import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  FileText,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  UserRound,
  Zap,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import CourierHeader from '../../components/CourierHeader';
import { shrinkToFit } from '../../constants/textFit';
import { ADVOCATE, CLIENT, CO_DETAILS } from '../../data/courier';
import { courierDetails as t, courierGreen as g, font, ink } from '../../constants/theme';

// Client — delivery details before booking (design/276).
//
// ⚠ Note 12 — this export is drawn almost entirely with bracketed placeholders:
//   [Client Name], [Pickup Address], [City], [State] - [PIN], [Mobile Number],
//   [Advocate Name], [Receiver Address], [Document Count] Documents,
//   [Document Name] x3, [Weight], [Date / Time] and [₹ Amount]. Real sample
//   values from data/courier.ts are rendered instead of the brackets; every
//   one of them is listed in PLACEHOLDERS there, which is the list of fields
//   the client still has to specify.
// ⚠ Note 5 — "Powered by Blue Dart" here, "DHL Express" on design/281.
//
// STATIC, NOT WIRED: "Change", "View Address" and "View Documents" open
// nothing. "Book Delivery" advances to design/280 and does not book anything —
// no courier vendor is scoped.
export default function CourierDeliveryDetailsScreen() {
  const d = CO_DETAILS;

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.notice}>
          <View style={styles.noticeCircle}>
            <ShieldCheck size={t.noticeGlyph} color={t.brand} strokeWidth={2} />
          </View>
          <Text style={styles.noticeText}>{d.notice}</Text>
        </View>

        <View style={styles.partner}>
          <View style={styles.partnerRow}>
            <View style={styles.tile}>
              <Truck size={t.tileGlyph} color={t.inkMuted} strokeWidth={1.9} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.partnerTitle}>{d.partnerTitle}</Text>
              <Text style={styles.partnerSub}>{d.partnerSub}</Text>
            </View>
            <View style={styles.sel}>
              <View style={styles.selDot} />
              <Text style={styles.selText} {...shrinkToFit(0.8)}>
                {d.selected}
              </Text>
            </View>
          </View>
          <View style={styles.powered}>
            <Zap size={t.poweredGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.poweredText} {...shrinkToFit(0.8)}>
              {d.powered}
            </Text>
          </View>
          <Text style={styles.direct} {...shrinkToFit(0.8)}>
            {'• ' + d.direct}
          </Text>
        </View>

        <AddressCard
          icon="pin"
          title={d.pickupTitle}
          action={d.pickupAction}
          name={CLIENT.name}
          lines={[CLIENT.address, CLIENT.cityLine]}
          phone={CLIENT.mobile}
        />
        <AddressCard
          icon="building"
          title={d.sendTitle}
          action={d.sendAction}
          name={ADVOCATE.name}
          lines={[ADVOCATE.office, `${ADVOCATE.city}, ${ADVOCATE.state} - ${ADVOCATE.pin}`]}
          phone={ADVOCATE.mobile}
        />

        <View style={styles.card}>
          <View style={styles.headRow}>
            <FileText size={t.headGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
              {d.docsTitle}
            </Text>
            <View style={styles.flex} />
            <View style={styles.count}>
              <Text style={styles.countText} {...shrinkToFit(0.8)}>
                {d.docsCount}
              </Text>
            </View>
          </View>
          {d.docs.map((n, i) => (
            <View key={n} style={[styles.docRow, i === 0 ? styles.docRowFirst : styles.docRowNext]}>
              <FileText size={t.docRowGlyph} color={t.brand} strokeWidth={2} />
              <Text style={styles.docRowText} {...shrinkToFit(0.8)}>
                {n}
              </Text>
            </View>
          ))}
          <View style={styles.viewDocsRow}>
            <Text style={styles.viewDocs} {...shrinkToFit(0.8)}>
              {d.viewDocs}
            </Text>
            <ArrowUpRight size={t.docRowGlyph} color={t.brand} strokeWidth={2} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.headRow}>
            <Truck size={t.headGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
              {d.deliveryTitle}
            </Text>
          </View>
          <View style={styles.grid}>
            {d.cells.map((c, i) => (
              <View
                key={c.label}
                style={[styles.cell, i % 2 === 1 && styles.cellRight, i > 1 && styles.cellLower]}
              >
                <Text style={styles.cellLabel} {...shrinkToFit(0.8)}>
                  {c.label}
                </Text>
                <Text style={styles.cellValue} {...shrinkToFit(0.75)}>
                  {c.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.feeRow}>
            <Text style={styles.feeTitle} {...shrinkToFit(0.8)}>
              {d.feeTitle}
            </Text>
            <Text style={styles.feeAmount} {...shrinkToFit(0.8)}>
              {d.feeAmount}
            </Text>
          </View>
          <View style={styles.feeNote}>
            <Info size={t.feeNoteGlyph} color={t.inkMuted} strokeWidth={2} />
            <Text style={styles.feeNoteText}>{d.feeNote}</Text>
          </View>
        </View>

        <View style={styles.banner}>
          <View style={styles.bannerCircle}>
            <ShieldCheck size={t.bannerGlyph} color={t.brand} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.bannerTitle}>{d.bannerTitle}</Text>
            <Text style={styles.bannerBody}>{d.bannerBody}</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => router.push('/courier/payment' as Href)}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.ctaGlyph} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.foot} {...shrinkToFit(0.8)}>
          {d.foot}
        </Text>
      </ScrollView>
    </View>
  );
}

