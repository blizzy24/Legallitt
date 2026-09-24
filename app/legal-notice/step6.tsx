import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import WizardShell from '../../components/WizardShell';
import { colors, font, wizard as w } from '../../constants/theme';

// Placeholder — step content to come.
export default function Step6Screen() {
  return (
    // Placeholder target — group 3 replaces this with the payment flow.
    <WizardShell step={6} buttonLabel="Continue" onContinue={() => router.replace('/(tabs)/home')}>
      <View style={styles.placeholder}>
        <Text style={styles.text}>Step 6</Text>
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
