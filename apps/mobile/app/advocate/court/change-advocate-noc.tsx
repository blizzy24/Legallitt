import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtChangeAdvocateNoc } from '../../../constants/theme';
import { COURT_CHANGE_ADVOCATE_NOC } from '../../../data/advocateCourt';

// Advocate — client changed advocate, NOC uploaded (design/394). Measured at 1.000 px/pt on a 2x upscale.
// No drawn control leads here (393's Upload NOC is unscoped). Send NOC to Client is unscoped.

export default function AdvocateCourtChangeAdvocateNocScreen() {
  return <CourtScreen spec={COURT_CHANGE_ADVOCATE_NOC} tokens={advCourtChangeAdvocateNoc} />;
}
