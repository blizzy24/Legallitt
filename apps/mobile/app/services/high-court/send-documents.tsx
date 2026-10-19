import { router, type Href } from 'expo-router';
import {
  Archive,
  BadgeCheck,
  Check,
  CircleCheck,
  Eye,
  FolderOpen,
  Gavel,
  LockKeyhole,
  MessageCircleQuestionMark,
  Truck,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { font, hcPalette as c, hcSendDocs as t, ink, shadow } from '../../../constants/theme';
import { HC_SEND_DOCS } from '../../../data/highCourt';

// High Court — send documents (design/304). Measured at 2.000 px/pt.
//
// Conflicts 4 and 9 are commented on HC_SEND_DOCS.
//
// WIRED INTO THE COURIER FLOW, as instructed:
//   Legalitt Delivery (drawn selected) + Continue → design/305, the Blue Dart
//     booking under /services/high-court/courier/booking.
//   Send Yourself → the existing self-send flow, /courier/self/instructions
//     (design/280). Its selected state and its Continue label are not drawn,
//     so tapping the card goes straight there rather than inventing either.
// View opens the client's documents list. Nothing is uploaded or sent.

export default function HighCourtSendDocumentsScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_SEND_DOCS;
  const toBooking = () => router.push('/services/high-court/courier/booking' as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        plainChevron
        center
        backHref={'/services/high-court/documents-needed' as Href}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>{d.intro}</Text>

        <View style={[styles.card, styles.ref]}>
          <View style={styles.between}>
            <View style={styles.pill}>
              <FolderOpen size={t.pillIcon} color={c.inkWarm} strokeWidth={1.9} />
              <Text style={styles.pillText} {...shrinkToFit(0.75)}>
                {d.ref}
              </Text>
            </View>
            <BadgeCheck size={t.badgeIcon} color={c.greenInk} strokeWidth={1.9} />
          </View>
          <View style={styles.divider} />
          <View style={styles.grid}>
            {d.grid.map(([label, value], i) => (
              <View key={label} style={[styles.cell, i % 2 === 0 && styles.cell1]}>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.valueRow}>
                  <Text style={[styles.value, i === 0 && styles.advValue]} {...shrinkToFit(0.75)}>
                    {value}
                  </Text>
                  {i === 0 && <Gavel size={t.valueIcon} color={c.greenInk} strokeWidth={2} />}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, styles.ready]}>
          <View style={styles.flex}>
            <Text style={styles.readyTitle}>{d.readyTitle}</Text>
            <Text style={styles.readySub}>{d.readySub}</Text>
            <View style={styles.ver}>
              <CircleCheck size={t.verIcon} color={c.greenInk} strokeWidth={2.2} />
              <Text style={styles.verText}>{d.verified}</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/documents' as Href)}
            style={styles.view}
          >
            <Eye size={t.viewIcon} color={c.ink} strokeWidth={1.9} />
            <Text style={styles.viewText}>{d.view}</Text>
          </Pressable>
        </View>

        <Text style={styles.choose}>{d.chooseTitle}</Text>
        <Text style={styles.chooseSub}>{d.chooseSub}</Text>

        <Pressable accessibilityRole="radio" accessibilityState={{ checked: true }} onPress={toBooking} style={[styles.card, styles.opt, styles.optOn]}>
          <View style={styles.optTop}>
            <View style={[styles.tile, styles.tileOn]}>
              <Truck size={t.tileGlyph} color={c.inkWarm} strokeWidth={1.8} />
            </View>
            <View style={styles.optText}>
              <Text style={styles.optTitle} {...shrinkToFit(0.8)}>
                {d.legalitt.title}
              </Text>
              <View style={styles.powered}>
                <Text style={styles.poweredText}>{d.legalitt.powered}</Text>
              </View>
            </View>
            <View style={[styles.mark, styles.markOn]}>
              <Check size={t.markGlyph} color={ink.onBrand} strokeWidth={3} />
            </View>
          </View>
          <Text style={[styles.optDesc, styles.optDescOn]}>{d.legalitt.desc}</Text>
        </Pressable>

        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: false }}
          onPress={() => router.push('/courier/self/instructions' as Href)}
          style={[styles.card, styles.opt, styles.optSelf]}
        >
          <View style={styles.optTop}>
            <View style={styles.tile}>
              <Archive size={t.tileGlyph} color={c.inkWarm} strokeWidth={1.8} />
            </View>
            <View style={styles.optText}>
              <Text style={styles.optTitle} {...shrinkToFit(0.8)}>
                {d.self.title}
              </Text>
              <Text style={styles.selfSub}>{d.self.sub}</Text>
            </View>
            <View style={styles.mark} />
          </View>
          <Text style={[styles.optDesc, styles.selfDesc]}>{d.self.desc}</Text>
        </Pressable>

        <View style={styles.help}>
          <View style={styles.helpDisc}>
            <MessageCircleQuestionMark size={t.helpGlyph} color={c.inkWarm} strokeWidth={1.9} />
          </View>
          <View style={styles.helpText}>
            <Text style={styles.helpTitle}>{d.helpTitle}</Text>
            <Text style={styles.helpBody}>{d.helpBody}</Text>
          </View>
        </View>

        <View style={styles.sec}>
          <LockKeyhole size={t.secIcon} color={c.greenInk} strokeWidth={2.2} />
          <Text style={styles.secText} {...shrinkToFit(0.75)}>
            {d.secure}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable accessibilityRole="button" onPress={toBooking} style={styles.btn}>
          <Truck size={t.btnIcon} color={ink.onBrand} strokeWidth={1.9} />
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.colGap },

  intro: {
    marginTop: t.introTop,
    marginLeft: t.introX - t.padX,
    fontFamily: font.appBody,
    fontSize: t.introSize,
    lineHeight: t.introLineHeight,
    color: c.inkWarm,
  },

  card: { borderRadius: t.cardRadius, backgroundColor: c.card },
  ref: { marginTop: t.refTop, paddingHorizontal: t.refPadX, paddingTop: t.refPadTop, paddingBottom: t.refPadBottom },
  pill: {
    flexShrink: 1,
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.peachNote,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.pillSize, color: c.inkWarm },
  divider: { marginTop: t.divTop, height: 1, backgroundColor: c.panel },
  grid: { marginTop: t.gridTop, flexDirection: 'row', flexWrap: 'wrap', rowGap: t.gridRowGap },
  cell: { flexBasis: '45%', flexGrow: 1, flexShrink: 1, minWidth: 0 },
  cell1: { flexBasis: t.col1W, flexGrow: 0 },
  label: { fontFamily: font.appBody, fontSize: t.labelSize, lineHeight: t.labelLineHeight, color: c.inkWarm },
  valueRow: { flexDirection: 'row', alignItems: 'center', gap: t.valueIconGap },
  advValue: { fontSize: t.advValueSize },
  value: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.valueSize, lineHeight: t.valueLineHeight, color: c.ink },

  ready: {
    marginTop: t.readyTop,
    paddingHorizontal: t.readyPadX,
    paddingTop: t.readyPadTop,
    paddingBottom: t.readyPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.colGap,
  },
  readyTitle: { fontFamily: font.appSemi, fontSize: t.readyTitleSize, lineHeight: t.readyTitleLineHeight, color: c.ink },
  readySub: {
    marginTop: t.readySubTop,
    fontFamily: font.appBody,
    fontSize: t.readySubSize,
    lineHeight: t.readySubLineHeight,
    color: c.inkWarm,
  },
  ver: {
    marginTop: t.verTop,
    alignSelf: 'flex-start',
    height: t.verH,
    borderRadius: t.verH / 2,
    paddingHorizontal: t.verPadX,
    backgroundColor: c.greenTile,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.verGap,
  },
  verText: { fontFamily: font.appSemi, fontSize: t.verSize, color: c.greenInk },
  view: {
    height: t.viewH,
    borderRadius: t.viewRadius,
    paddingHorizontal: t.viewPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.viewGap,
  },
  viewText: { fontFamily: font.appSemi, fontSize: t.viewSize, color: c.ink },

  choose: {
    marginTop: t.chooseTop,
    marginLeft: t.chooseX - t.padX,
    fontFamily: font.appSemi,
    fontSize: t.chooseSize,
    lineHeight: t.chooseLineHeight,
    color: c.ink,
  },
  chooseSub: {
    marginLeft: t.chooseX - t.padX,
    fontFamily: font.appBody,
    fontSize: t.chooseSubSize,
    lineHeight: t.chooseSubLineHeight,
    color: c.inkWarm,
  },

  opt: { paddingHorizontal: t.optPadX, paddingTop: t.optPadTop, paddingBottom: t.optPadBottom },
  optOn: { marginTop: t.optTop, backgroundColor: c.peachSelect },
  optSelf: { ...shadow, marginTop: t.optGap, paddingTop: t.selfPadTop, paddingBottom: t.selfPadBottom },
  optTop: { flexDirection: 'row', alignItems: 'flex-start' },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileOn: { backgroundColor: c.selectTile },
  optText: { flex: 1, minWidth: 0, marginLeft: t.tileGap, marginTop: t.optTextTop },
  optTitle: { fontFamily: font.appSemi, fontSize: t.optTitleSize, lineHeight: t.optTitleLineHeight, color: c.ink },
  powered: {
    marginTop: t.poweredTop,
    alignSelf: 'flex-start',
    height: t.poweredH,
    borderRadius: t.poweredH / 2,
    paddingHorizontal: t.poweredPadX,
    backgroundColor: c.card,
    justifyContent: 'center',
  },
  poweredText: { fontFamily: font.appSemi, fontSize: t.poweredSize, color: c.inkWarm },
  selfSub: {
    marginTop: t.selfSubTop,
    fontFamily: font.appSemi,
    fontSize: t.selfSubSize,
    lineHeight: t.selfSubLineHeight,
    color: c.ink,
  },
  mark: {
    marginLeft: t.tileGap,
    width: t.mark,
    height: t.mark,
    borderRadius: t.mark / 2,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markOn: { backgroundColor: c.greenInk },
  optDesc: { fontFamily: font.appBody, fontSize: t.optDescSize, lineHeight: t.optDescLineHeight, color: c.inkWarm },
  optDescOn: { marginTop: t.optDescTop },
  selfDesc: { marginTop: t.selfDescTop },

  help: {
    marginTop: t.helpTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.helpPadX,
    paddingTop: t.helpPadTop,
    paddingBottom: t.helpPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  helpDisc: {
    width: t.helpDisc,
    height: t.helpDisc,
    borderRadius: t.helpDisc / 2,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpText: { flex: 1, minWidth: 0, marginLeft: t.helpGap, marginTop: t.helpTextTop },
  helpTitle: { fontFamily: font.appSemi, fontSize: t.helpTitleSize, lineHeight: t.helpTitleLineHeight, color: c.ink },
  helpBody: { fontFamily: font.appBody, fontSize: t.helpBodySize, lineHeight: t.helpBodyLineHeight, color: c.inkWarm },

  sec: { marginTop: t.secTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.secGap },
  secText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.secSize, lineHeight: t.secLineHeight, color: c.inkWarm },

  bar: { backgroundColor: c.page, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
  btn: {
    height: t.btnH,
    borderRadius: t.btnH / 2,
    backgroundColor: c.brown,
    paddingHorizontal: t.barPadX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
  },
  btnText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
});
