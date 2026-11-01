import NoticeScreenFeedback from '../../../../components/NoticeScreenFeedback';
import {useAdvocateNoticeModel} from "../../../../features/legal-notice/useAdvocateNoticeModel";
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  FileText,
  MessageSquare,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_RECEIVED } from '../../../../data/advocateSide';
import { advNoticeReceipt as t, colors, font, ink } from '../../../../constants/theme';

// Documents received (design/202) — UNFINISHED DESIGN.
//
// ⚠ Rendered WITH THE BRACKETS INTACT: [Case ID], [Client Name], [Case Name],
// [Document Count], [Document Name] ×3, [Courier Name], [Waybill Number], [Date],
// [Advocate Name].
//
// ⚠ NEITHER BUTTON HAS A DRAWN DESTINATION. "Open Case" and "Chat with Client" lead
// nowhere in designs 183-203 — no case screen and no client chat exists in this
// flow. Both route to the report screen for now so the journey completes; this is a
// placeholder decision, not a drawn one.

export function AdvocateNoticeReceivedScreenView({ data, navigate }: { data: { ADV_NOTICE_RECEIVED: typeof ADV_NOTICE_RECEIVED }; navigate: typeof router }) {
  const { ADV_NOTICE_RECEIVED } = data;
  const router = navigate;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = ADV_NOTICE_RECEIVED;
  const onward = `/advocate/notice/${id}/report` as Href;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {r.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.badge}>
          <Check size={t.badgeIcon} color={ink.onBrand} />
        </View>
        <Text style={styles.heading} {...shrinkToFit(0.75)}>
          {r.heading}
        </Text>
        <Text style={styles.body}>{r.body}</Text>

        <View style={styles.card}>
          <View style={styles.infoHead}>
            <Text style={styles.infoLabel} {...shrinkToFit(0.8)}>
              {r.caseInfo.label}
            </Text>
            <Text style={styles.infoChip} {...shrinkToFit(0.75)}>
              {r.caseInfo.chip}
            </Text>
          </View>
          <View style={styles.infoRule} />
          {r.caseInfo.rows.map((row) => (
            <View key={row.label} style={styles.infoRow}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.75)}>
                {row.label}
              </Text>
              <Text style={styles.rowValue} {...shrinkToFit(0.7)}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.secRow}>
            <Text style={styles.docsTitle} {...shrinkToFit(0.75)}>
              {r.documents.title}
            </Text>
            <View style={styles.docChip}>
              <Text style={styles.docChipText} {...shrinkToFit(0.75)}>
                {r.documents.chip}
              </Text>
            </View>
            <View style={styles.statusChip}>
              <CircleCheck size={t.statusChipIcon} color={t.statusChipColour} />
              <Text style={styles.statusChipText} {...shrinkToFit(0.8)}>
                {r.documents.statusChip}
              </Text>
            </View>
          </View>
          {r.documents.rows.map((name, i) => (
            <View key={i} style={styles.docRow}>
              <View style={styles.docRowIcon}>
                <FileText size={t.docRowIconGlyph} color={colors.textPrimary} />
              </View>
              <Text style={styles.docRowName} {...shrinkToFit(0.75)}>
                {name}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.docsTitle} {...shrinkToFit(0.75)}>
            {r.delivery.title}
          </Text>
          <View style={styles.infoRule} />
          {r.delivery.rows.map((row) => (
            <View key={row.label} style={styles.infoRow}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.75)}>
                {row.label}
              </Text>
              <Text style={[styles.rowValue, row.mono && styles.mono]} {...shrinkToFit(0.65)}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.confirmed]}>
          <View style={styles.confirmedIcon}>
            <ShieldCheck size={t.confirmedIconGlyph} color={colors.brandDark} />
          </View>
          <View style={styles.confirmedText}>
            <Text style={styles.confirmedTitle} {...shrinkToFit(0.75)}>
              {r.confirmed.title}
            </Text>
            <Text style={styles.confirmedBody}>{r.confirmed.body}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ⚠ Neither destination is drawn; both land on the report screen for now. */}
      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(onward)}
          style={({ pressed }) => [styles.btn, styles.primary, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText} {...shrinkToFit(0.8)}>
            {r.openCase}
          </Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} style={styles.btnIcon} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(onward)}
          style={({ pressed }) => [styles.btn, styles.secondary, pressed && styles.pressed]}
        >
          <MessageSquare size={t.btnIcon} color={colors.textPrimary} />
          <Text style={styles.secondaryText} {...shrinkToFit(0.8)}>
            {r.chat}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.headerBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.backGap,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 28, alignItems: 'center' },
  badge: {
    marginTop: t.badgeTop,
    width: t.badge,
    height: t.badge,
    borderRadius: t.badge / 2,
    backgroundColor: t.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    marginTop: t.headingGap,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
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

  card: {
    alignSelf: 'stretch',
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  infoHead: { flexDirection: 'row', alignItems: 'center' },
  infoLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appSemi,
    fontSize: t.infoLabelSize,
    letterSpacing: t.infoLabelSpacing,
    color: colors.textPrimary,
  },
  infoChip: { fontFamily: font.appBody, fontSize: t.infoChipSize, color: colors.textBody },
  infoRule: { marginTop: t.infoRuleGap, height: 1, backgroundColor: t.infoRule },
  infoRow: { marginTop: t.infoRowGap, flexDirection: 'row', alignItems: 'center' },
  rowLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appBody,
    fontSize: t.rowLabelSize,
    color: colors.textBody,
  },
  rowValue: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.rowValueSize, color: colors.textPrimary },
  mono: { fontFamily: font.mono },

  secRow: { flexDirection: 'row', alignItems: 'center' },
  docsTitle: { fontFamily: font.appHeading, fontSize: t.secTitleSize, color: colors.textPrimary },
  docChip: {
    marginLeft: t.docChipGap,
    minHeight: t.docChipHeight,
    borderRadius: t.docChipRadius,
    paddingHorizontal: t.docChipPadX,
    backgroundColor: '#EFEDE9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  docChipText: { fontFamily: font.appBody, fontSize: t.docChipSize, color: colors.textBody },
  statusChip: {
    marginLeft: 'auto',
    paddingLeft: 8,
    minHeight: t.docChipHeight,
    borderRadius: t.docChipRadius,
    paddingHorizontal: t.docChipPadX,
    backgroundColor: t.statusChipBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  statusChipText: {
    marginLeft: t.statusChipIconGap,
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.docChipSize,
    color: t.statusChipColour,
  },
  docRow: {
    marginTop: t.docRowGap,
    borderRadius: t.docRowRadius,
    backgroundColor: t.docRowBg,
    padding: t.docRowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docRowIcon: {
    width: t.docRowIcon,
    height: t.docRowIcon,
    borderRadius: t.docRowIconRadius,
    backgroundColor: t.docRowIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docRowName: {
    marginLeft: t.docRowIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.docRowNameSize,
    color: colors.textPrimary,
  },

  confirmed: { backgroundColor: t.confirmedBg, flexDirection: 'row' },
  confirmedIcon: {
    width: t.confirmedIcon,
    height: t.confirmedIcon,
    borderRadius: t.confirmedIcon / 2,
    backgroundColor: t.confirmedIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedText: { flex: 1, minWidth: 0, marginLeft: t.confirmedIconGap },
  confirmedTitle: { fontFamily: font.appHeading, fontSize: t.confirmedTitleSize, color: colors.textPrimary },
  confirmedBody: {
    marginTop: t.confirmedBodyGap,
    fontFamily: font.appBody,
    fontSize: t.confirmedBodySize,
    lineHeight: t.confirmedBodyLineHeight,
    color: colors.textPrimary,
  },

  bar: { paddingHorizontal: t.barPadX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  btn: {
    minHeight: t.btnHeight,
    borderRadius: t.btnRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primary: { backgroundColor: t.primaryBg },
  primaryText: { fontFamily: font.appHeading, fontSize: t.btnSize, color: ink.onBrand },
  btnIcon: { marginLeft: t.btnIconGap },
  secondary: { marginTop: t.secondaryGap, backgroundColor: t.secondaryBg },
  secondaryText: {
    marginLeft: t.btnIconGap,
    fontFamily: font.appHeading,
    fontSize: t.btnSize,
    color: colors.textPrimary,
  },
  pressed: { opacity: 0.85 },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function AdvocateNoticeReceivedScreen() {
  const model=useAdvocateNoticeModel('received');
  return <NoticeScreenFeedback error={model.error}><AdvocateNoticeReceivedScreenView data={model.data} navigate={model.navigate} /></NoticeScreenFeedback>;
}
