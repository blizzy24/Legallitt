import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  ChevronRight,
  EllipsisVertical,
  FileText,
  Folder,
  Mail,
  MessageSquare,
  MessageSquareText,
  Phone,
  ShieldCheck,
  UserRound,
  Wallet,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import {
  ADV_CLIENT_ACTIVITY,
  ADV_CLIENT_FOOTER,
  ADV_CLIENT_MATTERS,
  ADV_CLIENT_PROFILE,
} from '../../../data/advocateSide';
import { advClientProfile as t, colors, font, ink } from '../../../constants/theme';

// Advocate client profile (design/152).
//
// The four tiles route to the per-client sub-screens from designs 153-156. The
// photograph is a placeholder sized to the design's circle — no asset exists.
//
// NOTE — design/152's activity trail adds a FOURTH earnings figure, "Retainer escrow
// of ₹45,000". With design/148's ₹8,500, design/156's ₹65,000 and design/157's
// ₹32,900 net, no two advocate screens agree on what money has moved. Recorded in
// data/advocateSide.ts; nothing is derived from any of them.

const TILES = [
  { key: 'cases', label: 'Cases', icon: Briefcase },
  { key: 'documents', label: 'Documents', icon: Folder },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'payments', label: 'Payments', icon: Wallet },
];

export default function AdvocateClientProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = ADV_CLIENT_PROFILE;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/(advocate)/clients')
          }
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          Client Profile
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="More" hitSlop={8}>
          <EllipsisVertical size={t.kebab} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardHead}>
            {/* Placeholder for design/152's photograph, at the drawn size. */}
            <View style={styles.photoWrap}>
              <View style={styles.photo}>
                <Text style={styles.photoText}>{c.initials}</Text>
              </View>
              <View style={styles.photoDot} />
            </View>
            <View style={styles.cardHeadText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} {...shrinkToFit(0.75)}>
                  {c.name}
                </Text>
                <View style={styles.chip}>
                  <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                    {c.chip}
                  </Text>
                </View>
              </View>
              <Text style={styles.type}>{c.type}</Text>
              <Text style={styles.since} {...shrinkToFit(0.8)}>
                {c.since}
              </Text>
            </View>
          </View>

          <View style={styles.contact}>
            <View style={styles.contactRow}>
              <Phone size={t.contactIcon} color={colors.brandDark} />
              <Text style={styles.contactText} {...shrinkToFit(0.75)}>
                {c.phone}
              </Text>
              <Pressable accessibilityRole="button" hitSlop={8}>
                <Text style={styles.copy} {...shrinkToFit(0.8)}>
                  Copy
                </Text>
              </Pressable>
            </View>
            <View style={[styles.contactRow, styles.contactRowNext]}>
              <Mail size={t.contactIcon} color={colors.brandDark} />
              <Text style={styles.contactText} {...shrinkToFit(0.7)}>
                {c.email}
              </Text>
              <Pressable accessibilityRole="button" hitSlop={8}>
                <Text style={styles.copy} {...shrinkToFit(0.8)}>
                  Copy
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/(advocate)/clients/${id}/messages` as Href)}
              style={({ pressed }) => [styles.action, styles.actionPrimary, pressed && styles.pressed]}
            >
              <MessageSquareText size={t.actionIcon} color={ink.onBrand} />
              <Text style={[styles.actionText, styles.actionTextPrimary]}>Message</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.action, styles.actionSecondary, pressed && styles.pressed]}
            >
              <Phone size={t.actionIcon} color={colors.textPrimary} />
              <Text style={styles.actionText}>Call</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.tiles}>
          {TILES.map((tile) => (
            <Pressable
              key={tile.key}
              accessibilityRole="button"
              onPress={() => router.push(`/(advocate)/clients/${id}/${tile.key}` as Href)}
              style={styles.tile}
            >
              <View style={styles.tileIcon}>
                <tile.icon size={t.tileIconGlyph} color={colors.brandDark} />
              </View>
              <Text style={styles.tileLabel} {...shrinkToFit(0.75)}>
                {tile.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.section} {...shrinkToFit(0.8)}>
            Active Matters ({ADV_CLIENT_MATTERS.length})
          </Text>
          <Text style={styles.sectionNote} {...shrinkToFit(0.8)}>
            Live Retainers
          </Text>
        </View>

        {ADV_CLIENT_MATTERS.map((m) => (
          <Pressable
            key={m.id}
            accessibilityRole="button"
            onPress={() => router.push(`/(advocate)/clients/${id}/cases` as Href)}
            style={styles.matter}
          >
            <View style={styles.matterHead}>
              <View style={styles.service}>
                <Text style={styles.serviceText} {...shrinkToFit(0.75)}>
                  {m.service}
                </Text>
              </View>
              <View style={styles.statusDot} />
              <Text style={styles.statusText} {...shrinkToFit(0.8)}>
                {m.status}
              </Text>
            </View>
            <View style={styles.matterBody}>
              <View style={styles.matterText}>
                <Text style={styles.matterTitle} {...shrinkToFit(0.75)}>
                  {m.title}
                </Text>
                <Text style={styles.matterDetail}>{m.detail}</Text>
              </View>
              <ChevronRight size={t.matterChevron} color={colors.textMuted} />
            </View>
          </Pressable>
        ))}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/(advocate)/clients/${id}/cases` as Href)}
          style={({ pressed }) => [styles.viewAll, pressed && styles.pressed]}
        >
          <Text style={styles.viewAllText}>View All Cases</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/(advocate)/clients/${id}/documents` as Href)}
          style={styles.doc}
        >
          <View style={styles.docIcon}>
            <FileText size={t.docIconGlyph} color={colors.brandDark} />
          </View>
          <View style={styles.docText}>
            <View style={styles.docTitleRow}>
              <Text style={styles.docTitle} {...shrinkToFit(0.75)}>
                {c.documents.count}
              </Text>
              <View style={styles.docChip}>
                <Text style={styles.docChipText} {...shrinkToFit(0.8)}>
                  {c.documents.chip}
                </Text>
              </View>
            </View>
            <Text style={styles.docBody} {...shrinkToFit(0.75)}>
              {c.documents.body}
            </Text>
          </View>
          <View style={styles.docView}>
            <Text style={styles.docViewText} {...shrinkToFit(0.8)}>
              View
            </Text>
            <ArrowRight size={15} color={colors.brandDark} style={styles.docViewIcon} />
          </View>
        </Pressable>

        <View style={styles.sectionRow}>
          <Text style={styles.section} {...shrinkToFit(0.8)}>
            Recent Activity
          </Text>
          <Text style={styles.sectionNote} {...shrinkToFit(0.8)}>
            Audit Trail
          </Text>
        </View>

        <View style={styles.act}>
          {ADV_CLIENT_ACTIVITY.map((a, i) => (
            <View key={a.id} style={[styles.actRow, i > 0 && styles.actRowNext]}>
              <View style={styles.actRail}>
                <View
                  style={[
                    styles.actDot,
                    { backgroundColor: a.tone === 'dark' ? t.actToneDark : t.actToneLight },
                  ]}
                />
                {i < ADV_CLIENT_ACTIVITY.length - 1 && <View style={styles.actLine} />}
              </View>
              <View style={styles.actText}>
                <View style={styles.actTitleRow}>
                  <Text style={styles.actTitle} {...shrinkToFit(0.75)}>
                    {a.title}
                  </Text>
                  <Text style={styles.actWhen} {...shrinkToFit(0.75)}>
                    {a.when}
                  </Text>
                </View>
                <Text style={styles.actBody}>{a.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.foot}>
          <ShieldCheck size={t.footIcon} color={colors.brandDark} />
          <Text style={styles.footText}>
            Client ID: <Text style={styles.footId}>{c.clientId}</Text> • {ADV_CLIENT_FOOTER}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: 14,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.titleGap,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
    marginLeft: t.kebabGap,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  cardHead: { flexDirection: 'row' },
  photoWrap: { width: t.photo, height: t.photo },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: '#F3DCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoText, color: colors.brandDark },
  photoDot: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: t.photoDot,
    height: t.photoDot,
    borderRadius: t.photoDot / 2,
    borderWidth: 2,
    borderColor: colors.card,
    backgroundColor: '#5A4A37',
  },
  cardHeadText: { flex: 1, minWidth: 0, marginLeft: t.photoGap },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  chip: {
    marginLeft: t.chipGap,
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, color: t.chipColour },
  type: {
    marginTop: t.typeGap,
    fontFamily: font.appBody,
    fontSize: t.typeSize,
    lineHeight: t.typeLineHeight,
    color: colors.textBody,
  },
  since: {
    marginTop: t.sinceGap,
    fontFamily: font.appBody,
    fontSize: t.sinceSize,
    color: colors.textMuted,
  },

  contact: {
    marginTop: t.contactGap,
    borderRadius: t.contactRadius,
    backgroundColor: t.contactBg,
    padding: t.contactPad,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center' },
  contactRowNext: { marginTop: t.contactRowGap },
  contactText: {
    marginLeft: t.contactIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appBody,
    fontSize: t.contactSize,
    color: colors.textPrimary,
  },
  copy: { fontFamily: font.appSemi, fontSize: t.copySize, color: colors.brandDark },

  actions: { marginTop: t.actionsGap, flexDirection: 'row', gap: t.actionGapX },
  action: {
    flex: 1,
    minWidth: 0,
    minHeight: t.actionHeight,
    borderRadius: t.actionRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: { backgroundColor: t.actionPrimaryBg },
  actionSecondary: { backgroundColor: t.actionSecondaryBg },
  pressed: { opacity: 0.85 },
  actionText: {
    marginLeft: t.actionIconGap,
    fontFamily: font.appHeading,
    fontSize: t.actionSize,
    color: colors.textPrimary,
  },
  actionTextPrimary: { color: ink.onBrand },

  tiles: { marginTop: t.tilesGap, flexDirection: 'row', gap: t.tileGapX },
  tile: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.tileRadius,
    backgroundColor: colors.card,
    paddingVertical: t.tilePadY,
    alignItems: 'center',
  },
  tileIcon: {
    width: t.tileIcon,
    height: t.tileIcon,
    borderRadius: t.tileIcon / 2,
    backgroundColor: t.tileIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: {
    marginTop: t.tileLabelGap,
    fontFamily: font.appBody,
    fontSize: t.tileLabelSize,
    color: colors.textPrimary,
  },

  sectionRow: { marginTop: t.sectionGap, flexDirection: 'row', alignItems: 'center' },
  section: { flex: 1, minWidth: 0, fontFamily: font.appHeading, fontSize: t.sectionSize, color: colors.textPrimary },
  sectionNote: { marginLeft: 8, fontFamily: font.appBody, fontSize: t.sectionNoteSize, color: colors.textBody },

  matter: {
    marginTop: t.matterGap,
    borderRadius: t.matterRadius,
    backgroundColor: colors.card,
    padding: t.matterPad,
  },
  matterHead: { flexDirection: 'row', alignItems: 'center' },
  service: {
    minHeight: t.serviceHeight,
    borderRadius: t.serviceRadius,
    paddingHorizontal: t.servicePadX,
    backgroundColor: t.serviceBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  serviceText: { fontFamily: font.appBody, fontSize: t.serviceSize, color: colors.textPrimary },
  statusDot: {
    width: t.statusDot,
    height: t.statusDot,
    borderRadius: t.statusDot / 2,
    marginLeft: t.statusGap,
    marginRight: t.statusDotGap,
    backgroundColor: colors.brandDark,
  },
  statusText: { fontFamily: font.appBody, fontSize: t.statusSize, color: colors.textPrimary },
  matterBody: { marginTop: t.matterTitleGap, flexDirection: 'row', alignItems: 'center' },
  matterText: { flex: 1, minWidth: 0, marginRight: 8 },
  matterTitle: { fontFamily: font.appHeading, fontSize: t.matterTitleSize, color: colors.textPrimary },
  matterDetail: {
    marginTop: t.matterDetailGap,
    fontFamily: font.appBody,
    fontSize: t.matterDetailSize,
    lineHeight: t.matterDetailLineHeight,
    color: colors.textBody,
  },

  viewAll: {
    marginTop: t.viewAllGap,
    minHeight: t.viewAllHeight,
    borderRadius: t.viewAllRadius,
    backgroundColor: t.viewAllBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllText: { fontFamily: font.appBody, fontSize: t.viewAllSize, color: colors.brandDark },

  doc: {
    marginTop: t.docGap,
    borderRadius: t.docRadius,
    backgroundColor: colors.card,
    padding: t.docPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIcon: {
    width: t.docIcon,
    height: t.docIcon,
    borderRadius: t.docIconRadius,
    backgroundColor: t.docIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docText: { flex: 1, minWidth: 0, marginLeft: t.docIconGap, marginRight: 8 },
  docTitleRow: { flexDirection: 'row', alignItems: 'center' },
  docTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.docTitleSize, color: colors.textPrimary },
  docChip: {
    marginLeft: t.docChipGap,
    minHeight: t.docChipHeight,
    borderRadius: t.docChipRadius,
    paddingHorizontal: t.docChipPadX,
    backgroundColor: t.docChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docChipText: { fontFamily: font.appBody, fontSize: t.docChipSize, color: colors.textBody },
  docBody: {
    marginTop: t.docBodyGap,
    fontFamily: font.appBody,
    fontSize: t.docBodySize,
    color: colors.textBody,
  },
  docView: { flexDirection: 'row', alignItems: 'center' },
  docViewText: { fontFamily: font.appBody, fontSize: t.docViewSize, color: colors.brandDark },
  docViewIcon: { marginLeft: 6 },

  act: {
    marginTop: t.actGap,
    borderRadius: t.actRadius,
    backgroundColor: colors.card,
    padding: t.actPad,
  },
  actRow: { flexDirection: 'row' },
  actRowNext: { marginTop: t.actRowGap },
  actRail: { width: t.actDot, alignItems: 'center' },
  actDot: { width: t.actDot, height: t.actDot, borderRadius: t.actDot / 2 },
  actLine: {
    flex: 1,
    width: t.actRail,
    marginTop: 6,
    marginBottom: -t.actRowGap,
    backgroundColor: t.actRailColour,
  },
  actText: { flex: 1, minWidth: 0, marginLeft: t.actGapX },
  actTitleRow: { flexDirection: 'row', alignItems: 'center' },
  actTitle: { flex: 1, minWidth: 0, marginRight: 8, fontFamily: font.appHeading, fontSize: t.actTitleSize, color: colors.textPrimary },
  actWhen: { fontFamily: font.appBody, fontSize: t.actWhenSize, color: colors.textBody },
  actBody: {
    marginTop: t.actBodyGap,
    fontFamily: font.appBody,
    fontSize: t.actBodySize,
    lineHeight: t.actBodyLineHeight,
    color: colors.textBody,
  },

  foot: {
    marginTop: t.footGap,
    borderRadius: t.footRadius,
    backgroundColor: t.footBg,
    padding: t.footPad,
    flexDirection: 'row',
  },
  footText: {
    marginLeft: t.footIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.footSize,
    lineHeight: t.footLineHeight,
    color: colors.textBody,
  },
  footId: { fontFamily: font.appHeading, color: colors.textPrimary },
});
