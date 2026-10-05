import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  Bell,
  BadgeCheck,
  Clock,
  CornerDownRight,
  FileText,
  Gavel,
  Lock,
  Plus,
  SquarePen,
  UserRound,
  Video,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_CONFIRMED } from '../../../../data/advocateSide';
import {
  advConfirmed as t,
  advRequest as h,
  colors,
  font,
  ink,
} from '../../../../constants/theme';

// Consultation confirmed (design/166).
//
// The "In 18 mins" chip counts down live. Everything else is static.
//
// design/166 clips the client's title under the ₹25,650 column and the second
// document name under its Review chip; both wrap here instead.
//
// Edit, Review and "+ Add AI Action Plan and brief in Notes" are inert — none has
// a designed destination, and the action plan it would insert is itself static
// mock content (see the AI scope note in data/advocateSide.ts).

export default function AdvocateConfirmedScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = ADV_CONFIRMED;
  const [seconds, setSeconds] = useState(c.countdownSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const tick = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(tick);
  }, [seconds]);

  const mins = Math.ceil(seconds / 60);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + h.headerTop }]}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Requests
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => router.push('/advocate/notifications')}
          style={styles.bellWrap}
        >
          <Bell size={h.bell} color={colors.textPrimary} />
          <View style={styles.bellDot} />
        </Pressable>
        <View style={styles.avatar}>
          <UserRound size={h.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <BadgeCheck size={t.bannerIconGlyph} color={colors.brandDark} />
          </View>
          <View style={styles.bannerText}>
            <Text style={styles.bannerTitle} {...shrinkToFit(0.7)}>
              {c.title}
            </Text>
            <Text style={styles.docket} {...shrinkToFit(0.7)}>
              {c.docket}
            </Text>
          </View>
          <View style={styles.tick}>
            <View style={styles.tickDot} />
            <Text style={styles.tickText} {...shrinkToFit(0.75)}>
              {seconds > 0 ? `In ${mins} min${mins === 1 ? '' : 's'}` : 'Starting now'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.clientRow}>
            {/* Placeholder for design/166's photograph, at the drawn size. */}
            <View style={styles.photo}>
              <Text style={styles.photoText}>{c.client.initials}</Text>
            </View>
            <View style={styles.clientText}>
              <Text style={styles.name} {...shrinkToFit(0.75)}>
                {c.client.name}
              </Text>
              <Text style={styles.role}>{c.client.title}</Text>
            </View>
            <View style={styles.amountCol}>
              <Text style={styles.amount} {...shrinkToFit(0.75)}>
                ₹{c.escrowAmount.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.amountLabel} {...shrinkToFit(0.75)}>
                {c.escrowLabel}
              </Text>
            </View>
          </View>

          <View style={styles.matter}>
            <View style={styles.matterHead}>
              <Text style={styles.matterLabel} {...shrinkToFit(0.8)}>
                {c.matterLabel}
              </Text>
              <Text style={styles.practice} {...shrinkToFit(0.75)}>
                • {c.practice}
              </Text>
            </View>
            <Text style={styles.matterTitle}>{c.matter}</Text>
            <View style={styles.chipRow}>
              {c.chips.map((label, i) => (
                <View key={label} style={styles.chip}>
                  {i === 0 ? (
                    <Lock size={t.chipIcon} color={colors.textBody} />
                  ) : (
                    <Clock size={t.chipIcon} color={colors.textBody} />
                  )}
                  <Text style={styles.chipText} {...shrinkToFit(0.75)}>
                    {label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.cellRow}>
            {[c.date, c.time].map((cell) => (
              <View key={cell.label} style={styles.cell}>
                <Text style={styles.cellLabel} {...shrinkToFit(0.75)}>
                  {cell.label}
                </Text>
                <Text style={styles.cellValue}>{cell.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.section} {...shrinkToFit(0.75)}>
              {c.summaryLabel}
            </Text>
            <Gavel size={t.sectionIcon} color={colors.textPrimary} />
          </View>
          <Text style={styles.summary}>{c.summary}</Text>
          <View style={styles.refs}>
            {c.references.map((r) => (
              <View key={r} style={styles.ref}>
                <Text style={styles.refText} {...shrinkToFit(0.75)}>
                  {r}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.section} {...shrinkToFit(0.75)}>
              DOCUMENTS ({c.documents.length})
            </Text>
            <Lock size={t.sectionIcon} color={colors.textPrimary} />
          </View>
          {c.documents.map((d) => (
            <View key={d.id} style={styles.doc}>
              <View style={styles.docIcon}>
                <FileText size={t.docIconGlyph} color={colors.brandDark} />
              </View>
              <View style={styles.docText}>
                <Text style={styles.docName} {...shrinkToFit(0.7)}>
                  {d.name}
                </Text>
                <Text style={styles.docMeta} {...shrinkToFit(0.75)}>
                  {d.meta}
                </Text>
              </View>
              {/* Inert — Review has no designed destination. */}
              <Pressable accessibilityRole="button" style={styles.review}>
                <Text style={styles.reviewText} {...shrinkToFit(0.8)}>
                  Review
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.section} {...shrinkToFit(0.7)}>
              {c.notes.label}
            </Text>
            <Pressable accessibilityRole="button" style={styles.edit}>
              <SquarePen size={t.editIcon} color={colors.textPrimary} />
              <Text style={styles.editText} {...shrinkToFit(0.8)}>
                {c.notes.edit}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.warn} {...shrinkToFit(0.7)}>
            {c.notes.warning}
          </Text>
          <View style={styles.priv}>
            <Lock size={t.privIcon} color={colors.textPrimary} />
            <Text style={styles.privText} {...shrinkToFit(0.75)}>
              {c.notes.privacy}
            </Text>
          </View>

          <View style={styles.notes}>
            {c.notes.entries.map((n, i) => (
              <View key={n} style={[styles.note, i > 0 && styles.noteNext]}>
                <CornerDownRight size={t.noteIcon} color={colors.brandDark} />
                <Text style={styles.noteText}>{n}</Text>
              </View>
            ))}
          </View>

          {/* Inert — see the note at the top of this file. */}
          <Pressable accessibilityRole="button" style={styles.add}>
            <Plus size={t.addPlus} color={colors.brandDark} />
            <Text style={styles.addText} {...shrinkToFit(0.75)}>
              {c.notes.add}
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/consultation/${id}/room` as Href)}
          style={({ pressed }) => [styles.enter, pressed && styles.pressed]}
        >
          <Video size={t.enterIcon} color={ink.onBrand} />
          <Text style={styles.enterText} {...shrinkToFit(0.75)}>
            {c.enter}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
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

  content: { paddingHorizontal: t.padX, paddingTop: t.bannerGap, paddingBottom: 32 },

  banner: {
    borderRadius: t.bannerRadius,
    backgroundColor: t.bannerBg,
    padding: t.bannerPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIcon: {
    width: t.bannerIcon,
    height: t.bannerIcon,
    borderRadius: t.bannerIcon / 2,
    backgroundColor: t.bannerIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: { flex: 1, minWidth: 0, marginLeft: t.bannerIconGap, marginRight: 6 },
  bannerTitle: { fontFamily: font.appHeading, fontSize: t.bannerTitleSize, color: colors.textPrimary },
  docket: { marginTop: t.docketGap, fontFamily: font.appBody, fontSize: t.docketSize, color: colors.textBody },
  tick: {
    minHeight: t.tickHeight,
    borderRadius: t.tickRadius,
    paddingHorizontal: t.tickPadX,
    backgroundColor: t.tickBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  tickDot: {
    width: t.tickDot,
    height: t.tickDot,
    borderRadius: t.tickDot / 2,
    marginRight: t.tickDotGap,
    backgroundColor: colors.brand,
  },
  tickText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.tickSize, color: colors.textPrimary },

  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },

  clientRow: { flexDirection: 'row', alignItems: 'flex-start' },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: '#F3DCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoText, color: colors.brandDark },
  clientText: { flex: 1, minWidth: 0, marginLeft: t.photoGap, marginRight: 10 },
  name: { fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  role: {
    marginTop: t.roleGap,
    fontFamily: font.appBody,
    fontSize: t.roleSize,
    lineHeight: t.roleLineHeight,
    color: colors.textBody,
  },
  amountCol: { alignItems: 'flex-end' },
  amount: { fontFamily: font.appHeading, fontSize: t.amountSize, color: colors.textPrimary },
  amountLabel: {
    marginTop: t.amountLabelGap,
    fontFamily: font.appBody,
    fontSize: t.amountLabelSize,
    color: colors.textBody,
  },

  matter: {
    marginTop: t.matterGap,
    borderRadius: t.matterRadius,
    backgroundColor: t.matterBg,
    padding: t.matterPad,
  },
  matterHead: { flexDirection: 'row', alignItems: 'center' },
  matterLabel: {
    fontFamily: font.appSemi,
    fontSize: t.matterLabelSize,
    letterSpacing: t.matterLabelSpacing,
    color: colors.brandDark,
  },
  practice: {
    marginLeft: t.practiceGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.practiceSize,
    color: colors.brandDark,
  },
  matterTitle: {
    marginTop: t.matterTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.matterTitleSize,
    lineHeight: t.matterTitleLineHeight,
    color: colors.textPrimary,
  },
  chipRow: { marginTop: t.chipGap, flexDirection: 'row', gap: t.chipGapX },
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
    fontFamily: font.appBody,
    fontSize: t.chipSize,
    color: colors.textPrimary,
  },

  cellRow: { marginTop: t.cellGap, flexDirection: 'row', gap: t.cellGapX },
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
    lineHeight: t.cellValueLineHeight,
    color: colors.textPrimary,
  },

  sectionRow: { flexDirection: 'row', alignItems: 'center' },
  section: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textPrimary,
  },
  summary: {
    marginTop: t.summaryGap,
    fontFamily: font.appBody,
    fontSize: t.summarySize,
    lineHeight: t.summaryLineHeight,
    color: colors.textPrimary,
  },
  refs: { marginTop: t.refGap, gap: t.refRowGap, alignItems: 'flex-start' },
  ref: {
    minHeight: t.refHeight,
    borderRadius: t.refRadius,
    paddingHorizontal: t.refPadX,
    backgroundColor: t.refBg,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  refText: { fontFamily: font.appBody, fontSize: t.refSize, color: colors.textPrimary },

  doc: {
    marginTop: t.docGap,
    borderRadius: t.docRadius,
    backgroundColor: t.docBg,
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
  docName: { fontFamily: font.appHeading, fontSize: t.docNameSize, color: colors.textPrimary },
  docMeta: { marginTop: t.docMetaGap, fontFamily: font.appBody, fontSize: t.docMetaSize, color: colors.textBody },
  review: {
    minHeight: t.reviewHeight,
    borderRadius: t.reviewRadius,
    paddingHorizontal: t.reviewPadX,
    backgroundColor: t.reviewBg,
    borderWidth: 1,
    borderColor: t.reviewBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewText: { fontFamily: font.appBody, fontSize: t.reviewSize, color: colors.brandDark },

  edit: { flexDirection: 'row', alignItems: 'center' },
  editText: { marginLeft: t.editIconGap, fontFamily: font.appSemi, fontSize: t.editSize, color: colors.textPrimary },
  warn: {
    marginTop: t.warnGap,
    fontFamily: font.appSemi,
    fontSize: t.warnSize,
    letterSpacing: t.warnSpacing,
    color: colors.textBody,
  },
  priv: { marginTop: t.privGap, flexDirection: 'row', alignItems: 'center' },
  privText: {
    marginLeft: t.privIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.privSize,
    color: colors.textPrimary,
  },

  notes: {
    marginTop: t.noteGap,
    borderRadius: t.noteRadius,
    backgroundColor: t.noteBg,
    padding: t.notePad,
  },
  note: { flexDirection: 'row' },
  noteNext: { marginTop: t.noteRowGap },
  noteText: {
    marginLeft: t.noteIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textPrimary,
  },
  add: {
    marginTop: t.addGap,
    minHeight: t.addHeight,
    borderRadius: t.addRadius,
    backgroundColor: t.addBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  addText: {
    marginLeft: t.addPlusGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.addSize,
    color: colors.brandDark,
  },

  enter: {
    marginTop: t.enterGap,
    minHeight: t.enterHeight,
    borderRadius: t.enterRadius,
    backgroundColor: t.enterBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  enterText: {
    marginLeft: t.enterIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.enterSize,
    color: ink.onBrand,
  },
  pressed: { opacity: 0.85 },
});
