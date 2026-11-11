import {BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException} from '@nestjs/common';
import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {
  DOCUMENT_MAX_BYTES, DOCUMENT_URL_SECONDS, DocumentMimeSchema, VERIFICATION_DOCUMENTS, VerificationDecisionSchema,
  VerificationDetailsSchema, VerificationDocumentKindSchema, verificationProblems,
  type AdvocateApprovalDetail, type AdvocateApprovalRow, type VerificationDetails, type VerificationDocument, type VerificationState,
} from '@legalitt/shared';
import type {Prisma, Document} from '../generated/prisma/client';
import {PrismaService} from '../prisma.service';
import {parse} from '../auth/auth.service';
import type {CaseActor} from '../cases/case-access';
import {DocumentStorage, stagingKey} from '../documents/document-storage';
import {FileInspector} from '../documents/file-inspector';
import {NOTIFICATIONS, type NotificationsPort} from '../notifications/notifications.port';

// D-35 / D-76..D-79. Verification documents are owner-scoped (case_id NULL):
// the generic /documents endpoints join through cases, so they can never serve
// these files; only this service does, to their owner and to admins (D-77).
const KINDS = VERIFICATION_DOCUMENTS.map(d => d.kind) as string[];
const PresignSchema = z.strictObject({kind: VerificationDocumentKindSchema, filename: z.string().trim().min(1).max(200)
  .refine(v => !/[\x00-\x1f\x7f/\\]/.test(v) && !v.includes('..') && !v.includes('${')), mime: DocumentMimeSchema});
const EDITABLE = ['not_started', 'needs_update', 'rejected'];
const ext = (mime: string) => mime === 'application/pdf' ? 'pdf' : mime === 'image/png' ? 'png' : 'jpg';
const docView = (d: Document): VerificationDocument => ({id: d.id, kind: d.kind as VerificationDocument['kind'], filename: d.filename,
  mime_type: d.mime_type, size_bytes: d.size_bytes.toString(), page_count: d.page_count, created_at: d.created_at.toISOString()});

@Injectable()
export class AdvocateVerificationService {
  constructor(private readonly prisma: PrismaService, private readonly storage: DocumentStorage, private readonly inspector: FileInspector,
    @Inject(NOTIFICATIONS) private readonly notifications: NotificationsPort) {}

  private advocate(actor: CaseActor) { if (actor.role !== 'advocate') throw new ForbiddenException('Advocates only'); }
  private admin(actor: CaseActor) { if (actor.role !== 'admin') throw new ForbiddenException('Admin access required'); }

