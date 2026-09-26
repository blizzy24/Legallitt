import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import FirShell from '../../components/FirShell';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, firShell as f, font } from '../../constants/theme';

// Placeholder — step content to come. The shell, header and progress bar are built.
export default function FirStep4Screen() {
  return (
    <FirShell step={4} title="Supporting Documents">
      <View style={styles.placeholder}>
        <Text style={styles.text}>Step 4 — Supporting Documents</Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label="Continue" onPress={() => router.push('/fir/step5')} />
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
