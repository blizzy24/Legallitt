import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BellRing,
  BookOpen,
  ChevronRight,
  CirclePlus,
  Clock,
  FolderOpen,
  Gavel,
  Headset,
  Rocket,
  Shield,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { dcLanding as t, font, hcPalette as c, ink, shadow, status } from '../../../constants/theme';
import { DC_LANDING } from '../../../data/districtCourt';

// District Court Representation — service landing (design/338). Measured at
// 2.000 px/pt. The District Court tile on client Home opens this screen.
//
// Conflict 1 (the "₹XX,XXX" placeholder prices) is commented on DC_LANDING.
//
// Client-supplied courthouse image is cropped by the rounded hero layout.
// The header avatar is drawn as a court thumbnail; it is the standard
// avatar here.
//
// Wiring: all three "Start New Case" buttons open design/340 (case type); Learn
// More opens design/339; Get Assistance opens support chat.

const WHY_ICON = { shield: ShieldCheck, support: Headset, bell: BellRing, folder: FolderOpen } as const;
const PROC_ICON = { clock: Clock, zap: Zap } as const;

export default function DistrictCourtLandingScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_LANDING;
  const start = () => router.push('/services/district-court/case-type' as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} backHref={'/(tabs)/home' as Href} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.hero]}>
          <View style={styles.heroArt}>
            <Image source={require('../../../assets/hero-district-court.png')} accessibilityLabel="District Court building" resizeMode="cover" style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} />
            <View style={styles.heroPill}>
              <View style={styles.heroPillDot} />
              <Text style={styles.heroPillText}>{d.heroPill}</Text>
            </View>
          </View>
          <Text style={styles.h1} {...shrinkToFit(0.8)}>
            {d.h1}
          </Text>
          <Text style={styles.body}>{d.body}</Text>
          <Pressable accessibilityRole="button" onPress={start} style={[styles.btn, styles.heroBtn]}>
            <Text style={styles.btnText}>{d.start}</Text>
            <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
          </Pressable>
        </View>

        <View style={[styles.card, styles.help]}>
          <View style={styles.disc}>
            <Gavel size={t.discGlyph} color={c.brownInk} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.helpTitle}>{d.helpTitle}</Text>
            <Text style={styles.helpBody}>{d.helpBody}</Text>
          </View>
        </View>

        <View style={[styles.between, styles.sec]}>
          <Text style={styles.secText}>{d.whyTitle}</Text>
          <View style={styles.secPill}>
            <Text style={styles.secPillText}>{d.whyPill}</Text>
          </View>
        </View>
        <View style={styles.grid}>
          {d.why.map((w) => {
            const Icon = WHY_ICON[w.icon];
            return (
              <View key={w.title} style={[styles.card, styles.tile]}>
                <View style={styles.tileIcon}>
                  <Icon size={t.tileGlyph} color={c.brownInk} strokeWidth={1.9} />
                </View>
                <Text style={styles.tileTitle} {...shrinkToFit(0.8)}>
                  {w.title}
                </Text>
                <Text style={styles.tileBody}>{w.body}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.learn}>
          <View style={styles.disc}>
            <BookOpen size={t.discGlyph} color={c.brownInk} strokeWidth={1.9} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.learnTitle}>{d.learnTitle}</Text>
            <Text style={styles.learnBody}>{d.learnBody}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/services/district-court/learn-more' as Href)}
              style={styles.learnBtn}
            >
              <Text style={styles.learnBtnText}>{d.learnMore}</Text>
              <ArrowRight size={t.learnBtnIcon} color={c.brownInk} strokeWidth={2} />
            </Pressable>
          </View>
        </View>

        <Text style={[styles.secText, styles.optSec]}>{d.optTitle}</Text>
        <View style={[styles.grid, styles.optGrid]}>
          {d.options.map((o) => {
            const Icon = PROC_ICON[o.icon];
            return (
              // Opens the price screen (design/343), which draws the real prices; 338
              // draws no selected state, so none is added here.
              <Pressable
                key={o.badge}
                accessibilityRole="button"
                onPress={() => router.push('/services/district-court/pricing' as Href)}
                style={[styles.card, styles.opt]}
              >
                <View style={[styles.badge, o.tone === 'peach' ? styles.badgePeach : styles.badgeGrey]}>
                  <Text style={[styles.badgeText, o.tone === 'peach' && styles.brownText]}>{o.badge}</Text>
                </View>
                <Text style={styles.optSub}>{o.sub}</Text>
                <Text style={styles.price} {...shrinkToFit(0.8)}>
                  {o.price}
                </Text>
                <View style={styles.proc}>
                  <Icon size={t.procIcon} color={c.greenInk} strokeWidth={2} />
                  <Text style={styles.procText} {...shrinkToFit(0.75)}>
                    {o.proc}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.note}>{d.optNote}</Text>

        <View style={[styles.card, styles.ready]}>
          <View style={styles.readyHead}>
            <Rocket size={t.readyIcon} color={c.brown} strokeWidth={1.8} />
            <Text style={styles.readyTitle}>{d.readyTitle}</Text>
          </View>
          <Text style={styles.readySub}>{d.readySub}</Text>
          <Pressable accessibilityRole="button" onPress={start} style={[styles.btn, styles.readyBtn]}>
            <Text style={[styles.btnText, styles.readyBtnText]}>{d.start}</Text>
            <CirclePlus size={t.readyBtnIcon} color={ink.onBrand} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.need}>
          <View style={styles.flex}>
            <Text style={styles.needTitle}>{d.needTitle}</Text>
            <Text style={styles.needBody}>{d.needBody}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/support-chat' as Href)}
            style={styles.get}
          >
            <Text style={styles.getText}>{d.getHelp}</Text>
          </Pressable>
        </View>

        <View style={styles.sup}>
          <View style={styles.supHead}>
            <Shield size={t.supIcon} color={c.ink} strokeWidth={1.9} />
            <Text style={styles.supTitle}>{d.supTitle}</Text>
          </View>
          <Text style={styles.supBody}>{d.supBody}</Text>
          <Text style={styles.supNote}>{d.supNote}</Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable accessibilityRole="button" onPress={start} style={[styles.btn, styles.barBtn]}>
          <Text style={[styles.btnText, styles.barBtnText]}>{d.start}</Text>
          <ChevronRight size={t.barBtnIcon} color={ink.onBrand} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.caption}>{d.caption}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.bottomPad },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.gridGap },
  brownText: { color: c.brownInk },

  card: { ...shadow, borderRadius: t.cardRadius, backgroundColor: c.card },
  hero: { marginTop: t.heroTop, paddingHorizontal: t.cardPad, paddingTop: t.heroPadTop, paddingBottom: t.heroPadBottom },
  heroArt: { overflow: 'hidden', height: t.heroH, borderRadius: t.heroRadius, backgroundColor: c.heroArt, justifyContent: 'flex-end' },
  heroPill: {
    marginLeft: t.heroPillLeft,
    marginBottom: t.heroPillBottom,
    alignSelf: 'flex-start',
    height: t.heroPillH,
    borderRadius: t.heroPillH / 2,
    paddingHorizontal: t.heroPillPadX,
    backgroundColor: c.page,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.heroPillGap,
  },
  heroPillDot: { width: t.heroPillDot, height: t.heroPillDot, borderRadius: t.heroPillDot / 2, backgroundColor: status.active },
  heroPillText: { fontFamily: font.appSemi, fontSize: t.heroPillSize, color: c.ink },
  h1: { marginTop: t.h1Top, fontFamily: font.appSemi, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  body: { marginTop: t.bodyTop, fontFamily: font.appBody, fontSize: t.bodySize, lineHeight: t.bodyLineHeight, color: c.inkWarm },
  btn: {
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
  },
  heroBtn: { marginTop: t.heroBtnTop },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },

  help: {
    marginTop: t.helpTop,
    paddingHorizontal: t.cardPad,
    paddingVertical: t.helpPadY,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.discGap,
  },
  disc: { width: t.disc, height: t.disc, borderRadius: t.disc / 2, backgroundColor: c.peach, alignItems: 'center', justifyContent: 'center' },
  helpTitle: { fontFamily: font.appSemi, fontSize: t.helpTitleSize, lineHeight: t.helpTitleLineHeight, color: c.ink },
  helpBody: { marginTop: t.helpBodyTop, fontFamily: font.appBody, fontSize: t.helpBodySize, lineHeight: t.helpBodyLineHeight, color: c.inkWarm },

  sec: { marginTop: t.secTop },
  secText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.secSize, lineHeight: t.secLineHeight, color: c.ink },
  secPill: { height: t.secPillH, borderRadius: t.secPillH / 2, paddingHorizontal: t.secPillPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  secPillText: { fontFamily: font.appSemi, fontSize: t.secPillSize, color: c.inkWarm },
  grid: { marginTop: t.gridTop, flexDirection: 'row', flexWrap: 'wrap', gap: t.gridGap },
  tile: { flexBasis: '45%', flexGrow: 1, minWidth: 0, paddingHorizontal: t.cardPad, paddingTop: t.tilePadTop, paddingBottom: t.tilePadBottom },
  tileIcon: { width: t.tileIcon, height: t.tileIcon, borderRadius: t.tileIconRadius, backgroundColor: c.tileGrey, alignItems: 'center', justifyContent: 'center' },
  tileTitle: { marginTop: t.tileTitleTop, fontFamily: font.appSemi, fontSize: t.tileTitleSize, lineHeight: t.tileTitleLineHeight, color: c.ink },
  tileBody: { marginTop: t.tileBodyTop, fontFamily: font.appBody, fontSize: t.tileBodySize, lineHeight: t.tileBodyLineHeight, color: c.inkWarm },

  learn: {
    marginTop: t.learnTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.peachSoft,
    paddingHorizontal: t.cardPad,
    paddingTop: t.learnPadTop,
    paddingBottom: t.learnPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.discGap + 4,
  },
  learnTitle: { fontFamily: font.appSemi, fontSize: t.learnTitleSize, lineHeight: t.learnTitleLineHeight, color: c.ink },
  learnBody: { marginTop: t.learnBodyTop, fontFamily: font.appBody, fontSize: t.learnBodySize, lineHeight: t.learnBodyLineHeight, color: c.inkWarm },
  learnBtn: {
    marginTop: t.learnBtnTop,
    alignSelf: 'flex-start',
    height: t.learnBtnH,
    borderRadius: t.learnBtnRadius,
    paddingHorizontal: t.learnBtnPadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.btnGap - 2,
  },
  learnBtnText: { fontFamily: font.appSemi, fontSize: t.learnBtnSize, color: c.brownInk },

  optSec: { marginTop: t.optTop },
  optGrid: { marginTop: t.optGridTop },
  opt: { flex: 1, minWidth: 0, paddingHorizontal: t.cardPad, paddingTop: t.optPadTop, paddingBottom: t.optPadBottom },
  badge: { alignSelf: 'flex-start', height: t.badgeH, borderRadius: t.badgeRadius, paddingHorizontal: t.badgePadX, justifyContent: 'center' },
  badgeGrey: { backgroundColor: c.tileGrey },
  badgePeach: { backgroundColor: c.peach },
  badgeText: { fontFamily: font.appSemi, fontSize: t.badgeSize, color: c.inkWarm },
  optSub: { marginTop: t.optSubTop, fontFamily: font.appBody, fontSize: t.optSubSize, lineHeight: t.optSubLineHeight, color: c.inkWarm },
  price: { marginTop: t.priceTop, fontFamily: font.appSemi, fontSize: t.priceSize, lineHeight: t.priceLineHeight, color: c.ink },
  proc: { marginTop: t.procTop, flexDirection: 'row', alignItems: 'center', gap: t.procGap },
  procText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.procSize, color: c.inkWarm },
  note: { marginTop: t.noteTop, paddingHorizontal: t.notePadX, fontFamily: font.appBody, fontSize: t.noteSize, lineHeight: t.noteLineHeight, color: c.ink },

  ready: { marginTop: t.readyTop, paddingHorizontal: t.cardPad, paddingTop: t.readyPadTop, paddingBottom: t.readyPadBottom },
  readyHead: { flexDirection: 'row', alignItems: 'center', gap: t.readyIconGap },
  readyTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.readyTitleSize, lineHeight: t.readyTitleLineHeight, color: c.ink },
  readySub: { marginTop: t.readySubTop, fontFamily: font.appBody, fontSize: t.readySubSize, lineHeight: t.readySubLineHeight, color: c.inkWarm },
  readyBtn: { marginTop: t.readyBtnTop, height: t.readyBtnH },
  readyBtnText: { fontSize: t.readyBtnSize },

  need: {
    marginTop: t.needTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.tileGrey,
    paddingHorizontal: t.cardPad,
    paddingTop: t.needPadTop,
    paddingBottom: t.needPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.gridGap,
  },
  needTitle: { fontFamily: font.appSemi, fontSize: t.needTitleSize, lineHeight: t.needTitleLineHeight, color: c.ink },
  needBody: { fontFamily: font.appBody, fontSize: t.needBodySize, lineHeight: t.needBodyLineHeight, color: c.inkWarm },
  get: { height: t.getH, borderRadius: t.getRadius, paddingHorizontal: t.getPadX, backgroundColor: c.card, justifyContent: 'center' },
  getText: { fontFamily: font.appSemi, fontSize: t.getSize, color: c.brownInk },

  sup: {
    marginTop: t.supTop,
    borderRadius: t.cardRadius,
    backgroundColor: c.peachDone,
    paddingHorizontal: t.cardPad,
    paddingTop: t.supPadTop,
    paddingBottom: t.supPadBottom,
  },
  supHead: { flexDirection: 'row', alignItems: 'center', gap: t.supIconGap },
  supTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.supTitleSize, lineHeight: t.supTitleLineHeight, color: c.ink },
  supBody: { marginTop: t.supBodyTop, fontFamily: font.appBody, fontSize: t.supBodySize, lineHeight: t.supBodyLineHeight, color: c.ink },
  supNote: {
    marginTop: t.supNoteTop,
    fontFamily: font.appBody,
    fontStyle: 'italic',
    fontSize: t.supNoteSize,
    lineHeight: t.supNoteLineHeight,
    color: c.inkWarm,
  },

  bar: { backgroundColor: c.page, borderTopWidth: 1, borderTopColor: c.panel, paddingHorizontal: t.barPadX, paddingTop: t.barPadTop },
  barBtn: { height: t.barBtnH },
  barBtnText: { fontSize: t.barBtnSize },
  caption: { marginTop: t.capTop, textAlign: 'center', fontFamily: font.appBody, fontSize: t.capSize, lineHeight: t.capLineHeight, color: c.inkWarm },
});
