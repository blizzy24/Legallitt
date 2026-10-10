import AdvocateCasesList from '../../../components/AdvocateCasesList';
import { DF_REQUESTS } from '../../../data/advocateForensic';

// Document Forensic requests (design/222).
//
// REUSED, NOT REBUILT. Below its own header, design/222 is the advocate cases list
// again — the same search field, the same two chip rows, the same matter card as
// designs 204/205/214. components/AdvocateCasesList gains a "portal" chrome
// variant for the two-line header, the subtitle and the extra search, and flags to
// drop the stat cards and the "Your Matters" row, neither of which design/222
// draws.
//
// ⚠ design/222 DRAWS TWO SEARCH FIELDS, stacked, with different placeholders:
// "Search client, document or request ID" above the list's own "Search client,
// case, service or case ID...". Built as drawn. See data/advocateForensic.ts.
//
// ⚠ THE SERVICE CHIP READS "Documents Forensic" — plural — where the card chip and
// every other screen read "Document Forensic".
//
// ⚠ design/222 draws TWO IDENTICAL cards; the list is live against ADV_CASES,
// which holds one forensic matter, so it yields one.

export default function AdvocateForensicRequestsScreen() {
  return (
    <AdvocateCasesList
      chrome="portal"
      title={DF_REQUESTS.title}
      eyebrow={DF_REQUESTS.eyebrow}
      subtitle={DF_REQUESTS.subtitle}
      extraSearch={DF_REQUESTS.search}
      initialService={DF_REQUESTS.service}
      showStats={false}
      showListTitle={false}
    />
  );
}
