import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import WizardShell from '../../components/WizardShell';
import { colors, font, wizard as w } from '../../constants/theme';

// Placeholder — step content to come.
export default function Step4Screen() {
  return (
    <WizardShell step={4} buttonLabel="Continue" onContinue={() => router.push('/legal-notice/step5')}>
      <View style={styles.placeholder}>
        <Text style={styles.text}>Step 4</Text>
      </View>
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    paddingVertical: w.contentGap,
  },
  text: {
    fontFamily: font.appSemi,
    fontSize: w.subtitleSize,
    color: colors.textBody,
  },
});
