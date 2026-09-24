import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import WizardShell from '../../components/WizardShell';
import { colors, font, wizard as w } from '../../constants/theme';

// Placeholder — step content to come.
export default function Step2Screen() {
  return (
    <WizardShell step={2} buttonLabel="Continue" onContinue={() => router.push('/legal-notice/step3')}>
      <View style={styles.placeholder}>
        <Text style={styles.text}>Step 2</Text>
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
