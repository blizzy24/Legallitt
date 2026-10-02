import { StyleSheet, Text, View } from 'react-native';

import ServiceHeader from '../../components/ServiceHeader';
import { colors, font, profile as t, space } from '../../constants/theme';

// Placeholder — screen UI to come from design/104-la-your-details.png.
export default function LegalAdviceChooseScreen() {
  return (
    <View style={styles.screen}>
      <ServiceHeader title="Get Expert Legal Advice" />
      <View style={styles.body}>
        <Text style={styles.title}>Get Expert Legal Advice</Text>
        <Text style={styles.text}>Not built yet (design/104-la-your-details.png).</Text>
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
