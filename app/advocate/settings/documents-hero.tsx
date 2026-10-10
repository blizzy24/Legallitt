import AdvocateDocumentsScreen from '../../../components/AdvocateDocumentsScreen';

// Advocate settings — manage documents, illustrated header (design/250).
//
// ⚠ PROVISIONAL ROUTE NAME. The brief named a route for design/248 and none
// for design/250, but asked for both to be built once the pixel diff showed
// they genuinely differ. "documents-hero" is a placeholder; rename it in one
// commit once the client says which of the two headers ships, or what the
// second one is for.
export default function AdvocateSettingsDocumentsHeroScreen() {
  return <AdvocateDocumentsScreen hero="illustrated" />;
}
