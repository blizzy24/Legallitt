import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, space } from '../../constants/theme';

// Placeholder — advocate clients screen, UI to come from the 149-159 batch.
export default function AdvocateClientsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>clients</Text>
      <Text style={styles.text}>Not built yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg, paddingHorizontal: space.screenX },
  title: { fontFamily: font.appHeading, fontSize: 24, color: colors.textPrimary, textTransform: 'capitalize' },
  text: { marginTop: 8, fontFamily: font.appBody, fontSize: 14, color: colors.textBody },
});
