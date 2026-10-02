import { StyleSheet, Text, View } from 'react-native';

import ServiceHeader from '../../components/ServiceHeader';
import { colors, font, profile as t, space } from '../../constants/theme';

// Placeholder — screen UI to come from design/124-la-datetime.png.
export default function LegalAdviceDatetimeScreen() {
  return (
    <View style={styles.screen}>
      <ServiceHeader title="Pick a Slot" />
      <View style={styles.body}>
        <Text style={styles.title}>Pick a Slot</Text>
        <Text style={styles.text}>Not built yet (design/124-la-datetime.png).</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  body: { paddingHorizontal: space.screenX, paddingTop: t.sectionGap, gap: 8 },
  title: { fontFamily: font.appHeading, fontSize: t.rowTitleSize + 3, color: colors.textPrimary },
  text: { fontFamily: font.appBody, fontSize: t.rowSubSize, color: colors.textBody },
});
