import { router, type Href } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock,
  Eye,
  FilePlus2,
  FileText,
  IdCard,
  MoreVertical,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import DocumentsHeroArt from './DocumentsHeroArt';
import { shrinkToFit } from '../constants/textFit';
import { AS_DOCUMENTS } from '../data/advocateSettings';
import { advDocuments as t, colors, font, ink, status } from '../constants/theme';
import { advDocHref } from '../data/docLinks';

/**
 * Manage Documents — shared by design/248 and design/250.
 *
 * PAIR B. Those two exports are the same screen with two different headers:
 * 248 a compact horizontal card, 250 a full-bleed illustrated hero. Pixel diff
 * confirmed everything below the header is identical except one word of footer
 * copy ("remain sealed." vs "remain sealed and private."), so one component
 * carries both and the `hero` prop picks the header.
 *
 * ⚠ THE CLIENT DREW BOTH HEADERS AND CHOSE NEITHER. The illustrated hero ships
 * on app/advocate/settings/documents.tsx by instruction; the compact card is
 * kept reachable rather than deleted, because no decision between them was ever
 * recorded. Both PNGs remain in design/. Do not remove the "compact" branch
 * without one.
 *
 * "View" opens the document viewer on that document. Otherwise STATIC: no
 * upload, no file picker, no camera — "Upload New Document", "Replace" and "Add
 * Additional Credential" open nothing. The filter chips do not filter. The vault bar renders at its drawn
 * fill.
 */
