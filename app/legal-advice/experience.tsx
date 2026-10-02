import { StyleSheet, Text, View } from 'react-native';

import ServiceHeader from '../../components/ServiceHeader';
import { colors, font, profile as t, space } from '../../constants/theme';

// Placeholder — screen UI to come from design/122-124.
export default function LegalAdviceExperienceScreen() {
  return (
    <View style={styles.screen}>
      <ServiceHeader title="Choose Your Advocate" />
      <View style={styles.body}>
        <Text style={styles.title}>Choose Your Advocate</Text>
        <Text style={styles.text}>Not built yet (design/122-124).</Text>
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
