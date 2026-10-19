import IdentityVerification from '../../../components/IdentityVerification';
import { useKyc } from '../../../context/kyc';
import { router, type Href } from 'expo-router';
import {
  Check,
  CircleCheck,
  CirclePlus,
  CircleQuestionMark,
  Eye,
  FilePlus,
  FileText,
  FileUp,
  Files,
  Gavel,
  Headset,
  IdCard,
  Info,
  Landmark,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import DistrictStepper from '../../../components/DistrictStepper';
import { shrinkToFit } from '../../../constants/textFit';
import {
  advForensicRed,
  dcDocuments as t,
  dcDocumentsPalette as p,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../../constants/theme';
import { DC_DOCUMENTS } from '../../../data/districtCourt';

// District Court — upload documents (design/342). Measured at 2.000 px/pt.
// Reached from Continue to Documents on design/341; Continue to Submission
// opens design/343.
//
// The two "I don't have this" boxes are real local toggles. STATIC: there is
// no file picker in this prototype, so View, Replace, delete, Upload and "Add
// Another Document" open nothing, and "2 of 5 ready" stays as drawn.
//
// See data/districtCourt.ts for the step counter, the Aadhaar (DPDP) note and
// the clipped file name. The trash glyph is #BA1A1A, the existing
// advForensicRed.
//
// The export clips the second file name under its REQ chip; never-ellipsize
// wraps it instead, so that card is one line (16pt) taller than drawn.

/** File names have no spaces; a zero-width space after each underscore lets
 *  a long one wrap instead of pushing the chips off the card. */
const breakable = (name: string) => name.replace(/_/g, '_\u200B');

const FILE_ICON = { file: FileText, id: IdCard } as const;
const SLOT_ICON = { court: Landmark, mail: Mail, files: Files } as const;

export default function DistrictDocumentsScreen() {
  const { kyc, begin } = useKyc();
  const insets = useSafeAreaInsets();
  const d = DC_DOCUMENTS;
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        titleStyle={styles.hdrTitle}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/case-details' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.row}>
          <View style={styles.pill}>
            <Gavel size={t.pillIcon} color={c.brownInk} strokeWidth={2} />
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {d.matter}
            </Text>
          </View>
          <View style={styles.ssl}>
            <View style={styles.sslDot} />
            <Text style={styles.sslText} {...shrinkToFit(0.8)}>
              {d.ssl}
            </Text>
          </View>
        </View>

        <View style={styles.steps}>
          <View style={styles.stepsHead}>
            <Text style={styles.stepsCaps} {...shrinkToFit(0.8)}>
              {d.stepsCaps}
            </Text>
            <Text style={styles.stepsCount} {...shrinkToFit(0.8)}>
              {d.stepsCount}
            </Text>
          </View>
          <View style={styles.stepper}>
            <DistrictStepper labels={d.steps} done={2} current={2} />
          </View>
        </View>

        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.lead}>{d.lead}</Text>
        <View style={styles.info}>
          <Info size={t.infoIcon} color={c.inkWarm} strokeWidth={1.9} />
          <Text style={styles.infoText}>
            <Text style={styles.infoLead}>{d.infoLead}</Text>
            {d.info}
          </Text>
        </View>

        <View style={styles.secRow}>
          <Text style={styles.sec} {...shrinkToFit(0.75)}>
            {d.sec}
          </Text>
          <Text style={styles.ready}>{kyc.completed ? 'Case papers ready • Identity verified' : 'Case papers ready • Identity verification pending'}</Text>
        </View>

        {d.files.map((f, i) => {
            if (f.icon === 'id') return <IdentityVerification key="identity" returnTo="/services/district-court/documents" />;
          const Icon = FILE_ICON[f.icon];
          return (
            <View key={f.name} style={[styles.card, i === 0 ? styles.listFirst : styles.cardNext]}>
              <View style={styles.fileHead}>
                <View style={[styles.tile, styles.tilePeach]}>
                  <Icon size={t.tileGlyph} color={c.ink} strokeWidth={1.9} />
                </View>
                <View style={styles.flex}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} {...shrinkToFit(0.7)}>
                      {breakable(f.name)}
                    </Text>
                    <View style={styles.req}>
                      <Text style={styles.reqText}>{d.req}</Text>
                    </View>
                    <View style={styles.ok}>
                      <CircleCheck size={t.okIcon} color={c.greenInk} strokeWidth={2.2} />
                      <Text style={styles.okText} {...shrinkToFit(0.8)}>
                        {d.uploaded}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.meta}>{f.meta}</Text>
                </View>
              </View>
              <View style={styles.strip}>
                <View style={styles.act}>
                  <Eye size={t.actIcon} color={c.ink} strokeWidth={2} />
                  <Text style={styles.actText}>{d.view}</Text>
                </View>
                <View style={styles.act}>
                  <RefreshCw size={t.actIcon} color={c.ink} strokeWidth={2} />
                  <Text style={styles.actText}>{d.replace}</Text>
                </View>
                <View style={[styles.act, styles.actSquare]}>
                  <Trash2 size={t.actIcon} color={advForensicRed.declineColour} strokeWidth={2} />
                </View>
              </View>
            </View>
          );
        })}

        {d.slots.map((s, i) => {
          const Icon = SLOT_ICON[s.icon];
          const off = !!skipped[s.title];
          return (
            <View key={s.title} style={[styles.card, i === 0 ? styles.slotsFirst : styles.cardNext]}>
              <View style={styles.fileHead}>
                <View style={[styles.tile, styles.tileGrey]}>
                  <Icon size={t.tileGlyph} color={c.inkWarm} strokeWidth={1.9} />
                </View>
                <View style={styles.flex}>
                  <View style={styles.optRow}>
                    <Text style={styles.optTitle} {...shrinkToFit(0.75)}>
                      {s.title}
                    </Text>
                    <View style={styles.optChip}>
                      <Text style={styles.optChipText}>{d.optional}</Text>
                    </View>
                  </View>
                  <Text style={styles.desc}>{s.desc}</Text>
                </View>
              </View>
              <View style={[styles.slotFoot, !s.skip && styles.slotFootEnd]}>
                {s.skip && (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: off }}
                    onPress={() => setSkipped((v) => ({ ...v, [s.title]: !off }))}
                    style={styles.skip}
                  >
                    <View style={[styles.box, off && styles.boxOn]}>
                      {off && <Check size={t.boxGlyph} color={ink.onBrand} strokeWidth={3} />}
                    </View>
                    <Text style={styles.skipText} {...shrinkToFit(0.75)}>
                      {d.noHave}
                    </Text>
                  </Pressable>
                )}
                <View style={styles.up}>
                  {s.skip ? (
                    <FileUp size={t.upIcon} color={c.brown} strokeWidth={2} />
                  ) : (
                    <CirclePlus size={t.upIcon} color={c.brown} strokeWidth={2} />
                  )}
                  <Text style={styles.upText}>{d.upload}</Text>
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.add}>
          <FilePlus size={t.addIcon} color={c.brown} strokeWidth={2} />
          <Text style={styles.addText} {...shrinkToFit(0.75)}>
            {d.add}
          </Text>
        </View>

        <View style={[styles.panelCard, styles.cant]}>
          <View style={styles.helpDisc}>
            <CircleQuestionMark size={t.helpGlyph} color={c.ink} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.helpTitle} {...shrinkToFit(0.75)}>
              {d.cantTitle}
            </Text>
            <Text style={styles.helpBody}>{d.cantBody}</Text>
          </View>
        </View>

        <View style={[styles.panelCard, styles.safe]}>
          <View style={styles.safeHead}>
            <View style={styles.safeDisc}>
              <ShieldCheck size={t.safeGlyph} color={p.shieldInk} strokeWidth={2.2} />
            </View>
            <Text style={styles.safeTitle} {...shrinkToFit(0.75)}>
              {d.safeTitle}
            </Text>
          </View>
          <Text style={[styles.helpBody, styles.safeBody]}>{d.safeBody}</Text>
        </View>

        <View style={styles.clar}>
          <View style={styles.clarDisc}>
            <Headset size={t.clarGlyph} color={c.brown} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.clarTitle} {...shrinkToFit(0.75)}>
              {d.clarTitle}
            </Text>
            <Text style={styles.clarBody}>{d.clarBody}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => kyc.completed ? router.push('/services/district-court/pricing') : begin('/services/district-court/documents')}
          style={styles.btn}
        >
          <FileUp size={t.btnIcon} color={ink.onBrand} strokeWidth={2} />
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.bottomPad },
  flex: { flex: 1, minWidth: 0 },
  hdrTitle: { fontSize: t.hdrTitleSize },
  hdrSub: { marginTop: t.hdrSubTop, fontSize: t.hdrSubSize, lineHeight: t.hdrSubLineHeight },

  row: { marginTop: t.rowTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.sslGap },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
    flexShrink: 1,
  },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: c.brownInk },
  ssl: { flexDirection: 'row', alignItems: 'center', gap: t.sslGap, flexShrink: 1 },
  sslDot: { width: t.sslDot, height: t.sslDot, borderRadius: t.sslDot / 2, backgroundColor: status.active },
  sslText: { fontFamily: font.appSemi, fontSize: t.sslSize, letterSpacing: t.sslSpacing, color: c.ink },

  steps: {
    marginTop: t.stepsTop,
    borderRadius: t.stepsRadius,
    paddingHorizontal: t.stepsPadX,
    paddingTop: t.stepsPadTop,
    paddingBottom: t.stepsPadBottom,
    backgroundColor: c.card,
    ...shadow,
  },
  stepsHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.sslGap },
  stepsCaps: {
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.stepsCapsSize,
    letterSpacing: t.stepsCapsSpacing,
    color: c.inkWarm,
  },
  stepsCount: {
    fontFamily: font.appSemi,
    fontSize: t.stepsCountSize,
    lineHeight: t.stepsCountLineHeight,
    color: c.brown,
  },
  stepper: { marginTop: t.stepperTop, marginHorizontal: t.stepperInset },

  h1: { marginTop: t.h1Top, fontFamily: font.appHeading, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  lead: {
    marginTop: t.leadTop,
    fontFamily: font.appBody,
    fontSize: t.leadSize,
    lineHeight: t.leadLineHeight,
    color: c.inkWarm,
  },
  info: {
    marginTop: t.infoTop,
    borderRadius: t.infoRadius,
    paddingHorizontal: t.infoPadX,
    paddingVertical: t.infoPadY,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    gap: t.infoGap,
  },
  infoText: { flex: 1, fontFamily: font.appBody, fontSize: t.infoSize, lineHeight: t.infoLineHeight, color: c.inkWarm },
  infoLead: { fontFamily: font.appSemi, color: c.ink },

  secRow: { marginTop: t.secTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.sslGap },
  sec: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.secSize, lineHeight: t.secLineHeight, color: c.ink },
  ready: { fontFamily: font.appSemi, fontSize: t.readySize, letterSpacing: t.readySpacing, color: c.inkWarm },

  card: { borderRadius: t.cardRadius, padding: t.cardPad, backgroundColor: c.card, ...shadow },
  listFirst: { marginTop: t.listTop },
  cardNext: { marginTop: t.cardGap },
  slotsFirst: { marginTop: t.slotsTop },
  fileHead: { flexDirection: 'row', gap: t.tileGap },
  tile: { width: t.tile, height: t.tile, borderRadius: t.tileRadius, alignItems: 'center', justifyContent: 'center' },
  tilePeach: { backgroundColor: p.tilePeach },
  tileGrey: { backgroundColor: c.tileGrey },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: t.actGap },
  name: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.nameSize, lineHeight: t.nameLineHeight, color: c.ink },
  req: {
    height: t.reqH,
    borderRadius: t.reqRadius,
    paddingHorizontal: t.reqPadX,
    backgroundColor: c.helpGrey,
    justifyContent: 'center',
  },
  reqText: { fontFamily: font.appBody, fontSize: t.reqSize, letterSpacing: t.reqSpacing, color: c.inkWarm },
  ok: {
    marginLeft: 'auto',
    height: t.okH,
    borderRadius: t.okH / 2,
    paddingHorizontal: t.okPadX,
    backgroundColor: c.greenSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.okGap,
  },
  okText: { fontFamily: font.appSemi, fontSize: t.okSize, letterSpacing: t.okSpacing, color: c.greenInk },
  meta: { marginTop: t.metaTop, fontFamily: font.appBody, fontSize: t.metaSize, lineHeight: t.metaLineHeight, color: c.inkWarm },
  strip: {
    marginTop: t.stripTop,
    minHeight: t.stripH,
    borderRadius: t.stripRadius,
    paddingHorizontal: t.stripPadX,
    paddingVertical: t.stripPadY,
    backgroundColor: c.panel,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: t.actRowGap,
  },
  act: {
    height: t.actH,
    borderRadius: t.actRadius,
    paddingHorizontal: t.actPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.actGap,
  },
  actSquare: { width: t.actSquare, paddingHorizontal: 0, justifyContent: 'center' },
  actText: { fontFamily: font.appSemi, fontSize: t.actSize, color: c.ink },

  optRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.optRowGap },
  optTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.optTitleSize, lineHeight: t.optTitleLineHeight, color: c.ink },
  optChip: {
    height: t.optChipH,
    borderRadius: t.optChipH / 2,
    paddingHorizontal: t.optChipPadX,
    backgroundColor: c.tileGrey,
    justifyContent: 'center',
  },
  optChipText: { fontFamily: font.appSemi, fontSize: t.optChipSize, letterSpacing: t.optChipSpacing, color: c.inkWarm },
  desc: { marginTop: t.descTop, fontFamily: font.appBody, fontSize: t.descSize, lineHeight: t.descLineHeight, color: c.inkWarm },
  slotFoot: { marginTop: t.rowGap, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.boxGap },
  slotFootEnd: { marginTop: t.rowGapEnd, justifyContent: 'flex-end' },
  skip: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.boxGap },
  box: {
    width: t.box,
    height: t.box,
    borderRadius: t.boxRadius,
    borderWidth: t.boxBorder,
    borderColor: p.checkbox,
    backgroundColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: c.brown, borderColor: c.brown },
  skipText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.boxSize, color: c.inkWarm },
  up: {
    height: t.upH,
    borderRadius: t.upRadius,
    paddingHorizontal: t.upPadX,
    backgroundColor: c.helpGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.upGap,
  },
  upText: { fontFamily: font.appSemi, fontSize: t.upSize, color: c.ink },

  add: {
    marginTop: t.addTop,
    minHeight: t.addH,
    borderRadius: t.addRadius,
    paddingHorizontal: t.cardPad,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.addGap,
  },
  addText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.addSize, color: c.brown },

  panelCard: { borderRadius: t.cardRadius, padding: t.cardPad },
  cant: { marginTop: t.helpTop, backgroundColor: c.panel, flexDirection: 'row', gap: t.helpGap },
  helpDisc: {
    width: t.helpDisc,
    height: t.helpDisc,
    borderRadius: t.helpDisc / 2,
    backgroundColor: c.helpGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpTitle: { fontFamily: font.appSemi, fontSize: t.helpTitleSize, lineHeight: t.helpTitleLineHeight, color: c.ink },
  helpBody: { fontFamily: font.appBody, fontSize: t.helpBodySize, lineHeight: t.helpBodyLineHeight, color: c.inkWarm },
  safe: { marginTop: t.safeTop, backgroundColor: c.peachSoft },
  safeHead: { flexDirection: 'row', alignItems: 'center', gap: t.safeGap },
  safeDisc: {
    width: t.safeDisc,
    height: t.safeDisc,
    borderRadius: t.safeDisc / 2,
    backgroundColor: p.tilePeach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.safeTitleSize, lineHeight: t.safeTitleLineHeight, color: c.ink },
  safeBody: { marginTop: t.safeBodyTop },

  clar: {
    marginTop: t.clarTop,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPad,
    paddingVertical: t.clarPadY,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.clarGap,
    ...shadow,
  },
  clarDisc: {
    width: t.clarDisc,
    height: t.clarDisc,
    borderRadius: t.clarDisc / 2,
    backgroundColor: p.headsetDisc,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clarTitle: { fontFamily: font.appSemi, fontSize: t.clarTitleSize, lineHeight: t.clarTitleLineHeight, color: c.ink },
  clarBody: { fontFamily: font.appBody, fontSize: t.clarBodySize, lineHeight: t.clarBodyLineHeight, color: c.inkWarm },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: c.page },
  btn: {
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
  },
  btnText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
});