export default function AdvocateDocumentsScreen({ hero }: { hero: 'compact' | 'illustrated' }) {
  const insets = useSafeAreaInsets();
  const d = AS_DOCUMENTS;
  const copy = hero === 'compact' ? d.heroCompact : d.heroIllustrated;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/advocate/settings' as Href))}
        >
          <ChevronLeft size={t.backIcon} color="#1B1C1C" strokeWidth={2.4} />
        </Pressable>
        <View style={styles.headCol}>
          <Text style={styles.eyebrow}>{d.eyebrow}</Text>
          <Text style={styles.title} {...shrinkToFit(0.8)}>
            {d.title}
          </Text>
        </View>
        <MoreVertical size={t.kebabGlyph} color="#1B1C1C" strokeWidth={2} />
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} strokeWidth={1.8} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {hero === 'compact' ? (
          <View style={styles.hero}>
            <View style={styles.heroTile}>
              <DocumentsHeroArt width={t.heroTileGlyph + 14} height={t.heroTileGlyph + 14} />
            </View>
            <View style={styles.heroCol}>
              <Text style={styles.heroEyebrow} {...shrinkToFit(0.8)}>
                {copy.eyebrow}
              </Text>
              <Text style={styles.heroTitle} {...shrinkToFit(0.8)}>
                {copy.title}
              </Text>
              <Text style={styles.heroBody}>{copy.body}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.bigHero}>
            <DocumentsHeroArt width={t.bigHeroGlyph * 1.6} height={t.bigHeroGlyph} />
            <Text style={[styles.heroEyebrow, styles.bigHeroEyebrow]} {...shrinkToFit(0.8)}>
              {copy.eyebrow}
            </Text>
            <Text style={styles.bigHeroTitle} {...shrinkToFit(0.8)}>
              {copy.title}
            </Text>
            <Text style={[styles.heroBody, styles.bigHeroBody]}>{copy.body}</Text>
          </View>
        )}

        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
          <PlusCircle size={t.ctaGlyph} color={ink.onBrand} strokeWidth={1.8} />
          <Text style={styles.ctaLabel} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipScroll}
          contentContainerStyle={styles.chips}
        >
          {d.chips.map((c, i) => (
            <View key={c} style={[styles.chip, i === 0 && styles.chipOn]}>
              <Text style={[styles.chipText, i === 0 && styles.chipTextOn]} {...shrinkToFit(0.8)}>
                {c}
              </Text>
            </View>
          ))}
        </ScrollView>

        {d.docs.map((doc, i) => (
          <View key={doc.title} style={[styles.doc, { marginTop: i === 0 ? t.docTop : t.docGap }]}>
            <View style={styles.docHead}>
              <View style={styles.docTile}>
                {i === 2 ? (
                  <IdCard size={t.docTileGlyph} color="#8C6B3F" strokeWidth={1.8} />
                ) : (
                  <FileText size={t.docTileGlyph} color="#8C6B3F" strokeWidth={1.8} />
                )}
              </View>
              <View style={styles.docCol}>
                <View style={styles.docTitleRow}>
                  <Text style={styles.docTitle} {...shrinkToFit(0.75)}>
                    {doc.title}
                  </Text>
                  <View
                    style={[styles.statusPill, doc.tone === 'pending' && styles.statusPillPending]}
                  >
                    {doc.tone === 'done' ? (
                      <CircleCheck size={t.statusGlyph} color="#4D463D" strokeWidth={2} />
                    ) : (
                      <Clock size={t.statusGlyph} color="#8C6B3F" strokeWidth={2} />
                    )}
                    <Text
                      style={[styles.statusText, doc.tone === 'pending' && styles.statusTextPending]}
                      {...shrinkToFit(0.8)}
                    >
                      {doc.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.docSub} {...shrinkToFit(0.8)}>
                  {doc.sub}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.docMeta} {...shrinkToFit(0.8)}>
                    {doc.meta}
                  </Text>
                  <View style={styles.metaDot} />
                  <Text style={styles.docMeta} {...shrinkToFit(0.8)}>
                    {`${doc.size} ${doc.kind}`}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.docRule} />
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(advDocHref(doc.title) as Href)}
                style={styles.action}
              >
                <Eye size={t.actionGlyph} color="#1B1C1C" strokeWidth={1.8} />
                <Text style={styles.actionText}>{d.view}</Text>
              </Pressable>
              <View style={[styles.action, styles.actionAlt]}>
                <RefreshCw size={t.actionGlyph} color="#4D463D" strokeWidth={1.8} />
                <Text style={[styles.actionText, styles.actionTextAlt]}>{d.replace}</Text>
              </View>
            </View>
          </View>
        ))}

        <View style={styles.add}>
          <View style={styles.addTile}>
            <FilePlus2 size={t.addGlyph} color="#4D463D" strokeWidth={1.8} />
          </View>
          <View style={styles.docCol}>
            <Text style={styles.addTitle} {...shrinkToFit(0.8)}>
              {d.add.title}
            </Text>
            <Text style={styles.addSub}>{d.add.sub}</Text>
          </View>
          <ChevronRight size={20} color="#4D463D" strokeWidth={2.2} />
        </View>

        <View style={styles.vault}>
          <View style={styles.vaultHead}>
            <Text style={styles.vaultTitle}>{d.vault.title}</Text>
            <Text style={styles.vaultMeta} {...shrinkToFit(0.8)}>
              {d.vault.meta}
            </Text>
          </View>
          <View style={styles.vaultBar}>
            <View style={[styles.vaultFill, { width: `${d.vault.fill * 100}%` }]} />
          </View>
          <View style={styles.vaultNoteRow}>
            <ShieldCheck size={t.vaultGlyph} color={ink.accent} strokeWidth={1.8} />
            <Text style={styles.vaultNote}>
              {hero === 'compact' ? d.vault.note248 : d.vault.note250}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: '#EDE8E6',
  },
  headCol: { flex: 1, alignItems: 'center' },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowTrack,
    color: ink.accent,
  },
  title: {
    marginTop: t.titleTop,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#1B1C1C',
  },
  avatar: {
    marginLeft: 14,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: '#6C5C45',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingBottom: 30 },

  hero: {
    marginTop: t.heroTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.heroBg,
    borderRadius: t.heroRadius,
    paddingHorizontal: t.heroPadX,
    paddingVertical: t.heroPadY,
  },
  heroTile: {
    width: t.heroTile,
    height: t.heroTile,
    borderRadius: t.heroTileRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.heroTileGap,
  },
  heroCol: { flex: 1 },
  heroEyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.heroEyebrowSize,
    letterSpacing: t.heroEyebrowTrack,
    color: '#8C6B3F',
  },
  heroTitle: {
    marginTop: t.heroTitleTop,
    fontFamily: font.appHeading,
    fontSize: t.heroTitleSize,
    color: '#1B1C1C',
  },
  heroBody: {
    marginTop: t.heroBodyTop,
    fontFamily: font.appBody,
    fontSize: t.heroBodySize,
    lineHeight: t.heroBodyLine,
    color: '#4D463D',
  },

  bigHero: {
    marginTop: t.heroTop,
    marginHorizontal: t.padX,
    minHeight: t.bigHeroH,
    borderRadius: t.heroRadius,
    backgroundColor: '#FBF6F1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  bigHeroEyebrow: { marginTop: t.bigHeroEyebrowTop, textAlign: 'center' },
  bigHeroTitle: {
    marginTop: t.bigHeroTitleTop,
    fontFamily: font.appHeading,
    fontSize: t.bigHeroTitleSize,
    color: '#1B1C1C',
  },
  bigHeroBody: { textAlign: 'center' },

  cta: {
    marginTop: t.ctaTop,
    marginHorizontal: t.padX,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: t.ctaBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  ctaLabel: {
    marginLeft: 11,
    fontFamily: font.appHeading,
    fontSize: t.ctaLabelSize,
    color: ink.onBrand,
  },

  chipScroll: { marginTop: t.chipsTop, flexGrow: 0, overflow: 'hidden', height: t.chipH },
  chips: { paddingHorizontal: t.padX },
  chip: {
    height: t.chipH,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.chipGap,
  },
  chipOn: { backgroundColor: t.chipOnBg },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: '#4D463D' },
  chipTextOn: { color: ink.onBrand },

  doc: {
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.docRadius,
    paddingHorizontal: t.docPadX,
    paddingVertical: t.docPadY,
  },
  docHead: { flexDirection: 'row' },
  docTile: {
    width: t.docTile,
    height: t.docTile,
    borderRadius: t.docTileRadius,
    backgroundColor: t.docTileBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.docTileGap,
  },
  docCol: { flex: 1 },
  docTitleRow: { flexDirection: 'row', alignItems: 'center' },
  docTitle: { flex: 1, fontFamily: font.appHeading, fontSize: t.docTitleSize, color: '#1B1C1C' },
  statusPill: {
    marginLeft: 8,
    height: t.statusH,
    borderRadius: t.statusRadius,
    paddingHorizontal: t.statusPadX,
    backgroundColor: '#EFEBE8',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPillPending: { backgroundColor: '#FBEBD4' },
  statusText: {
    marginLeft: 5,
    fontFamily: font.appSemi,
    fontSize: t.statusSize,
    color: '#4D463D',
  },
  statusTextPending: { color: '#8C6B3F' },
  docSub: {
    marginTop: t.docSubTop,
    fontFamily: font.appBody,
    fontSize: t.docSubSize,
    color: '#6B6B6B',
  },
  metaRow: { marginTop: t.docMetaTop, flexDirection: 'row', alignItems: 'center' },
  docMeta: { fontFamily: font.appSemi, fontSize: t.docMetaSize, color: '#4D463D' },
  metaDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C9C3BE',
    marginHorizontal: 9,
  },
  docRule: { marginTop: t.docRuleTop, height: 1, backgroundColor: '#EDE8E6' },
  actions: { marginTop: t.actionTop, flexDirection: 'row', justifyContent: 'flex-end' },
  action: {
    height: t.actionH,
    borderRadius: t.actionRadius,
    paddingHorizontal: t.actionPadX,
    backgroundColor: '#F7F5F4',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: t.actionGapX,
  },
  actionAlt: { backgroundColor: '#EFEBE8' },
  actionText: {
    marginLeft: t.actionGap,
    fontFamily: font.appSemi,
    fontSize: t.actionSize,
    color: '#1B1C1C',
  },
  actionTextAlt: { color: '#4D463D' },

  add: {
    marginTop: t.addTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: t.addRadius,
    padding: t.addPad,
  },
  addTile: {
    width: t.addTile,
    height: t.addTile,
    borderRadius: t.addTile / 2,
    backgroundColor: '#F2EEEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.addGap,
  },
  addTitle: { fontFamily: font.appHeading, fontSize: t.addTitleSize, color: '#1B1C1C' },
  addSub: {
    marginTop: t.addSubTop,
    fontFamily: font.appBody,
    fontSize: t.addSubSize,
    lineHeight: t.addSubLine,
    color: '#4D463D',
  },

  vault: {
    marginTop: t.vaultTop,
    marginHorizontal: t.padX,
    backgroundColor: t.vaultBg,
    borderRadius: t.vaultRadius,
    padding: t.vaultPad,
  },
  vaultHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vaultTitle: {
    fontFamily: font.appSemi,
    fontSize: t.vaultTitleSize,
    letterSpacing: t.vaultTitleTrack,
    color: '#4D463D',
  },
  vaultMeta: { fontFamily: font.appHeading, fontSize: t.vaultMetaSize, color: '#8C6B3F' },
  vaultBar: {
    marginTop: t.vaultBarTop,
    height: t.vaultBarH,
    borderRadius: t.vaultBarH / 2,
    backgroundColor: t.vaultBarBg,
    overflow: 'hidden',
  },
  vaultFill: { height: '100%', borderRadius: t.vaultBarH / 2, backgroundColor: '#6C5C45' },
  vaultNoteRow: { marginTop: t.vaultNoteTop, flexDirection: 'row' },
  vaultNote: {
    flex: 1,
    marginLeft: t.vaultGap,
    fontFamily: font.appBody,
    fontSize: t.vaultNoteSize,
    lineHeight: t.vaultNoteLine,
    color: '#4D463D',
  },
});
