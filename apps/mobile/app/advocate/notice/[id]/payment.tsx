import NoticeScreenFeedback from '../../../../components/NoticeScreenFeedback';
import { useAdvocateNoticeModel } from "../../../../features/legal-notice/useAdvocateNoticeModel";
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowLeft, ArrowRight, FileText, ShieldCheck } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PaymentMethods from '../../../../components/PaymentMethods';
import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_PAYMENT } from '../../../../data/advocateSide';
import { advNoticePayment as t, colors, font, ink } from '../../../../constants/theme';

// Complete Payment for the delivery booking (design/196).
//
// ⚠ THE GST DOES NOT COMPUTE. ₹250 service fee + ₹40 labelled "GST 18%" = ₹290.
// 18% of 250 is ₹45, which would total ₹295. Either the figure or the label is
// wrong. The drawn figures are used verbatim and NOT computed, so the screen matches
// the export — see the note in data/advocateSide.ts.
//
// ⚠ "High Court Represantative" is misspelled AND names a different service from the
// Legal Notice flow this screen sits inside.
//
// ⚠ Ref ID "#LGT-849204" is the Legal Notice reference again — its fifth appearance
// across three unrelated services (designs 28, 29, 30, 86, 196). Kept as drawn.
//
// Pay routes to the shared scan-pay screen, parameterised with this service's name,
// amount and reference, as the Property Search and Document Forensic flows do.

export function AdvocateNoticePaymentView({payment, navigate, payHref}: {payment: typeof ADV_NOTICE_PAYMENT; navigate: typeof router; payHref: Href}) {
  const router = navigate;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = payment;

  // design/197 → 198, the advocate's own Scan & Pay and success (not the client
  // Legal Notice screens 29–30).


  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
          style={styles.backBtn}
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {p.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.tag}>
              <FileText size={t.tagIcon} color={colors.brandDark} />
            </View>
            <View style={styles.bigIcon}>
              <FileText size={t.bigIconGlyph} color={colors.brandDark} />
            </View>
          </View>

          <Text style={styles.svc} {...shrinkToFit(0.7)}>
            {p.service}
          </Text>
          <Text style={styles.ref} {...shrinkToFit(0.75)}>
            {p.refLabel} {p.ref} ·
          </Text>

          <View style={styles.rule} />

          {/* Drawn figures; see the GST note at the top of this file. */}
          {p.lines.map((l) => (
            <View key={l.label} style={styles.line}>
              <Text style={styles.lineLabel} {...shrinkToFit(0.7)}>
                {l.label}
              </Text>
              <Text style={styles.lineAmount} {...shrinkToFit(0.75)}>
                {l.amount}
              </Text>
            </View>
          ))}

          <View style={styles.rule} />

          <View style={styles.total}>
            <Text style={styles.totalLabel} {...shrinkToFit(0.75)}>
              {p.totalLabel}
            </Text>
            <Text style={styles.totalAmount} {...shrinkToFit(0.75)}>
              {p.total}
            </Text>
          </View>
          <Text style={styles.totalNote} {...shrinkToFit(0.8)}>
            {p.totalNote}
          </Text>
        </View>

        <View style={styles.methodsRow}>
          <Text style={styles.methodsLabel} {...shrinkToFit(0.8)}>
            {p.methodsLabel}
          </Text>
          <Text style={styles.methodsMeta} {...shrinkToFit(0.8)}>
            {p.methodsMeta}
          </Text>
        </View>
        <PaymentMethods />

        <View style={styles.secure}>
          <ShieldCheck size={t.secureIcon} color={colors.brandDark} />
          <Text style={styles.secureText}>{p.secureNote}</Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel} {...shrinkToFit(0.8)}>
            {p.barLabel}
          </Text>
          <Text style={styles.barAmount} {...shrinkToFit(0.75)}>
            {p.total}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(payHref)}
          style={({ pressed }) => [styles.pay, pressed && styles.pressed]}
        >
          <Text style={styles.payText} {...shrinkToFit(0.8)}>
            {p.pay}
          </Text>
          <ArrowRight size={t.payIcon} color={ink.onBrand} style={styles.payIcon} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.headerBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: t.backBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.backGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },

  content: { paddingHorizontal: t.padX, paddingTop: t.cardGap, paddingBottom: 28 },
  card: {
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start' },
  tag: {
    minHeight: t.tagHeight,
    borderRadius: t.tagRadius,
    paddingHorizontal: t.tagPadX,
    backgroundColor: t.tagBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigIcon: {
    marginLeft: 'auto',
    width: t.bigIcon,
    height: t.bigIcon,
    borderRadius: t.bigIconRadius,
    backgroundColor: t.bigIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svc: { marginTop: t.svcGap, fontFamily: font.appHeading, fontSize: t.svcSize, color: colors.textPrimary },
  ref: { marginTop: t.refGap, fontFamily: font.appBody, fontSize: t.refSize, color: colors.textBody },

  rule: { marginVertical: t.ruleGap, height: 1, backgroundColor: t.rule },
  line: { marginBottom: t.lineGap, flexDirection: 'row', alignItems: 'center' },
  lineLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appBody,
    fontSize: t.lineLabelSize,
    color: colors.textBody,
  },
  lineAmount: { fontFamily: font.appBody, fontSize: t.lineAmountSize, color: colors.textPrimary },
  total: { flexDirection: 'row', alignItems: 'center' },
  totalLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.totalLabelSize,
    color: colors.textPrimary,
  },
  totalAmount: { fontFamily: font.appHeading, fontSize: t.totalAmountSize, color: colors.textPrimary },
  totalNote: {
    marginTop: t.totalNoteGap,
    textAlign: 'right',
    fontFamily: font.appBody,
    fontSize: t.totalNoteSize,
    color: colors.textBody,
  },

  methodsRow: { marginTop: t.methodsGap, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  methodsLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appSemi,
    fontSize: t.methodsLabelSize,
    letterSpacing: t.methodsLabelSpacing,
    color: colors.textBody,
  },
  methodsMeta: { fontFamily: font.appBody, fontSize: t.methodsMetaSize, color: colors.brandDark },

  secure: { marginTop: t.secureGap, flexDirection: 'row', alignItems: 'flex-start' },
  secureText: {
    marginLeft: t.secureIconGap,
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.secureSize,
    lineHeight: t.secureLineHeight,
    color: colors.textBody,
  },

  bar: {
    paddingHorizontal: t.barPadX,
    paddingTop: t.barPadTop,
    backgroundColor: t.barBg,
    borderTopWidth: 1,
    borderTopColor: t.barBorder,
  },
  barRow: { flexDirection: 'row', alignItems: 'center' },
  barLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appBody,
    fontSize: t.barLabelSize,
    color: colors.textPrimary,
  },
  barAmount: { fontFamily: font.appHeading, fontSize: t.barAmountSize, color: colors.textPrimary },
  pay: {
    marginTop: t.payGap,
    minHeight: t.payHeight,
    borderRadius: t.payRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payText: { fontFamily: font.appHeading, fontSize: t.paySize, color: ink.onBrand },
  payIcon: { marginLeft: t.payIconGap },
  pressed: { opacity: 0.85 },
});

export default function AdvocateNoticePaymentScreen() {
  const model = useAdvocateNoticeModel('payment');
  return <NoticeScreenFeedback error={model.error}><AdvocateNoticePaymentView payment={model.data.ADV_NOTICE_PAYMENT} navigate={model.navigate} payHref={model.path('scan-pay')} /></NoticeScreenFeedback>;
}
