import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Award,
  Check,
  ChevronLeft,
  FileText,
  Gavel,
  IdCard,
  Loader,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import VerifyDocsArt from '../../../components/VerifyDocsArt';
import { shrinkToFit } from '../../../constants/textFit';
import { AV_DOCUMENTS } from '../../../data/advocateVerify';
import {
  advVerifyDocuments as t,
  advVerifyStep as s,
  colors,
  font,
  ink,
  status,
} from '../../../constants/theme';

// Advocate verification — documents (design/238).
//
// STATIC, NOT WIRED. There is no file picker, no camera and no upload anywhere
// in this project, and none was asked for. Every control here is drawn:
// "Upload Document" opens nothing, "Replace" replaces nothing, the × removes
// nothing, and the third card's progress bar renders at ITS DRAWN PERCENTAGE
// (68%) and stays there. Nothing is uploading.
//
// ⚠ NOTE 9 — AADHAAR IS BACK. Card one asks an advocate to upload an Aadhaar
// card and design/240 confirms one was received. Aadhaar collection by a
// private party is legally constrained in a way nothing else on this list is.
// Drawn as designed; flagged for a decision before any of it is wired.
//
// ⚠ "STEP 3 OF 4" — design/236 says that too, and this is the fifth of six
// form screens. Note 1 in data/advocateVerify.ts. This is also a fifth header
// arrangement: progress bar first, then a back chevron beside a filled step
// pill, then a centred title, all on a 16pt grid rather than 20.
//
// ⚠ CARD FOUR IS PARTLY UNREADABLE IN THE EXPORT. design/238 composites its
// pinned footer over that card. Only the tops of the title glyphs survive, and
// its Upload Document button. What is legible is built; the rest is reported in
// data/advocateVerify.ts rather than invented.

const ICONS = [IdCard, Award, Gavel, FileText];

