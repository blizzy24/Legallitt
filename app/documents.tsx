import { StyleSheet, Text, View } from 'react-native';

import ServiceHeader from '../components/ServiceHeader';
import { colors, font, profile as t, space } from '../constants/theme';

// Placeholder — screen UI to come from design/56. Routed from the profile menu so
// the row does not dead-end.
export default function DocumentsScreen() {
  return (
    <View style={styles.screen}>
      <ServiceHeader title="My Documents" />
      <View style={styles.body}>
        <Text style={styles.title}>My Documents</Text>
        <Text style={styles.text}>Your uploaded legal documents.</Text>
        <Text style={styles.text}>This screen is not built yet (design/56).</Text>
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
