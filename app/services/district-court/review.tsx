import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CalendarX,
  Check,
  CircleCheck,
  CircleQuestionMark,
  ExternalLink,
  FileText,
  FolderOpen,
  Info,
  Landmark,
  MapPin,
  Paperclip,
  Pencil,
  Pointer,
  ReceiptText,
  Scale,
  ScrollText,
  Shield,
  ShieldCheck,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import {
  advForensicRed,
  courierHeader as h,
  dcCaseType,
  dcReview as t,
  dcReviewPalette as p,
  font,
  hcPalette as c,
  ink,
  shadow,
} from '../../../constants/theme';
import { DC_REVIEW } from '../../../data/districtCourt';

// District Court — review request (design/344). Measured at 2.000 px/pt.
// Reached from the button on design/343. Submit Request opens the service-fee
// payment (/services/district-court/payment → design/298's success) — see the
// payment note in data/districtCourt.ts.
//
// Each section's Edit returns to the screen that set it (340, 341, 342, 343);
// "View All Documents" opens 342. The two confirmation boxes are real local
// toggles; the button is drawn active with both unticked, so it is not gated.
// "Terms of Service" has no destination; "Privacy Policy" opens /privacy.
//
// Section heads (#FBF9F9) use hcPalette.page; the date panel's red is the
// existing advForensicRed.

const EDIT = {
  type: '/services/district-court/case-type',
  details: '/services/district-court/case-details',
  docs: '/services/district-court/documents',
  service: '/services/district-court/pricing',
} as const;

const breakable = (name: string) => name.replace(/_/g, '_​');

