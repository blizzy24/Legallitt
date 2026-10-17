import { router } from 'expo-router';
import {
  BadgeIndianRupee,
  ChevronLeft,
  Clock,
  MessageSquare,
  Phone,
  ShieldCheck,
  Star,
  Video,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import {
  LA_CHOOSE_ORDER,
  LA_CHOOSE_POPULAR,
  laConsultType,
  type LaConsultTypeId,
} from '../../data/legalAdvice';
import { colors, font, ink, laChoose as t, laChooseAccent as a } from '../../constants/theme';
import { useLegalAdvice } from '../../context/legalAdvice';

// "Choose How You Want to Consult".
//
// THE ARTWORK IS IN design/104-la-your-details.png, NOT design/103 — the batch's file
// names are shifted by one against their contents.
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — THE PRICES HERE CONTRADICT THE LANDING'S.
//
//     landing (design/102)   Chat ₹499   Video ₹999    Audio ₹699
//     this screen            Chat ₹499   Audio ₹999    Video ₹1,499
//
// Audio and video swap rank and video nearly doubles. Each screen renders its own
// figures exactly as drawn. Checkout uses this selector's choosePrice for the selected consultation.
//
// REPORTED — this screen is drawn OUTSIDE THE MAIN PALETTE, in green / lavender /
// peach with dark-green headings. Third such divergence after the advocate profile
// and the legal-matter picker. Its colours are quarantined in `laChooseAccent`.
//
// REPORTED — chat is sold here as "Up to 7 days" where the landing's detail card
// sells the same product as a "30 Mins Session". Two different units for one thing.
//
// REPORTED — the brief describes a three-label bottom strip (duration / privacy /
// speed); design/104 draws TWO. Built as drawn.
//
// The ₹25-per-page overage above 25 free pages is the same rule the Document
// Forensic and FIR batches carry, so it looks platform-wide.
// ─────────────────────────────────────────────────────────────────────────────

const ICONS: Record<LaConsultTypeId, typeof Video> = {
  chat: MessageSquare,
  audio: Phone,
  video: Video,
};

const WHY = [
  {
    icon: ShieldCheck,
    title: 'Experience and Verified Legal Experts',
    body: 'Connect with verified and experienced lawyers.',
  },
  {
    icon: Star,
    title: 'Personalized Guidance',
    body: 'Get advice tailored to your unique situation.',
  },
  {
    icon: Clock,
    title: 'Fast and Convenient Legal Consultation',
    body: 'Choose when and how you consult-right from home.',
  },
  {
    icon: BadgeIndianRupee,
    title: 'Affordable Transparent Pricing',
    body: 'Clear fixed charging with no hidden Charges',
  },
];

export default function LegalAdviceChooseScreen() {
  const insets = useSafeAreaInsets();
  const { form, update } = useLegalAdvice();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + t.backTop, paddingBottom: insets.bottom + t.cardGap },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/legal-advice'))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.title}>
          Get Expert <Text style={styles.titleAccent}>Legal</Text> Advice
        </Text>
        <Text style={styles.body}>
          Your Legal Concern. Expert Guidance. The Right Way Forward. Connect with experienced
          legal professionals and receive personalised advice for your specific legal Issue
        </Text>

        <View style={styles.flourish}>
          <View style={styles.flourishLine} />
          <View style={styles.flourishDot} />
          <Text style={styles.flourishText} {...shrinkToFit(0.75)}>
            Choose How You Want to Consult
          </Text>
          <View style={styles.flourishDot} />
          <View style={styles.flourishLine} />
        </View>
        <Text style={styles.sub} {...shrinkToFit(0.8)}>
          Select a consultation type that suits you best
        </Text>

        {LA_CHOOSE_ORDER.map(laConsultType).map((c) => {
          const Icon = ICONS[c.id];
          const tone = a[c.id];
          const on = c.id === form.consultType;
          return (
            <Pressable
              key={c.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => update({ consultType: c.id })}
              style={[styles.card, on && styles.cardOn]}
            >
              {c.id === LA_CHOOSE_POPULAR && (
                <View style={styles.popular}>
                  <Text style={styles.popularText} {...shrinkToFit(0.8)}>
                    Popular
                  </Text>
                </View>
              )}

              <View style={styles.cardRow}>
                <View style={[styles.disc, { backgroundColor: tone.disc }]}>
                  <Icon size={t.discGlyph} color={tone.glyph} />
                </View>

                <View style={styles.cardText}>
                  <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
                    {c.title}
                  </Text>
                  <Text style={styles.cardBody}>{c.chooseDescription}</Text>

                  <View style={styles.rule} />

                  <View style={styles.strip}>
                    <Text style={styles.stripText} {...shrinkToFit(0.75)}>
                      {c.strip[0]}
                    </Text>
                    <View style={styles.stripDivider} />
                    <Text style={styles.stripText} {...shrinkToFit(0.75)}>
                      {c.strip[1]}
                    </Text>
                  </View>
                </View>

                <View style={[styles.block, { backgroundColor: tone.block }]}>
                  <Text style={styles.blockLabel} {...shrinkToFit(0.8)}>
                    Starting at
                  </Text>
                  <Text style={styles.blockPrice} {...shrinkToFit(0.7)}>
                    ₹{c.choosePrice.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.blockNote}>{c.uploadNote[0]}</Text>
                  <Text style={styles.blockNoteTight}>{c.uploadNote[1]}</Text>
                  <Text style={styles.blockCaption} {...shrinkToFit(0.75)}>
                    Quick Easy Private
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.flourishWhy}>
          <View style={styles.flourishLine} />
          <View style={styles.flourishDot} />
          <Text style={styles.flourishText} {...shrinkToFit(0.75)}>
            Why Choose Legalitt?
          </Text>
          <View style={styles.flourishDot} />
          <View style={styles.flourishLine} />
        </View>

        <View style={styles.whyRow}>
          {WHY.map((w, i) => (
            <View key={w.title} style={[styles.whyCell, i > 0 && styles.whyCellDivided]}>
              <View style={styles.whyIcon}>
                <w.icon size={t.whyIconGlyph} color={colors.brandDark} />
              </View>
              <Text style={styles.whyTitle}>{w.title}</Text>
              <Text style={styles.whyBody}>{w.body}</Text>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          // Next in the brief's order is Your Details (design/105), then the matter
          // picker and the experience tiers.
          onPress={() => router.push('/legal-advice/details')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue</Text>
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
  body: {
    marginTop: t.bodyGap,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },

  flourish: {
    marginTop: t.flourishGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flourishWhy: {
    marginTop: t.whyGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flourishLine: { flex: 1, height: t.flourishLine, backgroundColor: colors.border },
  flourishDot: {
    width: t.flourishDot,
    height: t.flourishDot,
    marginHorizontal: t.flourishGapX / 2,
    transform: [{ rotate: '45deg' }],
    backgroundColor: colors.brandDark,
  },
  flourishText: {
    marginHorizontal: t.flourishGapX / 2,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.flourishSize,
    color: colors.textPrimary,
  },
  sub: {
    marginTop: t.subGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.subSize,
    color: colors.textBody,
  },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: 'transparent',
    padding: t.cardPad,
  },
  cardOn: { borderColor: a.title },
  popular: {
    alignSelf: 'flex-start',
    minHeight: t.popularHeight,
    borderRadius: t.popularRadius,
    paddingHorizontal: t.popularPadX,
    marginBottom: 6,
    backgroundColor: a.popularBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularText: { fontFamily: font.appSemi, fontSize: t.popularSize, color: ink.onBrand },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  disc: {
    width: t.disc,
    height: t.disc,
    borderRadius: t.disc / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, minWidth: 0, marginLeft: t.discGap, marginRight: t.blockGap },
  cardTitle: { fontFamily: font.appBody, fontSize: t.cardTitleSize, color: a.title },
  cardBody: {
    marginTop: t.cardBodyGap,
    fontFamily: font.appBody,
    fontSize: t.cardBodySize,
    lineHeight: t.cardBodyLineHeight,
    color: colors.textBody,
  },
  rule: { marginTop: t.ruleGap, height: 1, backgroundColor: a.rule },
  strip: {
    marginTop: t.stripGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripText: {
    flexShrink: 1,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.stripSize,
    color: colors.textBody,
  },
  stripDivider: {
    width: t.stripDivider,
    height: t.stripDividerHeight,
    marginHorizontal: t.stripGapX,
    backgroundColor: a.rule,
  },

  block: {
    width: t.blockWidth,
    borderRadius: t.blockRadius,
    padding: t.blockPad,
    alignItems: 'center',
  },
  blockLabel: { fontFamily: font.appBody, fontSize: t.blockLabelSize, color: colors.textBody },
  blockPrice: {
    marginTop: t.blockPriceGap,
    fontFamily: font.appHeading,
    fontSize: t.blockPriceSize,
    color: a.title,
  },
  blockNote: {
    marginTop: t.blockNoteGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.blockNoteSize,
    lineHeight: t.blockNoteLineHeight,
    color: colors.textBody,
  },
  blockNoteTight: {
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.blockNoteSize,
    lineHeight: t.blockNoteLineHeight,
    color: colors.textBody,
  },
  blockCaption: {
    marginTop: t.blockCaptionGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.blockCaptionSize,
    color: colors.textPrimary,
  },

  whyRow: { marginTop: t.whyTitleGap, flexDirection: 'row' },
  whyCell: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 6 },
  whyCellDivided: { borderLeftWidth: t.whyDivider, borderLeftColor: colors.border },
  whyIcon: {
    width: t.whyIcon,
    height: t.whyIcon,
    borderRadius: t.whyIcon / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyTitle: {
    marginTop: t.whyTitleGap,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.whyTitleSize,
    lineHeight: t.whyTitleLineHeight,
    color: colors.brandDark,
  },
  whyBody: {
    marginTop: t.whyBodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.whyBodySize,
    lineHeight: t.whyBodyLineHeight,
    color: colors.textBody,
  },

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
});
