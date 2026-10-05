import ProposeTimeScreen from '../../../../components/ProposeTimeScreen';
import { ADV_RESCHEDULE } from '../../../../data/advocateSide';

// Reschedule the call (design/176).
//
// Structurally the same screen as design/165's Propose Alternate Time, which it
// reuses. It differs in exactly three ways: the title reads "Reschedule the call",
// the Custom Slot Configuration card is absent, and the message card carries three
// suggestion chips. See components/ProposeTimeScreen.tsx.
export default function AdvocateRescheduleScreen() {
  return (
    <ProposeTimeScreen
      title={ADV_RESCHEDULE.title}
      showCustomConfig={false}
      messageChips={ADV_RESCHEDULE.messageChips}
    />
  );
}
