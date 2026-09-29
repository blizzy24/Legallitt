import { StyleSheet, Text, View } from 'react-native';

import ServiceHeader from '../../components/ServiceHeader';
import { colors, font, profile as t, space } from '../../constants/theme';

// Placeholder — screen UI to come from design/78.
export default function PsTrackScreen() {
  return (
    <View style={styles.screen}>
      <ServiceHeader title="Property Search Report" />
      <View style={styles.body}>
        <Text style={styles.title}>Track Request</Text>
        <Text style={styles.text}>Not built yet (design/78).</Text>
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
