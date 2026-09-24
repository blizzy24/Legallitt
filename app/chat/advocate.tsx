import { StyleSheet, Text, View } from 'react-native';

import PayHeader from '../../components/PayHeader';
import { colors, font, space, wizard as w } from '../../constants/theme';

// BLOCKED — design/33 (chat with advocate) uses grey iMessage-style bubbles, a stock
// photograph and a brown header that don't match the app's design language and
// conflict with the support chat. Placeholder route until the client decides.
export default function AdvocateChatScreen() {
  return (
    <View style={styles.screen}>
      <PayHeader title="Chat with Advocate" subtitle="Coming soon" />
      <View style={styles.body}>
        <Text style={styles.text}>Advocate chat is awaiting a design decision.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  body: {
    padding: space.screenX,
    paddingTop: w.contentGap,
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: w.subtitleSize,
    color: colors.textBody,
  },
});
