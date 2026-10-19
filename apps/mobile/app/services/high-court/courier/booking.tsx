import { router, type Href } from 'expo-router';
import {
  Archive,
  ArrowRight,
  BadgeCheck,
  Building,
  CircleCheck,
  CircleDot,
  CircleQuestionMark,
  Clock,
  Eye,
  FolderOpen,
  MapPin,
  Package,
  Pencil,
  Phone,
  SatelliteDish,
  ShieldCheck,
  ShieldHalf,
  Truck,
  Weight,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import { courierHeader as h, font, hcBooking as t, hcPalette as c, ink, shadow } from '../../../../constants/theme';
import { HC_BOOKING } from '../../../../data/highCourt';

// High Court courier — Blue Dart booking (design/305). Measured at 2.000 px/pt.
// Reached from Legalitt Delivery on design/304.
//
// Conflicts 4 and 6 and the ₹250 / ₹290 fee split are commented on HC_BOOKING.
//
// STATIC, NOT WIRED: no courier is booked, priced or tracked. Change and View
// Address are inert — no address editor or map is drawn for this flow. View
// Documents opens the client's documents list. Continue opens design/306.

const TILE_ICON = { truck: Truck, package: Package, weight: Weight, clock: Clock } as const;

export default function HighCourtCourierBookingScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_BOOKING;

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        center
        backHref={'/services/high-court/send-documents' as Href}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Help"
            hitSlop={8}
            onPress={() => router.push('/help' as Href)}
            style={styles.help}
          >
            <CircleQuestionMark size={t.helpIcon} color={h.ink} strokeWidth={1.9} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.pill, styles.step]}>
          <View style={styles.stepDot} />
          <Text style={[styles.pillText, styles.stepText]} {...shrinkToFit(0.75)}>
            {d.step}
          </Text>
        </View>
        <View style={[styles.pill, styles.powered]}>
          <Truck size={t.pillIcon} color={c.greenInk} fill={c.greenInk} strokeWidth={1.5} />
          <Text style={styles.pillText} {...shrinkToFit(0.75)}>
            {d.powered}
          </Text>
        </View>
        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.sub}>{d.sub}</Text>

        <View style={[styles.card, styles.transit]}>
          <View style={styles.disc}>
            <Archive size={t.discGlyph} color={c.ink} fill={c.ink} strokeWidth={1.4} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.rowTitle}>{d.transitTitle}</Text>
            <Text style={styles.rowSub}>{d.transitSub}</Text>
          </View>
          <View style={[styles.tag, styles.tagGreen]}>
            <Text style={[styles.tagText, styles.tagTextGreen]}>{d.insured}</Text>
          </View>
        </View>

        <View style={styles.secRow}>
          <View style={styles.secLead}>
            <CircleDot size={t.secIcon} color={c.brown} strokeWidth={2.2} />
            <Text style={styles.secText}>{d.pickupLabel}</Text>
          </View>
          <View style={[styles.secPill, styles.secPillGrey]}>
            <Text style={styles.secPillText}>{d.origin}</Text>
          </View>
        </View>
        <View style={[styles.card, styles.person]}>
          <View style={styles.between}>
            <View style={styles.nameRow}>
              <Text style={styles.name} {...shrinkToFit(0.8)}>
                {d.pickupName}
              </Text>
              <BadgeCheck size={t.nameIcon} color={c.card} fill={c.greenInk} strokeWidth={2} />
            </View>
            {/* Inert — no address editor is drawn. */}
            <View style={styles.change}>
              <Pencil size={t.changeIcon} color={c.inkWarm} strokeWidth={2} />
              <Text style={styles.changeText}>{d.change}</Text>
            </View>
          </View>
          <View style={styles.addr}>
            <MapPin size={t.addrIcon} color={c.inkWarm} strokeWidth={1.8} />
            <Text style={styles.addrText}>{d.pickupAddr}</Text>
          </View>
          <View style={styles.phoneRow}>
            <Phone size={t.phoneIcon} color={c.inkWarm} strokeWidth={1.8} />
            <Text style={styles.phone}>{d.pickupPhone}</Text>
            <View style={styles.reg}>
              <Text style={styles.regText} {...shrinkToFit(0.7)}>
                {d.registered}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.secRow}>
          <View style={styles.secLead}>
            <MapPin size={t.secIcon} color={c.ink} strokeWidth={1.9} />
            <Text style={styles.secText}>{d.deliverLabel}</Text>
          </View>
          <View style={[styles.secPill, styles.secPillGreen]}>
            <Text style={[styles.secPillText, styles.tagTextGreen]}>{d.destination}</Text>
          </View>
        </View>
        <View style={[styles.card, styles.person]}>
          <View style={styles.advTop}>
            <View style={styles.flex}>
              <Text style={styles.name} {...shrinkToFit(0.8)}>
                {d.advName}
              </Text>
              <Text style={styles.firm}>{d.firm}</Text>
            </View>
            {/* Inert — no map or address sheet is drawn. */}
            <View style={styles.viewAddr}>
              <Eye size={t.viewAddrIcon} color={c.inkWarm} strokeWidth={1.9} />
              <Text style={styles.viewAddrText}>{d.viewAddress}</Text>
            </View>
          </View>
          <View style={[styles.addr, styles.advAddr]}>
            <Building size={t.addrIcon} color={c.inkWarm} strokeWidth={1.8} />
            <Text style={[styles.addrText, styles.advAddrText]}>{d.advAddr}</Text>
          </View>
          <View style={[styles.phoneRow, styles.advPhone]}>
            <Phone size={t.phoneIcon} color={c.inkWarm} strokeWidth={1.8} />
            <Text style={styles.phone}>{d.advPhone}</Text>
          </View>
          <View style={styles.chamber}>
            <ShieldCheck size={t.chamberIcon} color={c.card} fill={c.greenInk} strokeWidth={1.8} />
            <Text style={styles.chamberText} {...shrinkToFit(0.75)}>
              {d.chamber}
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.docs]}>
          <View style={styles.docsTop}>
            <View style={styles.docDisc}>
              <FolderOpen size={t.docGlyph} color={c.brownInk} strokeWidth={1.9} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.docTitle}>{d.docsTitle}</Text>
              <Text style={styles.docSub}>{d.docsSub}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/documents' as Href)}
              style={styles.viewDocs}
            >
              <Eye size={t.viewAddrIcon} color={c.brownInk} strokeWidth={1.9} />
              <Text style={[styles.viewAddrText, styles.viewDocsText]}>{d.viewDocs}</Text>
            </Pressable>
          </View>
          <View style={styles.chips}>
            {d.chips.map((ch) => (
              <View key={ch} style={styles.chip}>
                <Text style={styles.chipText}>{ch}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.det]}>
          <View style={styles.between}>
            <Text style={styles.detTitle}>{d.detTitle}</Text>
            <View style={styles.readyRow}>
              <View style={styles.readyDot} />
              <Text style={styles.readyText}>{d.ready}</Text>
            </View>
          </View>
          <View style={styles.grid}>
            {d.tiles.map((tile) => {
              const Icon = TILE_ICON[tile.icon];
              return (
                <View key={tile.label} style={styles.tile}>
                  <View style={styles.between}>
                    <View style={styles.tileLabelRow}>
                      <Icon size={t.tileIcon} color={tile.icon === 'clock' ? c.greenInk : c.inkWarm} strokeWidth={1.9} />
                      <Text style={styles.tileLabel} {...shrinkToFit(0.75)}>
                        {tile.label}
                      </Text>
                    </View>
                    {'tag' in tile && (
                      <View style={styles.auto}>
                        <Text style={styles.autoText}>{tile.tag}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.tileValue} {...shrinkToFit(0.75)}>
                    {tile.value}
                  </Text>
                  <Text style={styles.tileSub}>{tile.sub}</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.strip}>
            <SatelliteDish size={t.stripIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.stripText}>{d.tracking}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.fee]}>
          <View style={styles.between}>
            <View>
              <Text style={styles.feeLabel}>{d.feeLabel}</Text>
              <Text style={styles.feeValue}>{d.fee}</Text>
            </View>
            <View style={[styles.tag, styles.tagPeach]}>
              <Text style={[styles.tagText, styles.tagTextBrown]}>{d.feeTag}</Text>
            </View>
          </View>
          <View style={styles.feeNote}>
            <Text style={styles.feeLead}>{d.feeLead}</Text>
            <Text style={styles.feeNoteText}>{d.feeNote}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.custody]}>
          <View style={styles.docDisc2}>
            <ShieldHalf size={t.docGlyph} color={c.brownInk} fill={c.brownInk} strokeWidth={1.5} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.custodyTitle}>{d.custodyTitle}</Text>
            <Text style={styles.custodyBody}>{d.custodyBody}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <View style={styles.barTop}>
          <View style={styles.flex}>
            <Text style={styles.barLabel}>{d.barLabel}</Text>
            <Text style={styles.barTotal} {...shrinkToFit(0.8)}>
              {d.barTotal}
            </Text>
          </View>
          <View style={styles.barSec}>
            <ShieldCheck size={t.barSecIcon} color={c.greenInk} strokeWidth={2} />
            <Text style={styles.barSecText}>{d.secured}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/high-court/courier/confirm' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.foot}>
          <CircleCheck size={t.footIcon} color={c.greenInk} strokeWidth={2} />
          <Text style={styles.footText}>{d.foot}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.discGap },
  help: { marginRight: t.helpGap },

  pill: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  step: { marginTop: t.pillTop, backgroundColor: c.peach },
  stepDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.brown },
  powered: { marginTop: t.poweredTop, backgroundColor: c.helpGrey },
  pillText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.pillSize, color: c.inkWarm },
  stepText: { color: c.brownInk },
  h1: { marginTop: t.h1Top, fontFamily: font.appSemi, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  sub: { fontFamily: font.appBody, fontSize: t.subSize, lineHeight: t.subLineHeight, color: c.inkWarm },

  card: { ...shadow, marginLeft: t.cardLeft - t.padX, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  transit: { marginTop: t.transitTop, paddingVertical: t.transitPadY, flexDirection: 'row', alignItems: 'center', gap: t.discGap },
  disc: {
    width: t.disc,
    height: t.disc,
    borderRadius: t.disc / 2,
    backgroundColor: c.mint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontFamily: font.appSemi, fontSize: t.rowTitleSize, lineHeight: t.rowTitleLineHeight, color: c.ink },
  rowSub: { fontFamily: font.appBody, fontSize: t.rowSubSize, lineHeight: t.rowSubLineHeight, color: c.inkWarm },
  tag: { height: t.tagH, borderRadius: t.tagH / 2, paddingHorizontal: t.tagPadX, justifyContent: 'center' },
  tagGreen: { backgroundColor: c.greenSoft },
  tagPeach: { backgroundColor: c.peach },
  tagText: { fontFamily: font.appSemi, fontSize: t.tagSize },
  tagTextGreen: { color: c.greenInk },
  tagTextBrown: { color: c.brownInk },

  secRow: { marginTop: t.secTop, minHeight: t.secH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  secLead: { flexDirection: 'row', alignItems: 'center', gap: t.secIconGap },
  secText: { fontFamily: font.appSemi, fontSize: t.secSize, color: c.ink },
  secPill: { height: t.secPillH, borderRadius: t.secPillH / 2, paddingHorizontal: t.secPillPadX, justifyContent: 'center' },
  secPillGrey: { backgroundColor: c.helpGrey },
  secPillGreen: { backgroundColor: c.greenBanner },
  secPillText: { fontFamily: font.appSemi, fontSize: t.secPillSize, color: c.inkWarm },

  person: { marginTop: t.secCardTop, paddingTop: t.personPadTop, paddingBottom: t.personPadBottom },
  nameRow: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.changeGap },
  name: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.nameSize, lineHeight: t.nameLineHeight, color: c.ink },
  change: {
    height: t.changeH,
    borderRadius: t.changeH / 2,
    paddingHorizontal: t.changePadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.changeGap,
  },
  changeText: { fontFamily: font.appSemi, fontSize: t.changeSize, color: c.inkWarm },
  addr: { marginTop: t.addrTop, flexDirection: 'row', alignItems: 'flex-start', gap: t.addrGap },
  addrText: {
    flex: 1,
    paddingRight: t.addrPadRight,
    fontFamily: font.appBody,
    fontSize: t.addrSize,
    lineHeight: t.addrLineHeight,
    color: c.inkWarm,
  },
  advAddr: { marginTop: t.advAddrTop },
  advAddrText: { lineHeight: t.advAddrLineHeight },
  advPhone: { marginTop: t.advPhoneTop },
  phoneRow: { marginTop: t.phoneTop, flexDirection: 'row', alignItems: 'center', gap: t.addrGap + 2 },
  phone: { fontFamily: font.appSemi, fontSize: t.phoneSize, color: c.ink },
  reg: { flexShrink: 1, height: t.regH, borderRadius: t.regH / 2, paddingHorizontal: t.regPadX, backgroundColor: c.helpGrey, justifyContent: 'center' },
  regText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.regSize, color: c.inkWarm },

  advTop: { flexDirection: 'row', alignItems: 'flex-start', gap: t.discGap },
  firm: { fontFamily: font.appSemi, fontSize: t.firmSize, lineHeight: t.firmLineHeight, color: c.brownLift },
  viewAddr: {
    height: t.viewAddrH,
    borderRadius: t.viewAddrH / 2,
    paddingHorizontal: t.viewAddrPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.changeGap,
  },
  viewAddrText: {
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.viewAddrSize,
    lineHeight: t.viewAddrLineHeight,
    color: c.inkWarm,
  },
  chamber: {
    marginTop: t.chamberTop,
    minHeight: t.chamberH,
    borderRadius: t.chamberRadius,
    paddingHorizontal: t.chamberPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.changeGap + 2,
  },
  chamberText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.chamberSize, color: c.greenInk },

  docs: { marginTop: t.cardGap, paddingTop: t.docsPadTop, paddingBottom: t.docsPadBottom },
  docsTop: { flexDirection: 'row', alignItems: 'center', gap: t.docGap },
  docDisc: {
    width: t.docDisc,
    height: t.docDisc,
    borderRadius: t.docDisc / 2,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docDisc2: {
    width: t.docDisc,
    height: t.docDisc,
    borderRadius: t.docDisc / 2,
    backgroundColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: { fontFamily: font.appSemi, fontSize: t.docTitleSize, lineHeight: t.docTitleLineHeight, color: c.ink },
  docSub: { fontFamily: font.appBody, fontSize: t.docSubSize, lineHeight: t.docSubLineHeight, color: c.inkWarm },
  viewDocs: {
    height: t.viewDocsH,
    borderRadius: t.viewDocsH / 2,
    paddingHorizontal: t.viewDocsPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.changeGap + 2,
  },
  viewDocsText: { color: c.brownInk },
  chips: { marginTop: t.chipsTop, flexDirection: 'row', flexWrap: 'wrap', columnGap: t.chipGapX, rowGap: t.chipGapY },
  chip: { height: t.chipH, borderRadius: t.chipRadius, paddingHorizontal: t.chipPadX, backgroundColor: c.panel, justifyContent: 'center' },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: c.inkWarm },

  det: { marginTop: t.cardGap, paddingTop: t.detPadTop, paddingBottom: t.detPadBottom },
  detTitle: { fontFamily: font.appSemi, fontSize: t.detTitleSize, lineHeight: t.detTitleLineHeight, color: c.ink },
  readyRow: { flexDirection: 'row', alignItems: 'center', gap: t.changeGap },
  readyDot: { width: t.readyDot, height: t.readyDot, borderRadius: t.readyDot / 2, backgroundColor: c.greenInk },
  readyText: { fontFamily: font.appSemi, fontSize: t.readySize, color: c.greenInk },
  grid: { marginTop: t.gridTop, flexDirection: 'row', flexWrap: 'wrap', gap: t.gridGap },
  tile: {
    flexBasis: '45%',
    flexGrow: 1,
    minWidth: 0,
    borderRadius: t.tileRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.tilePadX,
    paddingTop: t.tilePadTop,
    paddingBottom: t.tilePadBottom,
  },
  tileLabelRow: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.tileIconGap },
  tileLabel: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.tileLabelSize, lineHeight: t.tileLabelLineHeight, color: c.inkWarm },
  auto: { height: t.autoH, borderRadius: t.autoRadius, paddingHorizontal: t.autoPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  autoText: { fontFamily: font.appBody, fontSize: t.autoSize, color: c.inkWarm },
  tileValue: { marginTop: t.tileValueTop, fontFamily: font.appSemi, fontSize: t.tileValueSize, lineHeight: t.tileValueLineHeight, color: c.ink },
  tileSub: { marginTop: t.tileSubTop, fontFamily: font.appBody, fontSize: t.tileSubSize, lineHeight: t.tileSubLineHeight, color: c.inkWarm },
  strip: {
    marginTop: t.stripTop,
    borderRadius: t.tileRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.stripPadX,
    paddingVertical: t.stripPadY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.stripGap,
  },
  stripText: { flex: 1, fontFamily: font.appBody, fontSize: t.stripSize, lineHeight: t.stripLineHeight, color: c.inkWarm },

  fee: { marginTop: t.cardGap, paddingTop: t.feePadTop, paddingBottom: t.feePadBottom },
  feeLabel: { fontFamily: font.appSemi, fontSize: t.feeLabelSize, lineHeight: t.feeLabelLineHeight, color: c.inkWarm },
  feeValue: { fontFamily: font.appHeading, fontSize: t.feeSize, lineHeight: t.feeLineHeight, color: c.ink },
  feeNote: {
    marginTop: t.feeNoteTop,
    borderRadius: t.feeNoteRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.feeNotePadX,
    paddingVertical: t.feeNotePadY,
  },
  feeLead: { fontFamily: font.appBody, fontSize: t.feeNoteLeadSize, lineHeight: t.feeNoteLeadLineHeight, color: c.ink },
  feeNoteText: {
    marginTop: t.feeNoteBodyTop,
    fontFamily: font.appBody,
    fontSize: t.feeNoteSize,
    lineHeight: t.feeNoteLineHeight,
    color: c.inkWarm,
  },

  custody: {
    marginTop: t.custodyTop,
    backgroundColor: c.peachSelect,
    paddingTop: t.custodyPadTop,
    paddingBottom: t.custodyPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.custodyGap,
  },
  custodyTitle: { fontFamily: font.appSemi, fontSize: t.custodyTitleSize, lineHeight: t.custodyTitleLineHeight, color: c.inkWarm },
  custodyBody: { fontFamily: font.appBody, fontSize: t.custodyBodySize, lineHeight: t.custodyBodyLineHeight, color: c.inkWarm },

  bar: {
    backgroundColor: c.page,
    borderTopWidth: 1,
    borderTopColor: c.panel,
    paddingHorizontal: t.barPadX,
    paddingTop: t.barPadTop,
  },
  barTop: { paddingHorizontal: t.barTextX - t.barPadX, flexDirection: 'row', alignItems: 'flex-end', gap: t.discGap },
  barLabel: { fontFamily: font.appBody, fontSize: t.barLabelSize, lineHeight: t.barLabelLineHeight, color: c.inkWarm },
  barTotal: { fontFamily: font.appSemi, fontSize: t.barTotalSize, lineHeight: t.barTotalLineHeight, color: c.ink },
  barSec: { flexDirection: 'row', alignItems: 'center', gap: t.barSecGap, marginBottom: (t.barTotalLineHeight - t.barSecSize) / 2 },
  barSecText: { fontFamily: font.appSemi, fontSize: t.barSecSize, color: c.greenInk },
  btn: {
    marginTop: t.btnTop,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
  },
  btnText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  foot: { marginTop: t.footTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.footGap },
  footText: { fontFamily: font.appBody, fontSize: t.footSize, lineHeight: t.footLineHeight, color: c.inkWarm },
});
