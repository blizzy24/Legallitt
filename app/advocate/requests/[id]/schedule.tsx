import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  Clock,
  Gavel,
  Info,
  Landmark,
  Paperclip,
  ShieldCheck,
  UserRound,
  Video,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_SCHEDULE, advNetAt10 } from '../../../../data/advocateSide';
import {
  advRequest as h,
  advSchedule as t,
  colors,
  font,
  ink,
} from '../../../../constants/theme';

// Accept & schedule (design/164).
//
// The platform charge is computed from ADV_COMMISSION_10 via advNetAt10(), so the
// 10% lives in the data file next to design/157's conflicting 6%.
//
// ⚠ "Amount on Hold" and "Advance Payment" are drawn in the same unsigned column as
// the fee and the charge, but 8,000 + 17,650 = 25,650 = the net AFTER the charge.
// They split the payout rather than reducing it. Drawn as designed; see the note in
// data/advocateSide.ts.
//
// The "view more" and "Preview" links are inert — neither has a designed destination.

const ROW_ICONS = { calendar: CalendarDays, clock: Clock, shield: ShieldCheck };

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}.00`;
}

export default function AdvocateScheduleScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const fee = advNetAt10(ADV_SCHEDULE.grossFee);

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

      <Pressable
        accessibilityRole="button"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        style={styles.back}
        hitSlop={8}
      >
        <ChevronLeft size={t.backChevron} color={colors.textPrimary} />
        <Text style={styles.backTitle}>Schedule</Text>
      </Pressable>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.section} {...shrinkToFit(0.75)}>
              CONSULTATION SUMMARY
            </Text>
            <View style={styles.mode}>
              <Video size={t.modeIcon} color={colors.textPrimary} />
              <Text style={styles.modeText} {...shrinkToFit(0.8)}>
                {ADV_SCHEDULE.mode}
              </Text>
            </View>
          </View>

          <View style={styles.clientRow}>
            {/* Placeholder for design/164's photograph, at the drawn size. */}
            <View style={styles.photo}>
              <Text style={styles.photoText}>{ADV_SCHEDULE.client.initials}</Text>
            </View>
            <View style={styles.clientText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} {...shrinkToFit(0.75)}>
                  {ADV_SCHEDULE.client.name}
                </Text>
                <View style={styles.verified}>
                  <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                    {ADV_SCHEDULE.client.verified}
                  </Text>
                </View>
              </View>
              <Text style={styles.clientTitle} {...shrinkToFit(0.75)}>
                {ADV_SCHEDULE.client.title}
              </Text>
              <Text style={styles.loc} {...shrinkToFit(0.75)}>
                {ADV_SCHEDULE.client.location}
              </Text>
            </View>
          </View>

          <View style={styles.matter}>
            <View style={styles.practice}>
              <Text style={styles.practiceText} {...shrinkToFit(0.75)}>
                {ADV_SCHEDULE.practice}
              </Text>
            </View>
            <Text style={styles.matterTitle}>{ADV_SCHEDULE.matter}</Text>

            {ADV_SCHEDULE.rows.map((r) => {
              const Icon = ROW_ICONS[r.icon];
              return (
                <View key={r.label}>
                  <View style={styles.rule} />
                  <View style={styles.row}>
                    <View style={styles.rowIcon}>
                      <Icon size={t.rowIconGlyph} color={colors.brandDark} />
                    </View>
                    <View style={styles.rowText}>
                      <Text style={styles.rowLabel} {...shrinkToFit(0.75)}>
                        {r.label}
                      </Text>
                      <Text style={r.link ? styles.rowBody : styles.rowValue}>
                        {r.value}
                        {r.link ? '  ' : ''}
                        {r.link ? <Text style={styles.rowLink}>{r.link}</Text> : null}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionRow}>
            <Text style={styles.section} {...shrinkToFit(0.75)}>
              FEE &amp; PAYOUT BREAKDOWN
            </Text>
            <View style={styles.escrow}>
              <ShieldCheck size={t.escrowIcon} color={colors.textPrimary} />
              <Text style={styles.escrowText} {...shrinkToFit(0.8)}>
                {ADV_SCHEDULE.escrowChip}
              </Text>
            </View>
          </View>

          <View style={styles.feeRow}>
            <View style={styles.feeText}>
              <Text style={styles.feeLabel} {...shrinkToFit(0.75)}>
                Professional Advisory Fee
              </Text>
              <Text style={styles.feeSub} {...shrinkToFit(0.75)}>
                {ADV_SCHEDULE.grossSub}
              </Text>
            </View>
            <Text style={styles.feeAmount} {...shrinkToFit(0.7)}>
              {money(fee.grossFee)}
            </Text>
          </View>

          <View style={styles.line}>
            <Text style={styles.lineLabel} {...shrinkToFit(0.7)}>
              Platform Service Charge (10%)
            </Text>
            <Info size={t.infoIcon} color={colors.textBody} style={styles.lineInfo} />
            <Text style={styles.lineAmount} {...shrinkToFit(0.75)}>
              -{money(fee.platformFee)}
            </Text>
          </View>

          {/* Drawn unsigned, in the same column as the deduction. See the file note. */}
          <View style={styles.line}>
            <Text style={styles.lineLabel} {...shrinkToFit(0.75)}>
              Amount on Hold
            </Text>
            <Text style={styles.lineAmount} {...shrinkToFit(0.75)}>
              {money(ADV_SCHEDULE.hold)}
            </Text>
          </View>
          <View style={styles.line}>
            <Text style={styles.lineLabel} {...shrinkToFit(0.75)}>
              Advance Payment
            </Text>
            <Text style={styles.lineAmount} {...shrinkToFit(0.75)}>
              {money(ADV_SCHEDULE.advance)}
            </Text>
          </View>

          <View style={styles.netRule} />

          <View style={styles.net}>
            <View style={styles.netLeft}>
              <Text style={styles.netLabel}>{ADV_SCHEDULE.netLabel}</Text>
              <Text style={styles.netSub}>{ADV_SCHEDULE.netSub}</Text>
            </View>
            <View style={styles.netRight}>
              <View style={styles.netAmountRow}>
                <Landmark size={t.netIcon} color={colors.textPrimary} />
                <Text style={styles.netAmount} {...shrinkToFit(0.65)}>
                  {money(fee.net)}
                </Text>
              </View>
              <Text style={styles.netNote}>{ADV_SCHEDULE.netNote}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.briefCard]}>
          <View style={styles.briefIcon}>
            <Paperclip size={t.briefIconGlyph} color={colors.textBody} />
          </View>
          <View style={styles.briefText}>
            <View style={styles.briefTitleRow}>
              <Text style={styles.briefTitle} {...shrinkToFit(0.7)}>
                {ADV_SCHEDULE.briefs.title}
              </Text>
              <Pressable accessibilityRole="button">
                <Text style={styles.briefLink} {...shrinkToFit(0.8)}>
                  {ADV_SCHEDULE.briefs.link}
                </Text>
              </Pressable>
            </View>
            <Text style={styles.briefSub}>{ADV_SCHEDULE.briefs.sub}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/requests/${id}/confirmed` as Href)}
          style={({ pressed }) => [styles.accept, pressed && styles.pressed]}
        >
          <Gavel size={t.acceptIcon} color={ink.onBrand} />
          <Text style={styles.acceptText} {...shrinkToFit(0.75)}>
            {ADV_SCHEDULE.accept}
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/requests/${id}/propose` as Href)}
          style={({ pressed }) => [styles.propose, pressed && styles.pressed]}
        >
          <Text style={styles.proposeText} {...shrinkToFit(0.75)}>
            {ADV_SCHEDULE.propose}
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
    paddingBottom: t.headerPadBottom,
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

  back: {
    paddingHorizontal: t.backPadX,
    paddingTop: t.backGap,
    paddingBottom: t.backPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backTitle: {
    marginLeft: t.backTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.backTitleSize,
    color: colors.textPrimary,
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 28 },
  card: {
    marginBottom: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },

  sectionRow: { flexDirection: 'row', alignItems: 'center' },
  section: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.brandDark,
  },
  mode: {
    minHeight: t.modeHeight,
    borderRadius: t.modeRadius,
    paddingHorizontal: t.modePadX,
    backgroundColor: t.modeBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  modeText: {
    marginLeft: t.modeIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.modeSize,
    color: colors.textPrimary,
  },

  clientRow: { marginTop: t.clientGap, flexDirection: 'row' },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: '#F3DCC0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoText, color: colors.brandDark },
  clientText: { flex: 1, minWidth: 0, marginLeft: t.photoGap },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  verified: {
    marginLeft: t.verifiedGap,
    minHeight: t.verifiedHeight,
    borderRadius: t.verifiedRadius,
    paddingHorizontal: t.verifiedPadX,
    backgroundColor: t.verifiedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: { fontFamily: font.appBody, fontSize: t.verifiedSize, color: colors.textPrimary },
  clientTitle: {
    marginTop: t.titleGap,
    fontFamily: font.appBody,
    fontSize: t.titleSize,
    color: colors.brandDark,
  },
  loc: { marginTop: t.locGap, fontFamily: font.appBody, fontSize: t.locSize, color: colors.textBody },

  matter: {
    marginTop: t.matterGap,
    borderRadius: t.matterRadius,
    backgroundColor: t.matterBg,
    padding: t.matterPad,
  },
  practice: {
    alignSelf: 'flex-start',
    minHeight: t.practiceHeight,
    borderRadius: t.practiceRadius,
    paddingHorizontal: t.practicePadX,
    backgroundColor: t.practiceBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceText: { fontFamily: font.appBody, fontSize: t.practiceSize, color: t.practiceColour },
  matterTitle: {
    marginTop: t.matterTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.matterTitleSize,
    lineHeight: t.matterTitleLineHeight,
    color: colors.textPrimary,
  },
  rule: { marginVertical: t.rowRuleGap, height: 1, backgroundColor: t.rowRule },
  row: { flexDirection: 'row' },
  rowIcon: {
    width: t.rowIcon,
    height: t.rowIcon,
    borderRadius: t.rowIconRadius,
    backgroundColor: t.rowIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, minWidth: 0, marginLeft: t.rowIconGap },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: colors.brandDark },
  rowValue: {
    marginTop: t.rowValueGap,
    fontFamily: font.appHeading,
    fontSize: t.rowValueSize,
    lineHeight: t.rowValueLineHeight,
    color: colors.textPrimary,
  },
  rowBody: {
    marginTop: t.rowValueGap,
    fontFamily: font.appBody,
    fontSize: t.rowBodySize,
    lineHeight: t.rowBodyLineHeight,
    color: colors.textPrimary,
  },
  rowLink: { textDecorationLine: 'underline', color: colors.brandDark },

  escrow: {
    minHeight: t.escrowHeight,
    borderRadius: t.escrowRadius,
    paddingHorizontal: t.escrowPadX,
    backgroundColor: t.escrowBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  escrowText: {
    marginLeft: t.escrowIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.escrowSize,
    color: colors.textPrimary,
  },

  feeRow: { marginTop: t.feeGap, flexDirection: 'row', alignItems: 'center' },
  feeText: { flex: 1, minWidth: 0, marginRight: 10 },
  feeLabel: { fontFamily: font.appBody, fontSize: t.feeLabelSize, color: colors.textPrimary },
  feeSub: {
    marginTop: t.feeSubGap,
    fontFamily: font.appSemi,
    fontSize: t.feeSubSize,
    color: colors.brandDark,
  },
  feeAmount: { fontFamily: font.appHeading, fontSize: t.feeAmountSize, color: colors.textPrimary },

  line: { marginTop: t.lineGap, flexDirection: 'row', alignItems: 'center' },
  lineLabel: {
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.lineLabelSize,
    color: colors.brandDark,
  },
  lineInfo: { marginLeft: t.infoIconGap },
  lineAmount: {
    marginLeft: 'auto',
    paddingLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.lineAmountSize,
    color: colors.textPrimary,
  },

  netRule: { marginTop: t.netRuleGap, height: 1, backgroundColor: t.netRule },
  net: {
    marginTop: t.netGap,
    borderRadius: t.netRadius,
    backgroundColor: t.netBg,
    padding: t.netPad,
    flexDirection: 'row',
  },
  netLeft: { width: t.netLeftW, marginRight: t.netColGap },
  netLabel: {
    fontFamily: font.appHeading,
    fontSize: t.netLabelSize,
    lineHeight: t.netLabelLineHeight,
    color: colors.textPrimary,
  },
  netSub: {
    marginTop: t.netSubGap,
    fontFamily: font.appSemi,
    fontSize: t.netSubSize,
    lineHeight: t.netSubLineHeight,
    color: colors.brandDark,
  },
  netRight: { flex: 1, minWidth: 0 },
  netAmountRow: { flexDirection: 'row', alignItems: 'center' },
  netAmount: {
    marginLeft: t.netIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.netAmountSize,
    color: colors.textPrimary,
  },
  netNote: {
    marginTop: t.netNoteGap,
    fontFamily: font.appBody,
    fontSize: t.netNoteSize,
    lineHeight: t.netNoteLineHeight,
    color: colors.textBody,
  },

  briefCard: { flexDirection: 'row', alignItems: 'center' },
  briefIcon: {
    width: t.briefIcon,
    height: t.briefIcon,
    borderRadius: t.briefIcon / 2,
    backgroundColor: t.briefIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  briefText: { flex: 1, minWidth: 0, marginLeft: t.briefIconGap },
  briefTitleRow: { flexDirection: 'row', alignItems: 'center' },
  briefTitle: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.briefTitleSize,
    color: colors.textPrimary,
  },
  briefLink: { fontFamily: font.appBody, fontSize: t.briefLinkSize, color: colors.brandDark },
  briefSub: {
    marginTop: t.briefSubGap,
    fontFamily: font.appBody,
    fontSize: t.briefSubSize,
    lineHeight: t.briefSubLineHeight,
    color: colors.brandDark,
  },

  accept: {
    marginTop: t.btnGap - t.cardGap,
    minHeight: t.acceptHeight,
    borderRadius: t.acceptRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  acceptText: {
    marginLeft: t.acceptIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.acceptSize,
    color: ink.onBrand,
  },
  propose: {
    marginTop: t.proposeGap,
    minHeight: t.proposeHeight,
    borderRadius: t.proposeRadius,
    backgroundColor: t.proposeBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  proposeText: { fontFamily: font.appSemi, fontSize: t.proposeSize, color: colors.brandDark },
  pressed: { opacity: 0.85 },
});
