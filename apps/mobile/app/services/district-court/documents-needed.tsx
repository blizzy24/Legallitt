import IdentityVerification from '../../../components/IdentityVerification';
import { useKyc } from '../../../context/kyc';
import { router, type Href } from 'expo-router';
import {
  Archive,
  ArrowRight,
  BadgeCheck,
  Check,
  CircleCheck,
  CircleEllipsis,
  ClipboardList,
  CloudUpload,
  Contact,
  FileText,
  FileType,
  FolderOpen,
  Gavel,
  House,
  Info,
  Quote,
  ShieldCheck,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import {
  advForensicRed,
  dcCancelPalette,
  dcDocsNeeded as t,
  dcDocsNeededPalette as p,
  dcDocumentsPalette,
  dcReviewPalette,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../../constants/theme';
import { DC_DOCS_NEEDED } from '../../../data/districtCourt';

// District Court — recommended documents (design/350). Measured at 2.000 px/pt.
// Reached from the held "[ Waiting for Advocate ]" bar on design/346.
// Continue to Delivery opens the District Court delivery details (design/351).
//
// STATIC, NOT WIRED: there is no file picker, so View, Replace and Upload
// Document open nothing; the checklist, the 60% bar and the journey are
// drawings. See data/districtCourt.ts for the advocate, step-counter,
// clipped-name and Aadhaar notes. The clipped names wrap instead, so the
// case card and the two file cards run 10–20pt taller than drawn.

const FILE_ICON = { file: FileText, pdf: FileType, clip: ClipboardList } as const;
const STILL_ICON = { id: Contact, house: House } as const;
const breakable = (name: string) => name.replace(/_/g, '_​');

export default function DistrictDocsNeededScreen() {
  const { kyc, begin } = useKyc();
  const insets = useSafeAreaInsets();
  const d = DC_DOCS_NEEDED;

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={`${d.sub}${d.subId}`}
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        titleStyle={styles.hdrTitle}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/advocate/accepted' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pill}>
          <Gavel size={t.pillIcon} color={c.brownInk} strokeWidth={2} />
          <Text style={styles.pillText} {...shrinkToFit(0.75)}>
            {d.pill}
          </Text>
        </View>
        <Text style={styles.h1} {...shrinkToFit(0.75)}>
          {d.h1}
        </Text>
        <Text style={styles.lead}>{d.lead}</Text>

        <View style={[styles.card, styles.white, styles.caseCard]}>
          <View style={styles.between}>
            <View style={styles.titleRow}>
              <FolderOpen size={t.titleIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.title} {...shrinkToFit(0.8)}>
                {d.caseTitle}
              </Text>
            </View>
            <View style={[styles.chip, styles.chipHalo]}>
              <Text style={[styles.chipText, styles.brown]}>{d.caseChip}</Text>
            </View>
          </View>
          {d.grid.map((row, i) => (
            <View key={i} style={[styles.gridRow, i === 0 ? styles.gridFirst : styles.gridNext]}>
              {row.map(([l, v]) => (
                <View key={l} style={styles.flex}>
                  <Text style={styles.label}>{l}</Text>
                  <View style={styles.valueRow}>
                    <Text style={styles.value}>{v}</Text>
                    {l === 'Assigned Advocate' && (
                      <BadgeCheck size={t.badgeIcon} color={c.card} fill={c.greenInk} strokeWidth={2} />
                    )}
                  </View>
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.msg, styles.next]}>
          <View style={styles.titleRow}>
            <Quote size={t.msgIcon} color={c.brown} fill={c.brown} strokeWidth={1.5} />
            <Text style={styles.msgTitle} {...shrinkToFit(0.8)}>
              {d.msgTitle}
            </Text>
          </View>
          <Text style={styles.quote}>{d.quote}</Text>
          <View style={[styles.between, styles.sigRow]}>
            <Text style={styles.sig} {...shrinkToFit(0.75)}>
              {d.sig}
            </Text>
            <Text style={styles.senior}>{d.senior}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.white, styles.next]}>
          <View style={styles.between}>
            <View style={styles.flex}>
              <Text style={styles.progTitle}>{d.progTitle}</Text>
              <Text style={styles.progSub}>{d.progSub}</Text>
            </View>
            <View style={styles.pct}>
              <Text style={styles.pctText}>{d.pct}</Text>
            </View>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { flex: d.pctValue }]} />
            <View style={{ flex: 1 - d.pctValue }} />
          </View>
          <View style={[styles.between, styles.legend]}>
            {d.legend.map(([lead, rest, kind]) => (
              <View key={lead} style={styles.legendItem}>
                <View style={[styles.legendDot, kind === 'opt' && styles.legendDotOpt]} />
                <Text style={styles.legendText} {...shrinkToFit(0.75)}>
                  <Text style={styles.legendLead}>{lead}</Text>
                  {rest}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.info}>
            <Info size={t.infoIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.infoText}>{d.info}</Text>
          </View>
        </View>

        <View style={[styles.between, styles.secRow]}>
          <View style={styles.titleRow}>
            <Text style={styles.sec} {...shrinkToFit(0.8)}>
              {d.sec}
            </Text>
            <View style={[styles.chip, styles.chipGrey]}>
              <Text style={styles.chipText}>{d.secChip}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.secSub}>{d.secSub}</Text>

        {d.docs.map((doc, i) => {
            if (doc.title === 'Identity Proof') return <IdentityVerification key="identity" returnTo="/services/district-court/documents-needed" />;
          const has = 'file' in doc;
          return (
            <View key={doc.title} style={[styles.card, styles.white, i === 0 ? styles.docsFirst : styles.docNext]}>
              <View style={styles.between}>
                <View style={[styles.req, doc.tag === 'OPTIONAL' && styles.reqOpt]}>
                  <Text style={styles.reqText}>{doc.tag}</Text>
                </View>
                <View style={[styles.status, has ? styles.statusOk : styles.statusMissing]}>
                  {has ? (
                    <CircleCheck size={t.statusIcon} color={p.uploadedPill} fill={c.greenInk} strokeWidth={2.2} />
                  ) : (
                    <CircleEllipsis size={t.statusIcon} color={advForensicRed.declineColour} strokeWidth={2} />
                  )}
                  <Text style={[styles.statusText, has ? styles.statusTextOk : styles.statusTextMissing]}>
                    {has ? d.uploaded : d.missing}
                  </Text>
                </View>
              </View>
              <Text style={styles.docTitle}>{doc.title}</Text>
              <Text style={styles.docDesc}>{doc.desc}</Text>
              {has ? (
                <View style={styles.file}>
                  <View style={styles.fileTile}>
                    {(() => {
                      const Icon = FILE_ICON[doc.file.icon];
                      return <Icon size={t.fileGlyph} color={dcDocumentsPalette.shieldInk} strokeWidth={1.9} />;
                    })()}
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.fileName}>{breakable(doc.file.name)}</Text>
                    <Text style={styles.fileMeta}>{doc.file.meta}</Text>
                  </View>
                  <View style={styles.acts}>
                    <Text style={styles.act}>{d.view}</Text>
                    <Text style={styles.act}>{d.replace}</Text>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.still}>
                    {(() => {
                      const Icon = STILL_ICON[doc.icon];
                      return <Icon size={t.stillIcon} color={c.brown} strokeWidth={1.9} />;
                    })()}
                    <Text style={styles.stillText}>{d.still}</Text>
                  </View>
                  <View style={styles.up}>
                    <CloudUpload size={t.upIcon} color={ink.onBrand} strokeWidth={2} />
                    <Text style={styles.upText}>{d.upload}</Text>
                  </View>
                </>
              )}
            </View>
          );
        })}

        <View style={[styles.card, styles.phys, styles.next]}>
          <View style={styles.titleRow}>
            <View style={styles.physDisc}>
              <Archive size={t.physGlyph} color={dcDocumentsPalette.shieldInk} strokeWidth={1.9} />
            </View>
            <Text style={styles.physTitle} {...shrinkToFit(0.8)}>
              {d.physTitle}
            </Text>
          </View>
          <Text style={styles.physBody}>{d.physBody}</Text>
          <View style={styles.physPanel}>
            <ShieldCheck size={t.physPanelIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.physNote}>{d.physNote}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.white, styles.next]}>
          <View style={styles.between}>
            <Text style={styles.progTitle} {...shrinkToFit(0.8)}>
              {d.journeyTitle}
            </Text>
            <Text style={styles.step}>{d.step}</Text>
          </View>
          <View style={styles.tl}>
            <View style={styles.rail} />
            {d.timeline.map((s) => {
              const done = s.state === 'done';
              const cur = s.state === 'current';
              return (
                <View key={s.title} style={styles.tlRow}>
                  <View style={styles.tlDiscBox}>
                    {cur ? (
                      <View style={styles.halo}>
                        <View style={styles.discCur} />
                      </View>
                    ) : (
                      <View style={[styles.disc, done && styles.discDone]}>
                        {done ? (
                          <Check size={t.tlGlyph} color={c.greenInk} strokeWidth={3} />
                        ) : (
                          <View style={styles.waitDot} />
                        )}
                      </View>
                    )}
                  </View>
                  <View style={styles.flex}>
                    <Text style={[styles.tlTitle, cur && styles.brown, s.state === 'wait' && styles.tlTitleWait]}>
                      {s.title}
                    </Text>
                    <Text style={[styles.tlStatus, cur && styles.brown, s.state === 'wait' && styles.tlStatusWait]}>
                      {s.status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => kyc.completed ? router.push('/services/district-court/courier/details') : begin('/services/district-court/documents-needed')}
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
  brown: { color: c.brown },
  hdrTitle: { fontSize: t.hdrTitleSize },
  hdrSub: { fontSize: t.hdrSubSize },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.titleGap },
  titleRow: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.titleGap },

  pill: {
    marginTop: t.pillTop,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: c.brownInk },
  h1: {
    marginTop: t.h1Top,
    fontFamily: font.appHeading,
    fontSize: t.h1Size,
    lineHeight: t.h1LineHeight,
    letterSpacing: t.h1Spacing,
    color: c.ink,
  },
  lead: { marginTop: t.leadTop, fontFamily: font.appBody, fontSize: t.leadSize, lineHeight: t.leadLineHeight, color: c.inkWarm },

  card: { borderRadius: t.cardRadius, padding: t.cardPad },
  white: { backgroundColor: c.card, ...shadow },
  next: { marginTop: t.cardGap },
  caseCard: { marginTop: t.caseTop },
  title: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.titleSize, lineHeight: t.titleLineHeight, color: c.ink },
  chip: { height: t.chipH, borderRadius: t.chipH / 2, paddingHorizontal: t.chipPadX, justifyContent: 'center' },
  chipHalo: { backgroundColor: p.halo },
  chipGrey: { backgroundColor: c.tileGrey },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, letterSpacing: t.chipSpacing, color: c.inkWarm },
  gridRow: { flexDirection: 'row', gap: t.gridGap },
  gridFirst: { marginTop: t.gridTop },
  gridNext: { marginTop: t.gridRowGap },
  label: {
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    lineHeight: t.labelLineHeight,
    letterSpacing: t.labelSpacing,
    color: c.inkWarm,
  },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: t.badgeGap },
  value: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.valueSize, lineHeight: t.valueLineHeight, color: c.ink },

  msg: { backgroundColor: c.peachPill, ...shadow },
  msgTitle: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.msgTitleSize,
    lineHeight: t.msgTitleLineHeight,
    color: dcDocumentsPalette.shieldInk,
  },
  quote: { marginTop: t.quoteTop, fontFamily: font.appBody, fontSize: t.quoteSize, lineHeight: t.quoteLineHeight, color: c.brownInk },
  sigRow: { marginTop: t.sigTop },
  sig: { flexShrink: 1, fontFamily: font.appSemi, fontStyle: 'italic', fontSize: t.sigSize, color: dcCancelPalette.darkBrown },
  senior: { fontFamily: font.appSemi, fontSize: t.seniorSize, letterSpacing: t.seniorSpacing, color: dcReviewPalette.noteInk },

  progTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.progTitleSize, lineHeight: t.progTitleLineHeight, color: c.ink },
  progSub: { fontFamily: font.appBody, fontSize: t.progSubSize, color: c.inkWarm },
  pct: {
    width: t.pct,
    height: t.pct,
    borderRadius: t.pct / 2,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pctText: { fontFamily: font.appSemi, fontSize: t.pctSize, color: c.brown },
  track: {
    marginTop: t.barTop,
    height: t.barH,
    borderRadius: t.barH / 2,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fill: { borderRadius: t.barH / 2, backgroundColor: status.active },
  legend: { marginTop: t.legendTop },
  legendItem: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.legendGap },
  legendDot: { width: t.legendDot, height: t.legendDot, borderRadius: t.legendDot / 2, backgroundColor: c.brown },
  legendDotOpt: { backgroundColor: status.active },
  legendText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.legendSize, color: c.ink },
  legendLead: { fontFamily: font.appBody, color: c.inkWarm },
  info: {
    marginTop: t.infoTop,
    borderRadius: t.infoRadius,
    paddingHorizontal: t.infoPadX,
    paddingVertical: t.infoPadY,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.infoGap,
  },
  infoText: { flex: 1, fontFamily: font.appBody, fontSize: t.infoSize, lineHeight: t.infoLineHeight, color: c.inkWarm },

  secRow: { marginTop: t.secTop },
  sec: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.secSize, lineHeight: t.secLineHeight, color: c.ink },
  secSub: { marginTop: t.secSubTop, fontFamily: font.appBody, fontSize: t.secSubSize, lineHeight: t.secSubLineHeight, color: c.inkWarm },

  docsFirst: { marginTop: t.docsTop },
  docNext: { marginTop: t.docGap },
  req: { height: t.reqH, borderRadius: t.reqH / 2, paddingHorizontal: t.reqPadX, backgroundColor: c.radioGrey, justifyContent: 'center' },
  reqOpt: { backgroundColor: c.tileGrey },
  reqText: { fontFamily: font.appSemi, fontSize: t.reqSize, letterSpacing: t.reqSpacing, color: c.ink },
  status: {
    height: t.statusH,
    borderRadius: t.statusH / 2,
    paddingHorizontal: t.statusPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.statusGap,
  },
  statusOk: { backgroundColor: p.uploadedPill },
  statusMissing: { backgroundColor: p.missingPill },
  statusText: { fontFamily: font.appSemi, fontSize: t.statusSize },
  statusTextOk: { color: c.greenInk },
  statusTextMissing: { color: advForensicRed.declineColour },
  docTitle: { marginTop: t.docTitleTop, fontFamily: font.appSemi, fontSize: t.docTitleSize, lineHeight: t.docTitleLineHeight, color: c.ink },
  docDesc: { marginTop: t.docDescTop, fontFamily: font.appBody, fontSize: t.docDescSize, lineHeight: t.docDescLineHeight, color: c.inkWarm },
  file: {
    marginTop: t.fileTop,
    borderRadius: t.fileRadius,
    paddingHorizontal: t.filePadX,
    paddingVertical: t.filePadY,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.fileGap,
  },
  fileTile: {
    width: t.fileTileSize,
    height: t.fileTileSize,
    borderRadius: t.fileTileRadius,
    backgroundColor: p.fileTile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: { fontFamily: font.appSemi, fontSize: t.fileNameSize, lineHeight: t.fileNameLineHeight, color: c.ink },
  fileMeta: { fontFamily: font.appBody, fontSize: t.fileMetaSize, lineHeight: t.fileMetaLineHeight, color: c.inkWarm },
  acts: { flexDirection: 'row', gap: t.actGap },
  act: { fontFamily: font.appSemi, fontSize: t.actSize, color: c.brown },
  still: {
    marginTop: t.stillTop,
    minHeight: t.stillH,
    borderRadius: t.stillRadius,
    paddingHorizontal: t.stillPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.stillGap,
  },
  stillText: { flex: 1, fontFamily: font.appBody, fontSize: t.docDescSize, color: c.inkWarm },
  up: {
    marginTop: t.upTop,
    height: t.upH,
    borderRadius: t.upRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.upGap,
  },
  upText: { fontFamily: font.appSemi, fontSize: t.upSize, color: ink.onBrand },

  phys: { backgroundColor: c.peachSoft, ...shadow },
  physDisc: {
    width: t.physDisc,
    height: t.physDisc,
    borderRadius: t.physDisc / 2,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  physTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.physTitleSize, color: c.ink },
  physBody: {
    marginTop: t.physBodyTop,
    fontFamily: font.appBody,
    fontSize: t.physBodySize,
    lineHeight: t.physBodyLineHeight,
    color: c.brownInk,
  },
  physPanel: {
    marginTop: t.physPanelTop,
    borderRadius: t.infoRadius,
    padding: t.physPanelPad,
    backgroundColor: p.physPanel,
    flexDirection: 'row',
    gap: t.infoGap,
  },
  physNote: { flex: 1, fontFamily: font.appBody, fontSize: t.infoSize, lineHeight: t.physPanelLineHeight, color: c.inkWarm },

  step: { fontFamily: font.appSemi, fontSize: t.stepSize, color: c.brownInk },
  tl: { marginTop: t.tlTop },
  rail: {
    position: 'absolute',
    left: t.tlInset + (t.tlHalo - t.tlRail) / 2,
    top: t.tlRowH / 2,
    bottom: t.tlRowH / 2,
    width: t.tlRail,
    backgroundColor: c.rail,
  },
  tlRow: { minHeight: t.tlRowH, paddingLeft: t.tlInset, flexDirection: 'row', alignItems: 'center', gap: t.tlGap },
  tlDiscBox: { width: t.tlHalo, alignItems: 'center' },
  disc: {
    width: t.tlDisc,
    height: t.tlDisc,
    borderRadius: t.tlDisc / 2,
    backgroundColor: c.helpGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discDone: { backgroundColor: status.active },
  halo: {
    width: t.tlHalo,
    height: t.tlHalo,
    borderRadius: t.tlHalo / 2,
    backgroundColor: p.halo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discCur: {
    width: t.tlCur,
    height: t.tlCur,
    borderRadius: t.tlCur / 2,
    borderWidth: t.tlRing,
    borderColor: c.brown,
    backgroundColor: c.card,
  },
  waitDot: { width: t.tlDot, height: t.tlDot, borderRadius: t.tlDot / 2, backgroundColor: c.tagMuted },
  tlTitle: { fontFamily: font.appSemi, fontSize: t.tlTitleSize, lineHeight: t.tlTitleLineHeight, color: c.ink },
  tlTitleWait: { fontFamily: font.appBody, color: c.inkWarm },
  tlStatus: { fontFamily: font.appBody, fontSize: t.tlStatusSize, lineHeight: t.tlStatusLineHeight, color: c.greenInk },
  tlStatusWait: { color: c.inkMuted },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: c.page },
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
