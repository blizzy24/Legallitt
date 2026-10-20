import ApiLegalNotice from "../../components/api/LegalNotice";
import { DATA_SOURCE } from "../../lib/data-source";
import AdvocateCasesList from '../../components/AdvocateCasesList';

// Advocate cases list — the Cases TAB (designs 204 and 205, superseding design/162).
// The list itself lives in components/AdvocateCasesList.tsx. design/214 is this tab
// with the FIR Draft chip selected; design/222's forensic portal reuses the list at
// app/advocate/forensic/requests.tsx.

function FixtureAdvocateCasesScreen() {
  return <AdvocateCasesList chrome="tab" />;
}

// The deployed fixture path remains unchanged; API mode is explicit.
export default function AdvocateCasesScreen() {
  return DATA_SOURCE === "api" ? <ApiLegalNotice stage="list" /> : <FixtureAdvocateCasesScreen />;
}
