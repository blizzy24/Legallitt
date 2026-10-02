import { router } from 'expo-router';
import {
  Briefcase,
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Gavel,
  HardHat,
  Home,
  MessagesSquare,
  Scale,
  ShieldAlert,
  ShoppingCart,
  Users,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { LA_MATTERS } from '../../data/legalAdvice';
import { colors, font, ink, laMatter as t, laMatterAccent as a } from '../../constants/theme';
import { useLegalAdvice } from '../../context/legalAdvice';

// Legal Advice legal-matter picker.
//
// THE ARTWORK IS IN design/106-la-review.png, NOT design/105 — the batch's file names
// are shifted by one against their contents.
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — THE CARD DESCRIPTIONS ARE INCONSISTENTLY SET AND SEVERAL ARE CUT OFF.
//
// In design/106 five of the ten descriptions are wrapped in quotation marks
// (General Consultation, Family Law, Criminal Law, Property Law and one other) and
// five are not, with no pattern to it. Several are also truncated mid-sentence by
// the card box rather than ending. Rendered here in full and without quote marks,
// as instructed — the full text is in data/legalAdvice.ts.
//
// REPORTED — the subtitle reads "Select the cosultation mode that best suits your
// legal needs." Two problems: "cosultation" is misspelled, and this screen picks a
// legal MATTER, not a consultation mode — that was the previous screen. Rendered
// with the spelling fixed and the wording left alone, since the correct sentence is
// a content decision.
//
// REPORTED — drawn outside the main palette on a WHITE page: lavender-blue discs,
// blue glyphs, dark-teal titles. Colours quarantined in `laMatterAccent`.
// ─────────────────────────────────────────────────────────────────────────────

const ICONS: Record<string, typeof Scale> = {
  general: MessagesSquare,
  family: Users,
  criminal: Gavel,
  consumer: ShoppingCart,
  service: Briefcase,
  cyber: ShieldAlert,
  property: Home,
  corporate: Building2,
  labour: HardHat,
  arbitration: CalendarCheck,
};

function tone(id: string) {
  if (id === 'family') return { disc: a.familyDisc, glyph: a.familyGlyph };
  if (id === 'property') return { disc: a.propertyDisc, glyph: a.propertyGlyph };
  return { disc: a.disc, glyph: a.glyph };
}

export default function LegalAdviceMatterScreen() {
  const insets = useSafeAreaInsets();
  const { form, update } = useLegalAdvice();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + t.backTop, paddingBottom: insets.bottom + t.buttonGap },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/legal-advice/details')
          }
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.title}>
          Select Your{'\n'}
          <Text style={styles.titleAccent}>Legal Matter</Text>
        </Text>
        <Text style={styles.sub}>
          Select the consultation mode that best suits your legal needs.
        </Text>

        <View style={styles.grid}>
          {LA_MATTERS.map((m) => {
            const Icon = ICONS[m.id] ?? Scale;
            const c = tone(m.id);
            const on = form.matter === m.id;
            return (
              <Pressable
                key={m.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => update({ matter: m.id })}
                style={[styles.card, on && styles.cardOn]}
              >
                <View style={styles.cardRow}>
                  <View style={[styles.disc, { backgroundColor: c.disc }]}>
                    <Icon size={t.discGlyph} color={c.glyph} />
                  </View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle} {...shrinkToFit(0.75)}>
                      {m.title}
                    </Text>
                    <Text style={styles.cardBody}>{m.description}</Text>
                  </View>
                  <ChevronRight size={t.chevron} color={colors.textMuted} style={styles.chevron} />
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/legal-advice/experience')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/legal-advice/experience')}
          style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
        >
          <Text style={styles.skipLabel}>Skip</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingHorizontal: t.padX },

  title: {
    marginTop: t.titleGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    lineHeight: t.titleLineHeight,
    color: colors.textPrimary,
  },
  titleAccent: { color: colors.brand },
  sub: {
    marginTop: t.subGap,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLineHeight,
    color: colors.textBody,
  },

  grid: {
    marginTop: t.gridGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: t.colGap,
    rowGap: t.rowGap,
  },
  card: {
    width: `${50}%`,
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 140,
    maxWidth: '48%',
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: t.cardBorder,
    borderColor: a.edge,
    padding: t.cardPad,
  },
  cardOn: { borderColor: a.selected },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  disc: {
    width: t.disc,
    height: t.disc,
    borderRadius: t.disc / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, minWidth: 0, marginLeft: t.discGap },
  cardTitle: {
    fontFamily: font.appBody,
    fontSize: t.cardTitleSize,
    lineHeight: t.cardTitleLineHeight,
    color: a.title,
  },
  cardBody: {
    marginTop: t.cardBodyGap,
    fontFamily: font.appBody,
    fontSize: t.cardBodySize,
    lineHeight: t.cardBodyLineHeight,
    color: colors.textBody,
  },
  chevron: { marginLeft: t.chevronGap, marginTop: 10 },

  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appSemi, fontSize: t.buttonSize, color: ink.onBrand },
  skip: {
    marginTop: t.skipGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    borderWidth: 1,
    borderColor: t.skipBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: { fontFamily: font.appBody, fontSize: t.buttonSize, color: colors.brandDark },
});
