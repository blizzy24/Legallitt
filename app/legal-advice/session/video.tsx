import { StyleSheet, Text, View } from 'react-native';

import ServiceHeader from '../../../components/ServiceHeader';
import { colors, font, profile as t, space } from '../../../constants/theme';

// Placeholder — screen UI to come from design/114-la-session-video.png.
export default function LegalAdviceSessionVideoScreen() {
  return (
    <View style={styles.screen}>
      <ServiceHeader title="Video Consultation" />
      <View style={styles.body}>
        <Text style={styles.title}>Video Consultation</Text>
        <Text style={styles.text}>Not built yet (design/114-la-session-video.png).</Text>
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
