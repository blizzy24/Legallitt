import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  Bell,
  Briefcase,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  CircleAlert,
  CircleX,
  Download,
  Eye,
  FileText,
  Headset,
  Landmark,
  MapPin,
  Menu,
  MoreVertical,
  Plus,
  Scale,
  Star,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ConfirmModal from '../../components/ConfirmModal';
import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, profile as p, requestDetail as t, status } from '../../constants/theme';
import { REQUEST_DETAIL as d, requestById } from '../../data/requests';
import { clientDocHref } from '../../data/docLinks';

// Request Details (design/54).
//
// TWO STACKED HEADERS — reported. This is the only screen in the app drawn with a
// second header row: an app-level bar (hamburger, "Requests", bell, avatar) sitting
// above a screen-level bar (back chevron, "Request Details", docket number, kebab).
// Every other detail screen in the app has one. Built as drawn; if the client meant
// one header, the top bar is the one to drop.
//
// The hamburger and kebab open nothing — neither menu is designed.

const STAT_ICONS: LucideIcon[] = [Scale, CalendarDays, Landmark];
const ATTR_ICONS: LucideIcon[] = [Briefcase, Scale, MapPin];

export default function RequestDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [cancelling, setCancelling] = useState(false);

  // design/54 only draws the DR-4402 docket; other ids fall back to it.
  const item = requestById(String(id));

  return (
    <View style={styles.screen}>
      <View style={[styles.topBar, { paddingTop: insets.top + t.topTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Menu" hitSlop={10}>
          <Menu size={t.menuIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          Requests
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Notifications" hitSlop={10} style={styles.bell}>
          <Bell size={t.bellIcon} color={colors.textPrimary} />
          <View style={styles.bellDot} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.avatarIcon} color={ink.onBrand} />
        </View>
      </View>

      <View style={styles.subBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/requests'))}
        >
          <ChevronLeft size={t.subBackIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.subText}>
          <Text style={styles.subTitle} numberOfLines={1}>
            Request Details
          </Text>
          <Text style={styles.subDocket} {...shrinkToFit(0.8)}>
            {item ? `DOCKET #${item.id}` : d.docket}
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="More options" hitSlop={10}>
          <MoreVertical size={t.kebabIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.statusPill}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText} {...shrinkToFit(0.8)}>
                {d.statusLabel}
              </Text>
            </View>
            <Text style={styles.filing} {...shrinkToFit(0.8)}>
              {d.filingId}
            </Text>
          </View>

          <Text style={styles.title}>{d.title}</Text>
          <Text style={styles.subtitle}>{d.subtitle}</Text>

          <View style={styles.stats}>
            {d.stats.map((s, i) => {
              const Icon = STAT_ICONS[i];
              return (
                <View key={s.label} style={styles.stat}>
                  <Icon size={t.statIcon} color={ink.accent} />
                  <Text style={styles.statLabel} {...shrinkToFit(0.75)}>
                    {s.label}
                  </Text>
                  <Text style={styles.statValue} {...shrinkToFit(0.7)}>
                    {s.value}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel} {...shrinkToFit(0.8)}>
            SELECTED ADVOCATE
          </Text>
          <Text style={styles.barId} {...shrinkToFit(0.8)}>
            {d.advocate.barId}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.advRow}>
            <View>
              <View style={styles.advAvatar}>
                <Text style={styles.advAvatarText}>{d.advocate.initials}</Text>
              </View>
              <View style={styles.advDot} />
            </View>
            <View style={styles.advText}>
              <View style={styles.advNameRow}>
                <Text style={styles.advName} {...shrinkToFit(0.8)}>
                  {d.advocate.name}
                </Text>
                <View style={styles.verified}>
                  <Check size={11} color={t.tlDone} strokeWidth={3} />
                  <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                    Verified
                  </Text>
                </View>
              </View>
              <View style={styles.advMeta}>
                <Star size={13} color="#F5A524" fill="#F5A524" />
                <Text style={styles.advMetaText} {...shrinkToFit(0.8)}>
                  {d.advocate.rating}
                </Text>
                <Text style={styles.advMetaDim} {...shrinkToFit(0.8)}>
                  • {d.advocate.briefs}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.attrs}>
            {d.advocate.attributes.map((a, i) => {
              const Icon = ATTR_ICONS[i];
              return (
                <View key={a} style={styles.attr}>
                  <Icon size={t.advAttrIcon} color={ink.accent} />
                  <Text style={styles.attrText} {...shrinkToFit(0.8)}>
                    {a}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <Text style={[styles.sectionLabel, styles.soloLabel]} {...shrinkToFit(0.8)}>
          CASE INFORMATION
        </Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel} {...shrinkToFit(0.8)}>
            Case Subject
          </Text>
          <Text style={styles.fieldValue} {...shrinkToFit(0.8)}>
            {d.caseSubject}
          </Text>

          <Text style={[styles.fieldLabel, styles.fieldSpaced]} {...shrinkToFit(0.8)}>
            Brief Description
          </Text>
          <View style={styles.brief}>
            <Text style={styles.briefText}>{d.briefDescription}</Text>
          </View>

          <Text style={[styles.fieldLabel, styles.fieldSpaced]} {...shrinkToFit(0.8)}>
            Designated Forum
          </Text>
          <View style={styles.forumRow}>
            <MapPin size={t.forumIcon} color={ink.accent} />
            <Text style={styles.forumText} {...shrinkToFit(0.75)}>
              {d.forum}
            </Text>
            <View style={styles.civil}>
              <Text style={styles.civilText}>{d.forumChip}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionLabel} {...shrinkToFit(0.8)}>
            DOCUMENTS ATTACHED ({d.documents.length})
          </Text>
          <Pressable accessibilityRole="button" hitSlop={8} style={styles.addLink}>
            <Plus size={13} color={ink.accent} />
            <Text style={styles.addLinkText} {...shrinkToFit(0.8)}>
              Add Document
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          {d.documents.map((f, i) => (
            <View key={f.name} style={[styles.file, i > 0 && styles.fileSpaced]}>
              <View style={styles.fileIcon}>
                <FileText size={t.fileIconGlyph} color={ink.accent} />
              </View>
              <View style={styles.fileText}>
                <Text style={styles.fileName} {...shrinkToFit(0.75)}>
                  {f.name}
                </Text>
                <Text style={styles.fileMeta} {...shrinkToFit(0.8)}>
                  {f.meta}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Preview"
                onPress={() => router.push(clientDocHref(f.name) as Href)}
                style={styles.fileAction}
              >
                <Eye size={t.fileActionIcon} color={colors.textPrimary} />
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Download" style={styles.fileAction}>
                <Download size={t.fileActionIcon} color={colors.textPrimary} />
              </Pressable>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionLabel, styles.soloLabel]} {...shrinkToFit(0.8)}>
          REQUEST TIMELINE
        </Text>
        <View style={styles.card}>
          {d.timeline.map((s, i) => {
            const last = i === d.timeline.length - 1;
            const done = s.state === 'done';
            const active = s.state === 'active';
            return (
              <View key={s.title} style={styles.tlRow}>
                <View style={styles.tlRail}>
                  <View
                    style={[
                      styles.tlMarker,
                      { backgroundColor: done ? t.tlDone : active ? t.tlActive : t.tlPending },
                    ]}
                  >
                    {done && <Check size={t.tlMarkerGlyph} color={ink.onBrand} strokeWidth={3} />}
                    {active && <View style={styles.tlCore} />}
                  </View>
                  {!last && (
                    <View
                      style={[styles.tlLine, { backgroundColor: done ? t.tlDone : t.tlPending }]}
                    />
                  )}
                </View>
                <View style={[styles.tlBody, !last && styles.tlBodyGap]}>
                  <View style={styles.tlTitleRow}>
                    <Text style={styles.tlTitle} {...shrinkToFit(0.8)}>
                      {s.title}
                    </Text>
                    {s.tag !== '' && (
                      <View style={styles.tlTag}>
                        <Text style={styles.tlTagText}>{s.tag}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.tlText}>{s.body}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/support-chat')}
          style={({ pressed }) => [styles.support, pressed && styles.pressed]}
        >
          <Headset size={t.buttonIcon} color={ink.onBrand} />
          <Text style={styles.supportLabel}>Contact Legalitt Support</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setCancelling(true)}
          style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
        >
          <CircleX size={t.buttonIcon} color={t.cancelText} />
          <Text style={styles.cancelLabel}>Cancel Request</Text>
        </Pressable>

        <View style={styles.footNote}>
          <CircleAlert size={t.footNoteIcon} color={colors.textBody} />
          <Text style={styles.footNoteText}>{d.footerNote}</Text>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={cancelling}
        icon={CircleX}
        title="Cancel Request?"
        body="This will withdraw your representation request. Your advocate will be notified."
        confirmLabel="Cancel Request"
        cancelLabel="Keep Request"
        onConfirm={() => {
          setCancelling(false);
          router.replace('/requests');
        }}
        onCancel={() => setCancelling(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  topBar: {
    minHeight: t.topHeight,
    paddingHorizontal: p.padX,
    paddingBottom: 10,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.topTitleSize,
    color: colors.textPrimary,
  },
  bell: {
    marginRight: t.bellGap,
  },
  bellDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: t.bellDot,
    height: t.bellDot,
    borderRadius: t.bellDot / 2,
    backgroundColor: status.notification,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subBar: {
    minHeight: t.subHeight,
    paddingHorizontal: p.padX,
    paddingTop: t.subPadTop,
    paddingBottom: 10,
    backgroundColor: colors.appBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subText: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  subTitle: {
    fontFamily: font.appHeading,
    fontSize: t.subTitleSize,
    color: colors.textPrimary,
  },
  subDocket: {
    marginTop: t.subDocketGap,
    fontFamily: font.appSemi,
    fontSize: t.subDocketSize,
    letterSpacing: t.subDocketSpacing,
    color: ink.accent,
  },
  content: {
    paddingHorizontal: p.padX,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    minHeight: 26,
    borderRadius: 13,
    paddingHorizontal: 10,
    backgroundColor: status.pendingBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
    backgroundColor: status.pending,
  },
  statusText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: 12,
    color: status.pendingText,
  },
  filing: {
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.filingSize,
    color: colors.textBody,
  },
  title: {
    marginTop: t.titleGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: t.subtitleGap,
    fontFamily: font.appBody,
    fontSize: t.subtitleSize,
    color: colors.textBody,
  },
  stats: {
    marginTop: t.statGap,
    flexDirection: 'row',
    gap: t.statColGap,
  },
  stat: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.statRadius,
    backgroundColor: t.statBg,
    padding: t.statPad,
    alignItems: 'center',
  },
  statLabel: {
    marginTop: t.statLabelGap,
    fontFamily: font.appBody,
    fontSize: t.statLabelSize,
    color: colors.textBody,
  },
  statValue: {
    marginTop: t.statValueGap,
    fontFamily: font.appHeading,
    fontSize: t.statValueSize,
    color: colors.textPrimary,
  },
  sectionHead: {
    marginTop: t.sectionGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textMuted,
  },
  soloLabel: {
    marginTop: t.sectionGap,
  },
  barId: {
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.barIdSize,
    color: colors.textBody,
  },
  advRow: {
    flexDirection: 'row',
  },
  advAvatar: {
    width: t.advAvatar,
    height: t.advAvatar,
    borderRadius: t.advAvatar / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advAvatarText: {
    fontFamily: font.appSemi,
    fontSize: t.advAvatarText,
    color: colors.brandDark,
  },
  advDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: t.advDot,
    height: t.advDot,
    borderRadius: t.advDot / 2,
    backgroundColor: t.tlDone,
    borderWidth: 2.5,
    borderColor: colors.card,
  },
  advText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.advGap,
    justifyContent: 'center',
  },
  advNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advName: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.advNameSize,
    color: colors.textPrimary,
  },
  verified: {
    marginLeft: t.advVerifiedGap,
    minHeight: 21,
    borderRadius: 10.5,
    paddingHorizontal: 8,
    backgroundColor: '#E8F8EF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    marginLeft: 4,
    fontFamily: font.appSemi,
    fontSize: 11,
    color: t.tlDone,
  },
  advMeta: {
    marginTop: t.advMetaGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  advMetaText: {
    marginLeft: 5,
    fontFamily: font.appSemi,
    fontSize: t.advMetaSize,
    color: colors.textPrimary,
  },
  advMetaDim: {
    marginLeft: 6,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.advMetaSize,
    color: colors.textBody,
  },
  attrs: {
    marginTop: t.advAttrGap,
    gap: t.advAttrRowGap,
    alignItems: 'flex-start',
  },
  attr: {
    minHeight: t.advAttrHeight,
    borderRadius: t.advAttrRadius,
    paddingHorizontal: t.advAttrPadX,
    backgroundColor: t.advAttrBg,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
  },
  attrText: {
    marginLeft: t.advAttrIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.advAttrSize,
    color: colors.textPrimary,
  },
  fieldLabel: {
    fontFamily: font.appBody,
    fontSize: t.fieldLabelSize,
    color: colors.textBody,
  },
  fieldSpaced: {
    marginTop: t.fieldGap,
  },
  fieldValue: {
    marginTop: t.fieldValueGap,
    fontFamily: font.appHeading,
    fontSize: t.fieldValueSize,
    color: colors.textPrimary,
  },
  brief: {
    marginTop: t.fieldValueGap + 2,
    borderRadius: t.briefRadius,
    backgroundColor: t.briefBg,
    padding: t.briefPad,
  },
  briefText: {
    fontFamily: font.appBody,
    fontSize: t.briefSize,
    lineHeight: t.briefLineHeight,
    color: colors.textBody,
  },
  forumRow: {
    marginTop: t.fieldValueGap + 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  forumText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.forumIconGap,
    fontFamily: font.appHeading,
    fontSize: t.fieldValueSize - 1,
    color: colors.textPrimary,
  },
  civil: {
    marginLeft: 8,
    minHeight: t.civilHeight,
    borderRadius: t.civilRadius,
    paddingHorizontal: t.civilPadX,
    backgroundColor: t.civilBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  civilText: {
    fontFamily: font.appSemi,
    fontSize: t.civilSize,
    letterSpacing: 0.5,
    color: colors.textBody,
  },
  addLink: {
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addLinkText: {
    marginLeft: 4,
    fontFamily: font.appSemi,
    fontSize: t.addLinkSize,
    color: ink.accent,
  },
  file: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileSpaced: {
    marginTop: t.fileGap,
  },
  fileIcon: {
    width: t.fileIcon,
    height: t.fileIcon,
    borderRadius: t.fileIconRadius,
    backgroundColor: t.fileIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.fileIconGap,
  },
  fileName: {
    fontFamily: font.appSemi,
    fontSize: t.fileNameSize,
    color: colors.textPrimary,
  },
  fileMeta: {
    marginTop: t.fileMetaGap,
    fontFamily: font.appBody,
    fontSize: t.fileMetaSize,
    color: colors.textBody,
  },
  fileAction: {
    marginLeft: t.fileActionGap,
    width: t.fileAction,
    height: t.fileAction,
    borderRadius: t.fileAction / 2,
    backgroundColor: colors.appBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlRow: {
    flexDirection: 'row',
  },
  tlRail: {
    alignItems: 'center',
  },
  tlMarker: {
    width: t.tlMarker,
    height: t.tlMarker,
    borderRadius: t.tlMarker / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.card,
  },
  tlLine: {
    flex: 1,
    width: t.tlLine,
    marginTop: 2,
  },
  tlBody: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.tlGap,
  },
  tlBodyGap: {
    marginBottom: t.tlItemGap,
  },
  tlTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tlTitle: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.tlTitleSize,
    color: colors.textPrimary,
  },
  tlTag: {
    marginLeft: 8,
    minHeight: t.tlTagHeight,
    borderRadius: t.tlTagRadius,
    paddingHorizontal: t.tlTagPadX,
    backgroundColor: t.tlTagBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlTagText: {
    fontFamily: font.appSemi,
    fontSize: t.tlTagSize,
    letterSpacing: t.tlTagSpacing,
    color: t.tlTagText,
  },
  tlText: {
    marginTop: t.tlBodyGap,
    fontFamily: font.appBody,
    fontSize: t.tlBodySize,
    lineHeight: t.tlBodyLineHeight,
    color: colors.textBody,
  },
  support: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.supportBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportLabel: {
    marginLeft: t.buttonIconGap,
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
  cancel: {
    marginTop: t.buttonStackGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.cancelBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLabel: {
    marginLeft: t.buttonIconGap,
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: t.cancelText,
  },
  pressed: {
    opacity: 0.85,
  },
  footNote: {
    marginTop: t.footNoteGap,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
  },
  footNoteText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.footNoteIconGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.footNoteSize,
    lineHeight: t.footNoteLineHeight,
    color: colors.textBody,
  },
});
