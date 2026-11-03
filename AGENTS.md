# Legalitt

## Read before writing any code

- `docs/LEGALITT-BACKEND-ARCHITECTURE.md` — the specification. Section numbers
  below refer to it.
- `docs/DESIGN-GENERATIONS.md` — which design is current where two exist.
- `docs/ADMIN-PANEL-SPEC.md` — what the admin panel is and is not.

Expo has changed: read https://docs.expo.dev/versions/v57.0.0/ before writing
Expo or React Native code.

## The designs are the specification

The client's designs in `design/` define every screen. Do not invent copy,
fields, or layout that is not drawn.

Two rules on top of that:

- **Check `DESIGN-GENERATIONS.md` first.** Some screens were redrawn. The older
  version must not be built. If it is unclear which is newer, stop and ask.
- **Read intent, not pixels (§1a.1).** The designs draw printed letterheads an
  advocate completes by hand. A blank line means "the advocate writes here", not
  "print underscores". A final PDF nobody writes on must never contain a blank
  where a value belongs.

Where a design and the old admin panel disagree, the design wins.

## Keep it fake till we make it (§2.11)

Unbuilt capabilities are simulated behind the real API, never skipped and never
bypassed. A simulator is a swap, not a shortcut: no special branches inside real
handlers. Anything standing in for something real is labelled honestly and
listed in the §9.1 register.

## Demo progression (§2.12)

Simulated steps stand in only for people who cannot act. The admin panel and the
advocate side are built, so every step they can perform is off by default. The
only step on by default is the courier's milestones between dispatch and
delivery, because nobody in the system is the courier.

Navigation follows the tap, never the clock.

## Working rules

- **Check before asserting.** Open the design, read the file, run the thing.
  Do not report a defect you have not seen yourself.
- **Stop and ask** rather than guessing at an ambiguous requirement. Ask for the
  exact URL or case rather than changing a handler speculatively.
- **Small chunks.** One reviewable change at a time, verified on the deployed
  site before moving on.
- Never commit a credential. Secrets live in Secrets Manager; code reads the ARN
  from the environment.

## Deployment (§10)

Standing approval: push to `main` and deploy `LegalittDev-Compute-DevelopmentOnly`
and the `legalitt-5` and `legalitt-admin-panel` Vercel projects without asking,
for changes already approved in substance. Report what went out.

Always ask first for: Core, production, credentials, data deletion, or anything
that changes cost.

**Migrate before you ship code.** Push the new image, run
`infra/scripts/dev-ops-task.sh migrate <IMAGE_TAG>` (runs that image's
migrations while the old API keeps serving), then deploy the stack on the tag.
Never the other way round: the running API must never serve against columns it
does not expect. A migration therefore has to be
safe for the old image too (add or widen first; rename or drop only once no
deployed code reads the old shape). If a change cannot be made safe that way,
stop and ask.

## Testing

- The API suite runs on the Node version in `engines` (22.x, pinned in
  `.nvmrc`; `fnm use` in the repository, or `fnm exec --using=.nvmrc pnpm test`).
  Other versions are refused: Node 24 runs `await t.test()` out of order and
  silently breaks subtests.
- The test database must be fully migrated and carry the base seed
  (`prisma/seed.ts`): `pnpm db:local:migrate`, then
  `DATABASE_URL=$LEGALITT_TEST_DATABASE_URL node dist/prisma/seed.js`.
  `scripts/test-preflight.cjs` checks all three before the suite starts and says
  which one is missing.