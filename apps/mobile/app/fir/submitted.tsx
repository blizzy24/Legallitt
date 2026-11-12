import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowRight, Check, Clock } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FirResultHeader from '../../components/FirResultHeader';
import RequestIdCard from '../../components/RequestIdCard';
import { shrinkToFit } from '../../constants/textFit';
import { colors, firResult as t, font, ink } from '../../constants/theme';
import { firHref, useFirFlow } from '../../features/fir/flow';
import { dayTime, goHome, hashRef, isPaid, requestSubmittedAt, turnaroundShort } from '../../features/fir/client/format';
import { LoadingState, StatePanel } from '../../features/fir/client/ui';

// C9 Request Submitted (design/47), reached from F5 Start Tracking. Real request ID,
// submitted time and the policy turnaround. Back arrow and Back To Home go Home —
// never back into payment. The drawn "Your information is encrypted • Bar Council
// Compliant" footer is left out (flow C9 [REMOVE]).
export default function FirSubmittedScreen() {
  const { caseId } = useLocalSearchParams<{ caseId?: string }>();
  const insets = useSafeAreaInsets();
  const f = useFirFlow(caseId);
  const flow = f.flow;
  const header = <FirResultHeader title="Fir Draft" eyebrow="LEGALITT" action="info" onAction={() => router.push('/help' as Href)} onBack={goHome} />;

  if (f.loading && !flow) return <View style={styles.screen}>{header}<LoadingState /></View>;
  if (!flow)
    return (
      <View style={styles.screen}>
        {header}
        <ScrollView contentContainerStyle={styles.content}>
          <StatePanel tone="error" title="We couldn’t load your request" body={f.error || 'Something went wrong loading your request.'}
            actions={[...(caseId ? [{ label: 'Try again', onPress: f.reload, primary: true }] : []), { label: 'Back To Home', onPress: goHome }]} />
        </ScrollView>
      </View>
    );
  if (!isPaid(flow))
    return (
      <View style={styles.screen}>
        {header}
        <ScrollView contentContainerStyle={styles.content}>
          {flow.status === 'cancelled'
            ? <StatePanel title="This request was cancelled" body={`Request ${hashRef(flow.reference)} was cancelled.`} actions={[{ label: 'Back To Home', onPress: goHome, primary: true }]} />
            : <StatePanel title="Your request isn’t submitted yet" body={`Request ${hashRef(flow.reference)} is waiting for payment. It is submitted to our legal team once payment is complete.`}
                actions={[{ label: 'Complete Payment', onPress: () => router.replace(firHref('payment', flow.case_id)), primary: true }, { label: 'Back To Home', onPress: goHome }]} />}
        </ScrollView>
      </View>
    );

  const submitted = requestSubmittedAt(flow);
  const underReview = flow.stage.client.stage === 2;
  const meta = [submitted && `Submitted ${dayTime(submitted)}`, `Turnaround: ${turnaroundShort(flow.settings)}`].filter(Boolean).join(' • ');

  return (
    <View style={styles.screen}>
      {header}

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.contentTop }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroInner}>
            <Check size={t.heroGlyph} color={ink.onBrand} strokeWidth={2.5} />
          </View>
        </View>

        <Text style={styles.heading} {...shrinkToFit(0.75)}>
          Request Submitted Successfully
        </Text>
        <Text style={styles.body}>
          Your FIR Draft request has been received. Our legal team will review the details and begin
          preparing your formal draft.
        </Text>

        <RequestIdCard requestId={flow.reference} style={styles.idCard} />

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Text style={styles.label} {...shrinkToFit(0.8)}>
              CURRENT STATUS
            </Text>
            <View style={styles.statusChip}>
              <View style={styles.statusDot} />
              <Text style={styles.statusChipText} {...shrinkToFit(0.8)}>
                {underReview ? 'Submitted' : flow.stage.client.status}
              </Text>
            </View>
          </View>
          <Text style={styles.statusTitle} {...shrinkToFit(0.75)}>
            {underReview ? 'Your request is now under review' : `Stage ${flow.stage.client.stage} of 5: ${flow.stage.client.label}`}
          </Text>
          <View style={styles.meta}>
            <Clock size={t.statusMetaIcon} color={colors.textBody} />
            <Text style={styles.metaText}>{meta}</Text>
          </View>
        </View>

        <View style={styles.spacer} />

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(firHref('status', flow.case_id))}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Track Request</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>

        {/* design/47 draws this one a shade lighter than Track Request. */}
        <Pressable
          accessibilityRole="button"
          onPress={goHome}
          style={({ pressed }) => [styles.button, styles.buttonSecondary, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Back To Home</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: t.bg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: t.padX,
    paddingTop: t.contentTop,
  },
  hero: {
    marginTop: t.heroTop,
    alignSelf: 'center',
    width: t.heroCircle,
    height: t.heroCircle,
    borderRadius: t.heroCircle / 2,
    backgroundColor: t.heroCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInner: {
    width: t.heroInner,
    height: t.heroInner,
    borderRadius: t.heroInner / 2,
    backgroundColor: t.heroInnerBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginTop: t.headingGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    lineHeight: t.headingLineHeight,
    color: colors.textPrimary,
  },
  body: {
    marginTop: t.bodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  idCard: {
    marginTop: t.idGap,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    padding: t.cardPad,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: colors.textBody,
  },
  statusChip: {
    marginLeft: 8,
    minHeight: t.statusChipHeight,
    borderRadius: t.statusChipRadius,
    paddingHorizontal: t.statusChipPadX,
    backgroundColor: t.statusChipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: t.statusChipDot,
    height: t.statusChipDot,
    borderRadius: t.statusChipDot / 2,
    marginRight: t.statusChipDotGap,
    backgroundColor: t.pillText,
  },
  statusChipText: {
    fontFamily: font.appSemi,
    fontSize: t.statusChipSize,
    color: t.pillText,
  },
  statusTitle: {
    marginTop: t.statusTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.statusTitleSize,
    color: colors.textPrimary,
  },
  meta: {
    marginTop: t.statusMetaGap,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  metaText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.statusMetaIconGap,
    fontFamily: font.appBody,
    fontSize: t.statusMetaSize,
    lineHeight: t.statusMetaLineHeight,
    color: colors.textBody,
  },
  spacer: {
    flex: 1,
    minHeight: t.buttonGap,
  },
  button: {
    marginTop: t.buttonStackGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: t.buttonSecondaryBg,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
  buttonIcon: {
    marginLeft: t.buttonIconGap,
  },
});
