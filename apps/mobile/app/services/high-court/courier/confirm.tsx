import { router, type Href } from 'expo-router';
import {
  Archive,
  ArrowRight,
  BadgeCheck,
  Check,
  CircleDot,
  CircleQuestionMark,
  Clock,
  FileText,
  Gavel,
  Info,
  Landmark,
  LockKeyhole,
  MapPin,
  Navigation,
  Pencil,
  Phone,
  Shield,
  Truck,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import { courierHeader as h, font, hcCourierConfirm as t, hcPalette as c, ink, shadow } from '../../../../constants/theme';
import { HC_COURIER_CONFIRM } from '../../../../data/highCourt';

// High Court courier — confirm delivery (design/306). Measured at 2.000 px/pt.
//
// Conflicts 6 and 9 and the ₹250 fee are commented on HC_COURIER_CONFIRM.
//
// Book Delivery is drawn DISABLED (grey) with the checkbox unticked. Ticking the
// box enables it; the enabled colour is not drawn, so it takes the batch's
// brown primary — flagged, not designed. Enabled, it opens the existing courier
// payment (design/307 = 277) with ?flow=hcr, whose success screen hands back to
// this flow's shipment screen (design/310).
//
// The map is a neutral block at the drawn size — no map asset or SDK. Edit is
// inert (no editor drawn); View List opens the client's documents list.

export default function HighCourtCourierConfirmScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_COURIER_CONFIRM;
  const [checked, setChecked] = useState(false);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        center
        backHref={'/services/high-court/courier/booking' as Href}
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
        <View style={styles.pills}>
          <View style={[styles.pill, styles.stepPill]}>
            <View style={styles.dot} />
            <Text style={[styles.pillText, styles.brownText]} {...shrinkToFit(0.7)}>
              {d.step}
            </Text>
          </View>
          <View style={[styles.pill, styles.greenPill]}>
            <BadgeCheck size={t.pillIcon} color={c.greenInk} strokeWidth={2} />
            <Text style={[styles.pillText, styles.greenText]} {...shrinkToFit(0.75)}>
              {d.verified}
            </Text>
          </View>
        </View>
        <Text style={styles.intro}>{d.intro}</Text>

        <View style={[styles.card, styles.mapCard]}>
          <View style={styles.map}>
            <View style={styles.routePill}>
              <Navigation size={t.routeIcon} color={c.ink} strokeWidth={2} />
              <Text style={styles.routePillText}>{d.route}</Text>
            </View>
          </View>
          <View style={styles.routeRow}>
            <View style={styles.routeEnd}>
              <CircleDot size={t.phoneIcon} color={c.brown} strokeWidth={2.2} />
              <Text style={styles.routeText} {...shrinkToFit(0.75)}>
                {d.from}
              </Text>
            </View>
            <View style={styles.dash} />
            <Truck size={t.phoneIcon} color={c.inkWarm} strokeWidth={1.9} />
            <View style={styles.dash} />
            <View style={styles.routeEnd}>
              <Gavel size={t.phoneIcon} color={c.greenInk} strokeWidth={2} />
              <Text style={[styles.routeText, styles.greenText]} {...shrinkToFit(0.75)}>
                {d.to}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.addrCard, styles.addrFirst]}>
          <View style={styles.head}>
            <View style={[styles.disc, styles.discPeach]}>
              <MapPin size={t.discGlyph} color={c.brown} strokeWidth={2} />
            </View>
            <Text style={styles.headText}>{d.sendFrom}</Text>
            <View style={[styles.tag, styles.tagGrey]}>
              <Text style={styles.tagText} {...shrinkToFit(0.75)}>
                {d.pickupTag}
              </Text>
            </View>
            {/* Inert — no address editor is drawn. */}
            <View style={styles.edit}>
              <Text style={styles.editText}>{d.edit}</Text>
              <Pencil size={t.editIcon} color={c.brown} strokeWidth={2} />
            </View>
          </View>
          <View style={styles.body}>
            <Text style={styles.name}>{d.fromName}</Text>
            <Text style={styles.addr}>{d.fromAddr}</Text>
            <View style={styles.phoneRow}>
              <Phone size={t.phoneIcon} color={c.ink} strokeWidth={1.8} />
              <Text style={styles.phone}>{d.fromPhone}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.addrCard]}>
          <View style={styles.head}>
            <View style={[styles.disc, styles.discGreen]}>
              <Landmark size={t.discGlyph} color={c.greenInk} strokeWidth={2} />
            </View>
            <Text style={styles.headText}>{d.sendTo}</Text>
            <View style={[styles.tag, styles.tagGreen]}>
              <BadgeCheck size={t.tagIcon} color={c.greenInk} strokeWidth={2} />
              <Text style={[styles.tagText, styles.greenText]} {...shrinkToFit(0.75)}>
                {d.toTag}
              </Text>
            </View>
          </View>
          <View style={styles.body}>
            <Text style={styles.name}>{d.toName}</Text>
            <View style={styles.firmRow}>
              <Shield size={t.firmIcon} color={c.brownLift} strokeWidth={2} />
              <Text style={styles.firm} {...shrinkToFit(0.75)}>
                {d.toFirm}
              </Text>
            </View>
            <Text style={styles.addr}>{d.toAddr}</Text>
            <View style={styles.phoneRow}>
              <Phone size={t.phoneIcon} color={c.ink} strokeWidth={1.8} />
              <Text style={styles.phone}>{d.toPhone}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.con]}>
          <View style={styles.conHead}>
            <Archive size={t.conTitleIcon} color={c.ink} strokeWidth={1.8} />
            <Text style={styles.conTitle} {...shrinkToFit(0.8)}>
              {d.conTitle}
            </Text>
          </View>
          <View style={styles.items}>
            <View style={styles.item}>
              <View style={[styles.itemTile, styles.tileGrey]}>
                <FileText size={t.itemGlyph} color={c.inkWarm} strokeWidth={1.9} />
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{d.docsTitle}</Text>
                <Text style={styles.itemSub}>{d.docsSub}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => router.push('/documents' as Href)}>
                <Text style={[styles.itemRight, styles.brownText]}>{d.viewList}</Text>
              </Pressable>
            </View>
            <View style={styles.item}>
              <View style={[styles.itemTile, styles.tileBlue]}>
                <Truck size={t.itemGlyph} color={c.blueInk} fill={c.blueInk} strokeWidth={1.4} />
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{d.partnerTitle}</Text>
                <Text style={styles.itemSub}>{d.partnerSub}</Text>
              </View>
              <View style={styles.bluePill}>
                <Text style={styles.bluePillText}>{d.partnerPill}</Text>
              </View>
            </View>
            <View style={styles.item}>
              <View style={[styles.itemTile, styles.tileGreen]}>
                <Clock size={t.itemGlyph} color={c.greenInk} strokeWidth={2} />
              </View>
              <View style={styles.itemText}>
                <Text style={styles.itemTitle} {...shrinkToFit(0.8)}>
                  {d.etaTitle}
                </Text>
                <Text style={styles.itemSub}>{d.etaSub}</Text>
              </View>
              <Text style={styles.itemRight}>{d.eta}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.fee]}>
          <View style={styles.feeHead}>
            <Text style={styles.feeTitle}>{d.feeTitle}</Text>
            <View style={[styles.tag, styles.tagPeach, styles.feeTag]}>
              <Text style={[styles.tagText, styles.brownText, styles.feeTagText]}>{d.feeTag}</Text>
            </View>
            <Text style={styles.feeValue}>{d.fee}</Text>
          </View>
          <Text style={styles.feeBody}>{d.feeBody}</Text>
        </View>

        <View style={styles.warn}>
          <Info size={t.warnIcon} color={c.brownInk} strokeWidth={1.9} />
          <Text style={styles.warnText}>{d.warn}</Text>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          onPress={() => setChecked((v) => !v)}
          style={[styles.card, styles.check]}
        >
          <View style={[styles.box, checked && styles.boxOn]}>
            {checked && <Check size={t.box - 2} color={ink.onBrand} strokeWidth={3} />}
          </View>
          <View style={styles.flex}>
            <Text style={styles.checkTitle}>{d.checkTitle}</Text>
            <Text style={styles.checkSub}>{d.checkSub}</Text>
          </View>
        </Pressable>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>{d.barLabel}</Text>
          <Text style={styles.barTotal}>{d.barTotal}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !checked }}
          disabled={!checked}
          onPress={() => router.push('/courier/payment?flow=hcr' as Href)}
          style={[styles.btn, checked && styles.btnOn]}
        >
          <Text style={styles.btnText}>{d.cta}</Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.foot}>
          <LockKeyhole size={t.footIcon} color={c.greenInk} strokeWidth={2.2} />
          <Text style={styles.footText} {...shrinkToFit(0.75)}>
            {d.foot}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  flex: { flex: 1, minWidth: 0 },
  help: { marginRight: t.helpGap },
  brownText: { color: c.brownInk },
  greenText: { color: c.greenInk },

  pills: { marginTop: t.pillsTop, flexDirection: 'row', flexWrap: 'wrap', gap: t.pillGap },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
    flexShrink: 1,
  },
  stepPill: { backgroundColor: c.peach },
  greenPill: { backgroundColor: c.greenSoft },
  dot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.brown },
  pillText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.pillSize },
  intro: { marginTop: t.introTop, fontFamily: font.appBody, fontSize: t.introSize, lineHeight: t.introLineHeight, color: c.inkWarm },

  card: { ...shadow, marginLeft: t.cardLeft - t.padX, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  mapCard: { marginTop: t.mapTop, paddingTop: t.mapPadTop, paddingBottom: t.mapPadBottom },
  map: { height: t.mapH, borderRadius: t.mapRadius, backgroundColor: c.panel },
  routePill: {
    position: 'absolute',
    top: t.routePillTop,
    left: t.routePillLeft,
    height: t.routePillH,
    borderRadius: t.routePillH / 2,
    paddingHorizontal: t.routePillPadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.routeGap,
  },
  routePillText: { fontFamily: font.appSemi, fontSize: t.routeSize, color: c.ink },
  routeRow: { marginTop: t.routeTop, minHeight: t.routeRowH, flexDirection: 'row', alignItems: 'center', gap: t.routeDashGap },
  routeEnd: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.routeGap },
  routeText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.routeSize, color: c.inkWarm },
  dash: { flex: 1, minWidth: t.routeDashGap, borderTopWidth: 1, borderStyle: 'dashed', borderColor: c.tagMuted },

  addrCard: { marginTop: t.cardGap, paddingTop: t.addrPadTop, paddingBottom: t.addrPadBottom },
  addrFirst: { marginTop: t.addrFirstTop },
  head: { flexDirection: 'row', alignItems: 'center', gap: t.discGap },
  disc: { width: t.disc, height: t.disc, borderRadius: t.disc / 2, alignItems: 'center', justifyContent: 'center' },
  discPeach: { backgroundColor: c.peach },
  discGreen: { backgroundColor: c.greenTile },
  headText: { fontFamily: font.appSemi, fontSize: t.headSize, color: c.ink },
  tag: {
    flexShrink: 1,
    height: t.tagH,
    borderRadius: t.tagH / 2,
    paddingHorizontal: t.tagPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.routeGap - 1,
  },
  tagGrey: { backgroundColor: c.tileGrey },
  tagGreen: { backgroundColor: c.greenSoft },
  tagPeach: { backgroundColor: c.peach },
  tagText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.tagSize, color: c.inkWarm },
  edit: { marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: t.routeGap - 1 },
  editText: { fontFamily: font.appSemi, fontSize: t.editSize, color: c.brown },
  body: { paddingLeft: t.bodyX - t.cardLeft - t.cardPadX },
  name: { marginTop: t.nameTop, fontFamily: font.appSemi, fontSize: t.nameSize, lineHeight: t.nameLineHeight, color: c.ink },
  firmRow: { marginTop: t.firmTop, flexDirection: 'row', alignItems: 'center', gap: t.routeGap },
  firm: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.firmSize, lineHeight: t.firmLineHeight, color: c.brownLift },
  addr: { marginTop: t.addrTop, fontFamily: font.appBody, fontSize: t.addrSize, lineHeight: t.addrLineHeight, color: c.inkWarm },
  phoneRow: { marginTop: t.phoneTop, minHeight: t.phoneLineHeight, flexDirection: 'row', alignItems: 'center', gap: t.phoneGap },
  phone: { fontFamily: font.appBody, fontSize: t.phoneSize, color: c.ink },

  con: { marginTop: t.cardGap, paddingTop: t.conPadTop, paddingBottom: t.conPadBottom },
  conHead: { flexDirection: 'row', alignItems: 'center', gap: t.discGap },
  conTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.conTitleSize, lineHeight: t.conTitleLineHeight, color: c.ink },
  items: { marginTop: t.itemsTop, gap: t.itemGap },
  item: {
    borderRadius: t.itemRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.itemPadX,
    paddingVertical: t.itemPadY,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.itemGap2,
  },
  itemTile: { width: t.itemTile, height: t.itemTile, borderRadius: t.itemTileRadius, alignItems: 'center', justifyContent: 'center' },
  tileGrey: { backgroundColor: c.tileGrey },
  tileBlue: { backgroundColor: c.blueTile },
  tileGreen: { backgroundColor: c.greenTile },
  itemText: { flex: 1, minWidth: 0, paddingRight: t.itemTextPadR },
  itemTitle: { fontFamily: font.appSemi, fontSize: t.itemTitleSize, lineHeight: t.itemTitleLineHeight, color: c.ink },
  itemSub: { fontFamily: font.appBody, fontSize: t.itemSubSize, lineHeight: t.itemSubLineHeight, color: c.inkWarm },
  itemRight: { fontFamily: font.appSemi, fontSize: t.itemRightSize, lineHeight: t.itemRightLineHeight, color: c.ink },
  bluePill: {
    flexShrink: 1,
    borderRadius: 999,
    paddingHorizontal: t.bluePillPadX,
    paddingVertical: t.bluePillPadY,
    backgroundColor: c.blueTile,
  },
  bluePillText: { fontFamily: font.appSemi, fontSize: t.bluePillSize, lineHeight: t.bluePillLineHeight, color: c.blueInk },

  fee: { marginTop: t.feeTop, paddingTop: t.feePadTop, paddingBottom: t.feePadBottom },
  feeHead: { flexDirection: 'row', alignItems: 'center', gap: t.discGap + 3 },
  feeTitle: { fontFamily: font.appSemi, fontSize: t.feeTitleSize, color: c.ink },
  feeTag: { height: t.feeTagH },
  feeTagText: { fontSize: t.feeTagSize },
  feeValue: { marginLeft: 'auto', fontFamily: font.appHeading, fontSize: t.feeSize, lineHeight: t.feeLineHeight, color: c.brown },
  feeBody: { marginTop: t.feeBodyTop, fontFamily: font.appBody, fontSize: t.feeBodySize, lineHeight: t.feeBodyLineHeight, color: c.inkWarm },

  warn: {
    marginTop: t.warnTop,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.warnRadius,
    backgroundColor: c.peachSoft,
    paddingHorizontal: t.warnPadX,
    paddingVertical: t.warnPadY,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.warnGap,
  },
  warnText: { flex: 1, fontFamily: font.appBody, fontSize: t.warnSize, lineHeight: t.warnLineHeight, color: c.brownInk },

  check: {
    marginTop: t.checkTop,
    paddingTop: t.checkPadTop,
    paddingBottom: t.checkPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.boxGap,
  },
  box: {
    marginTop: (t.checkTitleLineHeight - t.box) / 2,
    width: t.box,
    height: t.box,
    borderRadius: t.boxRadius,
    borderWidth: t.boxBorder,
    borderColor: c.checkGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: c.brown, borderColor: c.brown },
  checkTitle: { fontFamily: font.appSemi, fontSize: t.checkTitleSize, lineHeight: t.checkTitleLineHeight, color: c.ink },
  checkSub: { marginTop: t.checkSubTop, fontFamily: font.appBody, fontSize: t.checkSubSize, lineHeight: t.checkSubLineHeight, color: c.inkWarm },

  bar: {
    backgroundColor: c.card,
    borderTopWidth: 1,
    borderTopColor: c.panel,
    paddingHorizontal: t.barPadX,
    paddingTop: t.barPadTop,
  },
  barRow: {
    paddingHorizontal: t.barTextX - t.barPadX,
    minHeight: t.barLineHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  barLabel: { fontFamily: font.appSemi, fontSize: t.barLabelSize, color: c.inkWarm },
  barTotal: { fontFamily: font.appSemi, fontSize: t.barTotalSize, color: c.ink },
  btn: {
    marginTop: t.btnTop,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.btnDisabled,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
  },
  btnOn: { backgroundColor: c.brown },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  foot: { marginTop: t.footTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.footGap },
  footText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.footSize, lineHeight: t.footLineHeight, color: c.inkWarm },
});
