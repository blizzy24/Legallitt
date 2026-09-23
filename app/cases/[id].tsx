import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font, home } from '../../constants/theme';

// Placeholder — screen UI to come.
export default function CaseDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.screen}>
      <Text style={styles.label}>Case Details</Text>
      <Text style={styles.sub}>{id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.appBg,
  },
  label: {
    fontFamily: font.appSemi,
    fontSize: home.sectionTitleSize,
    color: colors.textPrimary,
  },
  sub: {
    marginTop: home.subtitleGap,
    fontFamily: font.mono,
    fontSize: home.subtitleSize,
    color: colors.textBody,
  },
});
