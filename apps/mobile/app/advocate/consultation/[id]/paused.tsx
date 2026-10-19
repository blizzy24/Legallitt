import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  CalendarDays,
  ChevronLeft,
  Clock,
  Pause,
  Phone,
  Play,
  Users,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_PAUSED } from '../../../../data/advocateSide';
import { advPaused as t, colors, font, ink } from '../../../../constants/theme';

// Consultation paused (design/175).
//
// ⚠ This screen states a billing rule the prototype cannot enforce: the
// consultation clock is held at 18:42 while a separate phone-call clock runs at
// 03:17, marked "Excluded from consultation". Both figures are static. A real one
// needs a server-side session clock that can be paused, a record of what caused
// each pause and a disbursement rule that reads it — plus the waiting room, which
// is a calling-vendor capability.
//
// Reached from the video screen behind DEV_PREVIEW_TOGGLES, since nothing in the
// prototype can pause a consultation.

const CELL_ICONS = { clock: Clock, phone: Phone };

export default function AdvocatePausedScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = ADV_PAUSED;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + t.backTop }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
          style={styles.backBtn}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Pause size={t.chipIcon} color={t.chipColour} />
            <Text style={styles.chipText} {...shrinkToFit(0.75)}>
              {p.chip}
            </Text>
          </View>
          <Text style={styles.session} {...shrinkToFit(0.7)}>
            {p.sessionId}
          </Text>
        </View>

        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {p.title}
        </Text>
        <Text style={styles.body}>{p.body}</Text>

        <View style={styles.card}>
          <View style={styles.clientRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{p.client.initials}</Text>
            </View>
            <View style={styles.clientText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} {...shrinkToFit(0.7)}>
                  {p.client.name}
                </Text>
                <View style={styles.roleChip}>
                  <Text style={styles.roleChipText} {...shrinkToFit(0.8)}>
                    {p.client.roleChip}
                  </Text>
                </View>
                {/* design/175 keeps this chip on the name row, with the service
                    line running the full width beneath both. */}
                <View style={styles.statusChip}>
                  <Text style={styles.statusChipText} {...shrinkToFit(0.8)}>
                    {p.client.statusChip}
                  </Text>
                </View>
              </View>
              <Text style={styles.service} {...shrinkToFit(0.7)}>
                {p.client.service}
              </Text>
            </View>
          </View>

          <View style={styles.rule} />

          <Text style={styles.mref} {...shrinkToFit(0.8)}>
            {p.matterLabel}
          </Text>
          <Text style={styles.mval}>{p.matter}</Text>

          <View style={styles.rule} />

          <View style={styles.cells}>
            {p.cells.map((c) => {
              const Icon = CELL_ICONS[c.icon];
              return (
                <View key={c.label} style={styles.cell}>
                  <View style={styles.cellHead}>
                    <Icon size={t.cellIcon} color={colors.brandDark} />
                    <Text style={styles.cellLabel} {...shrinkToFit(0.7)}>
                      {c.label}
                    </Text>
                  </View>
                  <View style={styles.cellValueRow}>
                    <Text style={styles.cellValue} {...shrinkToFit(0.75)}>
                      {c.value}
                    </Text>
                    <Text style={styles.cellState} {...shrinkToFit(0.75)}>
                      {c.state}
                    </Text>
                  </View>
                  <Text style={[styles.cellNote, c.excluded && styles.cellNoteExcluded]}>
                    {c.note}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.wait}>
          <View style={styles.waitHead}>
            <Users size={t.waitIcon} color={colors.brandDark} />
            <Text style={styles.waitTitle} {...shrinkToFit(0.7)}>
              {p.waiting.title}
            </Text>
          </View>
          <Text style={styles.waitBody}>{p.waiting.body}</Text>
        </View>

        <Text style={styles.prompt} {...shrinkToFit(0.8)}>
          {p.prompt}
        </Text>

        {p.options.map((o) => (
          <View key={o.id} style={styles.opt}>
            <View style={styles.optHead}>
              <View
                style={[
                  styles.optDot,
                  { backgroundColor: o.tone === 'brand' ? t.optResumeDot : t.optReschedDot },
                ]}
              />
              <Text style={styles.optTitle} {...shrinkToFit(0.75)}>
                {o.title}
              </Text>
              <Text style={styles.optMeta} {...shrinkToFit(0.75)}>
                {o.meta}
              </Text>
            </View>
            <Text style={styles.optBody}>{o.body}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                o.id === 'resume'
                  ? router.replace(`/advocate/consultation/${id}/video` as Href)
                  : router.push(`/advocate/consultation/${id}/reschedule` as Href)
              }
              style={({ pressed }) => [
                styles.optBtn,
                o.tone === 'brand' ? styles.optBtnBrand : styles.optBtnLight,
                pressed && styles.pressed,
              ]}
            >
              {o.tone === 'brand' ? (
                <Play size={t.optBtnIcon} color={ink.onBrand} />
              ) : (
                <CalendarDays size={t.optBtnIcon} color={colors.brandDark} />
              )}
              <Text
                style={[styles.optBtnText, o.tone === 'brand' && styles.optBtnTextBrand]}
                {...shrinkToFit(0.75)}
              >
                {o.action}
              </Text>
            </Pressable>
          </View>
        ))}

        <Text style={styles.foot} {...shrinkToFit(0.75)}>
          {p.footnote}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingHorizontal: t.padX, paddingBottom: 36 },

  backBtn: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: t.backBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipRow: { marginTop: t.backGap, flexDirection: 'row', alignItems: 'center' },
  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  chipText: {
    marginLeft: t.chipIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.chipSize,
    color: t.chipColour,
  },
  session: {
    marginLeft: t.sessionGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.sessionSize,
    color: colors.textBody,
  },

  title: { marginTop: t.titleGap, fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  body: {
    marginTop: t.bodyGap,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.cardBorder,
    borderTopWidth: t.cardTopBorder,
    padding: t.cardPad,
  },
  clientRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: '#F3E6D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: font.appSemi, fontSize: t.avatarText, color: colors.brandDark },
  clientText: { flex: 1, minWidth: 0, marginLeft: t.avatarGap },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  roleChip: {
    marginLeft: t.roleChipGap,
    minHeight: t.roleChipHeight,
    borderRadius: t.roleChipRadius,
    paddingHorizontal: t.roleChipPadX,
    backgroundColor: t.roleChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipText: { fontFamily: font.appBody, fontSize: t.roleChipSize, color: colors.textPrimary },
  service: { marginTop: t.serviceGap, fontFamily: font.appBody, fontSize: t.serviceSize, color: colors.textBody },
  statusChip: {
    marginLeft: 'auto',
    minHeight: t.statusChipHeight,
    borderRadius: t.statusChipRadius,
    paddingHorizontal: t.statusChipPadX,
    backgroundColor: t.statusChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusChipText: { fontFamily: font.appSemi, fontSize: t.statusChipSize, color: t.statusChipColour },

  rule: { marginVertical: t.ruleGap, height: 1, backgroundColor: t.rule },
  mref: {
    fontFamily: font.appSemi,
    fontSize: t.mrefSize,
    letterSpacing: t.mrefSpacing,
    color: colors.textBody,
  },
  mval: {
    marginTop: t.mvalGap,
    fontFamily: font.appHeading,
    fontSize: t.mvalSize,
    lineHeight: t.mvalLineHeight,
    color: colors.textPrimary,
  },

  cells: { flexDirection: 'row', gap: t.cellGapX },
  cell: {
    flex: 1,
    minWidth: 0,
    borderRadius: t.cellRadius,
    borderWidth: 1,
    borderColor: t.cellBorder,
    backgroundColor: t.cellBg,
    padding: t.cellPad,
  },
  cellHead: { flexDirection: 'row', alignItems: 'center' },
  cellLabel: {
    marginLeft: t.cellIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.cellLabelSize,
    color: colors.textPrimary,
  },
  cellValueRow: { marginTop: t.cellValueGap, flexDirection: 'row', alignItems: 'baseline' },
  cellValue: { fontFamily: font.appHeading, fontSize: t.cellValueSize, color: colors.textPrimary },
  cellState: {
    marginLeft: t.cellStateGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.cellStateSize,
    letterSpacing: t.cellStateSpacing,
    color: colors.textBody,
  },
  cellNote: {
    marginTop: t.cellNoteGap,
    fontFamily: font.appBody,
    fontSize: t.cellNoteSize,
    lineHeight: t.cellNoteLineHeight,
    color: colors.textBody,
  },
  cellNoteExcluded: { color: t.cellExcluded },

  wait: {
    marginTop: t.cardGap,
    borderRadius: t.waitRadius,
    backgroundColor: t.waitBg,
    padding: t.waitPad,
  },
  waitHead: { flexDirection: 'row', alignItems: 'center' },
  waitTitle: {
    marginLeft: t.waitIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.waitTitleSize,
    color: colors.textPrimary,
  },
  waitBody: {
    marginTop: t.waitBodyGap,
    fontFamily: font.appBody,
    fontSize: t.waitBodySize,
    lineHeight: t.waitBodyLineHeight,
    color: colors.textBody,
  },

  prompt: {
    marginTop: t.promptGap,
    fontFamily: font.appSemi,
    fontSize: t.promptSize,
    letterSpacing: t.promptSpacing,
    color: colors.textPrimary,
  },

  opt: {
    marginTop: t.optGap,
    borderRadius: t.optRadius,
    backgroundColor: colors.card,
    padding: t.optPad,
  },
  optHead: { flexDirection: 'row', alignItems: 'center' },
  optDot: { width: t.optDot, height: t.optDot, borderRadius: t.optDot / 2, marginRight: t.optDotGap },
  optTitle: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appHeading,
    fontSize: t.optTitleSize,
    color: colors.textPrimary,
  },
  optMeta: { fontFamily: font.mono, fontSize: t.optMetaSize, color: colors.brandDark },
  optBody: {
    marginTop: t.optBodyGap,
    fontFamily: font.appBody,
    fontSize: t.optBodySize,
    lineHeight: t.optBodyLineHeight,
    color: colors.textBody,
  },
  optBtn: {
    marginTop: t.optBtnGap,
    minHeight: t.optBtnHeight,
    borderRadius: t.optBtnRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  optBtnBrand: { backgroundColor: colors.brand },
  optBtnLight: {
    backgroundColor: t.optBtnLightBg,
    borderWidth: 1,
    borderColor: t.optBtnLightBorder,
  },
  optBtnText: {
    marginLeft: t.optBtnIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.optBtnSize,
    color: colors.textPrimary,
  },
  optBtnTextBrand: { color: ink.onBrand },
  pressed: { opacity: 0.85 },

  foot: {
    marginTop: t.footGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.footSize,
    color: colors.textBody,
  },
});