export default function AdvocateVerifyDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const d = AV_DOCUMENTS;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <View style={styles.progress}>
          {Array.from({ length: 4 }, (_, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                i > 0 && { marginLeft: s.progressGap },
                i < d.filled && styles.segmentOn,
              ]}
            />
          ))}
        </View>

        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={10}
            style={styles.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
          >
            <ChevronLeft size={t.backIcon} color="#222222" strokeWidth={2.4} />
          </Pressable>
          <View style={styles.pill}>
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {d.step}
            </Text>
          </View>
          <View style={styles.spacer} />
        </View>

        <Text style={styles.title} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <VerifyDocsArt width={390 - t.padX * 2} height={t.heroH} />
        </View>

        <Text style={styles.lead}>{d.lead}</Text>

        <View style={styles.accept}>
          <FileText size={t.acceptGlyph} color={ink.accent} strokeWidth={1.8} />
          <Text style={styles.acceptText} {...shrinkToFit(0.8)}>
            {d.accepted}
          </Text>
        </View>

        {d.docs.map((doc, i) => {
          const Icon = ICONS[i];
          return (
            <View key={doc.title} style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.tile}>
                  <Icon size={t.tileGlyph} color={ink.accent} strokeWidth={1.8} />
                </View>
                <View style={styles.cardCol}>
                  <View style={styles.titleRow}>
                    <Text style={styles.docTitle} {...shrinkToFit(0.75)}>
                      {doc.title}
                    </Text>
                    <View style={styles.reqPill}>
                      <Text style={styles.reqPillText} {...shrinkToFit(0.8)}>
                        {doc.pill}
                      </Text>
                    </View>
                    <View style={styles.titleFlex} />
                    <View style={styles.statusCol}>
                      {doc.tone === 'done' ? (
                        <Check size={t.statusGlyph} color={status.active} strokeWidth={3} />
                      ) : doc.tone === 'idle' ? (
                        <View style={styles.idleDot} />
                      ) : null}
                      <Text
                        style={[
                          styles.status,
                          doc.tone === 'done' && styles.statusDone,
                          doc.tone === 'busy' && styles.statusBusy,
                        ]}
                        {...shrinkToFit(0.8)}
                      >
                        {doc.status}
                      </Text>
                    </View>
                  </View>
                  {doc.sub ? <Text style={styles.sub}>{doc.sub}</Text> : null}
                </View>
              </View>

              {doc.file ? (
                <Fragment>
                  {doc.progress ? <View style={styles.rule} /> : null}
                  <View style={[styles.file, doc.progress ? styles.fileBare : null]}>
                    {doc.progress ? (
                      <Loader size={t.fileGlyph} color={ink.accent} strokeWidth={2} />
                    ) : (
                      <FileText size={t.fileGlyph} color="#4A4A4A" strokeWidth={1.8} />
                    )}
                    <Text style={styles.fileName} {...shrinkToFit(0.8)}>
                      {doc.file.name}
                    </Text>
                    {doc.file.size ? (
                      <Text style={styles.fileMeta}>{`• ${doc.file.size}`}</Text>
                    ) : null}
                    {doc.progress ? (
                      <Text style={styles.fileMeta}>{doc.file.action}</Text>
                    ) : (
                      <Fragment>
                        <Text style={styles.replace}>{doc.file.action}</Text>
                        <X size={t.fileGlyph} color="#4A4A4A" strokeWidth={2} />
                      </Fragment>
                    )}
                  </View>
                  {doc.progress ? (
                    <View style={styles.bar}>
                      <View style={[styles.barFill, { width: `${doc.progress * 100}%` }]} />
                    </View>
                  ) : null}
                </Fragment>
              ) : null}

              {doc.upload ? (
                <Fragment>
                  <View style={styles.rule} />
                  <View style={styles.uploadRow}>
                    <View style={styles.upload}>
                      <Upload size={t.uploadGlyph} color={ink.accent} strokeWidth={1.8} />
                      <Text style={styles.uploadText} {...shrinkToFit(0.8)}>
                        {doc.upload}
                      </Text>
                    </View>
                  </View>
                </Fragment>
              ) : null}
            </View>
          );
        })}

        <View style={styles.privacy}>
          <View style={styles.privacyTile}>
            <ShieldCheck size={t.privacyGlyph} color={ink.accent} strokeWidth={1.8} />
          </View>
          <View style={styles.cardCol}>
            <Text style={styles.privacyText}>{d.privacy.body}</Text>
            <Text style={styles.privacyLink}>{d.privacy.link}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => router.push('/advocate/verify/review' as Href)}
        >
          <Text style={styles.ctaLabel} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={s.ctaArrow} color={ink.onBrand} strokeWidth={2.4} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
        >
          <Text style={styles.secondary}>{d.secondary}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: s.bg },

  header: { paddingHorizontal: t.padX },
  progress: { flexDirection: 'row' },
  segment: {
    flex: 1,
    height: t.progressHeight,
    borderRadius: t.progressHeight / 2,
    backgroundColor: s.progressOff,
  },
  segmentOn: { backgroundColor: colors.brand },

  headerRow: {
    marginTop: t.rowTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: s.backBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: { width: t.backBtn, height: t.backBtn },
  pill: {
    height: t.pillH,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillTrack,
    color: ink.accent,
  },
  title: {
    marginTop: t.titleTop,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#222222',
  },

  content: { paddingBottom: 24 },

  hero: {
    marginTop: t.heroTop,
    marginHorizontal: t.padX,
    height: t.heroH,
    borderRadius: t.heroRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: s.backBorder,
    overflow: 'hidden',
  },
  lead: {
    marginTop: t.leadTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.leadSize,
    color: colors.textBody,
  },
  accept: {
    marginTop: t.acceptTop,
    marginHorizontal: t.padX,
    height: t.acceptH,
    borderRadius: t.acceptRadius,
    backgroundColor: t.acceptBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    marginLeft: t.acceptGap,
    fontFamily: font.appSemi,
    fontSize: t.acceptSize,
    color: ink.accent,
  },

  card: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: s.backBorder,
    padding: t.cardPad,
  },
  cardHead: { flexDirection: 'row' },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: t.tileBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.tileGap,
  },
  cardCol: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  docTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.docTitleSize, color: '#222222' },
  reqPill: {
    flexShrink: 0,
    marginLeft: t.reqPillGap,
    height: t.reqPillH,
    borderRadius: t.reqPillRadius,
    paddingHorizontal: t.reqPillPadX,
    backgroundColor: t.reqPillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reqPillText: { fontFamily: font.appSemi, fontSize: t.reqPillSize, color: ink.accent },
  sub: {
    marginTop: t.subTop,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLine,
    color: colors.textBody,
  },
  titleFlex: { flex: 1, minWidth: 6 },
  statusCol: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginLeft: 8,
  },
  idleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D8D2C8',
  },
  status: { marginLeft: 6, fontFamily: font.appBody, fontSize: t.statusSize, color: colors.textBody },
  statusDone: { fontFamily: font.appSemi, color: status.active },
  statusBusy: { marginLeft: 0, fontFamily: font.appSemi, color: ink.accent },

  file: {
    marginTop: t.fileTop,
    height: t.fileH,
    borderRadius: t.fileRadius,
    backgroundColor: t.fileBg,
    paddingHorizontal: t.filePadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileBare: { backgroundColor: 'transparent', paddingHorizontal: 0, marginTop: t.fileTop - 5 },
  fileName: {
    flex: 1,
    flexShrink: 1,
    marginLeft: 9,
    fontFamily: font.appBody,
    fontSize: t.fileNameSize,
    color: '#222222',
  },
  fileMeta: {
    flexShrink: 0,
    marginLeft: 5,
    fontFamily: font.appBody,
    fontSize: t.fileMetaSize,
    color: colors.textBody,
  },
  replace: {
    marginHorizontal: 10,
    fontFamily: font.appSemi,
    fontSize: t.fileMetaSize,
    color: '#222222',
    textDecorationLine: 'underline',
  },

  bar: {
    marginTop: t.barTop,
    height: t.barH,
    borderRadius: t.barH / 2,
    backgroundColor: t.barBg,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: t.barH / 2, backgroundColor: colors.brand },

  rule: { marginTop: t.ruleTop, height: 1, backgroundColor: s.rule },
  uploadRow: { marginTop: t.uploadTop, alignItems: 'flex-end' },
  upload: {
    width: t.uploadW,
    height: t.uploadH,
    borderRadius: t.uploadRadius,
    borderWidth: 1,
    borderColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    marginLeft: 8,
    fontFamily: font.appSemi,
    fontSize: t.uploadSize,
    color: ink.accent,
  },

  privacy: {
    marginTop: t.privacyTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: t.privacyRadius,
    borderWidth: 1,
    borderColor: s.backBorder,
    padding: t.privacyPad,
  },
  privacyTile: {
    width: t.privacyTile,
    height: t.privacyTile,
    borderRadius: t.tileRadius,
    backgroundColor: t.tileBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.privacyGap,
  },
  privacyText: {
    fontFamily: font.appBody,
    fontSize: t.privacySize,
    lineHeight: t.privacyLine,
    color: colors.textBody,
  },
  privacyLink: {
    marginTop: t.linkTop,
    fontFamily: font.appSemi,
    fontSize: t.privacySize,
    color: ink.accent,
    textDecorationLine: 'underline',
  },

  footer: {
    paddingTop: t.footerPadTop,
    paddingHorizontal: t.padX,
    borderTopWidth: 1,
    borderTopColor: s.rule,
    backgroundColor: s.bg,
  },
  cta: {
    height: t.ctaH,
    borderRadius: s.ctaRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  ctaLabel: {
    fontFamily: font.appHeading,
    fontSize: 16,
    color: ink.onBrand,
    marginRight: s.ctaArrowGap,
  },
  secondary: {
    marginTop: s.secondaryTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: s.secondarySize,
    color: colors.textBody,
  },
});
