import { type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { useKyc } from '../context/kyc';
import { colors, font, ink } from '../constants/theme';
import { DATA_SOURCE } from '../lib/data-source';

/** Shared identity checkpoint: reuse the result; do not collect another Aadhaar copy. */
export default function IdentityVerification({ returnTo }: { returnTo: Href }) {
  const { kyc, begin } = useKyc();
  // D-40: DigiLocker and Video KYC are not built; the checkpoint is hidden wherever real data is used.
  if (DATA_SOURCE === 'api') return null;
  return <View style={styles.card}>
    <ShieldCheck size={24} color={ink.accent} />
    <Text style={styles.title}>{kyc.completed ? 'Identity verified' : 'Identity verification required'}</Text>
    <Text style={styles.body}>{kyc.completed
      ? 'Your existing verification is reused. No additional identity upload is needed.'
      : 'Complete identity verification once to continue. It will be reused across your client services.'}</Text>
    {!kyc.completed && <Pressable accessibilityRole="button" onPress={() => begin(returnTo)} style={styles.button}>
      <Text style={styles.buttonText}>Verify identity</Text>
    </Pressable>}
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: 18, marginVertical: 12, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.brand },
  title: { fontFamily: font.appSemi, fontSize: 16, color: colors.textPrimary, marginTop: 8 },
  body: { fontFamily: font.appBody, fontSize: 14, color: colors.textBody, marginTop: 8, lineHeight: 21 },
  button: { padding: 14, borderRadius: 12, backgroundColor: colors.brand, marginTop: 12, alignItems: 'center' },
  buttonText: { fontFamily: font.appSemi, color: ink.onBrand },
});
