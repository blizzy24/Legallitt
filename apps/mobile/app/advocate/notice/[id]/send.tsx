import NoticeScreenFeedback from '../../../../components/NoticeScreenFeedback';
import { useAdvocateNoticeModel } from "../../../../features/legal-notice/useAdvocateNoticeModel";
import { previewNotice } from '../../../../components/PreviewNotice';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  Copy,
  Eye,
  FileText,
  Gavel,
  IdCard,
  Info,
  Landmark,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_SEND } from '../../../../data/advocateSide';
import { advNoticeSend as t, colors, font, ink } from '../../../../constants/theme';
import { advDocHref } from '../../../../data/docLinks';

// Send documents (design/194).
//
// ⚠ The fourth document chip is CLIPPED to a sliver at the screen edge with no
// legible text. It is tinted differently from the three grey document chips and the
// card counts "5 Documents" against three named ones, so it is INFERRED as a "+2"
// overflow counter. See the note in data/advocateSide.ts.
//
// ⚠ design/194 writes the advocate as "Adv. Gurneeet Chawla" (three e's) and calls
// the matter "High Court Representation / #HCR-2026-1048", where the same journey
// has been a Legal Notice under LN-2026-1048 since design/185. Both as drawn.
//
// View, Copy and the chips are inert.
//
// Owner decision, 4 November 2026: the Legalitt Delivery Partner is not built (§9.1),
// so the choice is removed until it is. Only Send by Yourself is offered, selected as
// design/284 draws it, and Continue opens the courier-details form (design/286). The
// partner screens (195–198) stay in the code but are unreachable from this flow.
// The two lines that promise Legalitt Delivery are not shown.

const CHIP_ICONS = [FileText, Gavel, IdCard];

