import { router } from 'expo-router';
import {
  Briefcase,
  ChevronLeft,
  MessageSquare,
  Phone,
  UserRoundCheck,
  Video,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import {
  LA_CHOOSE_POPULAR,
  LA_EXPERIENCE_TIERS,
  laConsultType,
  type LaConsultTypeId,
} from '../../data/legalAdvice';
import {
  colors,
  font,
  ink,
  laChoose as c,
  laChooseAccent as a,
  laExperience as t,
} from '../../constants/theme';
import { useLegalAdvice } from '../../context/legalAdvice';

// Advocate experience picker.
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — THE FILE NAMES ARE WRONG AND ONE STATE IS MISSING.
//
//   design/122-la-experience-audio.png actually draws the CHAT state (first card
//     "Chat Consultation ₹499", green accent)
//   design/123-la-experience-video.png actually draws the AUDIO state (first card
//     "Audio Consultation ₹999", indigo accent)
//   design/121-la-experience-chat.png is not this screen at all — it is "Request a
//     Callback"
//
// There is NO VIDEO state in the export. It is built here from the same template,
// since the first card simply reflects whatever was chosen earlier, but nobody has
// drawn it. (design/124-la-datetime.png is correctly named, so the batch's one-off
// numbering shift ends at 123.)
//
// REPORTED — THE SELECTED-BORDER COLOUR IS NOT ARBITRARY. design/122 draws it dark
// GREEN and design/123 dark INDIGO, which are exactly the chat and audio accents
// from the choose screen (design/104) — the tier tint tracks the consultation type
// rather than varying at random. Per instruction the border is drawn in the BRAND
// colour instead, since the app has no blue or red accent; but the premise that the
// two files disagree about one state does not hold, and reverting to per-type
// accents is a one-line change because `laChooseAccent` already holds those tones.
//
// REPORTED — chat's duration is given as "Up to 30 mins" here and "Up to 7 days" on
// the choose screen. That is a THIRD unit for the same product, after the landing's
// "30 Mins Session".
//
// REPORTED — design/123's first card carries the page-allowance lines and
// design/122's does not, for the same card in the same position.
//
// Pricing stays blocked: the tier prices are a second axis that no screen reconciles
// with the consultation-type prices. Nothing here computes a total.
// ─────────────────────────────────────────────────────────────────────────────

const ICONS: Record<LaConsultTypeId, typeof Video> = {
  chat: MessageSquare,
  audio: Phone,
  video: Video,
};

export default function LegalAdviceExperienceScreen() {
  const insets = useSafeAreaInsets();
  const { form, update } = useLegalAdvice();

  const chosen = laConsultType(form.consultType);
  const ChosenIcon = ICONS[chosen.id];
  const chosenTone = a[chosen.id];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + c.backTop, paddingBottom: insets.bottom + c.cardGap },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/legal-advice/matter')
          }
        >
          <ChevronLeft size={c.backIcon} color={colors.textPrimary} />
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
            Advocate Experience
          </Text>
          <View style={styles.flourishDot} />
          <View style={styles.flourishLine} />
        </View>
        <Text style={styles.sub} {...shrinkToFit(0.8)}>
          Select based on years of professional practice
        </Text>

        {/* Reflects the type chosen on the previous screen; not re-selectable here. */}
        <View style={styles.card}>
          {chosen.id === LA_CHOOSE_POPULAR && (
            <View style={styles.popular}>
              <Text style={styles.popularText} {...shrinkToFit(0.8)}>
                Popular
              </Text>
            </View>
          )}
          <View style={styles.cardRow}>
            <View style={[styles.disc, { backgroundColor: chosenTone.disc }]}>
              <ChosenIcon size={c.discGlyph} color={chosenTone.glyph} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
                {chosen.title}
              </Text>
              <Text style={styles.cardBody}>{chosen.chooseDescription}</Text>
              <View style={styles.rule} />
              <View style={styles.strip}>
                <Text style={styles.stripText} {...shrinkToFit(0.75)}>
                  {chosen.strip[0]}
                </Text>
                <View style={styles.stripDivider} />
                <Text style={styles.stripText} {...shrinkToFit(0.75)}>
                  {chosen.strip[1]}
                </Text>
              </View>
            </View>
            <View style={[styles.block, { backgroundColor: chosenTone.block }]}>
              <Text style={styles.blockLabel} {...shrinkToFit(0.8)}>
                Starting at
              </Text>
              <Text style={styles.blockPrice} {...shrinkToFit(0.7)}>
                ₹{chosen.choosePrice.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.blockCaption} {...shrinkToFit(0.75)}>
                Quick Easy Private
              </Text>
            </View>
          </View>
        </View>

        {LA_EXPERIENCE_TIERS.map((tier) => {
          const on = form.experience === tier.id;
          return (
            <Pressable
              key={tier.id}
              accessibilityRole="radio"
              accessibilityState={{ selected: on }}
              onPress={() => update({ experience: tier.id })}
              style={[styles.card, on && styles.cardOn]}
            >
              <View style={styles.cardRow}>
                <View style={[styles.disc, { backgroundColor: chosenTone.disc }]}>
                  <UserRoundCheck size={c.discGlyph} color={chosenTone.glyph} />
                </View>

                <View style={styles.cardText}>
                  <View style={styles.yearsRow}>
                    <Briefcase size={t.yearsIcon} color={t.yearsColour} />
                    <Text style={styles.years} {...shrinkToFit(0.75)}>
                      {tier.years}
                    </Text>
                  </View>
                  <Text style={styles.tierTitle} {...shrinkToFit(0.75)}>
                    {tier.title}
                  </Text>
                  <Text style={styles.cardBody}>{tier.description}</Text>
                  <View style={styles.rule} />
                  <View style={styles.strip}>
                    <Text style={styles.stripText} {...shrinkToFit(0.75)}>
                      {tier.strip[0]}
                    </Text>
                    <View style={styles.stripDivider} />
                    <Text style={styles.stripText} {...shrinkToFit(0.75)}>
                      {tier.strip[1]}
                    </Text>
                  </View>
                </View>

                <View style={[styles.block, { backgroundColor: chosenTone.block }]}>
                  <Text style={styles.blockLabel} {...shrinkToFit(0.8)}>
                    Starting at
                  </Text>
                  <Text style={styles.blockPrice} {...shrinkToFit(0.7)}>
                    ₹{tier.startingAt.toLocaleString('en-IN')}
                  </Text>
                  <Text style={styles.blockCaption} {...shrinkToFit(0.75)}>
                    {tier.caption}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/legal-advice/datetime')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg },
  content: { paddingHorizontal: c.padX },

  title: {
    marginTop: c.titleGap,
    fontFamily: font.appHeading,
    fontSize: c.titleSize,
    lineHeight: c.titleLineHeight,
    color: colors.textPrimary,
  },
  titleAccent: { color: colors.brand },
  body: {
    marginTop: c.bodyGap,
    fontFamily: font.appBody,
    fontSize: c.bodySize,
    lineHeight: c.bodyLineHeight,
    color: colors.textBody,
  },

  flourish: {
    marginTop: t.flourishGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flourishLine: { flex: 1, height: c.flourishLine, backgroundColor: colors.border },
  flourishDot: {
    width: c.flourishDot,
    height: c.flourishDot,
    marginHorizontal: c.flourishGapX / 2,
    transform: [{ rotate: '45deg' }],
    backgroundColor: colors.brandDark,
  },
  flourishText: {
    marginHorizontal: c.flourishGapX / 2,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: c.flourishSize,
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
    marginTop: c.cardGap,
    borderRadius: c.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: 'transparent',
    padding: c.cardPad,
  },
  // design/122 and 123 tint this border to match the consultation type; the brand
  // colour is used instead, per instruction. See the note at the top of the file.
  cardOn: { borderColor: colors.brand },
  popular: {
    alignSelf: 'flex-start',
    minHeight: c.popularHeight,
    borderRadius: c.popularRadius,
    paddingHorizontal: c.popularPadX,
    marginBottom: 6,
    backgroundColor: a.popularBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularText: { fontFamily: font.appSemi, fontSize: c.popularSize, color: ink.onBrand },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  disc: {
    width: c.disc,
    height: c.disc,
    borderRadius: c.disc / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, minWidth: 0, marginLeft: c.discGap, marginRight: c.blockGap },
  cardTitle: { fontFamily: font.appBody, fontSize: c.cardTitleSize, color: a.title },

  yearsRow: { flexDirection: 'row', alignItems: 'center' },
  years: {
    marginLeft: t.yearsIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.yearsSize,
    color: t.yearsColour,
  },
  tierTitle: {
    marginTop: t.yearsGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: t.titleColour,
  },

  cardBody: {
    marginTop: c.cardBodyGap,
    fontFamily: font.appBody,
    fontSize: c.cardBodySize,
    lineHeight: c.cardBodyLineHeight,
    color: colors.textBody,
  },
  rule: { marginTop: c.ruleGap, height: 1, backgroundColor: a.rule },
  strip: {
    marginTop: c.stripGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripText: {
    flexShrink: 1,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: c.stripSize,
    color: colors.textBody,
  },
  stripDivider: {
    width: c.stripDivider,
    height: c.stripDividerHeight,
    marginHorizontal: c.stripGapX,
    backgroundColor: a.rule,
  },

  block: {
    width: c.blockWidth,
    borderRadius: c.blockRadius,
    padding: c.blockPad,
    alignItems: 'center',
  },
  blockLabel: { fontFamily: font.appBody, fontSize: c.blockLabelSize, color: colors.textBody },
  blockPrice: {
    marginTop: c.blockPriceGap,
    fontFamily: font.appHeading,
    fontSize: c.blockPriceSize,
    color: a.title,
  },
  blockCaption: {
    marginTop: c.blockCaptionGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: c.blockCaptionSize,
    color: colors.textPrimary,
  },

  button: {
    marginTop: c.buttonGap,
    minHeight: c.buttonHeight,
    borderRadius: c.buttonRadius,
    backgroundColor: c.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appSemi, fontSize: c.buttonSize, color: ink.onBrand },
});
