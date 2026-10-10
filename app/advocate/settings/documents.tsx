import AdvocateDocumentsScreen from '../../../components/AdvocateDocumentsScreen';

// Advocate settings — manage documents (design/250, the illustrated hero).
//
// ⚠ TWO HEADERS WERE DRAWN AND NEITHER WAS CHOSEN. design/248 and design/250
// are the same screen with different headers — 248 a compact horizontal card,
// 250 a full-bleed illustrated hero — and the client supplied both without
// picking one. The hero ships on this route by instruction; 248's compact card
// is NOT deleted and NOT archived, it stays one prop away:
//
//     <AdvocateDocumentsScreen hero="compact" />
//
// Both PNGs stay in design/. Switching back is a one-word change here.
export default function AdvocateSettingsDocumentsScreen() {
  return <AdvocateDocumentsScreen hero="illustrated" />;
}
