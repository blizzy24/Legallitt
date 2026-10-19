import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  Coins,
  Eye,
  FileText,
  Gavel,
  Home,
  IdCard,
  Image as ImageIcon,
  Mail,
  MapPin,
  MessageSquareQuote,
  Phone,
  Quote,
  Shield,
  ShieldCheck,
  TriangleAlert,
  UserRound,
  Wallet,
  X,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { FIR_REQUEST } from '../../../data/advocateFir';
import { advFirRequest as t, colors, font, ink, status } from '../../../constants/theme';
import { advDocHref } from '../../../data/docLinks';

// FIR request details (design/215).
//
// ⚠ THE FEE CONTRADICTS design/214. The cases card reads "Fee: ₹4,500"; this screen
// splits ₹3,500 into ₹500 + ₹3,000. Both are stored, each on the screen that draws
// it. See data/advocateFir.ts note 1.
//
// ⚠ ₹500 OF ₹3,500 IS 14.286% — a fifth commission rate in the app. Stored as a
// literal, deliberately not computed. Note 2.
//
// ⚠ THE DOCKET IS FIR-2026-1048 here and #FIR-2026-8841 on designs 218/219, with an
// inconsistent "#". Note 3.
//
// ⚠ FIVE DOCUMENTS here, FOUR with different names on design/216. Note 4.
//
// ⚠ THE INCIDENT DATE IS IN THE FUTURE (18 Oct 2026 against a current date of
// 9 Oct 2026). Not normalised. Note 5.
//
// ⚠ The mobile number is unmasked; design/207 masks the same client's. Note 6.
//
// ⚠ design/215 CLIPS the email to "rahul@example.co". Stored and rendered whole —
// the project never ellipsizes. Note 7.
//
// ⚠ The Reject button is status.redContainer / status.onRedContainer — the
// design/210 red, now a shared palette pair. See constants/theme.ts.

const CELL_ICONS = { phone: Phone, mail: Mail };
const ROW_ICONS = { alert: TriangleAlert, calendar: CalendarDays, pin: MapPin };
const DOC_ICONS = { doc: FileText, image: ImageIcon, id: IdCard, quote: MessageSquareQuote, home: Home };