function Section({
  icon: Icon,
  title,
  edit,
  children,
  first,
}: {
  icon: typeof Landmark;
  title: string;
  edit: keyof typeof EDIT;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <View style={[styles.card, first ? styles.cardFirst : styles.cardNext]}>
      <View style={styles.head}>
        <Icon size={t.headIcon} color={c.ink} strokeWidth={1.9} />
        <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
          {title}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${DC_REVIEW.edit} ${title}`}
          hitSlop={8}
          onPress={() => router.push(EDIT[edit] as Href)}
          style={styles.edit}
        >
          <Pencil size={t.editIcon} color={c.brown} strokeWidth={2} />
          <Text style={styles.editText}>{DC_REVIEW.edit}</Text>
        </Pressable>
      </View>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

function Box({ on, onPress, label }: { on: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: on }} onPress={onPress} style={styles.agree}>
      <View style={[styles.box, on && styles.boxOn]}>
        {on && <Check size={t.boxGlyph} color={ink.onBrand} strokeWidth={3} />}
      </View>
      <Text style={styles.agreeText}>{label}</Text>
    </Pressable>
  );
}

export default function DistrictReviewScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_REVIEW;
  const [confirm, setConfirm] = useState(false);
  const [agree, setAgree] = useState(false);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        backHref={'/services/district-court/pricing' as Href}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Help"
            hitSlop={8}
            onPress={() => router.push('/help' as Href)}
            style={styles.help}
          >
            <CircleQuestionMark size={dcCaseType.helpIcon} color={h.ink} strokeWidth={1.9} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <Text style={styles.caps} {...shrinkToFit(0.8)}>
            {d.step}
          </Text>
          <View style={styles.pill}>
            <BadgeCheck size={t.pillIcon} color={p.finalPill} fill={c.greenInk} strokeWidth={2} />
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {d.final}
            </Text>
          </View>
        </View>
        <View style={styles.bar} />
        <View style={styles.labels}>
          {d.steps.map((s, i) => {
            const last = i === d.steps.length - 1;
            return (
              <View key={s} style={styles.label}>
                <Check size={t.labelIcon} color={last ? c.brown : c.greenInk} strokeWidth={2.4} />
                <Text style={[styles.labelText, last && styles.labelLast]} {...shrinkToFit(0.75)}>
                  {s}
                </Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.lead}>{d.lead}</Text>
        <View style={styles.hint}>
          <Pointer size={t.hintIcon} color={c.brown} strokeWidth={2} />
          <Text style={styles.hintText}>{d.hint}</Text>
        </View>

        <Section icon={Landmark} title={d.typeHead} edit="type" first>
          <Text style={styles.typeTitle}>{d.typeTitle}</Text>
          <View style={styles.typeRow}>
            <View style={styles.chip}>
              <Scale size={t.chipIcon} color={c.brownInk} strokeWidth={2} />
              <Text style={styles.chipText}>{d.typeChip}</Text>
            </View>
            <Text style={styles.typeNote}>{d.typeNote}</Text>
          </View>
        </Section>

        <Section icon={FileText} title={d.detailsHead} edit="details">
          {d.fields.map(([label, value, kind], i) => (
            <View key={label} style={i === 1 ? styles.fieldNext : i === 2 ? styles.fieldTight : undefined}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <View style={styles.fieldRow}>
                {kind === 'pin' && <MapPin size={t.pinIcon} color={c.inkWarm} strokeWidth={2} style={styles.pin} />}
                <Text style={[styles.fieldValue, kind === 'strong' && styles.fieldStrong, kind === 'pin' && styles.pinValue]}>
                  {value}
                </Text>
              </View>
            </View>
          ))}
          <Text style={[styles.fieldLabel, styles.storyLabel]}>{d.storyLabel}</Text>
          <View style={styles.story}>
            <Text style={styles.storyText}>{d.story}</Text>
          </View>
          <View style={styles.date}>
            <CalendarX size={t.dateIcon} color={advForensicRed.declineColour} strokeWidth={2} />
            <View style={styles.flex}>
              <Text style={styles.dateTitle}>{d.dateTitle}</Text>
              <Text style={styles.dateValue}>{d.date}</Text>
            </View>
          </View>
        </Section>

        <Section icon={ScrollText} title={d.existingHead} edit="details">
          <View style={styles.grid}>
            <View style={styles.flex}>
              <Text style={styles.fieldLabel}>{d.ongoingLabel}</Text>
              <View style={styles.dotRow}>
                <View style={styles.dot} />
                <Text style={[styles.gridValue, styles.fieldStrong]}>{d.ongoing}</Text>
              </View>
            </View>
            <View style={styles.flex}>
              <Text style={styles.fieldLabel}>{d.numberLabel}</Text>
              <Text style={[styles.gridValue, styles.mono]}>{d.number}</Text>
            </View>
          </View>
          <View style={[styles.grid, styles.gridNext]}>
            <View style={styles.flex}>
              <Text style={styles.fieldLabel}>{d.prevLabel}</Text>
              <Text style={styles.gridValue}>{d.prev}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={styles.fieldLabel}>{d.nocLabel}</Text>
              <Text style={[styles.gridValue, styles.brown]}>{d.noc}</Text>
            </View>
          </View>
          <View style={styles.reason}>
            <Text style={styles.fieldLabel}>{d.reasonLabel}</Text>
            <Text style={styles.gridValue}>{d.reason}</Text>
          </View>
          <View style={styles.noc}>
            <Info size={t.nocIcon} color={c.inkWarm} strokeWidth={2} />
            <Text style={styles.nocText}>{d.nocNote}</Text>
          </View>
        </Section>

        <Section icon={FolderOpen} title={d.docsHead} edit="docs">
          {d.docs.map((doc, i) => (
            <View key={doc.name} style={[styles.doc, i > 0 && styles.docNext]}>
              <CircleCheck size={t.docCheck} color={ink.onBrand} fill={c.greenInk} strokeWidth={2.2} />
              <View style={styles.flex}>
                <Text style={styles.docName}>{breakable(doc.name)}</Text>
                <Text style={styles.docMeta}>{doc.meta}</Text>
              </View>
              {doc.id ? (
                <ShieldCheck size={t.docIcon} color={c.inkWarm} strokeWidth={1.9} />
              ) : (
                <Paperclip size={t.docIcon} color={c.inkWarm} strokeWidth={1.9} />
              )}
            </View>
          ))}
          <View style={styles.docsFoot}>
            <Text style={styles.docsFootText} {...shrinkToFit(0.75)}>
              {d.docsFoot}
            </Text>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push(EDIT.docs as Href)}
              style={styles.link}
            >
              <Text style={styles.linkText} {...shrinkToFit(0.75)}>
                {d.viewAll}
              </Text>
              <ExternalLink size={t.linkIcon} color={c.brown} strokeWidth={2} />
            </Pressable>
          </View>
        </Section>

        <Section icon={Award} title={d.svcHead} edit="service">
          <View style={styles.svc}>
            <View style={styles.flex}>
              <Text style={styles.svcTitle}>{d.svcTitle}</Text>
              <Text style={styles.svcDesc}>{d.svcDesc}</Text>
            </View>
            <View style={styles.svcRight}>
              <Text style={styles.svcPrice}>{d.svcPrice}</Text>
              <Text style={styles.svcRate}>{d.svcRate}</Text>
            </View>
          </View>
        </Section>

        <View style={styles.sum}>
          <View style={styles.sumHead}>
            <ReceiptText size={t.sumIcon} color={c.brown} strokeWidth={1.9} />
            <Text style={styles.sumTitle} {...shrinkToFit(0.8)}>
              {d.sumTitle}
            </Text>
          </View>
          <View style={styles.sumRows}>
            {d.sumRows.map(([label, value]) => (
              <View key={label} style={styles.sumRow}>
                <Text style={styles.sumLabel}>{label}</Text>
                <Text style={styles.sumValue} {...shrinkToFit(0.75)}>
                  {value}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.rule} />
          <View style={styles.total}>
            <View style={[styles.flex, styles.totalText]}>
              <Text style={styles.totalLabel}>{d.totalLabel}</Text>
              <Text style={styles.totalSub}>{d.totalSub}</Text>
            </View>
            <Text style={styles.totalPrice}>{d.totalPrice}</Text>
          </View>
          <View style={styles.sumInfo}>
            <BadgeCheck size={t.sumInfoIcon} color={c.brown} strokeWidth={1.9} />
            <Text style={styles.sumInfoText}>{d.sumInfo}</Text>
          </View>
        </View>

        <View style={styles.before}>
          <View style={styles.beforeHead}>
            <Shield size={t.beforeIcon} color={c.brownInk} fill={c.brownInk} strokeWidth={2} />
            <Text style={styles.beforeTitle} {...shrinkToFit(0.8)}>
              {d.beforeTitle}
            </Text>
          </View>
          <Text style={styles.beforeBody}>{d.beforeBody}</Text>
          <Text style={styles.beforeNote}>{d.beforeNote}</Text>
        </View>

        <View style={styles.confirm}>
          <Box on={confirm} onPress={() => setConfirm((v) => !v)} label={d.confirm} />
          <View style={styles.agreeNext}>
            <Box on={agree} onPress={() => setAgree((v) => !v)} label={d.agree} />
          </View>
          <Text style={styles.legal}>
            {d.legal[0]}
            <Text style={styles.legalLink}>{d.legal[1]}</Text>
            {d.legal[2]}
            <Text style={styles.legalLink} onPress={() => router.push('/privacy' as Href)}>
              {d.legal[3]}
            </Text>
            {d.legal[4]}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.foot, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => router.push('/services/district-court/payment' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.cap}>{d.caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.bottomPad },
  flex: { flex: 1, minWidth: 0 },
  help: { marginRight: dcCaseType.helpGap },
  brown: { color: c.brown },

  row: { marginTop: t.rowTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.pillGap },
  caps: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.capsSize, letterSpacing: t.capsSpacing, color: c.brown },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: p.finalPill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
    flexShrink: 1,
  },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: c.greenInk },
  bar: { marginTop: t.barTop, height: t.barH, borderRadius: t.barH / 2, backgroundColor: c.greenInk },
  labels: { marginTop: t.labelsTop, flexDirection: 'row' },
  label: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.labelGap },
  labelText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.labelSize, lineHeight: t.labelLineHeight, color: c.greenInk },
  labelLast: { color: c.brown },

  h1: { marginTop: t.h1Top, fontFamily: font.appSemi, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  lead: { marginTop: t.leadTop, fontFamily: font.appBody, fontSize: t.leadSize, lineHeight: t.leadLineHeight, color: c.inkWarm },
  hint: { marginTop: t.hintTop, flexDirection: 'row', alignItems: 'center', gap: t.hintGap },
  hintText: { flex: 1, fontFamily: font.appBody, fontSize: t.hintSize, color: c.brown },

  card: { borderRadius: t.cardRadius, backgroundColor: c.card, overflow: 'hidden', ...shadow },
  cardFirst: { marginTop: t.cardTop },
  cardNext: { marginTop: t.cardGap },
  head: {
    minHeight: t.headH,
    paddingLeft: t.headPadX,
    paddingRight: t.headPadRight,
    backgroundColor: c.page,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.headGap,
  },
  headTitle: { flex: 1, fontFamily: font.appSemi, fontSize: t.headSize, color: c.ink },
  edit: { flexDirection: 'row', alignItems: 'center', gap: t.editGap },
  editText: { fontFamily: font.appSemi, fontSize: t.editSize, color: c.brown },
  body: { padding: t.bodyPad, paddingTop: t.bodyPadTop },

  typeTitle: { fontFamily: font.appSemi, fontSize: t.typeSize, lineHeight: t.typeLineHeight, color: c.ink },
  typeRow: { marginTop: t.typeRowTop, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.rowGap },
  chip: {
    height: t.chipH,
    borderRadius: t.chipH / 2,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.peachDecide,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.chipGap,
  },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, letterSpacing: t.chipSpacing, color: c.brownInk },
  typeNote: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.chipSize, color: c.inkWarm },

  fieldNext: { marginTop: t.fieldGap },
  fieldTight: { marginTop: t.fieldGapTight },
  storyLabel: { marginTop: t.storyLabelTop },
  pinValue: { lineHeight: t.pinLineHeight },
  fieldLabel: { fontFamily: font.appBody, fontSize: t.fieldLabelSize, lineHeight: t.fieldLabelLineHeight, color: c.inkWarm },
  fieldRow: { marginTop: t.fieldValueTop, flexDirection: 'row', alignItems: 'center', gap: t.pinGap },
  pin: { alignSelf: 'center' },
  fieldValue: { flex: 1, fontFamily: font.appBody, fontSize: t.fieldValueSize, lineHeight: t.fieldValueLineHeight, color: c.ink },
  fieldStrong: { fontFamily: font.appSemi },
  story: { marginTop: t.storyTop, borderRadius: t.storyRadius, padding: t.storyPad, backgroundColor: c.panel },
  storyText: { fontFamily: font.appBody, fontSize: t.storySize, lineHeight: t.storyLineHeight, color: c.ink },
  date: {
    marginTop: t.dateTop,
    borderRadius: t.dateRadius,
    paddingHorizontal: t.datePadX,
    paddingVertical: t.datePadY,
    backgroundColor: p.datePanel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.dateGap,
  },
  dateTitle: {
    fontFamily: font.appSemi,
    fontSize: t.dateTitleSize,
    lineHeight: t.dateTitleLineHeight,
    letterSpacing: t.dateTitleSpacing,
    color: advForensicRed.declineColour,
  },
  dateValue: { fontFamily: font.appBody, fontSize: t.dateValueSize, lineHeight: t.dateValueLineHeight, color: c.ink },

  grid: { flexDirection: 'row', gap: t.gridGap },
  gridNext: { marginTop: t.gridRowGap },
  reason: { marginTop: t.reasonTop },
  gridValue: { marginTop: t.fieldValueTop, fontFamily: font.appBody, fontSize: t.gridValueSize, lineHeight: t.gridValueLineHeight, color: c.ink },
  mono: { fontFamily: font.mono, fontWeight: '700' },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: t.dotGap },
  dot: { marginTop: t.fieldValueTop, width: t.dot, height: t.dot, borderRadius: t.dot / 2, backgroundColor: c.greenInk },
  noc: {
    marginTop: t.nocTop,
    borderRadius: t.nocRadius,
    paddingHorizontal: t.nocPadX,
    paddingVertical: t.nocPadY,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.nocGap,
  },
  nocText: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.nocSize,
    lineHeight: t.nocLineHeight,
    letterSpacing: t.nocSpacing,
    color: c.inkWarm,
  },

  doc: {
    minHeight: t.docH,
    borderRadius: t.docRadius,
    paddingHorizontal: t.docPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.docGapX,
  },
  docNext: { marginTop: t.docGap },
  docName: { fontFamily: font.appBody, fontSize: t.docNameSize, lineHeight: t.docNameLineHeight, color: c.ink },
  docMeta: { fontFamily: font.appBody, fontSize: t.docMetaSize, lineHeight: t.docMetaLineHeight, color: c.inkWarm },
  docsFoot: { marginTop: t.docsFootTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.rowGap },
  docsFootText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.docsFootSize, color: c.inkWarm },
  link: { flexDirection: 'row', alignItems: 'center', gap: t.linkGap, flexShrink: 1 },
  linkText: { fontFamily: font.appSemi, fontSize: t.docsFootSize, color: c.brown, textDecorationLine: 'underline' },

  svc: { flexDirection: 'row', gap: t.rowGap },
  svcTitle: { fontFamily: font.appSemi, fontSize: t.svcTitleSize, lineHeight: t.svcTitleLineHeight, color: c.ink },
  svcDesc: { marginTop: t.svcDescTop, fontFamily: font.appBody, fontSize: t.svcDescSize, lineHeight: t.svcDescLineHeight, color: c.inkWarm },
  svcRight: { alignItems: 'flex-end' },
  svcPrice: { fontFamily: font.appSemi, fontSize: t.svcPriceSize, color: c.ink },
  svcRate: {
    marginTop: t.svcRateTop,
    width: t.svcRateW,
    textAlign: 'right',
    fontFamily: font.appBody,
    fontSize: t.svcRateSize,
    lineHeight: t.svcRateLineHeight,
    letterSpacing: t.svcRateSpacing,
    color: c.greenInk,
  },

  sum: { marginTop: t.cardGap, borderRadius: t.cardRadius, padding: t.bodyPad, backgroundColor: c.page, ...shadow },
  sumHead: { flexDirection: 'row', alignItems: 'center', gap: t.sumGap },
  sumTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.sumTitleSize, lineHeight: t.sumTitleLineHeight, color: c.ink },
  sumRows: { marginTop: t.sumRowsTop },
  sumRow: { minHeight: t.sumRowH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.rowGap },
  sumLabel: { fontFamily: font.appBody, fontSize: t.sumLabelSize, color: c.inkWarm },
  sumValue: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.sumValueSize, color: c.ink },
  rule: { marginTop: t.ruleTop, height: t.ruleH, backgroundColor: p.divider },
  total: { marginTop: t.totalTop, flexDirection: 'row', alignItems: 'flex-start', gap: t.totalGap },
  totalText: { marginTop: t.totalLabelTop },
  totalLabel: { fontFamily: font.appSemi, fontSize: t.totalLabelSize, lineHeight: t.totalLabelLineHeight, color: c.ink },
  totalSub: { fontFamily: font.appBody, fontSize: t.totalSubSize, color: c.inkWarm },
  totalPrice: { fontFamily: font.appHeading, fontSize: t.totalPriceSize, lineHeight: t.totalPriceLineHeight, color: c.ink },
  sumInfo: {
    marginTop: t.sumInfoTop,
    borderRadius: t.sumInfoRadius,
    padding: t.sumInfoPad,
    backgroundColor: c.panel,
    flexDirection: 'row',
    gap: t.sumInfoGap,
  },
  sumInfoText: { flex: 1, fontFamily: font.appBody, fontSize: t.sumInfoSize, lineHeight: t.sumInfoLineHeight, color: c.inkWarm },

  before: { marginTop: t.cardGap, borderRadius: t.cardRadius, padding: t.bodyPad, backgroundColor: c.peachSoft },
  beforeHead: { flexDirection: 'row', alignItems: 'center', gap: t.beforeGap },
  beforeTitle: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.beforeTitleSize,
    lineHeight: t.beforeTitleLineHeight,
    color: c.brownInk,
  },
  beforeBody: {
    marginTop: t.beforeBodyTop,
    fontFamily: font.appBody,
    fontSize: t.beforeBodySize,
    lineHeight: t.beforeBodyLineHeight,
    color: c.brownInk,
  },
  beforeNote: {
    marginTop: t.beforeNoteTop,
    fontFamily: font.appBody,
    fontSize: t.beforeNoteSize,
    lineHeight: t.beforeNoteLineHeight,
    color: p.noteInk,
  },

  confirm: { marginTop: t.cardGap, borderRadius: t.cardRadius, padding: t.bodyPad, backgroundColor: c.card, ...shadow },
  agree: { flexDirection: 'row', alignItems: 'flex-start', gap: t.boxGap },
  agreeNext: { marginTop: t.agreeGap },
  box: {
    marginTop: (t.agreeLineHeight - t.box) / 2,
    width: t.box,
    height: t.box,
    borderRadius: t.boxRadius,
    borderWidth: t.boxBorder,
    borderColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: c.brown },
  agreeText: { flex: 1, fontFamily: font.appBody, fontSize: t.agreeSize, lineHeight: t.agreeLineHeight, color: c.ink },
  legal: { marginTop: t.legalTop, fontFamily: font.appBody, fontSize: t.legalSize, lineHeight: t.legalLineHeight, color: c.inkWarm },
  legalLink: { textDecorationLine: 'underline' },

  foot: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: c.page, ...shadow },
  btn: {
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
    ...shadow,
  },
  btnText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  cap: { marginTop: t.capTop, textAlign: 'center', fontFamily: font.appBody, fontSize: t.capSize, lineHeight: t.capLineHeight, color: c.inkWarm },
});
