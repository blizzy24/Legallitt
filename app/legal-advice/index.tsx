import { router } from 'expo-router';
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Lock,
  MessageSquare,
  PhoneCall,
  Scale,
  ShieldCheck,
  Video,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ServiceHeader from '../../components/ServiceHeader';
import { shrinkToFit } from '../../constants/textFit';
import {
  LA_INCLUSION,
  LA_LANDING_ORDER,
  LA_LANDING_POPULAR,
  laConsultType,
  type LaConsultTypeId,
} from '../../data/legalAdvice';
import { colors, font, ink, laIndex as t } from '../../constants/theme';
import { useLegalAdvice } from '../../context/legalAdvice';

// Legal Advice landing.
//
// THE ARTWORK IS IN design/102-la-info.png, NOT design/101. The batch's file
// numbering is shifted by one — see the header of data/legalAdvice.ts.
// design/101-la-landing.png is a 1572x858 board holding only this screen's
// Chat-selected and Audio-selected inset states, which are implemented here as the
// three selectable states of the format picker.
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — TWO BLOCKS OF COPY BELONG TO A DIFFERENT SERVICE.
//
// Quick Submission reads "...submit your forensic review request" and Assistance
// Service reads "...guide you through the document review process". Both are
// Document Forensic's copy, sitting on the Legal Advice landing. Rendered exactly as
// drawn rather than reworded, because the right wording is a content decision, not a
// layout one — but neither line should ship.
//
// REPORTED — the design's detail card does not follow its own selection. In all
// three states (design/101's insets and design/102's default) the card's icon is the
// VIDEO icon and the button reads "Book Video Consultation • ₹999", even when the
// card's own title and fee say Chat ₹499 or Audio ₹699. Built to follow the
// selection, as the brief asks.
//
// REPORTED — the landing prices (Chat ₹499 / Video ₹999 / Audio ₹699) contradict the
// choose screen's (Chat ₹499 / Audio ₹999 / Video ₹1,499). This screen renders the
// landing's, exactly as drawn. Checkout uses the selected consultation's price from design/104.
// ─────────────────────────────────────────────────────────────────────────────

const TICKS = [
  'Understand your legal rights and options',
  'Get clarity on the next steps',
  'Discuss your matter with an experienced advocate',
  'Avoid unnecessary legal complications',
];

const WHY = [
  {
    icon: ShieldCheck,
    title: 'Verified Advocates',
    body: 'Connect with experienced and verified legal professionals.',
  },
  {
    icon: MessageSquare,
    title: 'Personalised Guidance',
    body: 'Get legal advice tailored to your specific situation.',
  },
  {
    icon: Lock,
    title: 'Secure & Confidential',
    body: 'Discuss your matter through a secure and confidential platform.',
  },
];

const FORMAT_ICONS: Record<LaConsultTypeId, typeof Video> = {
  chat: MessageSquare,
  video: Video,
  audio: PhoneCall,
};

