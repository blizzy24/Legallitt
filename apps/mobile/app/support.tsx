import PreviewStep from '../components/PreviewStep';

// Placeholder — screen UI to come from design/70. Routed from the profile menu so
// the row does not dead-end.
// Renders the neutral preview step (the screen's name, one line, Back) — no
// build notes in the UI.
function FixtureSupportScreen() {
  return <PreviewStep header="Contact Support" service="Contact Support" />;
}

import {ContactSupport} from '../features/messages/Support';
import {DATA_SOURCE as LIVE_DATA_SOURCE} from '../lib/data-source';
export default function LiveScreen() { return LIVE_DATA_SOURCE === 'api' ? <ContactSupport/> : <FixtureSupportScreen/>; }
