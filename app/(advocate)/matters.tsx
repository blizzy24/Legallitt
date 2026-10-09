import AdvocateCasesList from '../../components/AdvocateCasesList';

// Advocate cases list — the Cases TAB (designs 204 and 205, superseding design/162).
// The list itself lives in components/AdvocateCasesList.tsx, which design/214 reuses
// at app/advocate/fir/requests.tsx with the FIR Draft filter pre-applied.

export default function AdvocateCasesScreen() {
  return <AdvocateCasesList chrome="tab" />;
}
