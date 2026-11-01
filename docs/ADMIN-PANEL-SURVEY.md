# The existing admin panel — what it is

1 November 2026 · observed at `legalitt.vercel.app`, signed in as SUPER ADMIN

This is a survey of the panel the previous team built, written because no
designs for an admin panel exist in our set. It records what is there, not
what we should build.

---

## 1. It is a whole admin product, not a Legal Notice screen

Eighteen sections across six groups:

| Group | Sections |
|---|---|
| Overview | Dashboard |
| Consultations & Operations | Consultations & Chats · Calendar & Schedule · Cases & Legal Notices · **Legal Notices** · FIR Drafts · Property Research · Document Forensic |
| Users & Advocate Network | Client Users · Advocate Network & Approvals · Admin Team |
| Financials & Revenue | Payments & Revenue · Payment History · Transaction Ledger · Payouts & Withdrawals |
| Support & Growth | Support Desk & Tickets · Coupons & Offers · Ads & Promotions |
| System & Security | Reports & Analytics (possibly more below the fold) |

Roles exist: the signed-in account is labelled **SUPER ADMIN**, and there is
an **Admin Team** section, so the panel assumes more than one admin and more
than one level of permission.

**The implication for scope.** "Legal Notice end to end including admin" needs
perhaps four of those eighteen. The rest is a separate body of work the client
may or may not expect as part of this phase, and it should be named before
anyone starts.

---

## 2. The Legal Notices screen

A dense table, not cards. Columns:

`CASE # · CLIENT · ISSUE · ADVOCATE · DOCUMENTS · STATUS · AMOUNT · CREATED · ACTIONS`

Above it, five counters — **Open 2 · Pending 0 · In Progress 2 · Completed 11
· Closed 0**, with "15 total notices" and a search box ("Search by client,
case #, or issue…").

**The admin's actions, as far as the list shows:**

- **`+ Assign`** appears in the ADVOCATE column on unassigned notices. This is
  the assignment step our demo progression currently stands in for.
- Documents are shown as counts by origin: `1 user doc`, `1 admin doc`, and a
  separate `AI Draft` marker. **Admins upload documents too**, which our model
  does not currently distinguish.
- Reference format is `LN-E8BBE5` — a hex suffix, where ours is `LN-2026-0001`.

---

## 3. Where it disagrees with what we have built

These are the things to resolve before building, not after.

| Theirs | Ours | Note |
|---|---|---|
| Open · Pending · In Progress · Completed · Closed | 17-value lifecycle, three buckets | Five admin-facing buckets need mapping onto our statuses |
| **₹1,199** on every notice | designs 22 draws **₹999 urgent / ₹699 ordinary** | A real pricing discrepancy — ask the client which is current |
| ISSUE is one text blob: `[Tenant Issue] <description> Sender: … phone: … Recipient: …` | `matter_type`, `case_parties`, `details` as proper fields | **Ours is better. Do not copy this.** The blob cannot be searched, sorted or validated |
| Advocate as free text: "A Rajeshwar Rao", "ADV RAJESH", "Ajay Chohan" | real `users` rows with profiles | Theirs has no advocate identity behind the name |
| Dark theme, orange accent | cream and brown | Two visual languages in one product — a decision for the client |

---

## 4. Two things worth raising with the client

**The data in it is real.** Client names, phone numbers and email addresses are
visible in the list. The newest entries are from 22 September, so the panel
looks dormant, but it is publicly reachable and protected by one password.
That password has also been shared in a chat and should be changed.

**Nothing behind it is ours.** We have no repository and no API for it. If the
previous team's backend is still running, that is a separate live system
holding this data; if it is not, these screens are a reference and nothing
more. Either way we are building new, against our own API.

---

## 5. What a Legal Notice admin slice actually needs

From everything above, the minimum for Legal Notice end to end:

1. **Legal Notices list** — the table, the five counters, search
2. **Case detail** — intake, parties, documents, timeline
3. **Assign advocate** — the `+ Assign` action, choosing from real advocates
4. **Confirm delivery** — upload proof, move the case to completed

Items 3 and 4 are exactly what `DEMO_PROGRESSION` currently fakes. Building
them is what takes those two rows off the §9.1 register.

Everything else in section 1 — payouts, coupons, ads, support desk, analytics —
is out of scope for Legal Notice and should be quoted and scheduled separately.
