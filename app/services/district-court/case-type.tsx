import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Building,
  Check,
  CircleQuestionMark,
  Ellipsis,
  FileText,
  Gavel,
  Info,
  Scale,
  ShoppingBag,
  UsersRound,
  Wallet,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import DistrictStepper from '../../../components/DistrictStepper';
import { shrinkToFit } from '../../../constants/textFit';
import {
  courierHeader as h,
  dcCaseType as t,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../../constants/theme';
import { DC_CASE_TYPE } from '../../../data/districtCourt';

// District Court — select case type (design/340). Measured at 2.000 px/pt.
// Reached from every Start button on designs 338 and 339.
//
// The eight tiles are a real local choice; Property is drawn selected and is
// the initial one. Continue opens design/341 whatever is chosen (341 draws a
// Civil matter — see its notes).
//
// The note card's thumbnail is a screenshot of this screen inside the export;
// it is a neutral block at the drawn size. "View examples" has no drawn
// destination and stays inert. The help icon opens /help.

const ICON = {
  scale: Scale,
  gavel: Gavel,
  family: UsersRound,
  file: FileText,
  building: Building,
  wallet: Wallet,
  bag: ShoppingBag,
  more: Ellipsis,
} as const;

type TypeId = (typeof DC_CASE_TYPE.types)[number]['id'];

export default function DistrictCaseTypeScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_CASE_TYPE;
  const [choice, setChoice] = useState<TypeId>(d.initial);
  const rows = [0, 2, 4, 6].map((i) => d.types.slice(i, i + 2));

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        center
        padTop={t.hdrPadTop}
        backHref={'/services/district-court' as Href}
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

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepRow}>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {d.step}
            </Text>
          </View>
          <Text style={styles.setup} {...shrinkToFit(0.8)}>
            {d.setup}
          </Text>
        </View>
        <View style={styles.stepper}>
          <DistrictStepper labels={d.steps} done={0} current={0} />
        </View>

        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.lead}>{d.lead}</Text>
        <View style={styles.info}>
          <Info size={t.infoIcon} color={c.inkWarm} strokeWidth={1.9} />
          <Text style={styles.infoText} {...shrinkToFit(0.8)}>
            {d.info}
          </Text>
        </View>

        <View style={styles.grid}>
          {rows.map((row, r) => (
            <View key={r} style={[styles.row, r > 0 && styles.rowNext]}>
              {row.map((o) => {
                const on = choice === o.id;
                const Icon = ICON[o.icon];
                return (
                  <Pressable
                    key={o.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: on }}
                    onPress={() => setChoice(o.id)}
                    style={[styles.tile, r >= 2 && styles.tileTall, on && styles.tileOn]}
                  >
                    <View style={styles.tileHead}>
                      <View style={[styles.disc, on && styles.discOn]}>
                        <Icon size={t.discGlyph} color={on ? ink.onBrand : c.brownInk} strokeWidth={1.9} />
                      </View>
                      <View style={[styles.radio, on && styles.radioOn]}>
                        {on && <Check size={t.radioGlyph} color={ink.onBrand} strokeWidth={3} />}
                      </View>
                    </View>
                    <View style={styles.tileText}>
                      <Text style={[styles.title, on && styles.textOn]} {...shrinkToFit(0.75)}>
                        {o.title}
                      </Text>
                      <Text style={[styles.desc, on && styles.textOn]}>{o.desc}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.note}>
          <View style={styles.noteArt} />
          <View style={styles.flex}>
            <Text style={styles.noteTitle} {...shrinkToFit(0.8)}>
              {d.noteTitle}
            </Text>
            <Text style={styles.noteBody}>{d.noteBody}</Text>
          </View>
        </View>

        <View style={styles.link}>
          <Text style={styles.linkText} {...shrinkToFit(0.75)}>
            {d.link}
          </Text>
          <ArrowRight size={t.linkIcon} color={c.brown} strokeWidth={2.2} />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => router.push('/services/district-court/case-details' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText}>{d.cta}</Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.cap}>{d.caption}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  help: { marginRight: t.helpGap },

  stepRow: { marginTop: t.pillTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.peach,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
    flexShrink: 1,
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.brownInk },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: c.brownInk },
  setup: { fontFamily: font.appSemi, fontSize: t.setupSize, letterSpacing: t.setupSpacing, color: c.brownInk },
  stepper: { marginTop: t.stepperTop, paddingHorizontal: t.stepperPadX },

  h1: { marginTop: t.h1Top, fontFamily: font.appHeading, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  lead: {
    marginTop: t.subTop,
    fontFamily: font.appBody,
    fontSize: t.subSize,
    lineHeight: t.subLineHeight,
    color: c.inkWarm,
  },
  info: {
    marginTop: t.infoTop,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: t.infoH,
    borderRadius: t.infoH / 2,
    paddingHorizontal: t.infoPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.infoGap,
  },
  infoText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.infoSize, color: c.inkWarm },

  grid: { marginTop: t.gridTop },
  row: { flexDirection: 'row', gap: t.gridGap },
  rowNext: { marginTop: t.gridGap },
  tile: {
    flex: 1,
    minWidth: 0,
    minHeight: t.tileH,
    borderRadius: t.tileRadius,
    padding: t.tilePad,
    backgroundColor: c.card,
    justifyContent: 'space-between',
    ...shadow,
  },
  tileTall: { minHeight: t.tileTallH },
  tileText: { marginTop: t.titleTop },
  tileOn: { backgroundColor: c.peach },
  tileHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  disc: {
    width: t.disc,
    height: t.disc,
    borderRadius: t.disc / 2,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discOn: { backgroundColor: c.brown },
  radio: {
    width: t.radio,
    height: t.radio,
    borderRadius: t.radio / 2,
    backgroundColor: c.helpGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { backgroundColor: status.active },
  title: {
    fontFamily: font.appSemi,
    fontSize: t.titleSize,
    lineHeight: t.titleLineHeight,
    color: c.ink,
  },
  desc: {
    marginTop: t.descTop,
    fontFamily: font.appBody,
    fontSize: t.descSize,
    lineHeight: t.descLineHeight,
    color: c.inkWarm,
  },
  textOn: { color: c.brownInk },

  note: {
    marginTop: t.noteTop,
    borderRadius: t.noteRadius,
    paddingHorizontal: t.notePadX,
    paddingVertical: t.notePadY,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.noteGap,
  },
  noteArt: { width: t.noteArt, height: t.noteArt, borderRadius: t.noteArtRadius, backgroundColor: c.heroArt },
  noteTitle: {
    fontFamily: font.appSemi,
    fontSize: t.noteTitleSize,
    lineHeight: t.noteTitleLineHeight,
    color: c.ink,
  },
  noteBody: { fontFamily: font.appBody, fontSize: t.noteBodySize, lineHeight: t.noteBodyLineHeight, color: c.inkWarm },

  link: {
    marginTop: t.linkTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.linkGap,
  },
  linkText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.linkSize, color: c.brown },

  btn: {
    marginTop: t.btnTop,
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
    ...shadow,
  },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  cap: {
    marginTop: t.capTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.capSize,
    lineHeight: t.capLineHeight,
    color: c.inkWarm,
  },
});
