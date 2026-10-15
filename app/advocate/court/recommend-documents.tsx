import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtRecommend } from '../../../constants/theme';
import { COURT_RECOMMEND } from '../../../data/advocateCourt';

// Advocate — recommend documents (design/374). Measured at 1.000 px/pt on a
// 2x upscale. Reached from Recommend Documents on 371 and 372. ⚠ Send to
// Client is unscoped and goes nowhere (see the spec).

export default function AdvocateCourtRecommendScreen() {
  return <CourtScreen spec={COURT_RECOMMEND} tokens={advCourtRecommend} />;
}