export function AdvocateNoticeSendScreenView({ data, navigate, onChoice }: { onChoice?: (choice: string) => void; data: { ADV_NOTICE_SEND: typeof ADV_NOTICE_SEND }; navigate: typeof router }) {
  const { ADV_NOTICE_SEND } = data;
  const router = navigate;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const s = ADV_NOTICE_SEND;
  const choice = 'self' as const;

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
          {s.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* The drawn intro ("Choose how you want to send…") is not shown: there is no choice. */}

        <View style={styles.card}>
          <View style={styles.svc}>
            <Gavel size={t.svcIcon} color={t.svcColour} />
            <Text style={styles.svcText} {...shrinkToFit(0.75)}>
              {s.serviceChip}
            </Text>
          </View>
          <Text style={styles.ref} {...shrinkToFit(0.75)}>
            {s.matterRef}
          </Text>
          <Text style={styles.party} {...shrinkToFit(0.7)}>
            {s.parties}
          </Text>
          <View style={styles.adv}>
            <View style={styles.advIcon}>
              <Landmark size={t.advIconGlyph} color={colors.brandDark} />
            </View>
            <Text style={styles.advLabel} {...shrinkToFit(0.7)}>
              {s.assignedLabel}{' '}
              <Text style={styles.advName}>{s.advocate}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.docsRow}>
            <Text style={styles.docsTitle} {...shrinkToFit(0.75)}>
              {s.docsTitle}
            </Text>
            <View style={styles.docsChip}>
              <Text style={styles.docsChipText} {...shrinkToFit(0.8)}>
                {s.docsChip}
              </Text>
            </View>
            {/* View names the set, so it opens the first document; the viewer has no pager. */}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(advDocHref(s.docChips[0]) as Href)}
              style={styles.docsLink}
            >
              <Eye size={t.docsLinkIcon} color={colors.brandDark} />
              <Text style={styles.docsLinkText} {...shrinkToFit(0.8)}>
                {s.docsLink}
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            contentContainerStyle={styles.chipRowContent}
          >
            {s.docChips.map((c, i) => {
              const Icon = CHIP_ICONS[i] ?? FileText;
              return (
                <View key={c} style={styles.chip}>
                  <Icon size={t.chipIcon} color={colors.textPrimary} />
                  <Text style={styles.chipText} numberOfLines={1}>
                    {c}
                  </Text>
                </View>
              );
            })}
            {/* ⚠ Inferred overflow counter — the design clips this chip. Absent when empty. */}
            {s.docChipOverflow ? <View style={[styles.chip, styles.chipMore]}>
              <Text style={[styles.chipText, styles.chipMoreText]} numberOfLines={1}>
                {s.docChipOverflow}
              </Text>
            </View> : null}
          </ScrollView>
        </View>

        {s.options.filter((o) => o.id === choice).map((o) => {
          const selected = true;
          return (
            <View
              key={o.id}
              style={[styles.opt, styles.optFirst, selected && styles.optSel]}
            >
              <View style={styles.optRow}>
                <View style={[styles.optTile, selected && styles.optTileSel]}>
                  {o.id === 'self' ? (
                    <Package size={t.optTileIcon} color={colors.brandDark} />
                  ) : (
                    <Truck size={t.optTileIcon} color={ink.onBrand} />
                  )}
                </View>
                <View style={styles.optText}>
                  <Text style={styles.optTitle} {...shrinkToFit(0.7)}>
                    {o.title}
                  </Text>
                  {o.chip && (
                    <View style={styles.optChip}>
                      <Text style={styles.optChipText} {...shrinkToFit(0.8)}>
                        {o.chip}
                      </Text>
                    </View>
                  )}
                  <Text style={styles.optBody}>{o.body}</Text>
                  {o.sub && <Text style={styles.optSub}>{o.sub}</Text>}
                  {o.safe && (
                    <View style={styles.optSafe}>
                      <ShieldCheck size={t.optSafeIcon} color={t.optSafeColour} />
                      <Text style={styles.optSafeText} {...shrinkToFit(0.75)}>
                        {o.safe}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={[styles.pick, selected && styles.pickOn]}>
                  {selected && <Check size={t.pickIcon} color={ink.onBrand} />}
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.card}>
          <View style={styles.sendRow}>
            <MapPin size={t.sendIcon} color={colors.textPrimary} />
            <Text style={styles.sendLabel} {...shrinkToFit(0.8)}>
              {s.sendToLabel}
            </Text>
            <Pressable onPress={() => previewNotice(s.copy)} accessibilityRole="button" style={styles.copyChip}>
              <Copy size={t.copyIcon} color={colors.textPrimary} />
              <Text style={styles.copyText} {...shrinkToFit(0.8)}>
                {s.copy}
              </Text>
            </Pressable>
          </View>
          <View style={styles.addr}>
            <Text style={styles.addrName} {...shrinkToFit(0.75)}>
              {s.sendTo.name}
            </Text>
            {s.sendTo.lines.map((l) => (
              <Text key={l} style={styles.addrLine}>
                {l}
              </Text>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.note]}>
          <View style={styles.noteIcon}>
            <Info size={t.noteIconGlyph} color={ink.onBrand} />
          </View>
          <View style={styles.noteText}>
            <Text style={styles.noteTitle}>{s.note.title}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onChoice ? onChoice(choice) : router.push(`/courier/self/details?noticeOutbound=1&caseId=${id}` as Href)}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText} {...shrinkToFit(0.8)}>
            {s.cta}
          </Text>
          <ArrowRight size={t.ctaIcon} color={ink.onBrand} style={styles.ctaIcon} />
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

  content: { paddingHorizontal: t.padX, paddingBottom: 28 },
  intro: {
    marginTop: t.introGap,
    fontFamily: font.appBody,
    fontSize: t.introSize,
    lineHeight: t.introLineHeight,
    color: colors.textPrimary,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },

  svc: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: t.svcHeight,
    borderRadius: t.svcRadius,
    paddingHorizontal: t.svcPadX,
    backgroundColor: t.svcBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  svcText: { marginLeft: t.svcIconGap, flexShrink: 1, fontFamily: font.appSemi, fontSize: t.svcSize, color: t.svcColour },
  ref: { marginTop: t.refGap, fontFamily: font.appBody, fontSize: t.refSize, color: colors.textBody },
  party: { marginTop: t.partyGap, fontFamily: font.appHeading, fontSize: t.partySize, color: colors.textPrimary },
  adv: { marginTop: t.advGap, flexDirection: 'row', alignItems: 'center' },
  advIcon: {
    width: t.advIcon,
    height: t.advIcon,
    borderRadius: t.advIcon / 2,
    backgroundColor: t.advIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advLabel: {
    marginLeft: t.advIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.advLabelSize,
    color: colors.textBody,
  },
  advName: { fontFamily: font.appHeading, fontSize: t.advNameSize, color: colors.textPrimary },

  docsRow: { flexDirection: 'row', alignItems: 'center' },
  docsTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.docsTitleSize, color: colors.textPrimary },
  docsChip: {
    marginLeft: t.docsChipGap,
    minHeight: t.docsChipHeight,
    borderRadius: t.docsChipRadius,
    paddingHorizontal: t.docsChipPadX,
    backgroundColor: t.docsChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  docsChipText: { fontFamily: font.appSemi, fontSize: t.docsChipSize, color: t.docsChipColour },
  docsLink: { marginLeft: 'auto', paddingLeft: 8, flexDirection: 'row', alignItems: 'center' },
  docsLinkText: { marginLeft: t.docsLinkGap, fontFamily: font.appSemi, fontSize: t.docsLinkSize, color: colors.brandDark },

  // overflow hidden so the row clips at the card edge, as design/194 draws it,
  // while still scrolling horizontally.
  chipRow: { marginTop: t.chipRowGap, flexGrow: 0, height: t.chipHeight, overflow: 'hidden' },
  chipRowContent: { gap: t.chipGapX },
  chip: {
    height: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: { marginLeft: t.chipIconGap, fontFamily: font.appBody, fontSize: t.chipSize, color: colors.textPrimary },
  chipMore: { backgroundColor: t.chipMoreBg },
  chipMoreText: { marginLeft: 0, fontFamily: font.appSemi, color: t.chipMoreColour },


  opt: {
    marginTop: t.optGap,
    borderRadius: t.optRadius,
    backgroundColor: t.optBg,
    padding: t.optPad,
  },
  optSel: { backgroundColor: t.optSelBg },
  // The removed choice heading's spacing, so the card sits where the options began.
  optFirst: { marginTop: t.chooseGap },
  optRow: { flexDirection: 'row' },
  optTile: {
    width: t.optTile,
    height: t.optTile,
    borderRadius: t.optTileRadius,
    backgroundColor: t.optTileBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optTileSel: { backgroundColor: t.optTileSelBg },
  optText: { flex: 1, minWidth: 0, marginLeft: t.optTileGap, marginRight: 10 },
  optTitle: { fontFamily: font.appHeading, fontSize: t.optTitleSize, color: colors.textPrimary },
  optChip: {
    marginTop: t.optChipGap,
    alignSelf: 'flex-start',
    minHeight: t.optChipHeight,
    borderRadius: t.optChipRadius,
    paddingHorizontal: t.optChipPadX,
    backgroundColor: t.optChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optChipText: { fontFamily: font.appSemi, fontSize: t.optChipSize, color: t.optChipColour },
  optBody: {
    marginTop: t.optBodyGap,
    fontFamily: font.appBody,
    fontSize: t.optBodySize,
    lineHeight: t.optBodyLineHeight,
    color: colors.textPrimary,
  },
  optSub: { marginTop: t.optSubGap, fontFamily: font.appBody, fontSize: t.optSubSize, color: colors.textBody },
  optSafe: { marginTop: t.optSubGap, flexDirection: 'row', alignItems: 'center' },
  optSafeText: {
    marginLeft: t.optSafeIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.optSubSize,
    color: t.optSafeColour,
  },
  pick: {
    width: t.pick,
    height: t.pick,
    borderRadius: t.pick / 2,
    backgroundColor: t.pickEmptyBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickOn: { backgroundColor: t.pickOnBg },

  sendRow: { flexDirection: 'row', alignItems: 'center' },
  sendLabel: {
    marginLeft: t.sendIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appHeading,
    fontSize: t.sendLabelSize,
    color: colors.textPrimary,
  },
  copyChip: {
    minHeight: t.copyHeight,
    borderRadius: t.copyRadius,
    paddingHorizontal: t.copyPadX,
    backgroundColor: t.copyBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  copyText: { marginLeft: t.copyIconGap, fontFamily: font.appBody, fontSize: t.copySize, color: colors.textPrimary },
  addr: {
    marginTop: t.addrGap,
    borderRadius: t.addrRadius,
    backgroundColor: t.addrBg,
    padding: t.addrPad,
  },
  addrName: { fontFamily: font.appHeading, fontSize: t.addrNameSize, color: colors.textPrimary },
  addrLine: {
    marginTop: t.addrLineGap,
    fontFamily: font.appBody,
    fontSize: t.addrLineSize,
    lineHeight: t.addrLineHeight,
    color: colors.textBody,
  },

  note: { backgroundColor: t.noteBg, flexDirection: 'row' },
  noteIcon: {
    width: t.noteIcon,
    height: t.noteIcon,
    borderRadius: t.noteIcon / 2,
    backgroundColor: t.noteIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteText: { flex: 1, minWidth: 0, marginLeft: t.noteIconGap },
  noteTitle: {
    fontFamily: font.appHeading,
    fontSize: t.noteTitleSize,
    lineHeight: t.noteTitleLineHeight,
    color: colors.textPrimary,
  },
  noteBody: {
    marginTop: t.noteBodyGap,
    fontFamily: font.appBody,
    fontSize: t.noteBodySize,
    lineHeight: t.noteBodyLineHeight,
    color: colors.textPrimary,
  },

  bar: { paddingHorizontal: t.barPadX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  cta: {
    minHeight: t.ctaHeight,
    borderRadius: t.ctaRadius,
    backgroundColor: t.ctaBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  ctaText: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.ctaSize, color: ink.onBrand },
  ctaIcon: { marginLeft: t.ctaIconGap },
  pressed: { opacity: 0.85 },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function AdvocateNoticeSendScreen() {
  const model = useAdvocateNoticeModel("send");
  return <NoticeScreenFeedback error={model.error} state={model.screenState}><AdvocateNoticeSendScreenView data={model.data} navigate={model.navigate} onChoice={model.onSendChoice} /></NoticeScreenFeedback>;
}
