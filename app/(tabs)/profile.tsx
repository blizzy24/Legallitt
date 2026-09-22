import { StyleSheet, Text, View } from 'react-native';

import { colors, font, home } from '../../constants/theme';

// Placeholder — screen UI to come.
export default function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.label}>Profile</Text>
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
});
