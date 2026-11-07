# Legalitt

## Read before writing any code

- `docs/LEGALITT-BACKEND-ARCHITECTURE.md` — the specification. Section numbers
  below refer to it.
- `docs/DESIGN-GENERATIONS.md` — which design is current where two exist.
- `docs/ADMIN-PANEL-SPEC.md` — what the admin panel is and is not.

Expo has changed: read https://docs.expo.dev/versions/v57.0.0/ before writing
Expo or React Native code.

## Setting up a new machine

Use **Git Bash on Windows** for this project; leave PowerShell execution policy
unchanged. Install fnm, put `eval "$(fnm env --use-on-cd --shell bash)"` in
`~/.bashrc`, and have `~/.bash_profile` source it. Install/select **Node 22.22.0
or newer within 22.x** with `fnm install 22` and `fnm use`; both version files
select 22. Run `corepack enable pnpm` for that Node installation; `package.json`
pins pnpm automatically. In Git Bash, `pnpm` uses the Corepack shell shim and
does not run PowerShell's blocked `pnpm.ps1`.

From the repository root in Git Bash:

```bash
pnpm install --frozen-lockfile
pnpm --filter @legalitt/api exec prisma generate
pnpm --filter @legalitt/shared build
# On a fresh clone only; preserve any existing local settings:
cp -n apps/mobile/.env.example apps/mobile/.env.local
pnpm mobile:deployed
```

Open **http://localhost:8081**. `mobile:deployed` starts BOTH Expo web and the
temporary local API proxy on `127.0.0.1:3002`; Ctrl+C stops both. Keep
`EXPO_PUBLIC_DATA_SOURCE=api` or the app silently selects fixtures. Restart after
editing environment values. This browser setup uses the deployed API/data and
needs no local API, Docker, PostgreSQL or AWS credentials. Sign in with existing
demo credentials; never rotate them for setup. Phone demo code `123456` selects
the seeded account for the chosen role and sends no SMS.

**Why the proxy:** deployed dev currently omits local origins from its CORS list
(architecture §2.10). [`apps/mobile/.env.example`](apps/mobile/.env.example)
documents its settings and removal:
when an AWS operator adds `http://localhost:8081`, switch back to the deployed
HTTPS API URL, unset both proxy settings and use
`pnpm --filter @legalitt/mobile web`. Do not disable browser security or switch
to fixtures to avoid CORS.

Other workflows have separate templates; copy only the ones you need:
[`apps/api/.env.example`](apps/api/.env.example) for the local API and test DB,
[`apps/admin/.env.example`](apps/admin/.env.example) for the admin frontend, and
[`infra/local/.env.example`](infra/local/.env.example) for Docker PostgreSQL.
Every setting states its requirement/default. Local API integration still needs
AWS access to the existing dev resources, and both local databases must be
migrated and base-seeded before database tests. `.env.local` files are ignored;
never put credentials in the examples. Older README setup passages describe
earlier deployment stages; use these templates and the current architecture.

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

## Every screen has five states

Required. Designs draw the ideal state only. Before any screen is considered
done, all five must be handled:

- **Ideal** — all data present, as drawn.
- **Empty** — no data yet. The screen must be designed for this, not just blank.
  A missing value takes its label, separators and icons with it (§1a).
- **Partial** — some fields missing. Never render a label with nothing after it.
- **Loading** — say so; don't show an empty shell that looks like real emptiness.
- **Error** — say what failed and what the person can do, next to the thing that
  failed.

A screen that cannot show a value must not show the label either, and must never
leave the person unable to tell whether the data is missing or the app is broken.

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

## Demo credentials

Never change `legalitt-dev/demo-auth` on its own. With explicit approval for a
credential change, run `pnpm demo:password` on Node 22. It prompts without echo,
updates the dev secret, immediately runs the deployed and local demo seeds, and
verifies all six deployed sign-ins. Start local Postgres first. If interrupted,
run `pnpm demo:password --resume` to finish both seeds using the current secret;
do not rotate again. `--check` validates prerequisites without changing anything.
No passwords in arguments, source files, logs, or commit messages.

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
