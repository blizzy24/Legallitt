import { previewNotice } from '../../../../components/PreviewNotice';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  CircleCheck,
  FolderArchive,
  Scale,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import {
  ADV_CASE_STATS,
  ADV_CLIENT_CASES,
  ADV_CLIENT_PROFILE,
} from '../../../../data/advocateSide';
import { advClientSub as t, colors, font, ink } from '../../../../constants/theme';

// Client cases (design/153).
//
// design/153 is a 284x1024 device mock-up, roughly 0.73 px/pt, so this screen's
// geometry is derived from proportion rather than measured to the usual ±1pt. The
// structure and copy are read directly; the spacing is inferred.
//
// Two card shapes, as drawn: active cases carry a Next Hearing bar and a "View Case"
// button; the completed one carries a settlement line and "View Archived Docket".

const FILTERS = ['All (3)', 'Active (2)', 'Closed (1)'];

export default function AdvocateClientCasesScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [filter, setFilter] = useState(0);
  const c = ADV_CLIENT_PROFILE;

  const cases = useMemo(() => {
    if (filter === 1) return ADV_CLIENT_CASES.filter((x) => x.status === 'active');
    if (filter === 2) return ADV_CLIENT_CASES.filter((x) => x.status === 'completed');
    return ADV_CLIENT_CASES;
  }, [filter]);

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
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            Client Cases
          </Text>
          <Text style={styles.headerSub} {...shrinkToFit(0.75)}>
            {c.name} • {c.clientId}
          </Text>
        </View>
        <Pressable onPress={() => previewNotice("Filter")} accessibilityRole="button" accessibilityLabel="Filter" style={styles.iconBtn}>
          <SlidersHorizontal size={t.iconBtnGlyph} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.strip}>
          <View style={styles.stripAvatar}>
            <Text style={styles.stripAvatarText}>{c.initials}</Text>
          </View>
          <View style={styles.stripText}>
            <View style={styles.stripNameRow}>
              <Text style={styles.stripName} {...shrinkToFit(0.75)}>
                {c.name}
              </Text>
              <BadgeCheck size={t.stripTick} color={colors.brandDark} style={styles.stripTick} />
            </View>
            <Text style={styles.stripType} {...shrinkToFit(0.7)}>
              {c.type}
            </Text>
          </View>
          <View style={styles.ref}>
            <Text style={styles.refLabel} {...shrinkToFit(0.8)}>
              CLIENT REF
            </Text>
            <Text style={styles.refValue} {...shrinkToFit(0.75)}>
              {c.clientId}
            </Text>
          </View>
        </View>

        <View style={styles.cells}>
          {ADV_CASE_STATS.map((s) => (
            <View key={s.label} style={styles.cell}>
              <View style={styles.cellHead}>
                {s.tone === 'green' ? (
                  <View style={styles.cellDotGreen} />
                ) : (
                  <View style={styles.cellDotMuted} />
                )}
                <Text style={styles.cellLabel} {...shrinkToFit(0.75)}>
                  {s.label}
                </Text>
              </View>
              <Text style={styles.cellValue} {...shrinkToFit(0.7)}>
                {s.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.chips}>
          {FILTERS.map((f, i) => {
            const on = i === filter;
            return (
              <Pressable
                key={f}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => setFilter(i)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]} {...shrinkToFit(0.8)}>
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {cases.map((k) => (
          <View key={k.id} style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.courtChip}>
                <Text style={styles.courtChipText} {...shrinkToFit(0.7)}>
                  {k.court}
                </Text>
              </View>
              <View style={styles.status}>
                {k.status === 'active' ? (
                  <View style={styles.statusDot} />
                ) : (
                  <CircleCheck size={12} color={colors.textBody} />
                )}
                <Text
                  style={[styles.statusText, k.status === 'active' && styles.statusTextActive]}
                  {...shrinkToFit(0.8)}
                >
                  {k.statusLabel}
                </Text>
              </View>
            </View>

            <Text style={styles.cardTitle} {...shrinkToFit(0.75)}>
              {k.title}
            </Text>
            <Text style={styles.cardType} {...shrinkToFit(0.75)}>
              {k.type}
            </Text>
            <Text style={styles.cardCourt} {...shrinkToFit(0.75)}>
              {k.courtLine}
            </Text>

            <View style={styles.detail}>
              <View style={styles.detailCol}>
                <Text style={styles.detailLabel} {...shrinkToFit(0.75)}>
                  {k.leftLabel}
                </Text>
                <Text style={styles.detailValue} {...shrinkToFit(0.7)}>
                  {k.leftValue}
                </Text>
              </View>
              <View style={[styles.detailCol, styles.detailColRight]}>
                <Text style={styles.detailLabel} {...shrinkToFit(0.75)}>
                  {k.rightLabel}
                </Text>
                <Text style={styles.detailValue} {...shrinkToFit(0.7)}>
                  {k.rightValue}
                </Text>
              </View>
            </View>

            {k.hearing ? (
              <View style={styles.hearing}>
                <View style={styles.hearingIcon}>
                  <CalendarDays size={t.hearingIconGlyph} color={colors.brandDark} />
                </View>
                <View style={styles.hearingText}>
                  <Text style={styles.hearingLabel} {...shrinkToFit(0.8)}>
                    Next Hearing
                  </Text>
                  <Text style={styles.hearingDate} {...shrinkToFit(0.7)}>
                    {k.hearing.date}
                  </Text>
                </View>
                {k.hearing.cause ? (
                  <View style={styles.cause}>
                    <Text style={styles.causeText} {...shrinkToFit(0.75)}>
                      {k.hearing.cause}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.settle}>
                <CircleCheck size={t.settleIcon} color={colors.textBody} />
                <Text style={styles.settleText}>{k.settlement}</Text>
              </View>
            )}

            <Pressable onPress={() => previewNotice(k.action)}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.action,
                k.status === 'active' ? styles.actionPrimary : styles.actionSecondary,
                pressed && styles.pressed,
              ]}
            >
              {k.status === 'completed' && (
                <FolderArchive size={t.actionIcon} color={colors.brandDark} style={styles.actionIcon} />
              )}
              <Text
                style={[
                  styles.actionText,
                  k.status === 'active' && styles.actionTextPrimary,
                ]}
                {...shrinkToFit(0.8)}
              >
                {k.action}
              </Text>
              {k.status === 'active' && (
                <ArrowRight size={t.actionIcon} color={ink.onBrand} style={styles.actionIconRight} />
              )}
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.titleGap, marginRight: 10 },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  headerSub: {
    marginTop: t.subGap,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    color: colors.textBody,
  },
  iconBtn: { width: t.iconBtn, height: t.iconBtn, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    marginLeft: t.iconBtnGap,
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX },
  strip: {
    marginTop: t.stripGap,
    borderRadius: t.stripRadius,
    backgroundColor: colors.card,
    padding: t.stripPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stripAvatar: {
    width: t.stripAvatar,
    height: t.stripAvatar,
    borderRadius: t.stripAvatar / 2,
    backgroundColor: '#F3DCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripAvatarText: { fontFamily: font.appSemi, fontSize: t.stripAvatarText, color: colors.brandDark },
  stripText: { flex: 1, minWidth: 0, marginLeft: t.stripAvatarGap, marginRight: 8 },
  stripNameRow: { flexDirection: 'row', alignItems: 'center' },
  stripName: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.stripNameSize, color: colors.textPrimary },
  stripTick: { marginLeft: t.stripTickGap },
  stripType: {
    marginTop: t.stripTypeGap,
    fontFamily: font.appBody,
    fontSize: t.stripTypeSize,
    color: colors.textBody,
  },
  ref: { alignItems: 'flex-end' },
  refLabel: {
    fontFamily: font.appSemi,
    fontSize: t.refLabelSize,
    letterSpacing: t.refLabelSpacing,
    color: colors.textBody,
  },
  refValue: {
    marginTop: t.refValueGap,
    fontFamily: font.appHeading,
    fontSize: t.refValueSize,
    color: colors.textPrimary,
  },

  cells: { marginTop: t.cellsGap, flexDirection: 'row', gap: t.cellGapX },
  cell: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.cellRadius,
    backgroundColor: colors.card,
    padding: t.cellPad,
  },
  cellHead: { flexDirection: 'row', alignItems: 'center' },
  cellDotGreen: {
    width: t.cellDot,
    height: t.cellDot,
    borderRadius: t.cellDot / 2,
    marginRight: t.cellDotGap,
    backgroundColor: '#1E9E4A',
  },
  cellDotMuted: {
    width: t.cellDot,
    height: t.cellDot,
    borderRadius: t.cellDot / 2,
    marginRight: t.cellDotGap,
    backgroundColor: colors.textMuted,
  },
  cellLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.cellLabelSize, color: colors.textBody },
  cellValue: {
    marginTop: t.cellValueGap,
    fontFamily: font.appHeading,
    fontSize: t.cellValueSize,
    color: colors.textPrimary,
  },

  chips: { marginTop: t.chipsGap, flexDirection: 'row', gap: t.chipGapX },
  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.chipBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: t.chipOnBg, borderColor: t.chipOnBg },
  chipText: { fontFamily: font.appBody, fontSize: t.chipSize, color: colors.textPrimary },
  chipTextOn: { fontFamily: font.appSemi, color: ink.onBrand },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  courtChip: {
    minHeight: t.courtChipHeight,
    borderRadius: t.courtChipRadius,
    paddingHorizontal: t.courtChipPadX,
    backgroundColor: t.courtChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  courtChipText: {
    fontFamily: font.appSemi,
    fontSize: t.courtChipSize,
    letterSpacing: t.courtChipSpacing,
    color: colors.textBody,
  },
  status: { marginLeft: 'auto', paddingLeft: 8, flexDirection: 'row', alignItems: 'center' },
  statusDot: {
    width: t.statusDot,
    height: t.statusDot,
    borderRadius: t.statusDot / 2,
    marginRight: t.statusDotGap,
    backgroundColor: t.statusActiveColour,
  },
  statusText: { marginLeft: 5, fontFamily: font.appBody, fontSize: t.statusSize, color: colors.textBody },
  statusTextActive: { marginLeft: 0, color: t.statusActiveColour },

  cardTitle: {
    marginTop: t.titleRowGap,
    fontFamily: font.appHeading,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  cardType: {
    marginTop: t.cardTypeGap,
    fontFamily: font.appBody,
    fontSize: t.cardTypeSize,
    color: colors.textBody,
  },
  cardCourt: {
    marginTop: t.cardCourtGap,
    fontFamily: font.appBody,
    fontSize: t.cardCourtSize,
    color: colors.textMuted,
  },

  detail: {
    marginTop: t.detailGap,
    borderRadius: t.detailRadius,
    backgroundColor: t.detailBg,
    padding: t.detailPad,
    flexDirection: 'row',
  },
  detailCol: { flex: 1, minWidth: 0 },
  detailColRight: { alignItems: 'flex-end' },
  detailLabel: {
    fontFamily: font.appSemi,
    fontSize: t.detailLabelSize,
    letterSpacing: t.detailLabelSpacing,
    color: colors.textBody,
  },
  detailValue: {
    marginTop: t.detailValueGap,
    fontFamily: font.appHeading,
    fontSize: t.detailValueSize,
    color: colors.textPrimary,
  },

  hearing: {
    marginTop: t.hearingGap,
    borderRadius: t.hearingRadius,
    backgroundColor: t.hearingBg,
    padding: t.hearingPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hearingIcon: {
    width: t.hearingIcon,
    height: t.hearingIcon,
    borderRadius: t.hearingIconRadius,
    backgroundColor: t.hearingIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hearingText: { flex: 1, minWidth: 0, marginLeft: t.hearingIconGap, marginRight: 8 },
  hearingLabel: { fontFamily: font.appBody, fontSize: t.hearingLabelSize, color: colors.textBody },
  hearingDate: {
    marginTop: t.hearingDateGap,
    fontFamily: font.appHeading,
    fontSize: t.hearingDateSize,
    color: colors.textPrimary,
  },
  cause: {
    minHeight: t.causeHeight,
    borderRadius: t.causeRadius,
    paddingHorizontal: t.causePadX,
    backgroundColor: t.causeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  causeText: { fontFamily: font.appBody, fontSize: t.causeSize, color: colors.textBody },

  settle: {
    marginTop: t.settleGap,
    borderRadius: t.settleRadius,
    backgroundColor: t.settleBg,
    padding: t.settlePad,
    flexDirection: 'row',
  },
  settleText: {
    marginLeft: t.settleIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.settleSize,
    lineHeight: t.settleLineHeight,
    color: colors.textBody,
  },

  action: {
    marginTop: t.actionGap,
    minHeight: t.actionHeight,
    borderRadius: t.actionRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimary: { backgroundColor: t.actionPrimaryBg },
  actionSecondary: { backgroundColor: t.actionSecondaryBg },
  pressed: { opacity: 0.85 },
  actionText: { fontFamily: font.appSemi, fontSize: t.actionSize, color: colors.brandDark },
  actionTextPrimary: { color: ink.onBrand },
  actionIcon: { marginRight: t.actionIconGap },
  actionIconRight: { marginLeft: t.actionIconGap },
});
