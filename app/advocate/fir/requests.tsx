import AdvocateCasesList from '../../../components/AdvocateCasesList';
import { FIR_REQUESTS } from '../../../data/advocateFir';

// FIR requests — the cases list filtered to FIR Draft (design/214).
//
// ⚠ design/214 DRAWS THE ADVOCATE TAB BAR, scales tab active, with the full Cases
// header, subtitle, stat cards, search and both chip rows. By the export it is the
// Cases TAB (designs 204/205) with the FIR Draft service chip selected, not a pushed
// screen. Built here as a pushed route on request, so the tab bar is not rendered
// and the header carries a back chevron the design does not draw. Reported.
//
// ⚠ design/214 draws TWO IDENTICAL FIR cards. The list is live against ADV_CASES,
// which holds one FIR matter, so it yields one card — the same decision taken for
// design/205's three identical property cards.
//
// ⚠ The card action reads "Continue Draft →" here and "Review Request" everywhere
// else. The design's wording is kept; see ADV_CASES_ACTIONS.

export default function AdvocateFirRequestsScreen() {
  return (
    <AdvocateCasesList chrome="pushed" initialService={FIR_REQUESTS.service} title={FIR_REQUESTS.title} />
  );
}
