import { AdvocateAvatar } from '../../../components/AdvocateAvatar';
import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Clock,
  Gavel,
  Headset,
  Info,
  LockKeyhole,
  MessageSquareText,
  Phone,
  Scale,
  ShieldCheck,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { dcProcessFee as t, font, hcPalette as c, ink, shadow } from '../../../constants/theme';
import { DC_PROCESS_FEE } from '../../../data/districtCourt';

// District Court — process fee (design/321). Measured at 2.000 px/pt.
//
// Conflicts 2 and 5 are commented on DC_PROCESS_FEE: "Pay Process Fee (₹850)"
// opens the shared ₹40,680 payment (designs 322–324).
//
// Chat opens the advocate chat (design/301, cross-service); Call dials nothing.

export default function DistrictCourtProcessFeeScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_PROCESS_FEE;

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={t.hdrPadTop}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/court-filing' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.pills}>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText} {...shrinkToFit(0.7)}>
              {d.pill}
            </Text>
          </View>
          <View style={styles.task}>
            <ShieldCheck size={t.taskIcon} color={c.greenInk} strokeWidth={2} />
            <Text style={styles.taskText}>{d.task}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.req]}>
          <View style={styles.reqHead}>
            <View style={styles.flex}>
              <Text style={styles.caps}>{d.reqLabel}</Text>
              <Text style={styles.title}>{d.reqTitle}</Text>
            </View>
            <View style={styles.gavel}>
              <Gavel size={t.gavelGlyph} color={c.inkWarm} strokeWidth={1.9} />
            </View>
          </View>
          <View style={styles.quote}>
            <Text style={styles.quoteText}>{d.quote}</Text>
          </View>
          <View style={styles.adv}>
            <AdvocateAvatar name={'Adv. Abhishek Verma'} style={styles.av}><Text style={styles.avText}>{d.initials}</Text></AdvocateAvatar>
            <View style={styles.flex}>
              <Text style={styles.advName} {...shrinkToFit(0.8)}>
                {d.adv}
              </Text>
              <Text style={styles.advRole}>{d.advRole}</Text>
            </View>
            <View style={styles.dateCol}>
              <Text style={styles.dateLabel}>{d.dateLabel}</Text>
              <Text style={styles.date}>{d.date}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.req]}>
          <View style={styles.between}>
            <Text style={styles.amtHead} {...shrinkToFit(0.8)}>
              {d.amtTitle}
            </Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{d.amtTag}</Text>
            </View>
          </View>
          <View style={styles.amtRow}>
            <Text style={styles.amount}>{d.amount}</Text>
            <Text style={styles.unit}>{d.unit}</Text>
          </View>
          <Text style={styles.desc}>{d.amtDesc}</Text>
          <View style={styles.box}>
            {d.boxRows.map((r, i) => (
              <View
                key={r.label}
                style={[styles.between, i > 0 && styles.boxRowGap, 'total' in r && styles.boxTotal]}
              >
                <Text style={[styles.boxLabel, 'total' in r && styles.boxLabelTotal]}>{r.label}</Text>
                <Text
                  style={[
                    styles.boxValue,
                    'green' in r && styles.greenText,
                    'total' in r && styles.boxValueTotal,
                  ]}
                  {...shrinkToFit(0.8)}
                >
                  {r.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.req]}>
          <View style={styles.between}>
            <Text style={styles.caps}>{d.matterLabel}</Text>
            <Text style={styles.matterMeta}>{d.matterMeta}</Text>
          </View>
          <View style={styles.matterRow}>
            <Scale size={t.matterIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.matter} {...shrinkToFit(0.8)}>
              {d.matter}
            </Text>
          </View>
          <View style={styles.matterBox}>
            {d.matterCells.map(([l, v]) => (
              <View key={l} style={styles.flex}>
                <Text style={styles.matterLabel}>{l}</Text>
                <Text style={styles.matterValue}>{v}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.req]}>
          <View style={styles.clarRow}>
            <View style={styles.clarDisc}>
              <Headset size={t.clarGlyph} color={c.brown} strokeWidth={1.9} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.clarTitle}>{d.clarTitle}</Text>
              <Text style={styles.clarSub}>{d.clarSub}</Text>
            </View>
          </View>
          <View style={styles.btns}>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/services/high-court/chat' as Href)}
              style={styles.btn}
            >
              <MessageSquareText size={t.btnIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.btnText}>{d.chat}</Text>
            </Pressable>
            {/* Static — no call is placed. */}
            <View style={styles.btn}>
              <Phone size={t.btnIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.btnText}>{d.call}</Text>
            </View>
          </View>
        </View>

        <View style={styles.rec}>
          <View style={styles.recHead}>
            <Clock size={t.recIcon} color={c.ink} strokeWidth={2} />
            <Text style={styles.recTitle} {...shrinkToFit(0.8)}>
              {d.recTitle}
            </Text>
          </View>
          <Text style={styles.recBody}>{d.recBody}</Text>
          <View style={styles.recBox}>
            <Info size={t.recBoxIcon} color={c.greenInk} strokeWidth={2} />
            <Text style={styles.recBoxText}>{d.recBox}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.next]}>
          <View style={styles.between}>
            <Text style={styles.nextHead}>{d.nextTitle}</Text>
            <Text style={styles.nextMeta}>{d.nextMeta}</Text>
          </View>
          <View style={styles.items}>
            {d.next.map((n, i) => (
              <View key={n.title} style={styles.item}>
                <View style={[styles.num, i === 0 && styles.numFirst]}>
                  <Text style={[styles.numText, i === 0 && styles.numTextFirst]}>{i + 1}</Text>
                </View>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>{n.title}</Text>
                  <Text style={styles.itemDesc}>{n.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/district-court/process-fee-payment' as Href)}
          style={styles.cta}
        >
          <Text style={styles.ctaText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.ctaIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.foot}>
          <LockKeyhole size={t.footIcon} color={c.greenInk} strokeWidth={2.4} />
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
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.avGap },
  hdrSub: { fontSize: t.hdrSubSize },
  greenText: { color: c.greenInk },

  pills: { marginTop: t.pillsTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.pillGap },
  pill: {
    flexShrink: 1,
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.amberDot },
  pillText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: c.brownInk },
  task: {
    height: t.taskH,
    borderRadius: t.taskH / 2,
    paddingHorizontal: t.taskPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap - 2,
  },
  taskText: { fontFamily: font.appSemi, fontSize: t.taskSize, color: c.inkWarm },

  card: { ...shadow, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  req: { paddingTop: t.padTop, paddingBottom: t.padBottom },
  reqHead: { flexDirection: 'row', alignItems: 'flex-start', gap: t.avGap },
  caps: { fontFamily: font.appSemi, fontSize: t.capsSize, lineHeight: t.capsLineHeight, letterSpacing: t.capsSpacing, color: c.inkWarm },
  title: { marginTop: t.titleTop, fontFamily: font.appSemi, fontSize: t.titleSize, lineHeight: t.titleLineHeight, color: c.ink },
  gavel: { width: t.gavelDisc, height: t.gavelDisc, borderRadius: t.gavelDisc / 2, backgroundColor: c.panel, alignItems: 'center', justifyContent: 'center' },
  quote: {
    marginTop: t.quoteTop,
    borderRadius: t.quoteRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.quotePadX,
    paddingTop: t.quotePadTop,
    paddingBottom: t.quotePadBottom,
  },
  quoteText: { fontFamily: font.appBody, fontSize: t.quoteSize, lineHeight: t.quoteLineHeight, color: c.inkWarm },
  adv: { marginTop: t.advTop, flexDirection: 'row', alignItems: 'center', gap: t.avGap },
  av: { width: t.avDisc, height: t.avDisc, borderRadius: t.avDisc / 2, backgroundColor: c.avatarTan, alignItems: 'center', justifyContent: 'center' },
  avText: { fontFamily: font.appSemi, fontSize: t.avSize, color: ink.onBrand },
  advName: { fontFamily: font.appSemi, fontSize: t.advNameSize, lineHeight: t.advNameLineHeight, color: c.ink },
  advRole: { fontFamily: font.appBody, fontSize: t.advRoleSize, lineHeight: t.advRoleLineHeight, color: c.inkWarm },
  dateCol: { alignItems: 'flex-end' },
  dateLabel: { fontFamily: font.appBody, fontSize: t.dateLabelSize, color: c.inkWarm },
  date: { fontFamily: font.appSemi, fontSize: t.dateSize, color: c.ink },

  amtHead: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.amtHeadSize, lineHeight: t.amtHeadLineHeight, color: c.ink },
  tag: { height: t.tagH, borderRadius: t.tagH / 2, paddingHorizontal: t.tagPadX, backgroundColor: c.peach, justifyContent: 'center' },
  tagText: { fontFamily: font.appSemi, fontSize: t.tagSize, color: c.brownInk },
  amtRow: { marginTop: t.amtTop, flexDirection: 'row', alignItems: 'baseline', gap: t.unitGap },
  amount: { fontFamily: font.appHeading, fontSize: t.amtSize, lineHeight: t.amtLineHeight, color: c.ink },
  unit: { fontFamily: font.appBody, fontSize: t.unitSize, color: c.inkWarm },
  desc: { marginTop: t.descTop, fontFamily: font.appBody, fontSize: t.descSize, lineHeight: t.descLineHeight, color: c.inkWarm },
  box: {
    marginTop: t.boxTop,
    borderRadius: t.boxRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.boxPadX,
    paddingTop: t.boxPadTop,
    paddingBottom: t.boxPadBottom,
  },
  boxRowGap: { marginTop: t.boxRowGap },
  boxTotal: { marginTop: t.boxTotalTop },
  boxLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.boxLabelSize, lineHeight: t.boxLineHeight, color: c.inkWarm },
  boxLabelTotal: { color: c.ink },
  boxValue: { fontFamily: font.appSemi, fontSize: t.boxValueSize, lineHeight: t.boxLineHeight, color: c.ink },
  boxValueTotal: { fontFamily: font.appHeading },

  matterMeta: { fontFamily: font.appSemi, fontSize: t.capsSize + 1, color: c.inkWarm },
  matterRow: { marginTop: t.matterTitleTop, flexDirection: 'row', alignItems: 'center', gap: t.matterGap },
  matter: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.matterSize, lineHeight: t.matterLineHeight, color: c.ink },
  matterBox: {
    marginTop: t.matterBoxTop,
    borderRadius: t.matterBoxRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.matterBoxPadX,
    paddingVertical: t.matterBoxPadY,
    flexDirection: 'row',
    gap: t.avGap,
  },
  matterLabel: { fontFamily: font.appBody, fontSize: t.matterLabelSize, lineHeight: t.matterLabelLineHeight, color: c.inkWarm },
  matterValue: { fontFamily: font.appSemi, fontSize: t.matterValueSize, lineHeight: t.matterValueLineHeight, color: c.ink },

  clarRow: { flexDirection: 'row', alignItems: 'center', gap: t.clarGap },
  clarDisc: { width: t.clarDisc, height: t.clarDisc, borderRadius: t.clarDisc / 2, backgroundColor: c.tileGrey, alignItems: 'center', justifyContent: 'center' },
  clarTitle: { fontFamily: font.appSemi, fontSize: t.clarTitleSize, lineHeight: t.clarTitleLineHeight, color: c.ink },
  clarSub: { fontFamily: font.appBody, fontSize: t.clarSubSize, lineHeight: t.clarSubLineHeight, color: c.inkWarm },
  btns: { marginTop: t.btnsTop, flexDirection: 'row', gap: t.btnGap },
  btn: {
    flex: 1,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnIconGap,
  },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: c.ink },

  rec: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.recPadTop,
    paddingBottom: t.recPadBottom,
  },
  recHead: { flexDirection: 'row', alignItems: 'center', gap: t.recGap },
  recTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.recTitleSize, lineHeight: t.recTitleLineHeight, color: c.ink },
  recBody: { marginTop: t.recBodyTop, fontFamily: font.appBody, fontSize: t.recBodySize, lineHeight: t.recBodyLineHeight, color: c.inkWarm },
  recBox: {
    marginTop: t.recBoxTop,
    borderRadius: t.recBoxRadius,
    backgroundColor: c.card,
    paddingHorizontal: t.recBoxPadX,
    paddingTop: t.recBoxPadTop,
    paddingBottom: t.recBoxPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.recBoxGap,
  },
  recBoxText: { flex: 1, fontFamily: font.appBody, fontSize: t.recBoxSize, lineHeight: t.recBoxLineHeight, color: c.ink },

  next: { paddingTop: t.nextPadTop, paddingBottom: t.nextPadBottom },
  nextHead: { fontFamily: font.appSemi, fontSize: t.nextHeadSize, lineHeight: t.nextHeadLineHeight, color: c.ink },
  nextMeta: { fontFamily: font.appBody, fontSize: t.nextMetaSize, color: c.inkWarm },
  items: { marginTop: t.itemsTop, gap: t.itemGap },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: t.numGap },
  num: {
    marginTop: (t.itemTitleLineHeight - t.num) / 2 + 3,
    width: t.num,
    height: t.num,
    borderRadius: t.num / 2,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numFirst: { backgroundColor: c.peach },
  numText: { fontFamily: font.appSemi, fontSize: t.numSize, color: c.ink },
  numTextFirst: { color: c.brownInk },
  itemTitle: { fontFamily: font.appSemi, fontSize: t.itemTitleSize, lineHeight: t.itemTitleLineHeight, color: c.ink },
  itemDesc: { fontFamily: font.appBody, fontSize: t.itemDescSize, lineHeight: t.itemDescLineHeight, color: c.inkWarm },

  bar: { backgroundColor: c.page, borderTopWidth: 1, borderTopColor: c.panel, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
  cta: {
    ...shadow,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.ctaGap,
  },
  ctaText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.ctaSize, color: ink.onBrand },
  foot: { marginTop: t.footTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.footGap },
  footText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.footSize, lineHeight: t.footLineHeight, color: c.inkWarm },
});
