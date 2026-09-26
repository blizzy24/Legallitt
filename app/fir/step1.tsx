import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import FirShell from '../../components/FirShell';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, firShell as f, font } from '../../constants/theme';

// Placeholder — step content to come. The shell, header and progress bar are built.
export default function FirStep1Screen() {
  return (
    <FirShell step={1} title="Quick Submission">
      <View style={styles.placeholder}>
        <Text style={styles.text}>Step 1 — Quick Submission</Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={() => router.push('/fir/step2')} />
      </View>
    </FirShell>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    paddingVertical: f.contentGap,
  },
  text: {
    fontFamily: font.appSemi,
    fontSize: f.titleSize,
    color: colors.textBody,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: f.contentGap,
  },
});
