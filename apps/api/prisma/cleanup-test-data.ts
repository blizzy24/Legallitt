// P0-7 (owner pre-authorised, 11 Nov 2026): remove walkthrough and verification
// cases from the DEVELOPMENT database, keeping every case the demo seed tagged
// with a `development_seed` event. Dry run by default: prints exactly what would
// be removed. `--apply --expect=<n>` deletes only if the candidate count is still
// exactly n, in one transaction, with every dependent row (found from the
// database's own foreign keys, so no table can be missed). Users, pricing and
// configuration are never touched. Take an RDS snapshot first.
import { createDatabaseClient } from '../src/database';
import { requireDemoMode } from '../src/phone-auth/demo-accounts';

type Fk = {child: string; col: string; nullable: boolean; parent: string; pcol: string};
const q = (name: string) => '"' + name.replace(/"/g, '""') + '"';
// Owner instruction: always keep these demo cases, tagged or not.
const KEEP = ['LN-2026-0001','LN-2026-0002','LN-2026-0003','LN-2026-0004','LN-2026-0005','LN-2026-0006','LN-2026-0020'];

async function main() {
  requireDemoMode();
  const apply = process.argv.includes('--apply');
  const expect = Number(process.argv.find(a => a.startsWith('--expect='))?.split('=')[1] ?? NaN);
  const db = await createDatabaseClient();
  try {
    const candidates = await db.$queryRawUnsafe<{id: string; reference: string; service_code: string; status: string; email: string | null; created_at: Date; marked: boolean}[]>(`
      SELECT c.id, c.reference, c.service_code, c.status::text AS status, u.email::text AS email, c.created_at,
        (c.details::text ILIKE '%TEST ONLY%' OR COALESCE(c.subject_matter,'') ILIKE '%TEST ONLY%') AS marked
      FROM cases c JOIN users u ON u.id = c.client_id
      WHERE NOT EXISTS (SELECT 1 FROM case_events e WHERE e.case_id = c.id AND e.type = 'development_seed')
        AND c.reference <> ALL($1::text[])
      ORDER BY c.service_code, c.reference`, KEEP);
    const kept = await db.$queryRawUnsafe<{reference: string}[]>(`SELECT c.reference FROM cases c
      WHERE EXISTS (SELECT 1 FROM case_events e WHERE e.case_id = c.id AND e.type = 'development_seed') OR c.reference = ANY($1::text[]) ORDER BY 1`, KEEP);
    console.log(`KEEP ${kept.length} seeded: ${kept.map(k => k.reference).join(', ')}`);
    console.log(`DELETE candidates ${candidates.length}:`);
    for (const c of candidates) console.log(`  ${c.reference}\t${c.service_code}\t${c.status}\t${c.email}\t${c.created_at.toISOString()}\t${c.marked ? 'TEST ONLY' : ''}`);
    // Verification runs also open support requests; only those marked TEST ONLY.
    const tickets = await db.$queryRawUnsafe<{id: string}[]>(`SELECT t.id::text AS id FROM support_tickets t
      WHERE COALESCE(t.description,'') ILIKE '%TEST ONLY%' OR COALESCE(t.subject,'') ILIKE '%TEST ONLY%'
        OR EXISTS (SELECT 1 FROM support_messages m WHERE m.ticket_id = t.id AND m.body ILIKE '%TEST ONLY%')`).catch(() => []);
    console.log(`DELETE TEST ONLY support requests ${tickets.length}`);
    if (!apply) { console.log('DRY RUN — nothing deleted.'); return; }
    if (expect !== candidates.length) throw new Error(`Expected ${expect} candidates, found ${candidates.length}; refusing to delete.`);
    const fks = await db.$queryRawUnsafe<Fk[]>(`SELECT conrelid::regclass::text AS child, a.attname AS col, NOT a.attnotnull AS nullable,
      confrelid::regclass::text AS parent, af.attname AS pcol FROM pg_constraint c
      JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
      JOIN pg_attribute af ON af.attrelid = c.confrelid AND af.attnum = c.confkey[1] WHERE c.contype = 'f'`);
    const pkRows = await db.$queryRawUnsafe<{t: string; col: string; n: number}[]>(`SELECT i.indrelid::regclass::text AS t,
      MIN(a.attname) AS col, COUNT(*)::int AS n FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
      WHERE i.indisprimary GROUP BY 1`);
    const pk = (t: string) => { const r = pkRows.find(x => x.t === t); if (!r || r.n !== 1) throw new Error(`No single-column key for ${t}`); return q(r.col); };
    await db.$transaction(async tx => {
      // Closure of rows to delete, keyed by table → set of primary keys (text).
      const closure = new Map<string, Set<string>>([['cases', new Set(candidates.map(c => c.id))]]);
      let grew = true;
      while (grew) {
        grew = false;
        for (const fk of fks) {
          const parentIds = closure.get(fk.parent);
          if (!parentIds?.size) continue;
          const refs = fk.pcol === 'id' ? [...parentIds] : (await tx.$queryRawUnsafe<{v: string}[]>(
            `SELECT ${q(fk.pcol)}::text AS v FROM ${q(fk.parent)} WHERE ${pk(fk.parent)}::text = ANY($1::text[])`, [...parentIds])).map(r => r.v);
          if (!refs.length) continue;
          const rows = await tx.$queryRawUnsafe<{id: string}[]>(
            `SELECT ${pk(fk.child)}::text AS id FROM ${q(fk.child)} WHERE ${q(fk.col)}::text = ANY($1::text[])`, refs);
          const set = closure.get(fk.child) ?? new Set<string>();
          for (const r of rows) if (!set.has(r.id)) { set.add(r.id); grew = true; }
          closure.set(fk.child, set);
        }
      }
      // Break cycles: clear nullable links held by rows that are themselves being deleted.
      // Tables with UPDATE triggers (immutable checkout quotes) are never updated.
      const guarded = new Set((await tx.$queryRawUnsafe<{t: string}[]>(`SELECT DISTINCT event_object_table AS t
        FROM information_schema.triggers WHERE event_manipulation = 'UPDATE'`)).map(r => r.t));
      const nulled = new Set<Fk>();
      for (const fk of fks.filter(f => f.nullable && !guarded.has(f.child))) {
        const ids = closure.get(fk.child);
        nulled.add(fk);
        if (ids?.size) await tx.$executeRawUnsafe(`UPDATE ${q(fk.child)} SET ${q(fk.col)} = NULL WHERE ${pk(fk.child)}::text = ANY($1::text[])`, [...ids]);
      }
      const pending = new Map([...closure].filter(([, s]) => s.size));
      for (let round = 0; pending.size && round < 50; round++) {
        for (const [table, ids] of [...pending]) {
          const blocked = fks.some(f => f.parent === table && f.child !== table && pending.has(f.child) && !nulled.has(f));
          if (blocked) continue;
          const n = await tx.$executeRawUnsafe(`DELETE FROM ${q(table)} WHERE ${pk(table)}::text = ANY($1::text[])`, [...ids]);
          console.log(`deleted ${n} from ${table}`);
          pending.delete(table);
        }
      }
      if (pending.size) throw new Error(`Could not order deletion for: ${[...pending.keys()].join(', ')}`);
      const actions = await tx.$executeRawUnsafe(`DELETE FROM admin_actions WHERE subject_type = 'case' AND subject_id::text = ANY($1::text[])`, candidates.map(c => c.id));
      console.log(`deleted ${actions} from admin_actions`);
      if (tickets.length) {
        const ids = tickets.map(t => t.id);
        console.log(`deleted ${await tx.$executeRawUnsafe(`DELETE FROM support_messages WHERE ticket_id::text = ANY($1::text[])`, ids)} from support_messages`);
        console.log(`deleted ${await tx.$executeRawUnsafe(`DELETE FROM admin_actions WHERE subject_id::text = ANY($1::text[])`, ids)} support admin_actions`);
        console.log(`deleted ${await tx.$executeRawUnsafe(`DELETE FROM support_tickets WHERE id::text = ANY($1::text[])`, ids)} from support_tickets`);
      }
    }, {timeout: 600_000, maxWait: 60_000});
    console.log(`APPLIED — ${candidates.length} cases removed.`);
  } finally { await db.$disconnect(); }
}
main().catch(e => { console.error('Cleanup failed:', e instanceof Error ? e.message : 'unknown error'); process.exitCode = 1; });
