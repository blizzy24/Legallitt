import { useDemoWait } from '../../hooks/useDemoAdvance';
import { router } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import PrimaryButton from '../../components/PrimaryButton';
import ServiceHeader from '../../components/ServiceHeader';
import { colors, firLanding as l, firShell as f, font, ink, space } from '../../constants/theme';

// PRICING PENDING — there is no FIR payment design.
//
// The payment screens in the FIR source batch were the Legal Notice ones verbatim:
// they read "Legal Notice", Ref #LGT-849204 and ₹999. No FIR fee, tier or invoice
// has been provided, so no FIR payment flow is built. Step 5 routes here instead.
// Replace this screen once the client confirms FIR pricing (see data/fir.ts).
export default function FirPayPlaceholderScreen() {
  // DEMO: pricing is unresolved, so no payment is built; demo mode moves on to the
  // next drawn screen after the shared wait (data/flowMap.ts).
  useDemoWait();
  return (
    <View style={styles.screen}>
      <ServiceHeader title="FIR Draft" />
      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.iconRow}>
            <CircleAlert size={l.disclaimerIcon + 3} color={ink.accent} />
            <Text style={styles.title}>Pricing pending confirmation</Text>
          </View>
          <Text style={styles.text}>
            FIR Draft pricing has not been confirmed yet, so this step has no payment screen. The payment designs
            supplied with this section were the Legal Notice ones and did not carry FIR fees.
          </Text>
          <Text style={styles.text}>Your request details are kept and nothing has been charged.</Text>
        </View>
        <View style={styles.footer}>
          <PrimaryButton label="Back To Home" onPress={() => router.replace('/(tabs)/home')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: f.bg,
  },
  body: {
    flex: 1,
    paddingHorizontal: space.screenX,
    paddingTop: f.contentGap,
  },
  card: {
    borderRadius: l.cardRadius,
    backgroundColor: l.disclaimerBg,
    borderWidth: 1,
    borderColor: l.cardBorder,
    padding: l.disclaimerPad,
    gap: l.disclaimerIconGap,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: l.disclaimerIconGap,
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: l.optionTitleSize,
    color: colors.textPrimary,
  },
  text: {
    fontFamily: font.appBody,
    fontSize: l.disclaimerSize,
    lineHeight: l.disclaimerLineHeight,
    color: colors.textBody,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: f.contentGap,
  },
});
