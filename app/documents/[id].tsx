import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, profile as t, space } from '../../constants/theme';

// Placeholder — built next from design/57.
export default function DocumentViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.screen}>
      <Text style={styles.text}>Document {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg, padding: space.screenX },
  text: { fontFamily: font.appSemi, fontSize: t.rowTitleSize, color: colors.textBody },
});
