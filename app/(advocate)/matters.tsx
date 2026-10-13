import AdvocateCasesList from '../../components/AdvocateCasesList';

// Advocate cases list — the Cases TAB (designs 204 and 205, superseding design/162).
// The list itself lives in components/AdvocateCasesList.tsx. design/214 is this tab
// with the FIR Draft chip selected; design/222's forensic portal reuses the list at
// app/advocate/forensic/requests.tsx.

export default function AdvocateCasesScreen() {
  return <AdvocateCasesList chrome="tab" />;
}