export default function AdvocateFirRequestScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = FIR_REQUEST;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {r.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.chip}>
              <View style={styles.chipDot} />
              <Text style={styles.chipText} {...shrinkToFit(0.75)}>
                {r.statusChip}
              </Text>
            </View>
            <Text style={styles.recv} {...shrinkToFit(0.75)}>
              {r.recv}
            </Text>
          </View>
          <View style={styles.idRow}>
            <Shield size={t.idIcon} color={colors.textPrimary} />
            <Text style={styles.id} {...shrinkToFit(0.7)}>
              {r.idLabel} {r.id}
            </Text>
          </View>
          <Text style={styles.station} {...shrinkToFit(0.75)}>
            {r.stationLabel} {r.station}
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle} {...shrinkToFit(0.75)}>
              {r.client.title}
            </Text>
            <View style={styles.kyc}>
              <ShieldCheck size={t.kycIcon} color={t.kycColour} />
              <Text style={styles.kycText} {...shrinkToFit(0.75)}>
                {r.client.chip}
              </Text>
            </View>
            <View style={styles.sectionAvatar}>
              <UserRound size={t.sectionAvatarGlyph} color={colors.textPrimary} />
            </View>
          </View>
          <View style={styles.grid}>
            {r.client.cells.map((c) => {
              const Icon = c.icon ? CELL_ICONS[c.icon] : null;
              return (
                <View key={c.label} style={styles.cell}>
                  <Text style={styles.cellLabel} {...shrinkToFit(0.7)}>
                    {c.label}
                  </Text>
                  <View style={styles.cellValueRow}>
                    {Icon && <Icon size={t.cellIcon} color={colors.textPrimary} style={styles.cellIcon} />}
                    {/* Never ellipsized — shrinks to fit the cell. */}
                    <Text style={styles.cellValue} {...shrinkToFit(0.6)}>
                      {c.value}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle} {...shrinkToFit(0.75)}>
              {r.incident.title}
            </Text>
            <Gavel size={t.sectionIcon} color={colors.textPrimary} style={styles.sectionIcon} />
          </View>
          {r.incident.rows.map((row) => {
            const Icon = ROW_ICONS[row.icon];
            return (
              <View key={row.label} style={styles.incRow}>
                <Icon size={t.rowIcon} color={colors.brandDark} style={styles.rowIcon} />
                <View style={styles.incText}>
                  <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                    {row.label}
                  </Text>
                  <Text style={styles.rowValue}>{row.value}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Quote size={t.quoteMark} color={colors.brandDark} style={styles.quoteMark} />
            <Text style={styles.sectionTitle} {...shrinkToFit(0.75)}>
              {r.statement.title}
            </Text>
          </View>
          <View style={styles.quote}>
            <Text style={styles.quoteText}>{r.statement.quote}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle} {...shrinkToFit(0.75)}>
              {r.fee.title}
            </Text>
            <Wallet size={t.sectionIcon} color={colors.textPrimary} style={styles.sectionIcon} />
          </View>
          {r.fee.rows.map((f) => (
            <View key={f.label} style={styles.feeRow}>
              <Text style={styles.feeLabel} {...shrinkToFit(0.8)}>
                {f.label}
              </Text>
              <Text
                style={[styles.feeValue, 'deduct' in f && f.deduct ? styles.feeDeduct : null]}
                {...shrinkToFit(0.8)}
              >
                {f.value}
              </Text>
            </View>
          ))}
          <View style={styles.advBox}>
            <View style={styles.advTop}>
            <View style={styles.advText}>
              <Text style={styles.advLabel} {...shrinkToFit(0.75)}>
                {r.fee.advocateLabel}
              </Text>
              <Text style={styles.advAmount} {...shrinkToFit(0.7)}>
                {r.fee.advocateAmount}
              </Text>
            </View>
            <View style={styles.advCoin}>
              <Coins size={t.advCoinGlyph} color={colors.brandDark} />
            </View>
            </View>
            <View style={styles.advEscrow}>
              <Shield size={t.advEscrowIcon} color={t.advEscrowColour} style={styles.advEscrowIcon} />
              <Text style={styles.advEscrowText}>{r.fee.escrow}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.sectionTitle} {...shrinkToFit(0.75)}>
              {r.documents.title}
            </Text>
            <View style={styles.docsChip}>
              <Text style={styles.docsChipText} {...shrinkToFit(0.75)}>
                {r.documents.chip}
              </Text>
            </View>
            <Text style={styles.docsVerified} {...shrinkToFit(0.75)}>
              {r.documents.verified}
            </Text>
          </View>
          {r.documents.rows.map((d) => {
            const Icon = DOC_ICONS[d.icon];
            return (
              <View key={d.name} style={styles.docRow}>
                <View style={styles.docIconBox}>
                  <Icon size={t.docIconGlyph} color={colors.textPrimary} />
                </View>
                <View style={styles.docText}>
                  <Text style={styles.docName} {...shrinkToFit(0.7)}>
                    {d.name}
                  </Text>
                  <Text style={styles.docMeta} {...shrinkToFit(0.8)}>
                    {d.meta}
                  </Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`View ${d.name}`}
                  hitSlop={8}
                  onPress={() => router.push(advDocHref(d.name) as Href)}
                >
                  <Eye size={t.docEye} color={colors.textPrimary} />
                </Pressable>
              </View>
            );
          })}
          <View style={styles.warn}>
            <ShieldCheck size={t.warnIcon} color={colors.brandDark} style={styles.warnIcon} />
            <Text style={styles.warnText}>{r.documents.warn}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <View style={styles.barRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
            style={({ pressed }) => [styles.btn, styles.reject, pressed && styles.pressed]}
          >
            <X size={t.btnIcon} color={status.onRedContainer} />
            <Text style={styles.rejectText} {...shrinkToFit(0.8)}>
              {r.reject}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/advocate/fir/documents?id=${id}` as Href)}
            style={({ pressed }) => [styles.btn, styles.accept, pressed && styles.pressed]}
          >
            <Check size={t.btnIcon} color={ink.onBrand} />
            <Text style={styles.acceptText} {...shrinkToFit(0.8)}>
              {r.accept}
            </Text>
          </Pressable>
        </View>
        <View style={styles.barRow}>
          <Text style={styles.capReject} {...shrinkToFit(0.75)}>
            {r.rejectCaption}
          </Text>
          <Text style={styles.capAccept} {...shrinkToFit(0.75)}>
            {r.acceptCaption}
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
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 24 },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    padding: t.cardPad,
  },
  row: { flexDirection: 'row', alignItems: 'center' },

  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    backgroundColor: t.chipBg,
    paddingHorizontal: t.chipPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  chipDot: {
    width: t.chipDot,
    height: t.chipDot,
    borderRadius: t.chipDot / 2,
    backgroundColor: t.chipColour,
    marginRight: t.chipDotGap,
  },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: t.chipColour, flexShrink: 1 },
  recv: { marginLeft: 'auto', paddingLeft: 8, fontFamily: font.appBody, fontSize: t.recvSize, color: t.recvColour, flexShrink: 1 },

  idRow: { marginTop: t.idGap, flexDirection: 'row', alignItems: 'center' },
  id: { marginLeft: t.idIconGap, flexShrink: 1, fontFamily: font.appHeading, fontSize: t.idSize, color: colors.textPrimary },
  station: {
    marginTop: t.stationGap,
    marginLeft: t.stationIndent,
    fontFamily: font.appBody,
    fontSize: t.stationSize,
    color: t.stationColour,
  },

  sectionTitle: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.sectionTitleSize, color: colors.textPrimary },
  sectionIcon: { marginLeft: 'auto' },
  kyc: {
    marginLeft: t.kycGap,
    minHeight: t.kycHeight,
    borderRadius: t.kycRadius,
    backgroundColor: t.kycBg,
    paddingHorizontal: t.kycPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  kycText: { marginLeft: t.kycIconGap, fontFamily: font.appSemi, fontSize: t.kycSize, color: t.kycColour, flexShrink: 1 },
  sectionAvatar: {
    marginLeft: 'auto',
    width: t.sectionAvatar,
    height: t.sectionAvatar,
    borderRadius: t.sectionAvatar / 2,
    backgroundColor: t.sectionAvatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  grid: { marginTop: t.gridGap, flexDirection: 'row', flexWrap: 'wrap', gap: t.gridGapY },
  cell: {
    width: '48%',
    flexGrow: 1,
    borderRadius: t.cellRadius,
    backgroundColor: t.cellBg,
    padding: t.cellPad,
  },
  cellLabel: {
    fontFamily: font.appSemi,
    fontSize: t.cellLabelSize,
    letterSpacing: t.cellLabelSpacing,
    color: t.cellLabelColour,
  },
  cellValueRow: { marginTop: t.cellValueGap, flexDirection: 'row', alignItems: 'center' },
  cellIcon: { marginRight: t.cellIconGap },
  cellValue: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.cellValueSize, color: colors.textPrimary },

  incRow: { marginTop: t.rowGap, flexDirection: 'row', alignItems: 'flex-start' },
  rowIcon: { marginTop: 2 },
  incText: { flex: 1, minWidth: 0, marginLeft: t.rowIconGap },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: t.rowLabelColour },
  rowValue: {
    marginTop: t.rowValueGap,
    fontFamily: font.appBody,
    fontSize: t.rowValueSize,
    lineHeight: t.rowValueLineHeight,
    color: colors.textPrimary,
  },

  quoteMark: { marginRight: t.quoteMarkGap },
  quote: { marginTop: t.quoteGap, borderRadius: t.quoteRadius, backgroundColor: t.quoteBg, padding: t.quotePad },
  quoteText: {
    fontFamily: font.appBody,
    fontSize: t.quoteSize,
    lineHeight: t.quoteLineHeight,
    color: colors.textPrimary,
  },

  feeRow: { marginTop: t.feeRowGap, flexDirection: 'row', alignItems: 'center' },
  feeLabel: { flexShrink: 1, marginRight: 10, fontFamily: font.appBody, fontSize: t.feeLabelSize, color: colors.textPrimary },
  feeValue: { marginLeft: 'auto', flexShrink: 1, fontFamily: font.appHeading, fontSize: t.feeValueSize, color: colors.textPrimary },
  feeDeduct: { color: t.feeDeductColour },

  advBox: {
    marginTop: t.advBoxGap,
    borderRadius: t.advBoxRadius,
    backgroundColor: t.advBoxBg,
    padding: t.advBoxPad,
  },
  advTop: { flexDirection: 'row', alignItems: 'center' },
  advText: { flex: 1, minWidth: 0, marginRight: 10 },
  advLabel: {
    fontFamily: font.appSemi,
    fontSize: t.advLabelSize,
    letterSpacing: t.advLabelSpacing,
    color: t.advLabelColour,
  },
  advAmount: { marginTop: t.advAmountGap, fontFamily: font.appHeading, fontSize: t.advAmountSize, color: colors.textPrimary },
  advCoin: {
    width: t.advCoin,
    height: t.advCoin,
    borderRadius: t.advCoin / 2,
    backgroundColor: t.advCoinBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advEscrow: { marginTop: t.advEscrowGap, flexDirection: 'row', alignItems: 'flex-start' },
  advEscrowIcon: { marginTop: 1 },
  advEscrowText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.advEscrowIconGap,
    fontFamily: font.appSemi,
    fontSize: t.advEscrowSize,
    lineHeight: t.advEscrowLineHeight,
    color: t.advEscrowColour,
  },

  docsChip: {
    marginLeft: t.docsChipGap,
    minHeight: t.docsChipHeight,
    borderRadius: t.docsChipRadius,
    backgroundColor: t.docsChipBg,
    paddingHorizontal: t.docsChipPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  docsChipText: { fontFamily: font.appSemi, fontSize: t.docsChipSize, color: t.docsChipColour },
  docsVerified: { marginLeft: 'auto', paddingLeft: 8, fontFamily: font.appSemi, fontSize: t.docsVerifiedSize, color: t.docsVerifiedColour, flexShrink: 1 },

  docRow: {
    marginTop: t.docRowGapY,
    borderRadius: t.docRowRadius,
    backgroundColor: t.docRowBg,
    padding: t.docRowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIconBox: {
    width: t.docIconBox,
    height: t.docIconBox,
    borderRadius: t.docIconRadius,
    backgroundColor: t.docIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docText: { flex: 1, minWidth: 0, marginHorizontal: t.docIconGap },
  docName: { fontFamily: font.appHeading, fontSize: t.docNameSize, color: colors.textPrimary },
  docMeta: { marginTop: t.docMetaGap, fontFamily: font.appBody, fontSize: t.docMetaSize, color: t.docMetaColour },

  warn: {
    marginTop: t.warnGap,
    borderRadius: t.warnRadius,
    backgroundColor: t.warnBg,
    padding: t.warnPad,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warnIcon: { marginTop: 1 },
  warnText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.warnIconGap,
    fontFamily: font.appBody,
    fontSize: t.warnSize,
    lineHeight: t.warnLineHeight,
    color: t.warnColour,
  },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: t.barBg },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: t.barGapX },
  btn: {
    minHeight: t.btnHeight,
    borderRadius: t.btnRadius,
    paddingHorizontal: t.btnPadX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  /** The shared tinted-red container. See constants/theme.ts. */
  reject: { backgroundColor: status.redContainer },
  rejectText: { marginLeft: t.btnIconGap, fontFamily: font.appHeading, fontSize: t.btnSize, color: status.onRedContainer, flexShrink: 1 },
  accept: { flex: 1, backgroundColor: t.acceptBg },
  acceptText: { marginLeft: t.btnIconGap, fontFamily: font.appHeading, fontSize: t.btnSize, color: ink.onBrand, flexShrink: 1 },
  capReject: { marginTop: t.capGap, fontFamily: font.appSemi, fontSize: t.capSize, color: t.capRejectColour, flexShrink: 1 },
  capAccept: { marginTop: t.capGap, marginLeft: 'auto', fontFamily: font.appSemi, fontSize: t.capSize, color: t.capAcceptColour, flexShrink: 1 },
  pressed: { opacity: 0.85 },
});
