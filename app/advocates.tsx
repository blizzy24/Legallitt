import { StyleSheet, Text, View } from 'react-native';

import ServiceHeader from '../components/ServiceHeader';
import { colors, font, profile as t, space } from '../constants/theme';

// Placeholder — screen UI to come from design/55. Routed from the profile menu so
// the row does not dead-end.
export default function AdvocatesScreen() {
  return (
    <View style={styles.screen}>
      <ServiceHeader title="Saved Advocates" />
      <View style={styles.body}>
        <Text style={styles.title}>Saved Advocates</Text>
        <Text style={styles.text}>Advocates you have saved.</Text>
        <Text style={styles.text}>This screen is not built yet (design/55).</Text>
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
    paddingHorizontal: space.screenX,
    paddingTop: t.sectionGap,
    gap: t.rowSubGap + 5,
  },
  title: {
    fontFamily: font.appHeading,
    fontSize: t.rowTitleSize + 3,
    color: colors.textPrimary,
  },
  text: {
    fontFamily: font.appBody,
    fontSize: t.rowSubSize,
    color: colors.textBody,
  },
});
