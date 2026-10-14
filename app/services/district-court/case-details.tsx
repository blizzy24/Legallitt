import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Building,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  CirclePlus,
  CircleQuestionMark,
  Contact,
  FolderOpen,
  Gavel,
  Info,
  Lightbulb,
  Lock,
  MapPin,
  MessageSquareText,
  NotebookPen,
  RefreshCw,
  ShieldHalf,
  Smile,
  UserRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import DistrictStepper from '../../../components/DistrictStepper';
import { shrinkToFit } from '../../../constants/textFit';
import {
  advForensicRed,
  courierHeader as h,
  dcCaseDetails as t,
  dcCaseDetailsPalette as p,
  dcCaseType,
  font,
  hcPalette as c,
  ink,
  shadow,
  status,
} from '../../../constants/theme';
import { DC_CASE_DETAILS } from '../../../data/districtCourt';

// District Court — case details (design/341). Measured at 2.000 px/pt.
// Reached from Continue on design/340; Continue to Documents opens design/342.
//
// Drawn filled in. Every field is a real local input holding the drawn value;
// nothing is saved or sent. The two yes/no choices and the sub-category chips
// are local state.
//
// Wiring choices (not drawn either way):
//   · The Date / "What is this date about?" fields and note show only while
//     "Yes" is chosen — the export draws them under Yes.
//   · Case Number, Previous Advocate, Reason and the NOC panel show only
//     while "No, my case is already going on" is chosen — drawn under it.
// STATIC: no date picker or state picker is designed; the plus and refresh
// glyphs on the two case options are drawn decoration.
//
// See data/districtCourt.ts for the step-counter, matter, case-number and
// previous-advocate conflicts. The required star is #BA1A1A, the existing
// advForensicRed.

function Label({ text, optional }: { text: string; optional?: boolean }) {
  return (
    <Text style={styles.label}>
      {text}
      {optional ? (
        <Text style={styles.optional}>{DC_CASE_DETAILS.optional}</Text>
      ) : (
        <Text style={styles.star}> *</Text>
      )}
    </Text>
  );
}

function Input({ value, icon: Icon, chevron }: { value: string; icon?: typeof MapPin; chevron?: boolean }) {
  return (
    <View style={styles.input}>
      {Icon ? <Icon size={t.inputIcon} color={c.inkWarm} strokeWidth={1.9} /> : null}
      <TextInput defaultValue={value} style={styles.inputText} />
      {chevron ? <ChevronDown size={t.inputIcon} color={c.inkWarm} strokeWidth={2} /> : null}
    </View>
  );
}

function Head({ icon: Icon, title, right }: { icon: typeof MapPin; title: string; right?: React.ReactNode }) {
  return (
    <View style={styles.head}>
      <View style={styles.headIcon}>
        <Icon size={t.headGlyph} color={c.brown} strokeWidth={2} />
      </View>
      <Text style={styles.headTitle} {...shrinkToFit(0.75)}>
        {title}
      </Text>
      {right}
    </View>
  );
}

