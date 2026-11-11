import PreviewStep from '../../components/PreviewStep';
import {PaymentsLive} from '../../features/account/Payments';
import {DATA_SOURCE} from '../../lib/data-source';

// Payments (D-18, profile-9). Fixture previews keep the neutral preview step.
export default function PaymentsScreen() {
  return DATA_SOURCE === 'api' ? <PaymentsLive/> : <PreviewStep header="Payments" service="Payments" />;
}