function AddressCard({
  icon,
  title,
  action,
  name,
  lines,
  phone,
}: {
  icon: 'pin' | 'building';
  title: string;
  action: string;
  name: string;
  lines: string[];
  phone: string;
}) {
  const Glyph = icon === 'pin' ? MapPin : Building2;
  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <Glyph size={t.headGlyph} color={t.brand} strokeWidth={2} />
        <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
          {title}
        </Text>
        <View style={styles.flex} />
        <Text style={styles.link} {...shrinkToFit(0.8)}>
          {action}
        </Text>
      </View>
      <View style={styles.box}>
        <View style={styles.boxRow}>
          <View style={styles.avatarBox}>
            <UserRound size={t.avatarGlyph} color={t.inkMuted} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.addrName} {...shrinkToFit(0.8)}>
              {name}
            </Text>
            {lines.map((l) => (
              <Text key={l} style={styles.addrLine} {...shrinkToFit(0.8)}>
                {l}
              </Text>
            ))}
            <View style={styles.phoneRow}>
              <Phone size={t.addrPhoneGlyph} color={t.inkMuted} strokeWidth={2} />
              <Text style={styles.addrPhone} {...shrinkToFit(0.8)}>
                {phone}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingBottom: t.bottomPad },
  flex: { flex: 1 },
  pressed: { opacity: 0.9 },

  notice: {
    marginTop: t.noticeTop,
    marginHorizontal: t.padX,
    height: t.noticeH,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.noticePadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  noticeCircle: {
    width: t.noticeGlyphCircle,
    height: t.noticeGlyphCircle,
    borderRadius: t.noticeGlyphCircle / 2,
    backgroundColor: t.noticeCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.noticeGap,
  },
  noticeText: {
    flex: 1,
    fontFamily: font.appBody,
    fontSize: t.noticeSize,
    lineHeight: t.noticeLine,
    color: t.inkMuted,
  },

  partner: {
    marginTop: t.partnerTop,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.partnerPadX,
    paddingTop: t.partnerPadTop,
    paddingBottom: t.partnerPadBottom,
  },
  partnerRow: { flexDirection: 'row' },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: t.tileBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.tileGap,
  },
  partnerTitle: {
    fontFamily: font.appHeading,
    fontSize: t.partnerTitleSize,
    lineHeight: t.partnerTitleLine,
    color: t.ink,
  },
  partnerSub: {
    marginTop: t.partnerSubTop,
    fontFamily: font.appBody,
    fontSize: t.partnerSubSize,
    lineHeight: t.partnerSubLine,
    color: t.inkMuted,
  },
  sel: {
    height: t.selH,
    borderRadius: t.selRadius,
    paddingHorizontal: t.selPadX,
    backgroundColor: g.recBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selDot: {
    width: t.selDot,
    height: t.selDot,
    borderRadius: t.selDot / 2,
    backgroundColor: g.recInk,
  },
  selText: {
    marginLeft: t.selGap,
    fontFamily: font.appSemi,
    fontSize: t.selSize,
    color: g.recInk,
  },
  powered: {
    marginTop: t.poweredTop,
    alignSelf: 'flex-start',
    height: t.poweredH,
    borderRadius: t.poweredRadius,
    paddingHorizontal: t.poweredPadX,
    backgroundColor: t.poweredBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  poweredText: {
    marginLeft: t.poweredGap,
    fontFamily: font.appSemi,
    fontSize: t.poweredSize,
    color: t.inkMuted,
  },
  direct: {
    marginTop: t.directTop,
    fontFamily: font.appBody,
    fontSize: t.directSize,
    color: t.inkMuted,
  },

  card: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  headRow: { flexDirection: 'row', alignItems: 'center' },
  headTitle: {
    marginLeft: t.headGap,
    fontFamily: font.appHeading,
    fontSize: t.headSize,
    color: t.ink,
  },
  link: { fontFamily: font.appSemi, fontSize: t.linkSize, color: t.brand },
  box: {
    marginTop: t.boxTop,
    borderRadius: t.boxRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.boxPadX,
    paddingVertical: t.boxPadY,
  },
  boxRow: { flexDirection: 'row' },
  avatarBox: {
    width: t.avatarBox,
    height: t.avatarBox,
    borderRadius: t.avatarBox / 2,
    backgroundColor: '#E8E4E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.avatarGap,
  },
  addrName: { fontFamily: font.appHeading, fontSize: t.addrNameSize, color: t.ink },
  addrLine: {
    marginTop: t.addrLineTop,
    fontFamily: font.appBody,
    fontSize: t.addrLineSize,
    color: t.inkMuted,
  },
  phoneRow: { marginTop: t.addrPhoneTop, flexDirection: 'row', alignItems: 'center' },
  addrPhone: {
    marginLeft: t.addrPhoneGap,
    fontFamily: font.appBody,
    fontSize: t.addrLineSize,
    color: t.inkMuted,
  },

  count: {
    height: t.countH,
    borderRadius: t.countRadius,
    paddingHorizontal: t.countPadX,
    backgroundColor: t.countBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontFamily: font.appSemi, fontSize: t.countSize, color: t.inkMuted },
  docRow: {
    height: t.docRowH,
    borderRadius: t.docRowRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.docRowPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docRowFirst: { marginTop: t.docRowTop },
  docRowNext: { marginTop: t.docRowGapY },
  docRowText: {
    marginLeft: t.docRowGap,
    fontFamily: font.appBody,
    fontSize: t.docRowSize,
    color: t.inkMuted,
  },
  viewDocsRow: {
    marginTop: t.viewDocsTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDocs: {
    marginRight: 5,
    fontFamily: font.appSemi,
    fontSize: t.viewDocsSize,
    color: t.brand,
  },

  grid: { marginTop: t.gridTop, flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '48.9%',
    minHeight: t.cellH,
    borderRadius: t.cellRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.cellPadX,
    paddingVertical: t.cellPadY,
  },
  cellRight: { marginLeft: '2.2%' },
  cellLower: { marginTop: t.gridGap },
  cellLabel: { fontFamily: font.appBody, fontSize: t.cellLabelSize, color: t.inkMuted },
  cellValue: {
    marginTop: t.cellValueTop,
    fontFamily: font.appHeading,
    fontSize: t.cellValueSize,
    color: t.ink,
  },

  feeRow: { flexDirection: 'row', alignItems: 'center' },
  feeTitle: { flex: 1, fontFamily: font.appHeading, fontSize: t.feeTitleSize, color: t.ink },
  feeAmount: { fontFamily: font.appHeading, fontSize: t.feeAmountSize, color: t.ink },
  feeNote: {
    marginTop: t.feeNoteTop,
    borderRadius: t.feeNoteRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.feeNotePadX,
    paddingVertical: t.feeNotePadY,
    flexDirection: 'row',
  },
  feeNoteText: {
    flex: 1,
    marginLeft: t.feeNoteGap,
    fontFamily: font.appBody,
    fontSize: t.feeNoteSize,
    lineHeight: t.feeNoteLine,
    color: t.inkMuted,
  },

  banner: {
    marginTop: t.bannerTop,
    marginHorizontal: t.padX,
    borderRadius: t.bannerRadius,
    backgroundColor: t.bannerBg,
    paddingHorizontal: t.bannerPadX,
    paddingVertical: t.bannerPadY,
    flexDirection: 'row',
  },
  bannerCircle: {
    width: t.bannerCircle,
    height: t.bannerCircle,
    borderRadius: t.bannerCircle / 2,
    backgroundColor: t.bannerCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.bannerGap,
  },
  bannerTitle: {
    fontFamily: font.appHeading,
    fontSize: t.bannerTitleSize,
    lineHeight: t.bannerTitleLine,
    color: t.ink,
  },
  bannerBody: {
    marginTop: t.bannerBodyTop,
    fontFamily: font.appBody,
    fontSize: t.bannerBodySize,
    lineHeight: t.bannerBodyLine,
    color: t.inkMuted,
  },

  cta: {
    marginTop: t.ctaTop,
    marginHorizontal: t.padX,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: t.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    marginRight: t.ctaGap,
    fontFamily: font.appHeading,
    fontSize: t.ctaSize,
    color: ink.onBrand,
  },
  foot: {
    marginTop: t.footTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.footSize,
    color: t.inkMuted,
  },
});
