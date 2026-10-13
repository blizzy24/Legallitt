import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Building2,
  FileText,
  Gavel,
  Info,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Truck,
  UserRound,
  Zap,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_DELIVERY } from '../../../../data/advocateSide';
import { advNoticeDelivery as t, colors, font, ink } from '../../../../constants/theme';
import { advDocHref } from '../../../../data/docLinks';

// Delivery details (design/195) — UNFINISHED DESIGN.
//
// ⚠ Every value in [square brackets] is a LITERAL PLACEHOLDER drawn in the export.
// They are rendered with the brackets intact so the gaps stay visible; nothing is
// invented to fill them. Rendered here: [Client Name], [Pickup Address],
// [City], [State] - [PIN] (twice), [Mobile Number] (twice), [Advocate Name],
// [Receiver Address], [Document Count], [Document Name] ×3, [Weight],
// [Date / Time], [₹ Amount].
//
// ⚠ The pickup and receiver blocks share the same city and mobile placeholders, so
// the two addresses are indistinguishable in the export.
//
// ⚠ Courier reads "Blue Dart" here and on design/199; design/200 tracks the same
// shipment under DHL Express.

function AddressBlock({
  icon,
  name,
  address,
  cityLine,
  mobile,
}: {
  icon: 'client' | 'advocate';
  name: string;
  address: string;
  cityLine: string;
  mobile: string;
}) {
  return (
    <View style={styles.block}>
      <View style={styles.blockIcon}>
        {icon === 'client' ? (
          <UserRound size={t.blockIconGlyph} color={colors.textBody} />
        ) : (
          <Gavel size={t.blockIconGlyph} color={colors.textBody} />
        )}
      </View>
      <View style={styles.blockText}>
        <Text style={styles.blockName} {...shrinkToFit(0.75)}>
          {name}
        </Text>
        <Text style={styles.blockLine}>{address}</Text>
        <Text style={styles.blockLine}>{cityLine}</Text>
        <View style={styles.blockMobile}>
          <Phone size={t.blockMobileIcon} color={colors.textBody} />
          <Text style={styles.blockMobileText} {...shrinkToFit(0.75)}>
            {mobile}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function AdvocateNoticeDeliveryScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = ADV_NOTICE_DELIVERY;

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
          {d.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.checkCard]}>
          <View style={styles.checkIcon}>
            <ShieldCheck size={t.checkIconGlyph} color={colors.brandDark} />
          </View>
          <Text style={styles.checkText}>{d.check}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.partnerRow}>
            <View style={styles.partnerIcon}>
              <Truck size={t.partnerIconGlyph} color={colors.textPrimary} />
            </View>
            <View style={styles.partnerText}>
              <Text style={styles.partnerTitle}>{d.partner.title}</Text>
              <Text style={styles.partnerBody}>{d.partner.body}</Text>
            </View>
            <View style={styles.partnerChip}>
              <View style={styles.partnerChipDot} />
              <Text style={styles.partnerChipText} {...shrinkToFit(0.8)}>
                {d.partner.chip}
              </Text>
            </View>
          </View>
          <View style={styles.powered}>
            <Zap size={t.poweredIcon} color={colors.textPrimary} />
            <Text style={styles.poweredText} {...shrinkToFit(0.8)}>
              {d.partner.poweredBy}
            </Text>
          </View>
          <Text style={styles.bullet}>• {d.partner.bullet}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <MapPin size={t.labelIcon} color={colors.brandDark} />
            <Text style={styles.label} {...shrinkToFit(0.75)}>
              {d.pickup.label}
            </Text>
            <Pressable accessibilityRole="button">
              <Text style={styles.link} {...shrinkToFit(0.8)}>
                {d.pickup.link}
              </Text>
            </Pressable>
          </View>
          <AddressBlock icon="client" {...d.pickup} />
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Building2 size={t.labelIcon} color={colors.brandDark} />
            <Text style={styles.label} {...shrinkToFit(0.75)}>
              {d.sendTo.label}
            </Text>
            <Pressable accessibilityRole="button">
              <Text style={styles.link} {...shrinkToFit(0.8)}>
                {d.sendTo.link}
              </Text>
            </Pressable>
          </View>
          <AddressBlock icon="advocate" {...d.sendTo} />
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <FileText size={t.labelIcon} color={colors.brandDark} />
            <Text style={styles.label} {...shrinkToFit(0.75)}>
              {d.documents.label}
            </Text>
            <View style={styles.docChip}>
              <Text style={styles.docChipText} {...shrinkToFit(0.75)}>
                {d.documents.chip}
              </Text>
            </View>
          </View>
          {d.documents.rows.map((r, i) => (
            <View key={i} style={styles.docRow}>
              <FileText size={t.docRowIcon} color={colors.brandDark} />
              <Text style={styles.docRowText} {...shrinkToFit(0.75)}>
                {r}
              </Text>
            </View>
          ))}
          {/* View Documents names the set, so it opens the first one (a drawn placeholder). */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(advDocHref(d.documents.rows[0]) as Href)}
            style={styles.docLink}
          >
            <Text style={styles.docLinkText} {...shrinkToFit(0.8)}>
              {d.documents.link}
            </Text>
            <ArrowUpRight size={t.docLinkIcon} color={colors.brandDark} style={styles.docLinkIcon} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.labelRow}>
            <Package size={t.labelIcon} color={colors.brandDark} />
            <Text style={styles.label} {...shrinkToFit(0.75)}>
              {d.delivery.label}
            </Text>
          </View>
          <View style={styles.cells}>
            {d.delivery.cells.map((c) => (
              <View key={c.label} style={styles.cell}>
                <Text style={styles.cellLabel} {...shrinkToFit(0.7)}>
                  {c.label}
                </Text>
                <Text style={styles.cellValue} {...shrinkToFit(0.7)}>
                  {c.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel} {...shrinkToFit(0.75)}>
              {d.fee.label}
            </Text>
            <Text style={styles.feeAmount} {...shrinkToFit(0.7)}>
              {d.fee.amount}
            </Text>
          </View>
          <View style={styles.feeNote}>
            <Info size={t.feeNoteIcon} color={colors.textBody} />
            <Text style={styles.feeNoteText}>{d.fee.note}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.warn]}>
          <View style={styles.warnIcon}>
            <ShieldCheck size={t.warnIconGlyph} color={colors.brandDark} />
          </View>
          <View style={styles.warnText}>
            <Text style={styles.warnTitle}>{d.warning.title}</Text>
            <Text style={styles.warnBody}>{d.warning.body}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/notice/${id}/payment` as Href)}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.ctaIcon} color={ink.onBrand} style={styles.ctaIcon} />
        </Pressable>
        <Text style={styles.cap} {...shrinkToFit(0.8)}>
          {d.ctaCaption}
        </Text>
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
    marginHorizontal: 10,
    textAlign: 'center',
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

  checkCard: { flexDirection: 'row', alignItems: 'center' },
  checkIcon: {
    width: t.checkIcon,
    height: t.checkIcon,
    borderRadius: t.checkIcon / 2,
    backgroundColor: t.checkIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    marginLeft: t.checkIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.checkSize,
    lineHeight: t.checkLineHeight,
    color: colors.textPrimary,
  },

  partnerRow: { flexDirection: 'row' },
  partnerIcon: {
    width: t.partnerIcon,
    height: t.partnerIcon,
    borderRadius: t.partnerIcon / 2,
    backgroundColor: t.partnerIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerText: { flex: 1, minWidth: 0, marginLeft: t.partnerIconGap, marginRight: 8 },
  partnerTitle: {
    fontFamily: font.appHeading,
    fontSize: t.partnerTitleSize,
    lineHeight: t.partnerTitleLineHeight,
    color: colors.textPrimary,
  },
  partnerBody: {
    marginTop: t.partnerBodyGap,
    fontFamily: font.appBody,
    fontSize: t.partnerBodySize,
    lineHeight: t.partnerBodyLineHeight,
    color: colors.textBody,
  },
  partnerChip: {
    alignSelf: 'flex-start',
    minHeight: t.partnerChipHeight,
    borderRadius: t.partnerChipRadius,
    paddingHorizontal: t.partnerChipPadX,
    backgroundColor: t.partnerChipBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  partnerChipDot: {
    width: t.partnerChipDot,
    height: t.partnerChipDot,
    borderRadius: t.partnerChipDot / 2,
    marginRight: t.partnerChipDotGap,
    backgroundColor: t.partnerChipColour,
  },
  partnerChipText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.partnerChipSize, color: t.partnerChipColour },
  powered: {
    marginTop: t.poweredGap,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: t.poweredHeight,
    borderRadius: t.poweredRadius,
    paddingHorizontal: t.poweredPadX,
    backgroundColor: t.poweredBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  poweredText: {
    marginLeft: t.poweredIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.poweredSize,
    color: colors.textPrimary,
  },
  bullet: { marginTop: t.bulletGap, fontFamily: font.appBody, fontSize: t.bulletSize, color: colors.textBody },

  labelRow: { flexDirection: 'row', alignItems: 'center' },
  label: {
    marginLeft: t.labelIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appHeading,
    fontSize: t.labelSize,
    color: colors.textPrimary,
  },
  link: { fontFamily: font.appSemi, fontSize: t.linkSize, color: colors.brandDark },

  block: {
    marginTop: t.blockGap,
    borderRadius: t.blockRadius,
    backgroundColor: t.blockBg,
    padding: t.blockPad,
    flexDirection: 'row',
  },
  blockIcon: {
    width: t.blockIcon,
    height: t.blockIcon,
    borderRadius: t.blockIcon / 2,
    backgroundColor: t.blockIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blockText: { flex: 1, minWidth: 0, marginLeft: t.blockIconGap },
  blockName: { fontFamily: font.appHeading, fontSize: t.blockNameSize, color: colors.textPrimary },
  blockLine: {
    marginTop: t.blockLineGap,
    fontFamily: font.appBody,
    fontSize: t.blockLineSize,
    lineHeight: t.blockLineHeight,
    color: colors.textPrimary,
  },
  blockMobile: { marginTop: t.blockMobileGap, flexDirection: 'row', alignItems: 'center' },
  blockMobileText: {
    marginLeft: t.blockMobileIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.blockMobileSize,
    color: colors.textBody,
  },

  docChip: {
    minHeight: t.docChipHeight,
    borderRadius: t.docChipRadius,
    paddingHorizontal: t.docChipPadX,
    backgroundColor: t.docChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  docChipText: { fontFamily: font.appBody, fontSize: t.docChipSize, color: colors.textBody },
  docRow: {
    marginTop: t.docRowGap,
    borderRadius: t.docRowRadius,
    backgroundColor: t.docRowBg,
    padding: t.docRowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docRowText: {
    marginLeft: t.docRowIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.docRowSize,
    color: colors.textPrimary,
  },
  docLink: {
    marginTop: t.docLinkGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docLinkText: { fontFamily: font.appSemi, fontSize: t.docLinkSize, color: colors.brandDark },
  docLinkIcon: { marginLeft: t.docLinkGapX },

  cells: { marginTop: t.blockGap, flexDirection: 'row', flexWrap: 'wrap', columnGap: t.cellGapX, rowGap: t.cellGapY },
  cell: {
    flexBasis: 0,
    flexGrow: 1,
    minWidth: '45%',
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

  feeRow: { flexDirection: 'row', alignItems: 'center' },
  feeLabel: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.feeLabelSize,
    color: colors.textPrimary,
  },
  feeAmount: { fontFamily: font.appHeading, fontSize: t.feeAmountSize, color: colors.textPrimary },
  feeNote: {
    marginTop: t.feeNoteGap,
    borderRadius: t.feeNoteRadius,
    backgroundColor: t.feeNoteBg,
    padding: t.feeNotePad,
    flexDirection: 'row',
  },
  feeNoteText: {
    marginLeft: t.feeNoteIconGap,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.feeNoteSize,
    lineHeight: t.feeNoteLineHeight,
    color: colors.textBody,
  },

  warn: { backgroundColor: t.warnBg, flexDirection: 'row' },
  warnIcon: {
    width: t.warnIcon,
    height: t.warnIcon,
    borderRadius: t.warnIcon / 2,
    backgroundColor: t.warnIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warnText: { flex: 1, minWidth: 0, marginLeft: t.warnIconGap },
  warnTitle: {
    fontFamily: font.appHeading,
    fontSize: t.warnTitleSize,
    lineHeight: t.warnTitleLineHeight,
    color: colors.textPrimary,
  },
  warnBody: {
    marginTop: t.warnBodyGap,
    fontFamily: font.appBody,
    fontSize: t.warnBodySize,
    lineHeight: t.warnBodyLineHeight,
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
  cap: {
    marginTop: t.capGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.capSize,
    color: colors.textBody,
  },
  pressed: { opacity: 0.85 },
});
