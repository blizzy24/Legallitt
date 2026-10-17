import { router, type Href } from 'expo-router';
import {
  Check,
  CircleCheck,
  CircleCheckBig,
  CircleHelp,
  CirclePlus,
  Contact,
  Eye,
  FileText,
  FolderOpen,
  Gavel,
  LockKeyhole,
  MailCheck,
  RefreshCcw,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { clientDocHref } from '../../../data/docLinks';
import { HC_DOCUMENTS } from '../../../data/highCourt';
import { font, hcDocuments as t, hcPalette as c, ink, status } from '../../../constants/theme';

// High Court — upload documents (design/294). Measured at 2.000 px/pt.
//
// Drawn in its "all required added" state: three files are already uploaded.
// View opens the client document viewer on that file (data/docLinks.ts).
// STATIC, NOT WIRED: no upload, no file picker, no camera — "+ Upload PDF /
// Photo", "+ Upload File" and Replace open nothing.
//
// ⚠ CONFLICT 11 (DPDP) — ID Proof asks for an Aadhaar card, the same concern
// already raised on the advocate verification batch. Built as drawn.
// ⚠ CONFLICT 6 — "Step 3 of 4"; the next screen says "Step 2 of 6".

type DocIcon = (typeof HC_DOCUMENTS.docs)[number]['icon'];
const ICONS: Record<DocIcon, LucideIcon> = {
  doc: FileText,
  gavel: Gavel,
  id: Contact,
  mail: MailCheck,
  folder: FolderOpen,
};

export default function HighCourtDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_DOCUMENTS;

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} backHref={'/services/high-court/case-details' as Href} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={[styles.pill, styles.pillPeach]}>
            <View style={styles.pillDot} />
            <Text style={[styles.pillText, styles.pillTextBrown]} {...shrinkToFit(0.8)}>
              {d.step}
            </Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {d.matter}
            </Text>
          </View>
        </View>
        <View style={styles.bar}>
          <View style={[styles.barFill, { flex: 0.8 }]} />
          <View style={{ flex: 0.2 }} />
        </View>
        <Text style={styles.intro}>{d.intro}</Text>

        <View style={[styles.card, styles.added]}>
          <View style={styles.addedDisc}>
            <CircleCheck size={t.addedGlyph} color={c.greenInk} strokeWidth={2.2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.addedTitle} {...shrinkToFit(0.8)}>
              {d.addedTitle}
            </Text>
            <View style={styles.addedPill}>
              <Text style={styles.addedPillText} {...shrinkToFit(0.8)}>
                {d.addedPill}
              </Text>
            </View>
            <Text style={styles.addedBody}>{d.addedBody}</Text>
          </View>
        </View>

        <View style={styles.note}>
          <View style={[styles.disc, styles.discPeach]}>
            <ShieldCheck size={t.noteGlyph} color={c.brown} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.noteTitle}>{d.noteTitle}</Text>
            <Text style={styles.noteBody}>{d.noteBody}</Text>
          </View>
        </View>

        {d.docs.map((doc) => {
          const Icon = ICONS[doc.icon];
          return (
            <View key={doc.id} style={styles.card}>
              <View style={styles.docHead}>
                <View style={styles.docTitleRow}>
                  <Text style={styles.docTitle} {...shrinkToFit(0.8)}>
                    {doc.title}
                  </Text>
                  <View style={[styles.docChip, doc.required ? styles.docChipReq : styles.docChipOpt]}>
                    <Text style={[styles.docChipText, doc.required && styles.docChipTextReq]}>
                      {doc.required ? d.required : d.optional}
                    </Text>
                  </View>
                </View>
                <Icon size={t.docIcon} color={c.brown} strokeWidth={1.8} />
              </View>
              <Text style={styles.docSub}>{doc.sub}</Text>

              {'file' in doc ? (
                <View style={styles.row}>
                  <View style={styles.rowTick}>
                    <Check size={t.rowTickGlyph} color={c.greenInk} strokeWidth={2.6} />
                  </View>
                  <View style={styles.flex}>
                    <Text style={styles.rowName} {...shrinkToFit(0.7)}>
                      {doc.file.name}
                    </Text>
                    <Text style={styles.rowMeta} {...shrinkToFit(0.8)}>
                      {doc.file.meta}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push(clientDocHref(doc.file.name) as Href)}
                    style={styles.rowBtn}
                  >
                    <Eye size={t.rowBtnIcon} color={c.ink} strokeWidth={2} />
                    <Text style={styles.rowBtnText}>{d.view}</Text>
                  </Pressable>
                  {/* Inert — no upload flow is designed. */}
                  <View style={[styles.rowBtn, styles.rowBtnNext]}>
                    <RefreshCcw size={t.rowBtnIcon} color={c.ink} strokeWidth={2} />
                    <Text style={styles.rowBtnText}>{d.replace}</Text>
                  </View>
                </View>
              ) : (
                <>
                  {/* Inert — no upload flow is designed. */}
                  <View style={styles.upload}>
                    <CirclePlus size={t.uploadIcon} color={c.brown} strokeWidth={2} />
                    <Text style={styles.uploadText} {...shrinkToFit(0.8)}>
                      {doc.upload}
                    </Text>
                  </View>
                  <Text style={styles.hint}>{doc.hint}</Text>
                </>
              )}
            </View>
          );
        })}

        <View style={styles.help}>
          <View style={[styles.disc, styles.discPeach]}>
            <CircleHelp size={t.helpGlyph} color={c.brown} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.helpTitle}>{d.helpTitle}</Text>
            <Text style={styles.helpBody}>{d.helpBody}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.barWrap, { paddingBottom: insets.bottom + t.footPadBottom }]}>
        <View style={styles.ready}>
          <CircleCheckBig size={t.readyIcon} color={ink.onBrand} fill={c.greenInk} strokeWidth={2.4} />
          <Text style={styles.readyText} {...shrinkToFit(0.8)}>
            {d.ready}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/high-court/pricing' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText}>{d.cta}</Text>
        </Pressable>
        <View style={styles.foot}>
          <LockKeyhole size={t.footIcon} color={c.inkWarm} strokeWidth={2.2} />
          <Text style={styles.footText} {...shrinkToFit(0.75)}>
            {d.foot}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.bottomPad },
  flex: { flex: 1, minWidth: 0 },

  topRow: { marginTop: t.topTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: {
    height: t.pillH,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.helpGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillDotGap,
  },
  pillPeach: { backgroundColor: c.peach },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.brown },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: c.inkWarm },
  pillTextBrown: { color: c.brownInk },
  bar: {
    marginTop: t.barTop,
    height: t.barH,
    borderRadius: t.barH / 2,
    backgroundColor: c.radioGrey,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barFill: { backgroundColor: c.brown, borderRadius: t.barH / 2 },
  intro: { marginTop: t.introTop, fontFamily: font.appBody, fontSize: t.introSize, color: c.inkWarm },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: c.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPad,
  },
  added: { marginTop: t.cardTop, flexDirection: 'row', alignItems: 'flex-start' },
  addedDisc: {
    width: t.addedDisc,
    height: t.addedDisc,
    borderRadius: t.addedDisc / 2,
    marginRight: t.addedGap,
    backgroundColor: c.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedTitle: { fontFamily: font.appSemi, fontSize: t.addedTitleSize, color: c.ink },
  addedPill: {
    marginTop: t.addedPillTop,
    alignSelf: 'flex-start',
    height: t.addedPillH,
    borderRadius: t.addedPillRadius,
    paddingHorizontal: t.addedPillPadX,
    backgroundColor: c.greenSoft,
    justifyContent: 'center',
  },
  addedPillText: { fontFamily: font.appSemi, fontSize: t.addedPillSize, color: c.greenInk },
  addedBody: {
    marginTop: t.addedBodyTop,
    fontFamily: font.appBody,
    fontSize: t.addedBodySize,
    lineHeight: t.addedBodyLineHeight,
    color: c.inkWarm,
  },

  note: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    padding: t.cardPad,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  disc: {
    width: t.noteDisc,
    height: t.noteDisc,
    borderRadius: t.noteDisc / 2,
    marginRight: t.noteGap,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discPeach: { backgroundColor: c.peach },
  noteTitle: { fontFamily: font.appSemi, fontSize: t.noteTitleSize, lineHeight: t.noteTitleLineHeight, color: c.ink },
  noteBody: {
    marginTop: t.noteBodyTop,
    fontFamily: font.appBody,
    fontSize: t.noteBodySize,
    lineHeight: t.noteBodyLineHeight,
    color: c.inkWarm,
  },

  docHead: { flexDirection: 'row', alignItems: 'center' },
  docTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.docChipGap },
  docTitle: { fontFamily: font.appSemi, fontSize: t.docTitleSize, color: c.ink },
  docChip: { height: t.docChipH, borderRadius: t.docChipRadius, paddingHorizontal: t.docChipPadX, justifyContent: 'center' },
  docChipReq: { backgroundColor: c.brown },
  docChipOpt: { backgroundColor: c.helpGrey },
  docChipText: { fontFamily: font.appSemi, fontSize: t.docChipSize, color: c.inkWarm },
  docChipTextReq: { color: ink.onBrand },
  docSub: {
    marginTop: t.docSubTop,
    fontFamily: font.appBody,
    fontSize: t.docSubSize,
    lineHeight: t.docSubLineHeight,
    color: c.inkWarm,
  },
  row: {
    marginTop: t.rowTop,
    borderRadius: t.rowRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.rowPadX,
    paddingVertical: t.rowPadY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTick: {
    width: t.rowTick,
    height: t.rowTick,
    borderRadius: t.rowTick / 2,
    marginRight: t.rowTickGap,
    backgroundColor: c.greenTile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowName: { fontFamily: font.appSemi, fontSize: t.rowNameSize, color: c.ink },
  rowMeta: { fontFamily: font.appBody, fontSize: t.rowMetaSize, color: c.greenInk },
  rowBtn: {
    height: t.rowBtnH,
    borderRadius: t.rowBtnRadius,
    paddingHorizontal: t.rowBtnPadX,
    backgroundColor: c.helpGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.rowBtnIconGap,
  },
  rowBtnNext: { marginLeft: t.rowBtnGap },
  rowBtnText: { fontFamily: font.appSemi, fontSize: t.rowBtnSize, color: c.ink },
  upload: {
    marginTop: t.uploadTop,
    height: t.uploadH,
    borderRadius: t.rowRadius,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.uploadGap,
  },
  uploadText: { fontFamily: font.appSemi, fontSize: t.uploadSize, color: c.brown },
  hint: { marginTop: t.hintTop, fontFamily: font.appBody, fontSize: t.hintSize, color: c.inkWarm },

  help: {
    marginTop: t.helpTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.peachNote,
    padding: t.helpPad,
    paddingVertical: t.helpPadY,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  helpTitle: { fontFamily: font.appSemi, fontSize: t.helpTitleSize, color: c.brownInk },
  helpBody: {
    marginTop: t.helpBodyTop,
    fontFamily: font.appBody,
    fontSize: t.helpBodySize,
    lineHeight: t.helpBodyLineHeight,
    color: c.ink,
  },

  barWrap: { backgroundColor: c.card, paddingHorizontal: t.padX, paddingTop: t.barPadTop },
  ready: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.readyGap },
  readyText: { fontFamily: font.appSemi, fontSize: t.readySize, color: c.greenInk },
  btn: {
    marginTop: t.btnTop,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  foot: { marginTop: t.footTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.footGap },
  footText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.footSize, color: c.inkWarm },
});
