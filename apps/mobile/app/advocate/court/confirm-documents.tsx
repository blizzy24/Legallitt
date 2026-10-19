import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtConfirmDocs } from '../../../constants/theme';
import { COURT_CONFIRM_DOCS } from '../../../data/advocateCourt';

// Advocate — confirm the physical documents (design/375). Measured at 1.000
// px/pt on a 2x upscale. The drawn checkbox enables Confirm Received, which
// opens 376 (navigation only). No drawn control leads here: Send to Client on
// 374 is unscoped.

export default function AdvocateCourtConfirmDocsScreen() {
  return <CourtScreen spec={COURT_CONFIRM_DOCS} tokens={advCourtConfirmDocs} />;
}