export default function LegalAdviceIndexScreen() {
  const insets = useSafeAreaInsets();
  const { form, update } = useLegalAdvice();
  const [assisted, setAssisted] = useState(form.assisted);

  const selected = laConsultType(form.consultType);
  const DetailIcon = FORMAT_ICONS[selected.id];

  return (
    <View style={styles.screen}>
      <ServiceHeader title="Legal Advice Consultation" share={false} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <View style={styles.heroPill}>
              <Text style={styles.heroPillText} {...shrinkToFit(0.75)}>
                PROFESSIONAL LEGAL GUIDANCE
              </Text>
            </View>
            <Text style={styles.heroTitle} {...shrinkToFit(0.8)}>
              Get Expert Legal Advice
            </Text>
            <Text style={styles.heroBody}>
              Connect with experienced legal professionals and receive personalised guidance for
              your specific legal situation.
            </Text>
          </View>
          {/* Placeholder for design/102's scales illustration, sized to its box. */}
          <Scale size={t.heroArt} color={colors.brand} style={styles.heroArt} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Why seek legal advice?</Text>
          <Text style={styles.cardBody}>
            Before taking an important legal step, understand your rights, options and the
            possible course of action.
          </Text>
          <Text style={styles.cardBody}>
            Get professional guidance tailored to your situation, so you can make informed
            decisions with greater clarity and confidence.
          </Text>

          {TICKS.map((line, i) => (
            <View key={line} style={styles.tickRow}>
              <View style={styles.tickCircle}>
                <Check size={t.tickGlyph} color={t.tickColour} strokeWidth={3} />
              </View>
              <Text style={styles.tickText}>{line}</Text>
              {i === TICKS.length - 1 && (
                <Pressable
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => router.push('/legal-advice/info')}
                  style={styles.learn}
                >
                  <Text style={styles.learnText} {...shrinkToFit(0.8)}>
                    Learn more
                  </Text>
                  <ChevronRight size={t.learnIcon} color={colors.brandDark} />
                </Pressable>
              )}
            </View>
          ))}
        </View>

        <View style={styles.strip}>
          <ShieldCheck size={t.stripIcon} color={colors.brandDark} />
          <Text style={styles.stripText} {...shrinkToFit(0.75)}>
            Verified Advocates • Secure &amp; Confidential
          </Text>
        </View>

        <Text style={styles.section}>Why choose Legalitt?</Text>
        <View style={styles.whyRow}>
          {WHY.map((w) => (
            <View key={w.title} style={styles.whyCard}>
              <View style={styles.whyIcon}>
                <w.icon size={t.whyIconGlyph} color={colors.brandDark} />
              </View>
              <Text style={styles.whyTitle}>{w.title}</Text>
              <Text style={styles.whyBody}>{w.body}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.label} {...shrinkToFit(0.8)}>
          CHOOSE HOW YOU WOULD LIKE TO PROCEED
        </Text>

        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected: !assisted }}
          onPress={() => {
            setAssisted(false);
            update({ assisted: false });
          }}
          style={[styles.pick, !assisted && styles.pickOn]}
        >
          <View style={styles.pickHead}>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                DO IT YOURSELF
              </Text>
            </View>
            <View style={[styles.radio, !assisted && styles.radioOn]}>
              {!assisted && <View style={styles.radioInner} />}
            </View>
          </View>
          <Text style={styles.pickTitle} {...shrinkToFit(0.8)}>
            Quick Submission
          </Text>
          {/* Document Forensic's copy, as drawn. See the note at the top of this file. */}
          <Text style={styles.pickBody}>
            Upload your document, provide the required details and submit your forensic review
            request.
          </Text>
          <View style={styles.pickLink}>
            <Text style={styles.pickLinkText} {...shrinkToFit(0.8)}>
              Continue with Quick Submission
            </Text>
            <ArrowRight size={t.pickLinkIcon} color={colors.textPrimary} />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected: assisted }}
          onPress={() => {
            setAssisted(true);
            update({ assisted: true });
          }}
          style={[styles.pick, assisted && styles.pickOn]}
        >
          <View style={styles.pickHead}>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                GET EXPERT HELP
              </Text>
            </View>
            <View style={[styles.radio, assisted && styles.radioOn]}>
              {assisted && <View style={styles.radioInner} />}
            </View>
          </View>
          <Text style={styles.pickTitle} {...shrinkToFit(0.8)}>
            Assistance Service
          </Text>
          {/* Document Forensic's copy, as drawn. See the note at the top of this file. */}
          <Text style={styles.pickBody}>
            Tell us what you need help with and our team will guide you through the document
            review process.
          </Text>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/support-chat')}
              style={styles.action}
            >
              <MessageSquare size={t.actionIcon} color={colors.textBody} />
              <Text style={styles.actionText} {...shrinkToFit(0.75)}>
                Request Chat
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/callback')}
              style={styles.action}
            >
              <PhoneCall size={t.actionIcon} color={colors.textBody} />
              <Text style={styles.actionText} {...shrinkToFit(0.75)}>
                Request Callback
              </Text>
            </Pressable>
          </View>
        </Pressable>

        <View style={styles.formatHead}>
          <Text style={styles.label} {...shrinkToFit(0.8)}>
            CHOOSE YOUR CONSULTATION
          </Text>
          <Text style={styles.selectFormat} {...shrinkToFit(0.8)}>
            Select format
          </Text>
        </View>

        <View style={styles.formatRow}>
          {LA_LANDING_ORDER.map(laConsultType).map((c) => {
            const on = c.id === form.consultType;
            const Icon = FORMAT_ICONS[c.id];
            return (
              <Pressable
                key={c.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => update({ consultType: c.id })}
                style={[styles.format, on && styles.formatOn]}
              >
                {c.id === LA_LANDING_POPULAR && (
                  <View style={styles.popular}>
                    <Text style={styles.popularText} {...shrinkToFit(0.7)}>
                      POPULAR
                    </Text>
                  </View>
                )}
                <View style={styles.formatIcon}>
                  <Icon size={t.formatIconGlyph} color={colors.textPrimary} />
                </View>
                <Text style={styles.formatLabel} {...shrinkToFit(0.8)}>
                  {c.label}
                </Text>
                <Text style={styles.formatPrice} {...shrinkToFit(0.8)}>
                  ₹{c.landingPrice}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.detail}>
          <View style={styles.detailHead}>
            <DetailIcon size={t.detailIcon} color={colors.textPrimary} />
            <Text style={styles.detailTitle} {...shrinkToFit(0.8)}>
              {selected.title}
            </Text>
          </View>
          <Text style={styles.detailBody}>{selected.description}</Text>

          <View style={styles.rule} />

          <View style={styles.meta}>
            <Clock size={t.detailMetaIcon} color={colors.textPrimary} />
            <Text style={styles.metaText} {...shrinkToFit(0.8)}>
              {selected.duration}
            </Text>
            <Text style={styles.feeLabel} {...shrinkToFit(0.8)}>
              Fee:{' '}
            </Text>
            <Text style={styles.fee} {...shrinkToFit(0.8)}>
              ₹{selected.landingPrice}
            </Text>
          </View>

          <View style={styles.inclusion}>
            <ShieldCheck size={t.inclusionIcon} color={colors.textPrimary} />
            <Text style={styles.inclusionText} {...shrinkToFit(0.75)}>
              {LA_INCLUSION}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/legal-advice/details')}
            style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          >
            <Text style={styles.buttonLabel} {...shrinkToFit(0.75)}>
              Book {selected.label} Consultation • ₹{selected.landingPrice}
            </Text>
            <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  content: { paddingHorizontal: t.padX },

  hero: {
    marginTop: t.heroGap,
    minHeight: t.heroHeight,
    borderRadius: t.heroRadius,
    backgroundColor: colors.card,
    padding: t.heroPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroText: { flex: 1, minWidth: 0 },
  heroPill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: t.heroPillHeight,
    borderRadius: t.heroPillRadius,
    paddingHorizontal: t.heroPillPadX,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPillText: {
    fontFamily: font.appSemi,
    fontSize: t.heroPillSize,
    letterSpacing: t.heroPillSpacing,
    color: ink.onBrand,
  },
  heroTitle: {
    marginTop: t.heroTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.heroTitleSize,
    color: colors.textPrimary,
  },
  heroBody: {
    marginTop: t.heroBodyGap,
    fontFamily: font.appBody,
    fontSize: t.heroBodySize,
    lineHeight: t.heroBodyLineHeight,
    color: colors.textBody,
  },
  heroArt: { marginLeft: t.heroArtGap },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  cardTitle: { fontFamily: font.appHeading, fontSize: t.cardTitleSize, color: colors.textPrimary },
  cardBody: {
    marginTop: t.cardBodyGap,
    fontFamily: font.appBody,
    fontSize: t.cardBodySize,
    lineHeight: t.cardBodyLineHeight,
    color: colors.textBody,
  },
  tickRow: { marginTop: t.tickGap, flexDirection: 'row', alignItems: 'center' },
  tickCircle: {
    width: t.tickCircle,
    height: t.tickCircle,
    borderRadius: t.tickCircle / 2,
    backgroundColor: t.tickCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.tickIconGap,
    fontFamily: font.appBody,
    fontSize: t.tickSize,
    color: colors.textPrimary,
  },
  learn: { marginLeft: t.learnGap, flexDirection: 'row', alignItems: 'center' },
  learnText: { fontFamily: font.appSemi, fontSize: t.learnSize, color: colors.brandDark },

  strip: {
    marginTop: t.stripGap,
    minHeight: t.stripHeight,
    borderRadius: t.stripRadius,
    backgroundColor: t.stripBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  stripText: {
    marginLeft: t.stripIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.stripSize,
    color: colors.textPrimary,
  },

  section: {
    marginTop: t.sectionGap,
    fontFamily: font.appHeading,
    fontSize: t.sectionSize,
    color: colors.textPrimary,
  },
  whyRow: { marginTop: t.whyGap, flexDirection: 'row', gap: t.whyColGap },
  whyCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.whyRadius,
    backgroundColor: colors.card,
    padding: t.whyPad,
  },
  whyIcon: {
    width: t.whyIcon,
    height: t.whyIcon,
    borderRadius: t.whyIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  whyTitle: {
    marginTop: t.whyTitleGap,
    fontFamily: font.appBody,
    fontSize: t.whyTitleSize,
    lineHeight: t.whyTitleLineHeight,
    color: colors.textPrimary,
  },
  whyBody: {
    marginTop: t.whyBodyGap,
    fontFamily: font.appBody,
    fontSize: t.whyBodySize,
    lineHeight: t.whyBodyLineHeight,
    color: colors.textBody,
  },

  label: {
    marginTop: t.labelGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: colors.textPrimary,
  },

  pick: {
    marginTop: t.pickGap,
    borderRadius: t.pickRadius,
    backgroundColor: colors.card,
    borderWidth: t.pickBorder,
    borderColor: 'transparent',
    padding: t.pickPad,
  },
  pickOn: { borderColor: t.pickBorderOn },
  pickHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  chipText: {
    fontFamily: font.appSemi,
    fontSize: t.chipSize,
    letterSpacing: t.chipSpacing,
    color: colors.textBody,
  },
  radio: {
    marginLeft: 10,
    width: t.radio,
    height: t.radio,
    borderRadius: t.radio / 2,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: colors.brandDark, borderColor: colors.brandDark },
  radioInner: {
    width: t.radioInner,
    height: t.radioInner,
    borderRadius: t.radioInner / 2,
    backgroundColor: ink.onBrand,
  },
  pickTitle: {
    marginTop: t.pickTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.pickTitleSize,
    color: colors.textPrimary,
  },
  pickBody: {
    marginTop: t.pickBodyGap,
    fontFamily: font.appBody,
    fontSize: t.pickBodySize,
    lineHeight: t.pickBodyLineHeight,
    color: colors.textBody,
  },
  pickLink: { marginTop: t.pickLinkGap, flexDirection: 'row', alignItems: 'center' },
  pickLinkText: {
    marginRight: 8,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.pickLinkSize,
    color: colors.textPrimary,
  },

  actions: { marginTop: t.actionGap, flexDirection: 'row', gap: t.actionColGap },
  action: {
    flex: 1,
    minWidth: 0,
    minHeight: t.actionHeight,
    borderRadius: t.actionRadius,
    backgroundColor: t.actionBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  actionText: {
    marginLeft: t.actionIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.actionSize,
    color: colors.textBody,
  },

  formatHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectFormat: {
    marginTop: t.labelGap,
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.formatPriceSize,
    color: colors.textBody,
  },
  formatRow: { marginTop: t.formatGap, flexDirection: 'row', gap: t.formatColGap },
  format: {
    flex: 1,
    minWidth: 0,
    minHeight: t.formatHeight,
    borderRadius: t.formatRadius,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  formatOn: { borderColor: t.pickBorderOn },
  popular: {
    position: 'absolute',
    top: -t.popularHeight / 2,
    minHeight: t.popularHeight,
    borderRadius: t.popularRadius,
    paddingHorizontal: t.popularPadX,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularText: {
    fontFamily: font.appSemi,
    fontSize: t.popularSize,
    letterSpacing: t.popularSpacing,
    color: ink.onBrand,
  },
  formatIcon: {
    width: t.formatIcon,
    height: t.formatIcon,
    borderRadius: t.formatIcon / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatLabel: {
    marginTop: t.formatLabelGap,
    fontFamily: font.appHeading,
    fontSize: t.formatLabelSize,
    color: colors.textPrimary,
  },
  formatPrice: {
    marginTop: t.formatPriceGap,
    fontFamily: font.appSemi,
    fontSize: t.formatPriceSize,
    color: colors.brandDark,
  },

  detail: {
    marginTop: t.detailGap,
    borderRadius: t.detailRadius,
    backgroundColor: t.detailBg,
    padding: t.detailPad,
  },
  detailHead: { flexDirection: 'row', alignItems: 'center' },
  detailTitle: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.detailIconGap,
    fontFamily: font.appHeading,
    fontSize: t.detailTitleSize,
    color: colors.textPrimary,
  },
  detailBody: {
    marginTop: t.detailBodyGap,
    fontFamily: font.appBody,
    fontSize: t.detailBodySize,
    lineHeight: t.detailBodyLineHeight,
    color: colors.textBody,
  },
  rule: { marginTop: t.detailRuleGap, height: 1, backgroundColor: t.detailRule },
  meta: { marginTop: t.detailMetaGap, flexDirection: 'row', alignItems: 'center' },
  metaText: {
    marginLeft: t.detailMetaIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.detailMetaSize,
    color: colors.textPrimary,
  },
  feeLabel: { fontFamily: font.appBody, fontSize: t.detailFeeLabelSize, color: colors.textBody },
  fee: { fontFamily: font.appHeading, fontSize: t.detailFeeSize, color: colors.textPrimary },
  inclusion: {
    marginTop: t.inclusionGap,
    minHeight: t.inclusionHeight,
    borderRadius: t.inclusionRadius,
    paddingHorizontal: t.inclusionPadX,
    backgroundColor: t.inclusionBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inclusionText: {
    marginLeft: t.inclusionIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.inclusionSize,
    color: colors.textPrimary,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.buttonBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  pressed: { opacity: 0.85 },
  buttonLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
  buttonIcon: { marginLeft: t.buttonIconGap },
});
