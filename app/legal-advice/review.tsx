import { StyleSheet, Text, View } from 'react-native';

import ServiceHeader from '../../components/ServiceHeader';
import { colors, font, profile as t, space } from '../../constants/theme';

// Placeholder — screen UI to come from design/107-la-payment.png.
export default function LegalAdviceReviewScreen() {
  return (
    <View style={styles.screen}>
      <ServiceHeader title="Review Your Request" />
      <View style={styles.body}>
        <Text style={styles.title}>Review Your Request</Text>
        <Text style={styles.text}>Not built yet (design/107-la-payment.png).</Text>
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
