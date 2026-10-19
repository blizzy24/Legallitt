import { CourtScreen } from '../../../../components/court/CourtKit';
import { advCourtReviewUpdate } from '../../../../constants/theme';
import { COURT_REVIEW_UPDATE } from '../../../../data/advocateCourt';

// Advocate — review client update (design/391). Measured at 1.000 px/pt on a 2x upscale.
// Reached from Save Hearing Update on 390. Save & Send Update opens 392 (navigation only).

export default function AdvocateCourtReviewUpdateScreen() {
  return <CourtScreen spec={COURT_REVIEW_UPDATE} tokens={advCourtReviewUpdate} />;
}
