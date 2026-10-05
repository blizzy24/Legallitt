import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  BadgeCheck,
  Bell,
  CircleStop,
  Info,
  Lock,
  PhoneOff,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_END } from '../../../../data/advocateSide';
import { advEnd as t, advRequest as h, colors, font, ink } from '../../../../constants/theme';

// End Consultation confirmation (design/179) — a card over the dimmed call screen.
//
// ⚠ The figures are static. "16m 48s of 45:00 scheduled" and the pro-rata
// disbursement imply a billed session clock and an escrow release rule the
// prototype has neither of.
//
// Confirming routes to the docket record; cancelling returns to the call.

export default function AdvocateEndScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const e = ADV_END;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + h.headerTop }]}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Requests
        </Text>
        <View style={styles.bellWrap}>
          <Bell size={h.bell} color={colors.textPrimary} />
          <View style={styles.bellDot} />
        </View>
        <View style={styles.avatar}>
          <UserRound size={h.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <View style={styles.scrim}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.cardHead}>
              <View style={styles.iconChip}>
                <PhoneOff size={t.iconChipIcon} color={t.iconChipColour} />
              </View>
              <View style={styles.session}>
                <Lock size={t.sessionIcon} color={colors.textBody} />
                <Text style={styles.sessionText} {...shrinkToFit(0.8)}>
                  {e.sessionChip}
                </Text>
              </View>
            </View>

            <Text style={styles.title} {...shrinkToFit(0.75)}>
              {e.title}
            </Text>
            {e.body.map((p, i) => (
              <Text key={p} style={[styles.body, i > 0 && styles.bodyPara]}>
                {p}
              </Text>
            ))}

            <View style={styles.summary}>
              <View style={styles.row}>
                <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                  {e.summary.clientLabel}
                </Text>
                <Text style={styles.rowValue} {...shrinkToFit(0.7)}>
                  {e.summary.client}
                </Text>
                <BadgeCheck size={t.rowTick} color={colors.brandDark} style={styles.rowTick} />
              </View>

              <Text style={[styles.rowLabel, styles.matterLabel]} {...shrinkToFit(0.8)}>
                {e.summary.matterLabel}
              </Text>
              <Text style={styles.matterValue}>{e.summary.matter}</Text>
              <Text style={styles.matterRef} {...shrinkToFit(0.75)}>
                {e.summary.matterRef}
              </Text>

              <View style={styles.cells}>
                {e.summary.cells.map((c) => (
                  <View key={c.label} style={styles.cell}>
                    <Text style={styles.cellLabel} {...shrinkToFit(0.75)}>
                      {c.label}
                    </Text>
                    <Text style={styles.cellValue} {...shrinkToFit(0.75)}>
                      {c.value}
                    </Text>
                    <Text style={styles.cellNote} {...shrinkToFit(0.7)}>
                      {c.note}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.foot}>
                <Info size={t.footIcon} color={colors.textBody} />
                <Text style={styles.footText}>{e.summary.footnote}</Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace(`/advocate/consultation/${id}/docket` as Href)}
              style={({ pressed }) => [styles.confirm, pressed && styles.pressed]}
            >
              <CircleStop size={t.confirmIcon} color={ink.onBrand} />
              <Text style={styles.confirmText} {...shrinkToFit(0.75)}>
                {e.confirm}
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
              style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
            >
              <ArrowLeft size={t.cancelIcon} color={colors.textPrimary} />
              <Text style={styles.cancelText} {...shrinkToFit(0.75)}>
                {e.cancel}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: h.headerPadBottom,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: h.titleSize,
    color: colors.textPrimary,
  },
  bellWrap: {},
  bellDot: {
    position: 'absolute',
    right: -2,
    top: -2,
    width: h.bellDot,
    height: h.bellDot,
    borderRadius: h.bellDot / 2,
    backgroundColor: '#D64545',
  },
  avatar: {
    marginLeft: h.avatarGap,
    width: h.avatar,
    height: h.avatar,
    borderRadius: h.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrim: { flex: 1, backgroundColor: t.scrim },
  content: { paddingHorizontal: t.padX, paddingTop: t.cardTop, paddingBottom: 28 },
  card: {
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  iconChip: {
    width: t.iconChip,
    height: t.iconChip,
    borderRadius: t.iconChipRadius,
    backgroundColor: t.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  session: {
    marginLeft: 'auto',
    minHeight: t.sessionHeight,
    borderRadius: t.sessionRadius,
    paddingHorizontal: t.sessionPadX,
    backgroundColor: t.sessionBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionText: {
    marginLeft: t.sessionIconGap,
    fontFamily: font.appBody,
    fontSize: t.sessionSize,
    color: colors.textPrimary,
  },

  title: { marginTop: t.titleGap, fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  body: {
    marginTop: t.bodyGap,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  bodyPara: { marginTop: t.bodyParaGap },

  summary: {
    marginTop: t.summaryGap,
    borderRadius: t.summaryRadius,
    backgroundColor: t.summaryBg,
    padding: t.summaryPad,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: colors.textBody },
  rowValue: {
    marginLeft: 'auto',
    flexShrink: 1,
    paddingLeft: 10,
    fontFamily: font.appHeading,
    fontSize: t.rowValueSize,
    color: colors.textPrimary,
  },
  rowTick: { marginLeft: t.rowTickGap },
  matterLabel: { marginTop: t.rowGap },
  matterValue: {
    marginTop: t.matterValueGap,
    fontFamily: font.appHeading,
    fontSize: t.matterValueSize,
    lineHeight: t.matterValueLineHeight,
    color: colors.textPrimary,
  },
  matterRef: {
    marginTop: t.matterRefGap,
    fontFamily: font.appSemi,
    fontSize: t.matterRefSize,
    color: colors.textPrimary,
  },

  cells: { marginTop: t.cellGap, flexDirection: 'row', gap: t.cellGapX },
  cell: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.cellRadius,
    backgroundColor: t.cellBg,
    padding: t.cellPad,
  },
  cellLabel: { fontFamily: font.appBody, fontSize: t.cellLabelSize, color: colors.textBody },
  cellValue: {
    marginTop: t.cellValueGap,
    fontFamily: font.appHeading,
    fontSize: t.cellValueSize,
    color: colors.textPrimary,
  },
  cellNote: { marginTop: t.cellNoteGap, fontFamily: font.appBody, fontSize: t.cellNoteSize, color: colors.textPrimary },

  foot: { marginTop: t.footGap, flexDirection: 'row' },
  footText: {
    marginLeft: t.footIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.footSize,
    lineHeight: t.footLineHeight,
    color: colors.textBody,
  },

  confirm: {
    marginTop: t.confirmGap,
    minHeight: t.confirmHeight,
    borderRadius: t.confirmRadius,
    backgroundColor: t.confirmBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  confirmText: {
    marginLeft: t.confirmIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.confirmSize,
    color: ink.onBrand,
  },
  cancel: {
    marginTop: t.cancelGap,
    minHeight: t.cancelHeight,
    borderRadius: t.cancelRadius,
    backgroundColor: t.cancelBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cancelText: {
    marginLeft: t.cancelIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.cancelSize,
    color: colors.textPrimary,
  },
  pressed: { opacity: 0.85 },
});
