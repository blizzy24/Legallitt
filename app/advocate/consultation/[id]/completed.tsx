import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  CircleCheck,
  CreditCard,
  Package,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_COMPLETED, ADV_COMMISSION_10, advNetAt10 } from '../../../../data/advocateSide';
import { advCompleted as t, advRequest as h, colors, font, ink } from '../../../../constants/theme';

// Consultation completed (design/181).
//
// ⚠ DIFFERENT CLIENT, SAME JOURNEY. Every other screen in this flow has the client
// as Ananya Deshmukh of Finova Tech India on a cross-border IP licensing matter.
// design/181 names Rahul Sharma of NexaCorp Technologies on "Series A Term Sheet &
// Founder Vesting Agreements", under docket #2024-91D rather than #2024-88C. Built
// exactly as drawn and flagged in data/advocateSide.ts.
//
// The retainer is computed from ADV_COMMISSION_10, so the 10% is not repeated here.

function money(n: number) {
  return `₹${n.toLocaleString('en-IN')}.00`;
}

export default function AdvocateCompletedScreen() {
  const insets = useSafeAreaInsets();
  const c = ADV_COMPLETED;
  const fee = advNetAt10(c.grossFee);

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
        <View style={styles.badgeRing}>
          <View style={styles.badge}>
            <BadgeCheck size={t.badgeIcon} color={t.badgeColour} />
          </View>
          <View style={styles.badgeDot} />
        </View>

        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {c.title}
        </Text>
        <Text style={styles.body}>{c.body}</Text>

        <View style={styles.chip}>
          <Package size={t.chipIcon} color={colors.textPrimary} />
          <Text style={styles.chipText} {...shrinkToFit(0.7)}>
            {c.docketChip}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.clientRow}>
            {/* Placeholder for design/181's photograph, at the drawn size. */}
            <View style={styles.photo}>
              <Text style={styles.photoText}>{c.client.initials}</Text>
            </View>
            <View style={styles.clientText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} {...shrinkToFit(0.75)}>
                  {c.client.name}
                </Text>
                <View style={styles.verified}>
                  <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                    {c.client.verifiedChip}
                  </Text>
                </View>
              </View>
              <Text style={styles.titleLine}>{c.client.title}</Text>
            </View>
            <View style={styles.docBtn}>
              <Building2 size={t.docBtnIcon} color={colors.textPrimary} />
            </View>
          </View>

          <View style={styles.matter}>
            <Text style={styles.matterLabel} {...shrinkToFit(0.8)}>
              {c.matterLabel}
            </Text>
            <Text style={styles.matterTitle}>{c.matter}</Text>
          </View>

          <View style={styles.cells}>
            {c.cells.map((cell) => (
              <View key={cell.label} style={styles.cell}>
                <Text style={styles.cellLabel} {...shrinkToFit(0.7)}>
                  {cell.label}
                </Text>
                <Text style={styles.cellValue} {...shrinkToFit(0.7)}>
                  {cell.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.fsRow}>
            <CreditCard size={t.fsIcon} color={colors.textPrimary} />
            <Text style={styles.fs} {...shrinkToFit(0.75)}>
              {c.settlementLabel}
            </Text>
            <View style={styles.escrow}>
              <View style={styles.escrowDot} />
              <Text style={styles.escrowText} {...shrinkToFit(0.75)}>
                {c.escrowChip}
              </Text>
            </View>
          </View>

          <View style={styles.line}>
            <Text style={styles.lineLabel} {...shrinkToFit(0.7)}>
              {c.feeLabel}
            </Text>
            <Text style={styles.lineAmount} {...shrinkToFit(0.75)}>
              {money(fee.grossFee)}
            </Text>
          </View>
          <View style={styles.line}>
            <Text style={styles.lineLabel} {...shrinkToFit(0.65)}>
              {ADV_COMMISSION_10.labels.completed} (10%)
            </Text>
            <Text style={styles.lineAmount} {...shrinkToFit(0.75)}>
              -{money(fee.platformFee)}
            </Text>
          </View>

          <View style={styles.net}>
            <View style={styles.netLeft}>
              <Text style={styles.netLabel} {...shrinkToFit(0.75)}>
                {c.netLabel}
              </Text>
              <View style={styles.netNoteRow}>
                <CircleCheck size={t.netNoteIcon} color={colors.textPrimary} />
                <Text style={styles.netNote}>{c.netNote}</Text>
              </View>
            </View>
            <Text style={styles.netAmount} {...shrinkToFit(0.6)}>
              {money(fee.net)}
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(advocate)/dashboard' as Href)}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Text style={styles.backText} {...shrinkToFit(0.75)}>
            {c.back}
          </Text>
          <ArrowRight size={t.backIcon} color={ink.onBrand} style={styles.backIcon} />
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

  content: { paddingHorizontal: t.padX, paddingBottom: 36, alignItems: 'center' },

  badgeRing: {
    marginTop: t.badgeTop,
    width: t.badgeRing,
    height: t.badgeRing,
    borderRadius: t.badgeRing / 2,
    backgroundColor: t.badgeRingBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: t.badge,
    height: t.badge,
    borderRadius: t.badge / 2,
    backgroundColor: t.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDot: {
    position: 'absolute',
    right: 2,
    bottom: 6,
    width: t.badgeDot,
    height: t.badgeDot,
    borderRadius: t.badgeDot / 2,
    backgroundColor: t.badgeDotBg,
  },

  title: {
    marginTop: t.titleGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  body: {
    marginTop: t.bodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  chip: {
    marginTop: t.chipGap,
    minHeight: t.chipHeight,
    maxWidth: '100%',
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    marginLeft: t.chipIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.chipSize,
    letterSpacing: t.chipSpacing,
    color: colors.textPrimary,
  },

  card: {
    alignSelf: 'stretch',
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  clientRow: { flexDirection: 'row', alignItems: 'center' },
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
  verifiedText: {
    fontFamily: font.appSemi,
    fontSize: t.verifiedSize,
    letterSpacing: t.verifiedSpacing,
    color: t.verifiedColour,
  },
  titleLine: {
    marginTop: t.titleLineGap,
    fontFamily: font.appBody,
    fontSize: t.titleLineSize,
    lineHeight: t.titleLineHeight,
    color: colors.textBody,
  },
  docBtn: {
    width: t.docBtn,
    height: t.docBtn,
    borderRadius: t.docBtn / 2,
    backgroundColor: t.docBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  matter: {
    marginTop: t.matterGap,
    borderRadius: t.matterRadius,
    backgroundColor: t.matterBg,
    padding: t.matterPad,
  },
  matterLabel: {
    fontFamily: font.appSemi,
    fontSize: t.matterLabelSize,
    letterSpacing: t.matterLabelSpacing,
    color: colors.textBody,
  },
  matterTitle: {
    marginTop: t.matterTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.matterTitleSize,
    lineHeight: t.matterTitleLineHeight,
    color: colors.textPrimary,
  },

  cells: { marginTop: t.cellGap, flexDirection: 'row' },
  cell: { flex: 1, minWidth: 0, paddingRight: 8 },
  cellLabel: { fontFamily: font.appBody, fontSize: t.cellLabelSize, color: colors.textBody },
  cellValue: {
    marginTop: t.cellValueGap,
    fontFamily: font.appHeading,
    fontSize: t.cellValueSize,
    color: colors.textPrimary,
  },

  fsRow: { flexDirection: 'row', alignItems: 'center' },
  fs: {
    marginLeft: t.fsIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.fsSize,
    letterSpacing: t.fsSpacing,
    color: colors.textPrimary,
  },
  escrow: {
    minHeight: t.escrowHeight,
    borderRadius: t.escrowRadius,
    paddingHorizontal: t.escrowPadX,
    backgroundColor: t.escrowBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  escrowDot: {
    width: t.escrowDot,
    height: t.escrowDot,
    borderRadius: t.escrowDot / 2,
    marginRight: t.escrowDotGap,
    backgroundColor: t.escrowColour,
  },
  escrowText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.escrowSize, color: t.escrowColour },

  line: { marginTop: t.lineGap, flexDirection: 'row', alignItems: 'center' },
  lineLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.lineLabelSize, color: colors.textPrimary },
  lineAmount: {
    marginLeft: 'auto',
    paddingLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.lineAmountSize,
    color: colors.textPrimary,
  },

  net: {
    marginTop: t.netGap,
    borderRadius: t.netRadius,
    backgroundColor: t.netBg,
    padding: t.netPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  netLeft: { flexShrink: 1, marginRight: 10 },
  netLabel: {
    fontFamily: font.appSemi,
    fontSize: t.netLabelSize,
    letterSpacing: t.netLabelSpacing,
    color: colors.textPrimary,
  },
  netNoteRow: { marginTop: t.netNoteGap, flexDirection: 'row', alignItems: 'center' },
  netNote: {
    marginLeft: t.netNoteIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.netNoteSize,
    lineHeight: t.netNoteLineHeight,
    color: colors.textPrimary,
  },
  netAmount: {
    marginLeft: 'auto',
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.netAmountSize,
    color: colors.textPrimary,
  },

  back: {
    alignSelf: 'stretch',
    marginTop: t.backGap,
    minHeight: t.backHeight,
    borderRadius: t.backRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: { fontFamily: font.appHeading, fontSize: t.backSize, color: ink.onBrand },
  backIcon: { marginLeft: t.backIconGap },
  pressed: { opacity: 0.85 },
});
