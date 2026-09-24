import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import WizardShell from '../../components/WizardShell';
import { colors, font, wizard as w } from '../../constants/theme';

// Placeholder — step content to come.
export default function Step5Screen() {
  return (
    <WizardShell step={5} buttonLabel="Submit & Proceed to Pay" onContinue={() => router.push('/legal-notice/step6')}>
      <View style={styles.placeholder}>
        <Text style={styles.text}>Step 5</Text>
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