  private async state(tx: Prisma.TransactionClient, userId: string): Promise<VerificationState> {
    const [profile, row, docs] = await Promise.all([
      tx.advocateProfile.findUnique({where: {user_id: userId}}),
      tx.advocateVerification.findUnique({where: {user_id: userId}}),
      tx.document.findMany({where: {owner_id: userId, case_id: null, kind: {in: KINDS}, status: 'uploaded'}, orderBy: {created_at: 'asc'}}),
    ]);
    const parsed = VerificationDetailsSchema.safeParse(row?.details ?? {});
    const details = parsed.success ? parsed.data : VerificationDetailsSchema.parse({});
    // Only the newest file of each kind counts; older uploads were replaced.
    const latest = VERIFICATION_DOCUMENTS.flatMap(k => { const d = docs.filter(x => x.kind === k.kind).at(-1); return d ? [docView(d)] : []; });
    return {status: (profile?.verification ?? 'not_started') as VerificationState['status'], details, documents: latest,
      submitted_at: row?.submitted_at?.toISOString() ?? null,
      decision: row?.decision && row.decided_at ? {decision: row.decision, reason: row.decision_reason, decided_at: row.decided_at.toISOString()} : null,
      problems: verificationProblems(details, latest)};
  }
  private async lockedProfile(tx: Prisma.TransactionClient, userId: string) {
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${'verification:' + userId}))::text`;
    return tx.advocateProfile.upsert({where: {user_id: userId}, update: {}, create: {user_id: userId}});
  }

  async read(actor: CaseActor) {
    this.advocate(actor);
    const db = await this.prisma.getClient();
    return db.$transaction(tx => this.state(tx, actor.id));
  }
  async save(actor: CaseActor, body: unknown) {
    this.advocate(actor);
    const {details} = parse(z.strictObject({details: VerificationDetailsSchema}), body);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const profile = await this.lockedProfile(tx, actor.id);
      if (!EDITABLE.includes(profile.verification)) throw new ConflictException(profile.verification === 'approved'
        ? 'Your verification is complete. Contact support to change verified details.' : 'Your details are under review and cannot be edited until Legalitt decides.');
      await tx.advocateVerification.upsert({where: {user_id: actor.id}, update: {details: details as Prisma.InputJsonObject, updated_at: new Date()},
        create: {user_id: actor.id, details: details as Prisma.InputJsonObject}});
      return this.state(tx, actor.id);
    });
  }
  async submit(actor: CaseActor) {
    this.advocate(actor);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const profile = await this.lockedProfile(tx, actor.id);
      if (!EDITABLE.includes(profile.verification)) throw new ConflictException('This verification has already been submitted.');
      const current = await this.state(tx, actor.id);
      if (current.problems.length) throw new BadRequestException({message: current.problems.map(p => p.message).join('\n'), issues: current.problems});
      await tx.advocateVerification.update({where: {user_id: actor.id}, data: {submitted_at: new Date(), updated_at: new Date()}});
      await tx.advocateProfile.update({where: {user_id: actor.id}, data: {verification: 'in_review', updated_at: new Date()}});
      for (const admin of await tx.user.findMany({where: {role: 'admin', status: 'active'}, select: {id: true}}))
        await this.notifications.send(tx, {user_id: admin.id, kind: 'advocate_verification_submitted', title: 'An advocate is waiting for approval', body: current.details.personal.full_name ?? undefined});
      return this.state(tx, actor.id);
    });
  }

  // ---------- owner-scoped verification documents ----------
  async presign(actor: CaseActor, body: unknown) {
    this.advocate(actor);
    const input = parse(PresignSchema, body);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const profile = await this.lockedProfile(tx, actor.id);
      if (!EDITABLE.includes(profile.verification)) throw new ConflictException('Documents are frozen while your verification is under review or complete.');
      const id = randomUUID();
      // Identity filenames may contain ID numbers: never persist them (§6d).
      const filename = input.kind === 'verification_identity' ? `Identity-proof-${id}.${ext(input.mime)}` : input.filename;
      const key = `advocates/${actor.id}/${id}/${filename}`;
      const doc = await tx.document.create({data: {id, case_id: null, owner_id: actor.id, kind: input.kind, filename, s3_key: key,
        mime_type: input.mime, size_bytes: 0n, status: 'pending', simulated: actor.source === 'simulated'}});
      const upload = await this.storage.upload(key, input.mime);
      return {document: {...doc, size_bytes: '0'}, upload: {...upload, method: 'POST', expires_in: DOCUMENT_URL_SECONDS, max_bytes: DOCUMENT_MAX_BYTES}};
    }, {timeout: 60_000});
  }
  private async own(tx: Prisma.TransactionClient, actor: CaseActor, id: string) {
    const doc = await tx.document.findFirst({where: {id, owner_id: actor.id, case_id: null, kind: {in: KINDS}}});
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }
  async complete(actor: CaseActor, id: string) {
    this.advocate(actor);
    const db = await this.prisma.getClient();
    return db.$transaction(async tx => {
      const doc = await this.own(tx, actor, id);
      if (doc.status === 'uploaded') return docView(doc);
      if (doc.status !== 'pending') throw new NotFoundException('Document not found');
      const key = stagingKey(doc.s3_key), info = await this.storage.head(key);
      if (!info) throw new ConflictException('Upload is not present in storage');
      try {
        if (!DocumentMimeSchema.safeParse(info.mime).success || info.size < 1 || info.size > DOCUMENT_MAX_BYTES)
          throw new BadRequestException('File exceeds the upload limits or has an unsupported type');
        const actual = await this.inspector.inspect(await this.storage.read(key, info));
        if (actual.mime !== info.mime) throw new BadRequestException('File type does not match its storage metadata');
        await this.storage.promote(doc.s3_key, info, actual.mime);
        return docView(await tx.document.update({where: {id}, data: {mime_type: actual.mime, size_bytes: BigInt(info.size), page_count: actual.pageCount, status: 'uploaded'}}));
      } catch (error) {
        if (error instanceof BadRequestException) await this.storage.discard(key, info);
        throw error;
      }
    }, {timeout: 60_000});
  }
  async remove(actor: CaseActor, id: string) {
    this.advocate(actor);
    const db = await this.prisma.getClient();
    const doc = await db.$transaction(async tx => {
      const profile = await this.lockedProfile(tx, actor.id);
      if (!EDITABLE.includes(profile.verification)) throw new ConflictException('Documents are frozen while your verification is under review or complete.');
      const found = await this.own(tx, actor, id);
      return tx.document.update({where: {id: found.id}, data: {status: 'deleted'}});
    });
    await this.storage.remove(doc.s3_key).catch(() => undefined);
    return {deleted: true};
  }
  async url(actor: CaseActor, id: string) {
    const db = await this.prisma.getClient();
    const doc = actor.role === 'admin'
      ? await db.document.findFirst({where: {id, case_id: null, kind: {in: KINDS}, status: 'uploaded'}})
      : actor.role === 'advocate' ? await db.document.findFirst({where: {id, owner_id: actor.id, case_id: null, kind: {in: KINDS}, status: 'uploaded'}}) : null;
    if (!doc) throw new NotFoundException('Document not found');
    return {url: await this.storage.download(doc.s3_key, doc.filename, actor.role === 'admin'), expires_in: DOCUMENT_URL_SECONDS};
  }

  // ---------- admin approvals queue (D-42) ----------
  async queue(actor: CaseActor, status: string) {
    this.admin(actor);
    const db = await this.prisma.getClient();
    const waiting = status !== 'decided';
    const rows = await db.advocateProfile.findMany({where: {verification: waiting ? 'in_review' : {in: ['approved', 'needs_update', 'rejected']}},
      include: {user_id_relation: {select: {full_name: true, email: true, role: true}}}});
    const subs = await db.advocateVerification.findMany({where: {user_id: {in: rows.map(r => r.user_id)}}});
    const items: AdvocateApprovalRow[] = rows.filter(r => r.user_id_relation.role === 'advocate').map(r => {
      const sub = subs.find(s => s.user_id === r.user_id), d = VerificationDetailsSchema.safeParse(sub?.details ?? {});
      return {user_id: r.user_id, name: r.user_id_relation.full_name, email: r.user_id_relation.email, city: r.city ?? (d.success ? d.data.practice.city ?? null : null),
        status: r.verification as AdvocateApprovalRow['status'], submitted_at: sub?.submitted_at?.toISOString() ?? null,
        bar_council: d.success ? {state: d.data.bar_council.state, number: d.data.bar_council.number} : {}};
    }).filter(r => !waiting || r.submitted_at);
    items.sort((a, b) => waiting ? (a.submitted_at ?? '').localeCompare(b.submitted_at ?? '') : (b.submitted_at ?? '').localeCompare(a.submitted_at ?? ''));
    return {items};
  }
  async detail(actor: CaseActor, userId: string): Promise<AdvocateApprovalDetail> {
    this.admin(actor);
    const db = await this.prisma.getClient();
    const user = await db.user.findFirst({where: {id: userId, role: 'advocate'}});
    if (!user) throw new NotFoundException('Advocate not found');
    const state = await db.$transaction(tx => this.state(tx, userId));
    return {...state, user_id: user.id, name: user.full_name, email: user.email, phone: user.phone};
  }
  async decide(actor: CaseActor, userId: string, body: unknown) {
    this.admin(actor);
    const input = parse(VerificationDecisionSchema, body);
    const db = await this.prisma.getClient();
    await db.$transaction(async tx => {
      if (!await tx.user.findFirst({where: {id: userId, role: 'advocate'}})) throw new NotFoundException('Advocate not found');
      const profile = await this.lockedProfile(tx, userId);
      if (profile.verification !== 'in_review') throw new ConflictException('This advocate is not waiting for a decision. Reload the queue.');
      const now = new Date(), state = await this.state(tx, userId), d = state.details;
      await tx.advocateVerification.update({where: {user_id: userId}, data: {decision: input.decision, decision_reason: input.reason ?? null, decided_at: now, decided_by: actor.id, updated_at: now}});
      // Approval publishes the verified facts to the profile used everywhere else (D-02).
      await tx.advocateProfile.update({where: {user_id: userId}, data: {verification: input.decision, updated_at: now,
        ...(input.decision === 'approved' ? {verified_at: now, bar_council_state: d.bar_council.state ?? null, bar_council_number: d.bar_council.number ?? null,
          enrolment_year: d.bar_council.enrolment_year ?? null, practice_areas: d.practice.areas ?? [], city: d.practice.city ?? null, state: d.practice.state ?? null,
          years_experience: d.professional.years_experience ?? null, education: d.professional.education || null, courts: d.professional.courts ?? [],
          languages: d.professional.languages ?? [], bio: d.practice.bio || null} : {})}});
      await tx.adminAction.create({data: {admin_id: actor.id, action: `advocate_verification_${input.decision}`, subject_type: 'user', subject_id: userId, payload: {reason: input.reason ?? null}}});
      const title = input.decision === 'approved' ? 'Your verification is complete' : input.decision === 'needs_update' ? 'Legalitt needs an update to your verification' : 'Your verification was not approved';
      await this.notifications.send(tx, {user_id: userId, kind: `verification_${input.decision}`, title, body: input.reason});
    });
    return this.detail(actor, userId);
  }
}
