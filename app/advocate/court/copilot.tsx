import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import LegalAiCopilotPanel from '../../../components/LegalAiCopilotPanel';
import { advCourtPalette as q } from '../../../constants/theme';
import AdvocateCourtChatScreen from './chat';

// Advocate — consultation copilot over the client chat (design/366).
//
// REUSED — design/366 is design/182's Legal AI copilot panel, re-exported in
// this batch: same title, chip, prompts, answer and composer. It is the
// existing LegalAiCopilotPanel, unchanged, opened as a sheet over the 365 chat.
// 366's crop shows only the sheet; the scrim behind it is 383's, the batch's
// one drawn scrim.
//
// ⚠⚠ UNSCOPED — AI. The answer is a fixed string; nothing is generated (see the
// panel). Close and the scrim go back to the chat.

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/advocate/court/chat' as Href);
}

export default function AdvocateCourtCopilotScreen() {
  return (
    <View style={styles.fill}>
      <AdvocateCourtChatScreen />
      <View style={[StyleSheet.absoluteFill, styles.scrim]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} style={styles.fill} />
        <LegalAiCopilotPanel onClose={close} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scrim: { backgroundColor: q.scrim },
});