export default function DistrictCaseDetailsScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_CASE_DETAILS;
  const [hasDate, setHasDate] = useState(true);
  const [ongoing, setOngoing] = useState(true);
  const [sub, setSub] = useState<string>(d.subs[0]);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={dcCaseType.hdrPadTop}
        titleGap={t.hdrTitleGap}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/case-type' as Href}
        right={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Help"
            hitSlop={8}
            onPress={() => router.push('/help' as Href)}
            style={styles.help}
          >
            <CircleQuestionMark size={dcCaseType.helpIcon} color={h.ink} strokeWidth={1.9} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sheet}>
          <View style={styles.pill}>
            <BadgeCheck size={t.pillIcon} color={c.peach} fill={c.greenInk} strokeWidth={2} />
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {d.step}
            </Text>
          </View>
          <View style={styles.tag}>
            <View style={styles.tagDot} />
            <Text style={styles.tagText} {...shrinkToFit(0.8)}>
              {d.tag}
            </Text>
          </View>
        </View>
        <View style={styles.stepper}>
          <DistrictStepper labels={d.steps} done={2} current={2} />
        </View>

        <View style={[styles.card, styles.cardFirst]}>
          <View style={styles.intro}>
            <View style={styles.flex}>
              <Text style={styles.h1}>{d.h1}</Text>
              <Text style={styles.lead}>{d.lead}</Text>
            </View>
            <View style={styles.introDisc}>
              <Gavel size={t.introGlyph} color={c.brownInk} strokeWidth={1.9} />
            </View>
          </View>
          <View style={styles.info}>
            <Info size={t.infoIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.infoText}>{d.info}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Head icon={Contact} title={d.basicTitle} right={<Text style={styles.headStep}>{d.basicStep}</Text>} />
          <View style={styles.headLabel}>
            <Label text={d.caseTitleLabel} />
          </View>
          <Input value={d.caseTitle} />
          <Text style={styles.helper}>{d.caseTitleHelp}</Text>
          <View style={styles.helperLabel}>
            <Label text={d.partyLabel} />
          </View>
          <Input value={d.party} icon={UserRound} />
          <Text style={styles.caps}>{d.courtCaps}</Text>
          <View style={styles.capsLabel}>
            <Label text={d.cityLabel} />
          </View>
          <Input value={d.city} icon={MapPin} />
          <View style={styles.cols}>
            <View style={styles.flex}>
              <View style={styles.colsLabel}>
                <Label text={d.districtLabel} />
              </View>
              <Input value={d.district} />
            </View>
            <View style={styles.flex}>
              <View style={styles.colsLabel}>
                <Label text={d.stateLabel} />
              </View>
              <Input value={d.state} chevron />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Head icon={NotebookPen} title={d.happenedTitle} />
          <View style={styles.happenedLabel}>
            <Label text={d.happenedLabel} />
          </View>
          <TextInput defaultValue={d.happened} multiline style={[styles.input, styles.area]} />
          <View style={styles.hint}>
            <Smile size={t.hintIcon} color={c.greenInk} strokeWidth={2} />
            <Text style={styles.hintText}>{d.happenedHint}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Head icon={CalendarCheck} title={d.dateTitle} />
          <Text style={[styles.label, styles.headLabel]}>{d.dateQuestion}</Text>
          <View style={styles.toggles}>
            {[true, false].map((v) => {
              const on = hasDate === v;
              return (
                <Pressable
                  key={String(v)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  onPress={() => setHasDate(v)}
                  style={[styles.toggle, on && styles.toggleOn]}
                >
                  {on && <CircleCheck size={t.toggleIcon} color={ink.onBrand} strokeWidth={2} />}
                  <Text style={[styles.toggleText, on && styles.toggleTextOn]}>{v ? d.yes : d.no}</Text>
                </Pressable>
              );
            })}
          </View>
          {hasDate && (
            <>
              <View style={styles.toggleLabel}>
                <Text style={styles.label}>{d.dateLabel}</Text>
              </View>
              <Input value={d.date} icon={CalendarDays} />
              <View style={styles.labelGap}>
                <Label text={d.aboutLabel} optional />
              </View>
              <Input value={d.about} />
              <View style={styles.note}>
                <Lightbulb size={t.noteIcon} color={c.inkWarm} strokeWidth={1.9} />
                <Text style={styles.noteText}>
                  <Text style={styles.noteLead}>{d.noteLead}</Text>
                  {d.note}
                </Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Head icon={FolderOpen} title={d.newTitle} />
          {[false, true].map((v, i) => {
            const on = ongoing === v;
            const Icon = v ? RefreshCw : CirclePlus;
            return (
              <Pressable
                key={String(v)}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setOngoing(v)}
                style={[styles.opt, i > 0 && styles.optNext, on && styles.optOn]}
              >
                <View style={[styles.radio, on && styles.radioOn]} />
                <Text style={styles.optText} {...shrinkToFit(0.75)}>
                  {v ? d.newNo : d.newYes}
                </Text>
                <Icon size={t.optIcon} color={c.inkWarm} strokeWidth={1.9} />
              </Pressable>
            );
          })}
          {ongoing && (
            <>
              <View style={styles.optLabel}>
                <Label text={d.numberLabel} optional />
              </View>
              <Input value={d.number} />
              <View style={styles.labelGap}>
                <Label text={d.prevLabel} optional />
              </View>
              <Input value={d.prev} />
              <View style={styles.labelGap}>
                <Label text={d.reasonLabel} optional />
              </View>
              <Input value={d.reason} />
              <View style={styles.noc}>
                <View style={styles.nocHead}>
                  <Text style={styles.nocTitle} {...shrinkToFit(0.75)}>
                    {d.nocTitle}
                  </Text>
                  <View style={styles.nocChip}>
                    <Text style={styles.nocChipText} {...shrinkToFit(0.8)}>
                      {d.nocChip}
                    </Text>
                  </View>
                </View>
                <Text style={styles.nocBody}>{d.nocBody}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Head
            icon={Building}
            title={d.moreTitle}
            right={
              <View style={styles.moreTag}>
                <Text style={styles.moreTagText} {...shrinkToFit(0.8)}>
                  {d.moreTag}
                </Text>
              </View>
            }
          />
          <View style={styles.headLabel}>
            <Label text={d.subLabel} optional />
          </View>
          <View style={styles.chips}>
            {d.subs.map((s) => {
              const on = sub === s;
              return (
                <Pressable
                  key={s}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  onPress={() => setSub(s)}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>{s}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.chipsLabel}>
            <Label text={d.locLabel} optional />
          </View>
          <Input value={d.loc} icon={MapPin} />
        </View>

        <View style={styles.card}>
          <Head icon={MessageSquareText} title={d.otherTitle} />
          <TextInput
            multiline
            placeholder={d.otherPlaceholder}
            placeholderTextColor={c.inkMuted}
            style={[styles.input, styles.area, styles.other]}
          />
        </View>

        <View style={styles.prot}>
          <View style={styles.protDisc}>
            <ShieldHalf size={t.protGlyph} color={p.protInk} fill={p.protInk} strokeWidth={2.2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.protTitle} {...shrinkToFit(0.75)}>
              {d.protTitle}
            </Text>
            <Text style={styles.protBody}>{d.protBody}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          onPress={() => router.push('/services/district-court/documents' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.cap}>
          <Lock size={t.capIcon} color={c.greenInk} fill={c.greenInk} strokeWidth={2} />
          <Text style={styles.capText} {...shrinkToFit(0.75)}>
            {d.caption}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingBottom: t.bottomPad },
  flex: { flex: 1, minWidth: 0 },
  help: { marginRight: dcCaseType.helpGap },
  hdrSub: { fontSize: t.hdrSubSize },

  sheet: {
    paddingHorizontal: t.padX,
    paddingTop: t.sheetPadTop,
    paddingBottom: t.sheetPadBottom,
    borderBottomLeftRadius: t.sheetRadius,
    borderBottomRightRadius: t.sheetRadius,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.pillGap,
    ...shadow,
  },
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
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, letterSpacing: t.pillSpacing, color: p.protInk },
  tag: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: c.helpGrey,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
    flexShrink: 1,
  },
  tagDot: { width: t.tagDot, height: t.tagDot, borderRadius: t.tagDot / 2, backgroundColor: status.active },
  tagText: { fontFamily: font.appSemi, fontSize: t.tagSize, letterSpacing: t.tagSpacing, color: c.inkWarm },
  stepper: { marginTop: t.stepperTop, paddingHorizontal: t.padX + t.stepperPadX },

  card: {
    marginTop: t.cardGap,
    marginLeft: t.cardLeft,
    marginRight: t.cardRight,
    borderRadius: t.cardRadius,
    padding: t.cardPad,
    paddingBottom: t.cardPadBottom,
    backgroundColor: c.card,
    ...shadow,
  },
  cardFirst: { marginTop: t.cardTop, paddingBottom: t.cardPad },

  intro: { flexDirection: 'row', alignItems: 'flex-start', gap: t.introGap },
  introDisc: {
    width: t.introDisc,
    height: t.introDisc,
    borderRadius: t.introDisc / 2,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: { fontFamily: font.appHeading, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  lead: {
    marginTop: t.leadTop,
    fontFamily: font.appBody,
    fontSize: t.leadSize,
    lineHeight: t.leadLineHeight,
    color: c.inkWarm,
  },
  info: {
    marginTop: t.infoTop,
    borderRadius: t.infoRadius,
    paddingHorizontal: t.infoPadX,
    paddingVertical: t.infoPadY,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.infoGap,
  },
  infoText: {
    flex: 1,
    fontFamily: font.appBody,
    fontSize: t.infoSize,
    lineHeight: t.infoLineHeight,
    color: c.inkWarm,
  },

  head: { flexDirection: 'row', alignItems: 'center', gap: t.headGap },
  headIcon: {
    width: t.headIcon,
    height: t.headIcon,
    borderRadius: t.headIconRadius,
    backgroundColor: c.chipGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headTitle: {
    flex: 1,
    fontFamily: font.appSemi,
    fontSize: t.headSize,
    lineHeight: t.headLineHeight,
    color: c.ink,
  },
  headStep: { fontFamily: font.appSemi, fontSize: t.headStepSize, color: c.inkWarm },

  labelGap: { marginTop: t.labelTop },
  headLabel: { marginTop: t.headLabelTop },
  happenedLabel: { marginTop: t.happenedLabelTop },
  helperLabel: { marginTop: t.helperLabelTop },
  toggleLabel: { marginTop: t.toggleLabelTop },
  optLabel: { marginTop: t.optLabelTop },
  chipsLabel: { marginTop: t.chipsLabelTop },
  label: { fontFamily: font.appSemi, fontSize: t.labelSize, lineHeight: t.labelLineHeight, color: c.ink },
  optional: { fontFamily: font.appBody, color: c.inkWarm },
  star: { color: advForensicRed.declineColour },
  input: {
    marginTop: t.inputTop,
    minHeight: t.inputH,
    borderRadius: t.inputRadius,
    paddingHorizontal: t.inputPadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.inputIconGap,
    ...shadow,
  },
  inputText: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
    fontFamily: font.appBody,
    fontSize: t.inputSize,
    color: c.ink,
  },
  helper: {
    marginTop: t.helperTop,
    fontFamily: font.appBody,
    fontSize: t.helperSize,
    lineHeight: t.helperLineHeight,
    color: c.inkWarm,
  },
  caps: {
    marginTop: t.capsTop,
    fontFamily: font.appSemi,
    fontSize: t.capsSize,
    lineHeight: t.capsLineHeight,
    letterSpacing: t.capsSpacing,
    color: c.inkWarm,
  },
  capsLabel: { marginTop: t.capsLabelTop },
  cols: { flexDirection: 'row', gap: t.colGap },
  colsLabel: { marginTop: t.colsLabelTop },

  area: {
    height: t.areaH,
    paddingVertical: t.areaPadY,
    textAlignVertical: 'top',
    fontFamily: font.appBody,
    fontSize: t.areaSize,
    lineHeight: t.areaLineHeight,
    color: c.ink,
  },
  other: { height: t.otherH, paddingTop: t.otherPadTop, paddingHorizontal: t.otherPadX, fontSize: t.otherSize },
  hint: { marginTop: t.hintTop, flexDirection: 'row', gap: t.hintGap },
  hintText: {
    flex: 1,
    fontFamily: font.appBody,
    fontSize: t.hintSize,
    lineHeight: t.hintLineHeight,
    color: c.inkWarm,
  },

  toggles: { marginTop: t.toggleTop, flexDirection: 'row', gap: t.colGap },
  toggle: {
    flex: 1,
    height: t.toggleH,
    borderRadius: t.toggleRadius,
    backgroundColor: c.helpGrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.toggleGap,
  },
  toggleOn: { backgroundColor: c.brown },
  toggleText: { fontFamily: font.appSemi, fontSize: t.toggleSize, color: c.inkWarm },
  toggleTextOn: { color: ink.onBrand },

  note: {
    marginTop: t.noteTop,
    borderRadius: t.noteRadius,
    paddingHorizontal: t.notePadX,
    paddingVertical: t.notePadY,
    backgroundColor: c.peach,
    flexDirection: 'row',
    gap: t.noteGap,
  },
  noteText: {
    flex: 1,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: c.inkWarm,
  },
  noteLead: { fontFamily: font.appSemi, color: c.ink },

  opt: {
    marginTop: t.optTop,
    minHeight: t.optH,
    borderRadius: t.optRadius,
    paddingHorizontal: t.optPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.optGap2,
  },
  optNext: { marginTop: t.optGap },
  optOn: { backgroundColor: c.peach },
  radio: { width: t.optRadio, height: t.optRadio, borderRadius: t.optRadio / 2, backgroundColor: c.radioGrey },
  radioOn: { backgroundColor: c.card, borderWidth: t.optRadioRing, borderColor: c.brown },
  optText: { flex: 1, fontFamily: font.appSemi, fontSize: t.optSize, color: c.ink },

  noc: {
    marginTop: t.nocTop,
    borderRadius: t.nocRadius,
    paddingHorizontal: t.nocPadX,
    paddingVertical: t.nocPadY,
    backgroundColor: c.panel,
  },
  nocHead: { flexDirection: 'row', alignItems: 'center', gap: t.chipGap },
  nocTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.nocTitleSize, color: c.ink },
  nocChip: {
    height: t.nocChipH,
    borderRadius: t.nocChipH / 2,
    paddingHorizontal: t.nocChipPadX,
    backgroundColor: c.radioGrey,
    justifyContent: 'center',
  },
  nocChipText: { fontFamily: font.appBody, fontSize: t.nocChipSize, color: c.inkWarm },
  nocBody: {
    marginTop: t.nocBodyTop,
    fontFamily: font.appBody,
    fontSize: t.nocBodySize,
    lineHeight: t.nocBodyLineHeight,
    color: c.inkWarm,
  },

  moreTag: {
    height: t.chipTagH,
    borderRadius: t.chipTagH / 2,
    paddingHorizontal: t.chipTagPadX,
    backgroundColor: c.peach,
    justifyContent: 'center',
    flexShrink: 1,
  },
  moreTagText: { fontFamily: font.appSemi, fontSize: t.chipTagSize, color: c.brownInk },
  chips: { marginTop: t.chipsTop, flexDirection: 'row', flexWrap: 'wrap', columnGap: t.chipGap, rowGap: t.chipRowGap },
  chip: {
    minHeight: t.chipH,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: c.helpGrey,
    justifyContent: 'center',
  },
  chipOn: { backgroundColor: c.brown },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, color: c.inkWarm },
  chipTextOn: { color: ink.onBrand },

  prot: {
    marginTop: t.protTop,
    marginLeft: t.cardLeft,
    marginRight: t.cardRight,
    borderRadius: t.protRadius,
    padding: t.protPad,
    backgroundColor: c.peach,
    flexDirection: 'row',
    gap: t.protGap,
  },
  protDisc: {
    width: t.protDisc,
    height: t.protDisc,
    borderRadius: t.protDisc / 2,
    backgroundColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protTitle: {
    fontFamily: font.appSemi,
    fontSize: t.protTitleSize,
    lineHeight: t.protTitleLineHeight,
    color: p.protInk,
  },
  protBody: {
    fontFamily: font.appBody,
    fontSize: t.protBodySize,
    lineHeight: t.protBodyLineHeight,
    color: p.protInk,
  },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop, backgroundColor: c.card },
  btn: {
    height: t.btnH,
    borderRadius: t.btnRadius,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
    ...shadow,
  },
  btnText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  cap: { marginTop: t.capTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.capGap },
  capText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.capSize,
    lineHeight: t.capLineHeight,
    letterSpacing: t.capSpacing,
    color: c.inkWarm,
  },
});
