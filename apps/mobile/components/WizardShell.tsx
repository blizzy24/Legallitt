import { router } from 'expo-router';
import { ChevronLeft, Lock } from 'lucide-react-native';
import { Fragment, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, ink, payHeader as ph, wizard as w } from '../constants/theme';
import PayHeader from './PayHeader';
import PrimaryButton from './PrimaryButton';
import { instructedCopy } from '../copy/instructed';

const WIZARD_STEPS = 6;

type Props = {
  /** 1-based step, of WIZARD_STEPS. */
  step: number;
  totalSteps?: number;
  busy?: boolean;
  children: ReactNode;
  buttonLabel: string;
  onContinue: () => void;
  onBack?: () => void;
  /**
   * Chat-style steps (1, 2, 3, 5) sit their content directly above the button with the
   * spare space at the top; step 4 fills from the top. Measured from the designs.
   */
  align?: 'bottom' | 'top';
  /**
   * 'centred' is the shared "Legal Notice / Secure & Confidence" block (steps 1–5).
   * 'leading' is step 6's circular back button with a left-aligned title (design/28).
   */
  header?: 'centred' | 'leading';
  title?: string;
  subtitle?: string;
  /** Hide the default Continue button (step 6 supplies its own fixed bar). */
  hideButton?: boolean;
  /** Extra bottom clearance, e.g. for a fixed bar supplied by the step. */
  bottomInset?: number;
  /** Steps 4 and 6 are drawn on the off-white app background; chat steps on white. */
  background?: 'white' | 'tinted';
};

export default function WizardShell({
  step, totalSteps = WIZARD_STEPS, busy = false,
  children,
  buttonLabel,
  onContinue, onBack,
  align = 'bottom',
  header = 'centred',
  title = 'Legal Notice',
  subtitle = 'Private & Confidential',
  hideButton = false,
  bottomInset = 0,
  background = 'white',
}: Props) {
  const insets = useSafeAreaInsets();

  const goBack = onBack ?? (() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  });

  const bg = background === 'tinted' ? colors.appBg : colors.screenBg;

  return (
    <View style={[styles.screen, { backgroundColor: bg }]}>
      {header === 'centred' ? (
        <View style={[styles.header, { paddingTop: insets.top + w.top }]}>
          <View style={styles.centredHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} hitSlop={12} style={styles.chevron}>
              <ChevronLeft size={w.chevronSize} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>{title}</Text>
            {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
          <Stepper step={step} totalSteps={totalSteps} />
          <Text style={styles.stepLabel}>
            Step {step} of {totalSteps}
          </Text>
        </View>
      ) : (
        <View>
          <PayHeader title={title} subtitle={subtitle} onBack={goBack} />
          <View style={[styles.header, styles.headerLeading]}>
            <Stepper step={step} totalSteps={totalSteps} />
            <Text style={styles.stepLabel}>
              Step {step} of {totalSteps}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          align === 'bottom' && styles.contentBottom,
          { paddingBottom: bottomInset },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {!hideButton && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + w.bottom, backgroundColor: bg }]}>
          <PrimaryButton label={busy ? instructedCopy.legalNoticeIntake.saving : buttonLabel} onPress={onContinue} disabled={busy} />
          <View style={styles.safeRow}>
            <Lock size={w.footerIcon} color={colors.textPrimary} />
            <Text style={styles.safeText}>Visible only to you, your advocate and Legalitt’s team</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function Stepper({ step, totalSteps }: { step: number; totalSteps: number }) {
  const items = Array.from({ length: totalSteps }, (_, i) => i + 1);
  return (
    <View style={styles.stepper} accessibilityLabel={`Step ${step} of ${totalSteps}`}>
      {items.map((n, i) => {
        const done = n <= step;
        // The segment leaving the current circle is already dark in the designs (step 5's
        // file fades it dark-to-beige; drawn solid here).
        const lineDone = n <= step + 1;
        return (
          <Fragment key={n}>
            {i > 0 && (
              <View style={[styles.line, { backgroundColor: lineDone ? w.lineDone : w.lineTodo }]} />
            )}
            <View style={[styles.circle, { backgroundColor: done ? w.circleDone : w.circleTodo }]}>
              <Text style={styles.circleText}>{n}</Text>
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: w.padX,
  },
  headerLeading: {
    // design/28: the stepper sits 17pt under the header divider (marginTop below
    // is the stepper's own gap).
    paddingTop: ph.stepperGap - w.stepperGap,
  },
  centredHeader: {
    alignItems: 'center',
  },
  chevron: {
    position: 'absolute',
    left: w.chevronInset,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  title: {
    fontFamily: font.appHeading,
    fontSize: w.titleSize,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: w.subtitleGap,
    fontFamily: font.appBody,
    fontSize: w.subtitleSize,
    color: colors.textPrimary,
  },
  stepper: {
    marginTop: w.stepperGap,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 1.5,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  line: {
    flex: 1,
    height: w.line,
  },
  circle: {
    width: w.circle,
    height: w.circle,
    borderRadius: w.circle / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleText: {
    fontFamily: font.appSemi,
    fontSize: w.circleText,
    color: ink.onBrand,
  },
  stepLabel: {
    marginTop: w.labelGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: w.labelSize,
    color: colors.textPrimary,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: w.padX,
    paddingTop: w.contentGap,
  },
  contentBottom: {
    justifyContent: 'flex-end',
  },
  footer: {
    paddingHorizontal: w.padX,
    paddingTop: w.contentGap,
  },
  safeRow: {
    marginTop: w.buttonGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: w.footerIconGap,
  },
  safeText: {
    fontFamily: font.appBody,
    fontSize: w.footerSize,
    color: colors.textBody,
  },
});
