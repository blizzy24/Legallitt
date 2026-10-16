import LegalittLoader from '../../components/LegalittLoader';
import { DEV_PREVIEW_TOGGLES } from '../../constants/dev';

// DEVELOPMENT ONLY — the Legalitt loader on its own.
export default function DevLoaderScreen() {
  if (!DEV_PREVIEW_TOGGLES) return null;
  return <LegalittLoader />;
}
