import { router, type Href } from 'expo-router';
import { ArrowLeft, CircleQuestionMark, User } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, firShell as f, font, ink } from '../constants/theme';
import { FIR_STEPS } from '../data/fir';
import {useFir} from '../context/fir';
import {DATA_SOURCE} from '../lib/data-source';

type Props = {
  /** 1-based step, of FIR_STEPS. */
  step: number;
  title: string;
  children: ReactNode;
  /** design/43 adds a "?" button beside the avatar on steps 2 and 3. */
  showHelp?: boolean;
  /** Extra bottom clearance for a screen that supplies its own fixed bar. */
  bottomInset?: number;
  /** Replaces the default Back (Step 1 asks "Save as draft and leave?" first). */
  onBack?: () => void;
};

// Header and progress bar shared by the five FIR steps (design/42, design/43).
// Deliberately separate from WizardShell: that one is centred title + numbered
// circles; this one is a screen-centred title with an avatar and a percentage bar.
export default function FirShell({ step, title, children, showHelp = false, bottomInset = 0, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const intake=useFir();
  const percent = Math.round((step / FIR_STEPS) * 100);

  const goBack = () => {
    if (onBack) { onBack(); return; }
    if (DATA_SOURCE !== 'api' || intake.record?.status === 'draft') { void intake.back(); return; }
    if (router.canGoBack()) router.back();
    else router.replace('/fir');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + f.top }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={goBack}>
          <ArrowLeft size={f.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerRight}>
          {showHelp && (
            // Flow C4: (?) opens the Help Center at its FIR questions.
            <Pressable accessibilityRole="button" accessibilityLabel="Help" hitSlop={10} style={styles.help} onPress={() => router.push('/help?topic=fir' as Href)}>
              <CircleQuestionMark size={f.helpSize} color={colors.textMuted} />
            </Pressable>
          )}
          <View style={styles.avatar}>
            <User size={f.avatarIcon} color={ink.onBrand} />
          </View>
        </View>
      </View>

      <View style={styles.progress}>
        <View style={styles.progressRow}>
          <Text style={styles.stepLabel}>
            STEP {step} OF {FIR_STEPS}
          </Text>
          {/* Only F0b (Step 1) draws the percentage; designs 43–46 show the label and bar alone. */}
          {step === 1 ? <Text style={styles.percent}>{percent}% Completed</Text> : null}
        </View>
        <View style={styles.track} accessibilityLabel={`Step ${step} of ${FIR_STEPS}`}>
          <View style={[styles.fill, { width: `${percent}%` }]} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + bottomInset + f.contentGap }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: f.bg,
  },
  header: {
    minHeight: f.headerHeight,
    paddingHorizontal: f.padX,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: f.dividerColor,
    backgroundColor: f.bg,
  },
  title: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: f.titleSize,
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  help: {
    marginRight: f.helpGap,
  },
  avatar: {
    width: f.avatar,
    height: f.avatar,
    borderRadius: f.avatar / 2,
    backgroundColor: f.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: {
    paddingHorizontal: f.padX,
    paddingTop: f.labelGap,
    backgroundColor: f.bg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepLabel: {
    fontFamily: font.appSemi,
    fontSize: f.labelSize,
    letterSpacing: f.labelSpacing,
    color: colors.textPrimary,
  },
  percent: {
    fontFamily: font.appSemi,
    fontSize: f.percentSize,
    color: f.percent,
  },
  track: {
    marginTop: f.barGap,
    height: f.barHeight,
    borderRadius: f.barHeight / 2,
    backgroundColor: f.barTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: f.barHeight / 2,
    backgroundColor: f.barFill,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: f.padX,
    paddingTop: f.contentGap,
  },
});
