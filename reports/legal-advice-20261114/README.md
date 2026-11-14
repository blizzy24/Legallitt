# Legal Advice rebuild — deployed and verified

Code release **15df9e7**, API image **6715935**. Continues bfeda1f; the release
and evidence are pushed to main. This report is part of the final evidence commit.

## Verified locally

- API: **255 passed, 0 failed**, full suite (full-api-final.log), including Legal
  Notice, FIR, Property Search, Document Forensic and both court workflows.
- Shared: **34 passed, 0 failed**. Auth-route tests: 2 passed. Browser route
  sweep: **350 routes, no failures**. Mobile/admin typechecks and production
  web builds passed. API build includes Prisma generation.
- Chat: Emerging intake → requested slot → shared test checkout → acceptance →
  both participants/message → client end → summary → exact ₹499 wallet credit.
- Video: alternate proposal accepted → both join → pause/resume → client ends;
  24-hour summary lateness → admin alert → summary submitted → ₹999 credit.
- Audio: admin multi-invite, one winner/closed loser; both join, pause/resume,
  five-minute warning, server auto-end for both and overdue-summary queue.
- Both no-shows, free advocate-fault reschedule, full test refund, cancellation
  before acceptance, two accepted ordinary reschedules and blocked third.
- Written advice: ₹147.50 total (₹100 advocate base), shared test purchase,
  editor save, real letterhead PDF, client viewer, additional ₹100 entitlement.
  API text extraction proves every edited section reaches the PDF.
- Same-price linked follow-up selection; rating; 12-hour proposal alert;
  seven-day chat expiry and admin reopening; foreign-client 404; NOT SET prices;
  loading, empty, partial and network-error states.
- Admin acceptance notifications, immediate return after the last decline, fair
  worker pagination and abandoned-AI-claim recovery are covered by final tests.
- [59 visual comparisons](../../docs/flows/la-screens/README.md) and the
  [gap audit](../../docs/flows/LEGAL-ADVICE-GAPS.md).

All local walkthrough cases are new labelled synthetic cases in the separate
legalitt_report_local database. Clock fixtures are limited to those case IDs and
their owner/TEST description. Test-suite cleanup runs only in the isolated test
database. No existing real case, credential or real money was changed.

## Assumptions and simulation boundaries

LA-R2-01..14 in [DECISIONS](../../docs/DECISIONS.md): new engine only for new
bookings; experience bands [0,5), [5,10), [10,15), [15,∞), unknown unclassified;
only Emerging seeded; client choice first, same-tier extra invitations; prior
follow-up base retained; no paid clock before confirmed time; free fault
reschedules don't consume ordinary allowance; unfinished slot nullable; private
notes/disputes remain separated; fictional demo-profile setup is repeatable;
supporting-PDF AI extraction is bounded and identity files excluded. Boundary and
fault-remedy interpretations await client confirmation as recorded there.

Calls are TEST rooms without transmitted media. Test payment moves no money.
Local AI uses the explicitly labelled simulated adapter; deployed AI retains the
existing configured adapter/India-only policy and may show unavailable output.
No AI document examination, recording, provider callback or bank payout is
claimed. Non-Emerging prices intentionally remain NOT SET. New Profile/Messages
designs and repeat KYC were excluded as instructed. See architecture §9.1/§9.2.

## Deployment and live verification

- Image: 6715935, digest `sha256:80d2345ffdcde3cb3590b15fab888bde02a771abf75f214577d49139ffdd71e1`.
- Stack: LegalittDev-Compute-DevelopmentOnly, UPDATE_COMPLETE, healthy task
  definition **30**. Only ApiImageTag changed; no Core/infrastructure sizing change.
- Migration task: `4eb2538ff9f74d20a245eb236a08c6d3`, exit 0; both additive migrations
  above applied before the API update.
- Client: [BLNjxG9AYiCZyb64RKfS62WHvfnH](https://vercel.com/blizzard7/legalitt/BLNjxG9AYiCZyb64RKfS62WHvfnH), success.
- Admin: [H2GmRq2AiHp3gTLfxGGyWoYKhoQs](https://vercel.com/blizzard7/legalitt-admin-panel/H2GmRq2AiHp3gTLfxGGyWoYKhoQs), success.
- Policy **version 1**, tariff rows and new-flow activation seeded after
  both frontends succeeded. Fixture seed filled missing experience on **two**
  existing fictional profiles; credentials, verification and cases preserved.
- Live: new synthetic Chat/Audio/Video bookings passed exact-price shared test
  checkout, single/multi-invite acceptance, alternate-time confirmation, tracking
  and admin views. A fourth synthetic request declined back to admin and was
  cancelled before acceptance with a test refund. All three foreign-client API
  reads returned **404**; the direct URL showed **Case not found**, no case data.
- No browser page errors. [Live evidence](live/results.json), [deployment record](release.json).

The first live isolation harness expected a generic “could not” message; the app
correctly rendered “Case not found”. The assertion was corrected and the remaining
checks passed without redoing the completed bookings or changing application code.

Full 30-minute/late-summary/PDF/exception journeys passed locally. Live sessions
remain future appointments: no live database clocks were accelerated. Real media,
real payments, unconfigured experience prices and the deferred Profile/Messages
redesign are deliberately outside this release, as approved. All assumptions are
recorded in DECISIONS.md; none of those capabilities is presented as operational.

The final evidence push may rebuild identical frontend bundles. GitHub's deployment
statuses on that commit record those builds; the IDs above identify the code release
used for the live walkthrough. Docker cleanup is recorded in docker-prune.log.
