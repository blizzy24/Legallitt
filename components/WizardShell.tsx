import { router } from 'expo-router';
import { ArrowLeft, ChevronLeft, Lock } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, ink, space, wizard as w } from '../constants/theme';
import PrimaryButton from './PrimaryButton';

export const WIZARD_STEPS = 6;

type Props = {
  /** 1-based step, of WIZARD_STEPS. */
  step: number;
  children: ReactNode;
  buttonLabel: string;
  onContinue: () => void;
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
};

export default function WizardShell({
  step,
  children,
  buttonLabel,
  onContinue,
  align = 'bottom',
  header = 'centred',
  title = 'Legal Notice',
  subtitle = 'Secure & Confidence',
  hideButton = false,
  bottomInset = 0,
}: Props) {
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + w.top }]}>
        {header === 'centred' ? (
          <View style={styles.centredHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} hitSlop={12} style={styles.chevron}>
              <ChevronLeft size={w.chevronSize} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        ) : (
          <View style={styles.leadingHeader}>
            <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} style={styles.leadButton}>
              <ArrowLeft size={w.chevronSize - 2} color={colors.textPrimary} />
            </Pressable>
            <View style={styles.leadText}>
              <Text style={styles.leadTitle}>{title}</Text>
              <Text style={styles.leadSubtitle}>{subtitle}</Text>
            </View>
          </View>
        )}

        <Stepper step={step} />
        <Text style={styles.stepLabel}>
          Step {step} of {WIZARD_STEPS}
        </Text>
      </View>

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
        <View style={[styles.footer, { paddingBottom: insets.bottom + w.bottom }]}>
          <PrimaryButton label={buttonLabel} onPress={onContinue} />
          <View style={styles.safeRow}>
            <Lock size={w.footerIcon} color={colors.textPrimary} />
            <Text style={styles.safeText}>Your information is safe and confidential</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function Stepper({ step }: { step: number }) {
  const items = Array.from({ length: WIZARD_STEPS }, (_, i) => i + 1);
  return (
    <View style={styles.stepper} accessibilityLabel={`Step ${step} of ${WIZARD_STEPS}`}>
      {items.map((n, i) => {
        const done = n <= step;
        // The segment leaving the current circle is already dark in the designs (step 5's
        // file fades it dark-to-beige; drawn solid here).
        const lineDone = n <= step + 1;
        return (
          <View key={n} style={styles.stepItem}>
            {i > 0 && (
              <View style={[styles.line, { backgroundColor: lineDone ? w.lineDone : w.lineTodo }]} />
            )}
            <View style={[styles.circle, { backgroundColor: done ? w.circleDone : w.circleTodo }]}>
              <Text style={styles.circleText}>{n}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  header: {
    paddingHorizontal: w.padX,
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
  leadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadButton: {
    width: w.leadHeaderButton,
    height: w.leadHeaderButton,
    borderRadius: w.leadHeaderButton / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.gap,
  },
  leadText: {
    flex: 1,
    minWidth: 0,
  },
  leadTitle: {
    fontFamily: font.appHeading,
    fontSize: w.leadTitleSize,
    color: colors.textPrimary,
  },
  leadSubtitle: {
    marginTop: 3,
    fontFamily: font.appBody,
    fontSize: w.leadSubtitleSize,
    color: colors.textBody,
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
    backgroundColor: colors.screenBg,
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
