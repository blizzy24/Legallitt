import { StyleSheet, Text, View } from 'react-native';

import PayHeader from '../../components/PayHeader';
import { colors, font, wizard as w } from '../../constants/theme';

// Placeholder — group 4 builds the tracking screen (design/31, 32).
export default function TrackingScreen() {
  return (
    <View style={styles.screen}>
      <PayHeader title="Legal Notice" subtitle="Tracking" />
      <View style={styles.placeholder}>
        <Text style={styles.text}>Tracking</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: w.contentGap,
  },
  text: {
    fontFamily: font.appSemi,
    fontSize: w.subtitleSize,
    color: colors.textBody,
  },
});
