import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Eye,
  FileText,
  FolderOpen,
  Info,
  LockKeyhole,
  MessageSquare,
  MessageSquarePlus,
  MessageSquareText,
  PenLine,
  Phone,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { font, hcPalette as c, hcReview as t, ink, shadow, status } from '../../../constants/theme';
import { clientDocHref } from '../../../data/docLinks';
import { HC_REVIEW } from '../../../data/highCourt';

// High Court — review before filing (design/318). Measured at 2.000 px/pt.
//
// ⚠ Cross-service, with conflicts 4, 5 and 6 — see HC_REVIEW.
//
// Wiring: Approve Documents opens design/320 (District Court "Court Filing" —
// cross-service, by design numbering); Request Changes opens design/319 (the
// change-request sheet); View Document opens the client document viewer;
// Chat opens the advocate chat (design/301).
// STATIC: Add Comment, Edit and Remove are inert — no comment editor is drawn;
// the note is a drawing. The "Anything Else?" box and the checkbox are local
// only. Approve is drawn enabled with the box unticked, so it stays enabled.
// Call dials nothing.

const DOC_ICON = { file: FileText, badge: BadgeCheck, folder: FolderOpen } as const;

export default function HighCourtReviewFilingScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_REVIEW;
  const [note, setNote] = useState('');
  const [checked, setChecked] = useState(false);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={t.hdrPadTop}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/court-fee' as Href}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, styles.adv]}>
          <View style={styles.between}>
            <View style={styles.caps}>
              <View style={styles.capsDot} />
              <Text style={styles.capsText}>{d.matter}</Text>
            </View>
            <View style={styles.id}>
              <Text style={styles.idText}>{d.id}</Text>
            </View>
          </View>
          <View style={styles.advRow}>
            <View>
              <View style={styles.photo}>
                <Text style={styles.photoText}>{d.initials}</Text>
              </View>
              <View style={styles.photoDot} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.name} {...shrinkToFit(0.75)}>
                {d.name}
              </Text>
              <Text style={styles.role}>{d.role}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/services/high-court/chat' as Href)}
              style={styles.pill}
            >
              <MessageSquareText size={t.pillIcon} color={c.brown} strokeWidth={1.9} />
              <Text style={styles.pillText}>{d.chat}</Text>
            </Pressable>
            {/* Static — no call is placed. */}
            <View style={styles.pill}>
              <Phone size={t.pillIcon} color={c.brown} strokeWidth={1.9} />
              <Text style={styles.pillText}>{d.call}</Text>
            </View>
          </View>
        </View>

        {/* The replacement design/318 drops the "Step 2 of 7" stepper card. */}
        <View style={styles.round}>
          <View style={styles.between}>
            <View style={styles.roundPill}>
              <Text style={styles.roundPillText}>{d.round}</Text>
            </View>
            <Text style={styles.roundMeta} {...shrinkToFit(0.75)}>
              {d.roundMeta}
            </Text>
          </View>
          <Text style={styles.roundTitle}>{d.roundTitle}</Text>
          <Text style={styles.roundBody}>{d.roundBody}</Text>
        </View>

        <View style={styles.docsHead}>
          <Text style={styles.docsTitle} {...shrinkToFit(0.8)}>
            {d.docsTitle}
          </Text>
          <View style={styles.files}>
            <Text style={styles.filesText}>{d.files}</Text>
          </View>
          <Text style={styles.tap}>{d.tap}</Text>
        </View>
        <View style={styles.info}>
          <Info size={t.infoIcon} color={c.inkWarm} strokeWidth={1.9} />
          <Text style={styles.infoText}>{d.info}</Text>
        </View>

        <View style={styles.docList}>
          {d.docs.map((doc) => {
            const Icon = DOC_ICON[doc.icon];
            return (
              <View key={doc.name} style={[styles.card, styles.doc]}>
                <View style={styles.docTop}>
                  <View style={styles.tile}>
                    <Icon size={t.tileGlyph} color={c.brown} strokeWidth={1.8} />
                  </View>
                  <View style={styles.flex}>
                    <View style={styles.between}>
                      <Text style={styles.file} {...shrinkToFit(0.75)}>
                        {doc.name}
                      </Text>
                      <View
                        style={[
                          styles.badge,
                          doc.tone === 'green' && styles.badgeGreen,
                          doc.tone === 'peach' && styles.badgePeach,
                          doc.tone === 'grey' && styles.badgeGrey,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            doc.tone === 'green' && styles.greenText,
                            doc.tone === 'peach' && styles.brownText,
                          ]}
                        >
                          {doc.badge}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.meta}>{doc.meta}</Text>
                  </View>
                </View>
                <View style={styles.btns}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push(clientDocHref(doc.name) as Href)}
                    style={[styles.btn, styles.btnView, 'note' in doc && styles.btnViewWide]}
                  >
                    <Eye size={t.btnIcon} color={c.ink} strokeWidth={1.9} />
                    <Text style={styles.btnText}>{d.view}</Text>
                  </Pressable>
                  {/* Inert — no comment editor is drawn. */}
                  <View style={[styles.btn, 'note' in doc ? styles.btnAddPeach : styles.btnAddGrey]}>
                    <MessageSquarePlus size={t.btnIcon} color={'note' in doc ? c.brownLift : c.ink} strokeWidth={1.9} />
                    <Text style={[styles.btnText, 'note' in doc && styles.btnTextPeach]}>{doc.add}</Text>
                  </View>
                </View>
                {'note' in doc && (
                  <View style={styles.note}>
                    <View style={styles.between}>
                      <View style={styles.noteHead}>
                        <MessageSquare size={t.noteIcon} color={c.ink} strokeWidth={1.9} />
                        <Text style={styles.noteLabel}>{d.noteLabel}</Text>
                      </View>
                      {/* Inert — Edit and Remove change nothing. */}
                      <Text style={styles.noteActions}>
                        {d.edit}
                        <Text style={styles.noteSep}>{'  •  '}</Text>
                        <Text style={styles.remove}>{d.remove}</Text>
                      </Text>
                    </View>
                    <Text style={styles.noteQuote}>{d.noteQuote}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={[styles.card, styles.else]}>
          <View style={styles.between}>
            <Text style={styles.elseTitle}>{d.elseTitle}</Text>
            <Text style={styles.tap}>{d.optional}</Text>
          </View>
          <Text style={styles.elseSub}>{d.elseSub}</Text>
          <TextInput
            value={note}
            onChangeText={(v) => setNote(v.slice(0, d.limit))}
            placeholder={d.placeholder}
            placeholderTextColor={c.inkMuted}
            multiline
            style={styles.area}
          />
          <View style={[styles.between, styles.areaFoot]}>
            <Text style={styles.areaFootText} {...shrinkToFit(0.75)}>
              {d.sentTo}
            </Text>
            <Text style={styles.areaFootText}>
              {note.length} / {d.limit}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          onPress={() => setChecked((v) => !v)}
          style={[styles.card, styles.check]}
        >
          <View style={[styles.box, checked && styles.boxOn]}>
            {checked && <Check size={t.box - 6} color={ink.onBrand} strokeWidth={3} />}
          </View>
          <View style={styles.flex}>
            <Text style={styles.checkTitle}>{d.checkTitle}</Text>
            <Text style={styles.checkSub}>{d.checkSub}</Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/district-court/court-filing' as Href)}
          style={styles.approve}
        >
          <Text style={styles.approveText}>{d.approve}</Text>
          <ArrowRight size={t.ctaIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/high-court/change-request' as Href)}
          style={styles.changes}
        >
          <PenLine size={t.ctaIcon} color={c.brownLift} strokeWidth={2} />
          <Text style={styles.changesText}>{d.changes}</Text>
        </Pressable>
        <Text style={styles.caption}>{d.caption}</Text>

        <View style={styles.proto}>
          <LockKeyhole size={t.protoIcon} color={c.greenInk} strokeWidth={2.4} />
          <Text style={styles.protoText}>{d.protocol}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.pillGap },
  hdrSub: { fontFamily: font.appSemi, fontSize: t.hdrSubSize },
  greenText: { color: c.greenInk },
  brownText: { color: c.brownInk },

  card: { ...shadow, marginLeft: t.cardLeft - t.padX, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  adv: { marginTop: t.advTop, paddingTop: t.advPadTop, paddingBottom: t.advPadBottom },
  caps: { flexDirection: 'row', alignItems: 'center', gap: t.pillGap },
  capsDot: { width: t.capsDot, height: t.capsDot, borderRadius: t.capsDot / 2, backgroundColor: status.active },
  capsText: { fontFamily: font.appSemi, fontSize: t.capsSize, lineHeight: t.capsLineHeight, letterSpacing: t.capsSpacing, color: c.ink },
  id: { height: t.idH, borderRadius: t.idH / 2, paddingHorizontal: t.idPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  idText: { fontFamily: font.appSemi, fontSize: t.idSize, color: c.ink },
  advRow: { marginTop: t.advRowTop, flexDirection: 'row', alignItems: 'center', gap: t.advGap },
  photo: { width: t.photo, height: t.photo, borderRadius: t.photo / 2, backgroundColor: c.avatarTan, alignItems: 'center', justifyContent: 'center' },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoInitials, color: ink.onBrand },
  photoDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: t.photoDot,
    height: t.photoDot,
    borderRadius: t.photoDot / 2,
    borderWidth: 1.5,
    borderColor: c.card,
    backgroundColor: status.active,
  },
  name: { fontFamily: font.appSemi, fontSize: t.nameSize, lineHeight: t.nameLineHeight, color: c.ink },
  role: { fontFamily: font.appBody, fontSize: t.roleSize, lineHeight: t.roleLineHeight, color: c.inkWarm },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap - 1,
  },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: c.ink },

  round: {
    marginTop: t.roundTop,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: c.peachSoft,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.roundPadTop,
    paddingBottom: t.roundPadBottom,
  },
  roundPill: { height: t.roundH, borderRadius: t.roundH / 2, paddingHorizontal: t.roundPadX, backgroundColor: c.brown, justifyContent: 'center' },
  roundPillText: { fontFamily: font.appSemi, fontSize: t.roundSize, color: ink.onBrand },
  roundMeta: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.roundMetaSize, color: c.inkWarm },
  roundTitle: { marginTop: t.roundTitleTop, fontFamily: font.appSemi, fontSize: t.roundTitleSize, lineHeight: t.roundTitleLineHeight, color: c.ink },
  roundBody: { marginTop: t.roundBodyTop, fontFamily: font.appBody, fontSize: t.roundBodySize, lineHeight: t.roundBodyLineHeight, color: c.inkWarm },

  docsHead: { marginTop: t.docsTop, flexDirection: 'row', alignItems: 'center', gap: t.pillGap },
  docsTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.docsTitleSize, lineHeight: t.docsTitleLineHeight, color: c.ink },
  files: { height: t.filesH, borderRadius: t.filesH / 2, paddingHorizontal: t.filesPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  filesText: { fontFamily: font.appSemi, fontSize: t.filesSize, color: c.ink },
  tap: { marginLeft: 'auto', fontFamily: font.appSemi, fontSize: t.tapSize, color: c.inkWarm },
  info: {
    marginTop: t.infoTop,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.infoRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.infoPadX,
    paddingVertical: t.infoPadY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.infoGap,
  },
  infoText: { flex: 1, fontFamily: font.appBody, fontSize: t.infoSize, lineHeight: t.infoLineHeight, color: c.inkWarm },

  docList: { marginTop: t.docTop, gap: t.docGap },
  doc: { paddingTop: t.docPadTop, paddingBottom: t.docPadBottom },
  docTop: { flexDirection: 'row', alignItems: 'center', gap: t.tileGap },
  tile: { width: t.tile, height: t.tile, borderRadius: t.tileRadius, backgroundColor: c.peach, alignItems: 'center', justifyContent: 'center' },
  file: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.fileSize, lineHeight: t.fileLineHeight, color: c.ink },
  meta: { fontFamily: font.appBody, fontSize: t.metaSize, lineHeight: t.metaLineHeight, color: c.inkWarm },
  badge: { height: t.badgeH, borderRadius: t.badgeH / 2, paddingHorizontal: t.badgePadX, justifyContent: 'center' },
  badgeGreen: { backgroundColor: c.greenSoft },
  badgePeach: { backgroundColor: c.peach },
  badgeGrey: { backgroundColor: c.tileGrey },
  badgeText: { fontFamily: font.appSemi, fontSize: t.badgeSize, color: c.inkWarm },
  btns: { marginTop: t.btnsTop, flexDirection: 'row', gap: t.btnGap },
  btn: {
    flex: 1,
    height: t.btnH,
    borderRadius: t.btnRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnIconGap,
  },
  btnView: { backgroundColor: c.tileGrey, flexGrow: 1.4 },
  btnViewWide: { flexGrow: 1.55 },
  btnAddPeach: { backgroundColor: c.peachPill },
  btnAddGrey: { backgroundColor: c.tileGrey },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: c.ink },
  btnTextPeach: { color: c.brownLift },
  note: {
    marginTop: t.noteTop,
    borderRadius: t.noteRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.notePadX,
    paddingVertical: t.notePadY,
  },
  noteHead: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.pillGap - 1 },
  noteLabel: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.noteLabelSize, lineHeight: t.noteLabelLineHeight, color: c.ink },
  noteActions: { fontFamily: font.appSemi, fontSize: t.noteActionSize, color: c.inkWarm },
  noteSep: { color: c.tagMuted },
  remove: { color: c.removeRed },
  noteQuote: {
    marginTop: t.noteQuoteTop,
    fontFamily: font.appBody,
    fontStyle: 'italic',
    fontSize: t.noteQuoteSize,
    lineHeight: t.noteQuoteLineHeight,
    color: c.inkWarm,
  },

  else: { marginTop: t.elseTop, paddingTop: t.elsePadTop, paddingBottom: t.elsePadBottom },
  elseTitle: { fontFamily: font.appSemi, fontSize: t.elseTitleSize, lineHeight: t.elseTitleLineHeight, color: c.ink },
  elseSub: { marginTop: t.elseSubTop, fontFamily: font.appBody, fontSize: t.elseSubSize, lineHeight: t.elseSubLineHeight, color: c.inkWarm },
  area: {
    marginTop: t.areaTop,
    minHeight: t.areaH,
    borderRadius: t.areaRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.areaPadX,
    paddingVertical: t.areaPadY,
    textAlignVertical: 'top',
    fontFamily: font.appBody,
    fontSize: t.areaSize,
    lineHeight: t.areaLineHeight,
    color: c.ink,
  },
  areaFoot: { marginTop: t.areaFootTop, paddingHorizontal: t.areaFootPadX },
  areaFootText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.areaFootSize, lineHeight: t.areaFootLineHeight, color: c.ink },

  check: {
    marginTop: t.checkTop,
    paddingTop: t.checkPadTop,
    paddingBottom: t.checkPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.boxGap,
  },
  box: {
    width: t.box,
    height: t.box,
    borderRadius: t.boxRadius,
    borderWidth: t.boxBorder,
    borderColor: c.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: c.brown, borderColor: c.brown },
  checkTitle: { fontFamily: font.appSemi, fontSize: t.checkTitleSize, lineHeight: t.checkTitleLineHeight, color: c.ink },
  checkSub: { marginTop: t.checkSubTop, paddingRight: t.checkSubPadR, fontFamily: font.appBody, fontSize: t.checkSubSize, lineHeight: t.checkSubLineHeight, color: c.inkWarm },

  approve: {
    ...shadow,
    marginTop: t.approveTop,
    marginLeft: t.cardLeft - t.padX,
    height: t.approveH,
    borderRadius: t.ctaRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.ctaGap,
  },
  approveText: { fontFamily: font.appSemi, fontSize: t.ctaSize, color: ink.onBrand },
  changes: {
    marginTop: t.changesTop,
    marginLeft: t.cardLeft - t.padX,
    height: t.changesH,
    borderRadius: t.ctaRadius,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.ctaGap,
  },
  changesText: { fontFamily: font.appSemi, fontSize: t.ctaSize, color: c.brownLift },
  caption: { marginTop: t.capTop, textAlign: 'center', fontFamily: font.appBody, fontSize: t.capSize, lineHeight: t.capLineHeight, color: c.inkWarm },
  proto: {
    marginTop: t.protoTop,
    marginLeft: t.cardLeft - t.padX,
    minHeight: t.protoH,
    borderRadius: t.infoRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.protoPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.infoGap,
  },
  protoText: { flex: 1, textAlign: 'center', fontFamily: font.appSemi, fontSize: t.protoSize, lineHeight: t.protoLineHeight, color: c.inkWarm },
});
