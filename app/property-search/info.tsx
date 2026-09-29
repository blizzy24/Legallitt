import { StyleSheet, Text, View } from 'react-native';

import ServiceHeader from '../../components/ServiceHeader';
import { colors, font, profile as t, space } from '../../constants/theme';

// Placeholder — built next.
export default function PsInfoScreen() {
  return (
    <View style={styles.screen}>
      <ServiceHeader title="Property Search Report" />
      <View style={styles.body}>
        <Text style={styles.text}>info</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  body: { paddingHorizontal: space.screenX, paddingTop: t.sectionGap },
  text: { fontFamily: font.appBody, fontSize: t.rowSubSize, color: colors.textBody },
});
