import NoticeScreenFeedback from '../../../../components/NoticeScreenFeedback';
import {useAdvocateNoticeModel} from "../../../../features/legal-notice/useAdvocateNoticeModel";
import { DEMO_AUTO_ADVANCE } from '../../../../constants/dev';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  FileText,
  FolderOpen,
  Hand,
  Package,
  ShieldCheck,
  Truck,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_CONFIRM } from '../../../../data/advocateSide';
import { advNoticeReceipt as t, colors, font, ink } from '../../../../constants/theme';

// Confirm documents (design/201) — UNFINISHED DESIGN.
//
// ⚠ Rendered WITH THE BRACKETS INTACT: [Client Name], [Case Name], [Case ID],
// [Document Count], [Document Name] ×4, [Courier Name], [Waybill Number], [Date],
// [Time], [Name if available].
//
// Confirm Received is disabled until the checkbox is ticked, as design/201 draws it
// in a muted state.

export function AdvocateNoticeConfirmScreenView({ data, navigate, onReceive }: { onReceive?:()=>void; data: { ADV_NOTICE_CONFIRM: typeof ADV_NOTICE_CONFIRM }; navigate: typeof router }) {
  const { ADV_NOTICE_CONFIRM } = data;
  const router = navigate;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = ADV_NOTICE_CONFIRM;
  const [checked, setChecked] = useState(false);

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
          {c.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.delRow}>
            <View style={styles.delChip}>
              <View style={styles.delChipDot} />
              <Text style={styles.delChipText} {...shrinkToFit(0.8)}>
                {c.deliveredChip}
              </Text>
            </View>
            <View style={styles.verified}>
              <BadgeCheck size={t.verifiedIcon} color="#1E9E4A" />
              <Text style={styles.verifiedText} {...shrinkToFit(0.75)}>
                {c.verified}
              </Text>
            </View>
          </View>
          <Text style={styles.delBody}>{c.deliveredBody}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.secRow}>
            <View style={styles.secIcon}>
              <FolderOpen size={t.secIconGlyph} color={colors.textPrimary} />
            </View>
            <View style={styles.secText}>
              <Text style={styles.secTitle} {...shrinkToFit(0.75)}>
                {c.caseRef.title}
              </Text>
              <Text style={styles.secSub} {...shrinkToFit(0.75)}>
                {c.caseRef.sub}
              </Text>
            </View>
          </View>
          {c.caseRef.rows.map((r) => (
            <View key={r.label} style={styles.row}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.75)}>
                {r.label}
              </Text>
              <Text style={[styles.rowValue, r.mono && styles.mono]} {...shrinkToFit(0.7)}>
                {r.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.secRow}>
            <View style={styles.secIcon}>
              <Package size={t.secIconGlyph} color={colors.textPrimary} />
            </View>
            <Text style={[styles.secTitle, styles.docTitle]} {...shrinkToFit(0.75)}>
              {c.documents.title}
            </Text>
            <View style={styles.docChip}>
              <Text style={styles.docChipText} {...shrinkToFit(0.7)}>
                {c.documents.chip}
              </Text>
            </View>
          </View>
          {c.documents.rows.map((r, i) => (
            <View key={i} style={styles.docRow}>
              <View style={styles.docRowIcon}>
                <FileText size={t.docRowIconGlyph} color={colors.textPrimary} />
              </View>
              <View style={styles.docRowText}>
                <Text style={styles.docRowName} {...shrinkToFit(0.75)}>
                  {r.name}
                </Text>
                <Text style={styles.docRowSub} {...shrinkToFit(0.75)}>
                  {r.sub}
                </Text>
              </View>
              <FileText size={t.docRowTrail} color="#C9C1B4" />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.secRow}>
            <View style={styles.secIcon}>
              <Truck size={t.secIconGlyph} color={colors.textPrimary} />
            </View>
            <View style={styles.secText}>
              <Text style={styles.secTitle} {...shrinkToFit(0.75)}>
                {c.delivery.title}
              </Text>
              <Text style={styles.secSub} {...shrinkToFit(0.75)}>
                {c.delivery.sub}
              </Text>
            </View>
          </View>
          {c.delivery.rows.map((r) => (
            <View key={r.label} style={styles.row}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.75)}>
                {r.label}
              </Text>
              <Text style={[styles.rowValue, r.mono && styles.mono]} {...shrinkToFit(0.65)}>
                {r.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.ask]}>
          <View style={styles.askHead}>
            <View style={styles.askIcon}>
              <Hand size={t.askIconGlyph} color={colors.textPrimary} />
            </View>
            <View style={styles.askText}>
              <Text style={styles.askTitle}>{c.ask.title}</Text>
              <Text style={styles.askBody}>{c.ask.body}</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            onPress={() => setChecked((v) => !v)}
            style={styles.check}
          >
            <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
              {checked && <Check size={t.checkBoxIcon} color={ink.onBrand} />}
            </View>
            <Text style={styles.checkText}>{c.ask.checkbox}</Text>
          </Pressable>
        </View>

        <View style={styles.note}>
          <ShieldCheck size={t.noteIcon} color={colors.brandDark} />
          <Text style={styles.noteText}>{c.note}</Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !checked }}
          disabled={!checked}
          onPress={onReceive ?? (() => router.push(`/advocate/notice/${id}/received` as Href))}
          style={({ pressed }) => [
            styles.btn,
            styles.primary,
            !checked && styles.primaryDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText} {...shrinkToFit(0.8)}>
            {c.cta}
          </Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} style={styles.btnIcon} />
        </Pressable>
        <View style={styles.cap}>
          <View style={styles.capDot} />
          <Text style={styles.capText} {...shrinkToFit(0.8)}>
            {c.ctaCaption}
          </Text>
        </View>
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

  content: { paddingHorizontal: t.padX, paddingTop: t.cardGap, paddingBottom: 28 },
  card: {
    marginBottom: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },

  delRow: { flexDirection: 'row', alignItems: 'center' },
  delChip: {
    minHeight: t.delChipHeight,
    borderRadius: t.delChipRadius,
    paddingHorizontal: t.delChipPadX,
    backgroundColor: t.delChipBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  delChipDot: {
    width: t.delChipDot,
    height: t.delChipDot,
    borderRadius: t.delChipDot / 2,
    marginRight: t.delChipDotGap,
    backgroundColor: t.delChipColour,
  },
  delChipText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.delChipSize,
    letterSpacing: t.delChipSpacing,
    color: t.delChipColour,
  },
  verified: { marginLeft: 'auto', paddingLeft: 8, flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  verifiedText: {
    marginLeft: t.verifiedIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.verifiedSize,
    color: colors.textPrimary,
  },
  delBody: {
    marginTop: t.delBodyGap,
    fontFamily: font.appBody,
    fontSize: t.delBodySize,
    lineHeight: t.delBodyLineHeight,
    color: colors.textPrimary,
  },

  secRow: { flexDirection: 'row', alignItems: 'center' },
  secIcon: {
    width: t.secIcon,
    height: t.secIcon,
    borderRadius: t.secIconRadius,
    backgroundColor: t.secIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secText: { flex: 1, minWidth: 0, marginLeft: t.secIconGap },
  secTitle: { fontFamily: font.appHeading, fontSize: t.secTitleSize, color: colors.textPrimary },
  secSub: { marginTop: t.secSubGap, fontFamily: font.appBody, fontSize: t.secSubSize, color: colors.textBody },
  docTitle: { flex: 1, minWidth: 0, marginLeft: t.secIconGap, marginRight: 8 },
  docChip: {
    minHeight: t.docChipHeight,
    borderRadius: t.docChipRadius,
    paddingHorizontal: t.docChipPadX,
    backgroundColor: t.docChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  docChipText: { fontFamily: font.appBody, fontSize: t.docChipSize, color: t.docChipColour },

  row: {
    marginTop: t.rowGap,
    borderRadius: t.rowRadius,
    backgroundColor: t.rowBg,
    padding: t.rowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
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
  docRowText: { flex: 1, minWidth: 0, marginLeft: t.docRowIconGap, marginRight: 8 },
  docRowName: { fontFamily: font.appHeading, fontSize: t.docRowNameSize, color: colors.textPrimary },
  docRowSub: { marginTop: t.docRowSubGap, fontFamily: font.appBody, fontSize: t.docRowSubSize, color: colors.textBody },

  ask: { backgroundColor: t.askBg },
  askHead: { flexDirection: 'row' },
  askIcon: {
    width: t.askIcon,
    height: t.askIcon,
    borderRadius: t.askIcon / 2,
    backgroundColor: t.askIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  askText: { flex: 1, minWidth: 0, marginLeft: t.askIconGap },
  askTitle: {
    fontFamily: font.appHeading,
    fontSize: t.askTitleSize,
    lineHeight: t.askTitleLineHeight,
    color: colors.textPrimary,
  },
  askBody: {
    marginTop: t.askBodyGap,
    fontFamily: font.appBody,
    fontSize: t.askBodySize,
    lineHeight: t.askBodyLineHeight,
    color: colors.textPrimary,
  },
  check: {
    marginTop: t.checkGap,
    borderRadius: t.checkRadius,
    backgroundColor: t.checkBg,
    padding: t.checkPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBox: {
    width: t.checkBox,
    height: t.checkBox,
    borderRadius: t.checkBoxRadius,
    backgroundColor: t.checkBoxBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: { backgroundColor: t.checkBoxOnBg },
  checkText: {
    marginLeft: t.checkGapX,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.checkSize,
    lineHeight: t.checkLineHeight,
    color: colors.textPrimary,
  },

  note: {
    marginBottom: t.cardGap,
    borderRadius: t.noteRadius,
    backgroundColor: t.noteBg,
    padding: t.notePad,
    flexDirection: 'row',
  },
  noteText: {
    marginLeft: t.noteIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
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
  primaryDisabled: { backgroundColor: '#BCB2A4' },
  primaryText: { fontFamily: font.appHeading, fontSize: t.btnSize, color: ink.onBrand },
  btnIcon: { marginLeft: t.btnIconGap },
  cap: { marginTop: t.capGap, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  capDot: {
    width: t.capDot,
    height: t.capDot,
    borderRadius: t.capDot / 2,
    marginRight: t.capDotGap,
    backgroundColor: '#C9C1B4',
  },
  capText: { fontFamily: font.appSemi, fontSize: t.capSize, color: colors.textBody },
  pressed: { opacity: 0.85 },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function AdvocateNoticeConfirmScreen() {
  const model=useAdvocateNoticeModel('confirm');
  return <NoticeScreenFeedback error={model.error}><AdvocateNoticeConfirmScreenView data={model.data} navigate={model.navigate} onReceive={model.onReceive} /></NoticeScreenFeedback>;
}
