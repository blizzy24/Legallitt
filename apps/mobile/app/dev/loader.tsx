import { Redirect } from 'expo-router';
import LegalittLoader from '../../components/LegalittLoader';
import { DEV_PREVIEW_TOGGLES } from '../../constants/dev';

// DEVELOPMENT ONLY — the Legalitt loader on its own.
export default function DevLoaderScreen() {
  // With the dev toggles off (client builds) this route is not a screen: go home.
  if (!DEV_PREVIEW_TOGGLES) return <Redirect href="/" />;
  return <LegalittLoader />;
}
