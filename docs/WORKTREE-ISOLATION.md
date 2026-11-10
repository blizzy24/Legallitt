# Parallel service work — 10 November 2026

**Consolidated 11 November 2026, by explicit owner instruction.** The remainder
of this document records the earlier handoff. Work now takes place only in
`D:\Legalitt\Legallitt`, on `services-consultation`. Claude's `6b33341` was rebased
onto main `d73f459` as `0545947` before cleanup. Both extra worktrees were checked
for tracked and untracked changes and were clean. `git worktree remove` removed
their registrations; Windows long-path dependency remnants were then removed
only after checking each absolute target. Ignored local settings are preserved
under the primary folder's ignored `.env.worktree-backups.local` directory.
The original branch/commit and all database volumes are retained. The primary
test database remains `legalitt_consultation_test`; no database was dropped.

Use Git Bash with Node 22 in each folder. Each agent must keep its worktree on
its assigned branch; do not switch branches in the other agent's folder.

| Agent | Folder | Branch | Local test database |
| --- | --- | --- | --- |
| Codex | `D:\Legalitt\Legallitt` | `services-consultation` | `legalitt_consultation_test` |
| Claude Code | `D:\Legalitt\Legallitt-documents` | `services-documents` | `legalitt_documents_test` |

Both test databases use the existing local PostgreSQL 16 server at
`127.0.0.1:55432`. Their connection strings are in each worktree's ignored
`apps/api/.env.local`. Credentials were not changed. The original `legalitt_test`
database was preserved. Each new database is migrated using its own branch and
base-seeded, without running the demo credential seed.

Claude's new folder also uses `legalitt_documents` as its local application
database. Codex retains the original `legalitt` application database. This keeps
local API walkthroughs separate as well as the database test suites.

Run `pnpm --filter @legalitt/api test:local` from the assigned worktree. Do not
export an old `DATABASE_URL` or `LEGALITT_TEST_DATABASE_URL` into the shell: an
exported variable overrides Node's `.env.local` loading. Do not copy another
worktree's database URLs or generated Prisma client. Each worktree installs its
own `node_modules`, generates its own Prisma client, and builds its own shared
package. The pnpm package cache can be shared.

Claude's source commit is `6b33341` (Property Search, Document Forensic and Court
Marriage). It was already committed and clean; none of its source was moved into
the Codex branch. Codex's in-progress source is FIR admin rejection, identity
replacement and reassignment (`62c3d76`), retained on `services-consultation` as
requested. The branch name does not imply that new consultation features have
been implemented.

Windows refused to rename the existing `D:\Legalitt\wt-services` directory.
That folder and all its files were therefore preserved as a detached worktree at
the same Claude commit. The requested `Legallitt-documents` worktree now owns the
`services-documents` branch. Use the new folder for further Claude work. The old
folder's ignored database settings also point to the documents databases, so it
no longer targets the former shared test database. No folder was deleted.

At this handoff, image `62c3d76` was built and uploaded to development ECR. No
deployed migration, Compute update or frontend rollout was started. GitHub
release-branch push attempts timed out; there is no claim of a successful push.
Deployment remains paused at the user's requested reporting checkpoint.
