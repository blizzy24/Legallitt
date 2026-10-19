import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtChangeAdvocate } from '../../../constants/theme';
import { COURT_CHANGE_ADVOCATE } from '../../../data/advocateCourt';

// Advocate — client changed advocate (design/393). Measured at 1.000 px/pt on a 2x upscale.
// No drawn control leads here; Upload NOC is unscoped.

export default function AdvocateCourtChangeAdvocateScreen() {
  return <CourtScreen spec={COURT_CHANGE_ADVOCATE} tokens={advCourtChangeAdvocate} />;
}
