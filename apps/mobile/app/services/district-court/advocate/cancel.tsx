import { AdvocateAvatar } from '../../../../components/AdvocateAvatar';
import { router, type Href } from 'expo-router';
import { BadgeCheck, Check, Copy, Info, Lock, Shield, UserRoundMinus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import {
  advForensicRed,
  dcCancel as t,
  dcCancelPalette as p,
  dcDocumentsPalette,
  font,
  hcPalette as c,
  ink,
  shadow,
} from '../../../../constants/theme';
import { DC_CANCEL } from '../../../../data/districtCourt';

// District Court — cancel request (design/349). Measured at 2.000 px/pt.
// Reached from Cancel Request on design/345.
//
// The reasons, the note and the confirmation box are real local inputs.
// Cancel Request is drawn in its disabled grey with the box unticked; no
// enabled look is drawn, so it keeps that look and becomes tappable only
// once the box is ticked. It returns to client Home (no cancelled screen is
// drawn — see data/districtCourt.ts). Keep My Request goes back to 345.
// STATIC: Copy copies nothing. The photo is an initials avatar, as on 345.

export default function DistrictCancelScreen() {
  const insets = useSafeAreaInsets();
  const d = DC_CANCEL;
  const [reason, setReason] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const keep = () =>
    router.canGoBack() ? router.back() : router.replace('/services/district-court/advocate/decide' as Href);

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        sub={d.sub}
        padTop={t.hdrPadTop}
        titleGap={t.hdrTitleGap}
        subStyle={styles.hdrSub}
        backHref={'/services/district-court/advocate/decide' as Href}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, styles.top]}>
          <View style={styles.topDisc}>
            <Shield size={t.topGlyph} color={p.darkBrown} fill={p.darkBrown} strokeWidth={2} />
          </View>
          <View style={styles.flex}>
            <Text style={styles.topTitle}>{d.topTitle}</Text>
            <Text style={styles.topBody}>{d.topBody}</Text>
            <Text style={styles.topSub}>{d.topSub}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.white, styles.next]}>
          <View style={styles.between}>
            <Text style={styles.title} {...shrinkToFit(0.8)}>
              {d.reqTitle}
            </Text>
            <View style={[styles.chip, styles.chipPanel]}>
              <Text style={[styles.chipText, styles.chipInk]}>{d.id}</Text>
              <Copy size={t.chipIcon} color={c.inkWarm} strokeWidth={2} />
            </View>
          </View>
          {d.cells.map((row, i) => (
            <View key={i} style={[styles.cellRow, i === 0 ? styles.cellsFirst : styles.cellNext]}>
              {row.map(([l, v]) => (
                <View key={l} style={styles.cell}>
                  <Text style={styles.cellLabel}>{l}</Text>
                  {l === 'Current Status' ? (
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>{v}</Text>
                    </View>
                  ) : (
                    <Text style={styles.cellValue}>{v}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.white, styles.next]}>
          <View style={styles.between}>
            <Text style={styles.title} {...shrinkToFit(0.8)}>
              {d.advTitle}
            </Text>
            <View style={[styles.chip, styles.chipGrey]}>
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                {d.advChip}
              </Text>
            </View>
          </View>
          <View style={styles.advPanel}>
            <AdvocateAvatar name={'Adv. Abhishek Verma'} style={styles.photo}><Text style={styles.photoText}>{d.initials}</Text></AdvocateAvatar>
            <View style={styles.flex}>
              <Text style={styles.name} {...shrinkToFit(0.75)}>
                {d.name}
              </Text>
              <View style={styles.verified}>
                <BadgeCheck size={t.verifiedIcon} color={c.card} fill={c.greenInk} strokeWidth={2} />
                <Text style={styles.verifiedText}>{d.verified}</Text>
              </View>
            </View>
          </View>
          <View style={styles.release}>
            <UserRoundMinus size={t.releaseIcon} color={c.inkMuted} strokeWidth={1.9} />
            <Text style={styles.releaseText}>{d.release}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.white, styles.next]}>
          <Text style={styles.whyTitle}>{d.whyTitle}</Text>
          <Text style={styles.whySub}>{d.whySub}</Text>
          {d.reasons.map((r, i) => {
            const on = reason === r;
            return (
              <Pressable
                key={r}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setReason(r)}
                style={[styles.reason, i === 0 ? styles.reasonsFirst : styles.reasonNext]}
              >
                <Text style={styles.reasonText}>{r}</Text>
                <View style={[styles.radio, on && styles.radioOn]} />
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, styles.white, styles.next]}>
          <Text style={styles.whyTitle}>{d.moreTitle}</Text>
          <TextInput
            multiline
            placeholder={d.morePlaceholder}
            placeholderTextColor={c.inkMuted}
            style={styles.area}
          />
          <View style={styles.lock}>
            <Lock size={t.lockIcon} color={c.inkMuted} strokeWidth={2} />
            <Text style={styles.lockText}>{d.lock}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.panel, styles.next]}>
          <View style={styles.beforeHead}>
            <Info size={t.beforeIcon} color={c.panel} fill={c.brown} strokeWidth={2} />
            <Text style={styles.whyTitle}>{d.beforeTitle}</Text>
          </View>
          {d.bullets.map((b, i) => (
            <View key={b} style={[styles.bullet, i === 0 ? styles.bulletsFirst : styles.bulletNext]}>
              <View style={styles.dot} />
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agree }}
          onPress={() => setAgree((v) => !v)}
          style={[styles.card, styles.white, styles.next, styles.agree]}
        >
          <View style={[styles.box, agree && styles.boxOn]}>
            {agree && <Check size={t.boxGlyph} color={ink.onBrand} strokeWidth={3} />}
          </View>
          <View style={styles.flex}>
            <Text style={styles.agreeText}>{d.agree}</Text>
            <Text style={styles.agreeNote}>{d.agreeNote}</Text>
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cancel}
          accessibilityState={{ disabled: !agree }}
          disabled={!agree}
          onPress={() => router.replace('/(tabs)/home' as Href)}
          style={[styles.btn, styles.btnCancel]}
        >
          <Text style={[styles.btnText, styles.btnTextMuted]}>{d.cancel}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={keep} style={[styles.btn, styles.btnKeep]}>
          <Text style={styles.btnText}>{d.keep}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  hdrSub: { fontSize: t.hdrSubSize },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.colGap },

  card: { borderRadius: t.cardRadius, padding: t.cardPad },
  white: { backgroundColor: c.card, ...shadow },
  panel: { backgroundColor: c.panel },
  next: { marginTop: t.cardGap },
  top: { marginTop: t.cardTop, backgroundColor: c.peachSoft, flexDirection: 'row', gap: t.topGap, ...shadow },
  topDisc: {
    width: t.topDisc,
    height: t.topDisc,
    borderRadius: t.topDisc / 2,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontFamily: font.appSemi, fontSize: t.topTitleSize, lineHeight: t.topTitleLineHeight, color: c.ink },
  topBody: { marginTop: t.topBodyTop, fontFamily: font.appBody, fontSize: t.topBodySize, lineHeight: t.topBodyLineHeight, color: c.inkWarm },
  topSub: { marginTop: t.topSubTop, fontFamily: font.appBody, fontSize: t.topSubSize, lineHeight: t.topSubLineHeight, color: c.inkMuted },

  title: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.titleSize, lineHeight: t.titleLineHeight, color: c.ink },
  chip: {
    height: t.chipH,
    borderRadius: t.chipH / 2,
    paddingHorizontal: t.chipPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.chipGap,
    flexShrink: 1,
  },
  chipPanel: { backgroundColor: c.panel },
  chipGrey: { backgroundColor: c.helpGrey },
  chipText: { fontFamily: font.appSemi, fontSize: t.chipSize, letterSpacing: t.chipSpacing, color: c.inkWarm },
  chipInk: { color: c.ink },
  cellRow: { flexDirection: 'row', gap: t.colGap },
  cellsFirst: { marginTop: t.cellsTop },
  cellNext: { marginTop: t.cellGap },
  cell: {
    flex: 1,
    minWidth: 0,
    minHeight: t.cellH,
    borderRadius: t.cellRadius,
    paddingHorizontal: t.cellPadX,
    backgroundColor: c.panel,
    justifyContent: 'center',
  },
  cellLabel: {
    fontFamily: font.appSemi,
    fontSize: t.cellLabelSize,
    lineHeight: t.cellLabelLineHeight,
    letterSpacing: t.cellLabelSpacing,
    color: c.inkMuted,
  },
  cellValue: { fontFamily: font.appBody, fontSize: t.cellValueSize, lineHeight: t.cellValueLineHeight, color: c.ink },
  pill: {
    marginTop: t.pillTop,
    alignSelf: 'flex-start',
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    backgroundColor: p.reviewPill,
    justifyContent: 'center',
  },
  pillText: { fontFamily: font.appSemi, fontSize: t.chipSize, letterSpacing: t.chipSpacing, color: p.darkBrown },

  advPanel: {
    marginTop: t.advTop,
    borderRadius: t.advPanelRadius,
    padding: t.advPanelPad,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.photoGap,
  },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: t.photoTextSize, color: ink.onBrand },
  name: { fontFamily: font.appSemi, fontSize: t.nameSize, lineHeight: t.nameLineHeight, color: c.ink },
  verified: { flexDirection: 'row', alignItems: 'center', gap: t.verifiedGap },
  verifiedText: { fontFamily: font.appSemi, fontSize: t.verifiedSize, letterSpacing: t.verifiedSpacing, color: c.greenInk },
  release: { marginTop: t.releaseTop, flexDirection: 'row', alignItems: 'center', gap: t.releaseGap },
  releaseText: { flex: 1, fontFamily: font.appBody, fontSize: t.releaseSize, lineHeight: t.releaseLineHeight, color: c.inkWarm },

  whyTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.whyTitleSize, lineHeight: t.whyTitleLineHeight, color: c.ink },
  whySub: { marginTop: t.whySubTop, fontFamily: font.appBody, fontSize: t.whySubSize, lineHeight: t.whySubLineHeight, color: c.inkWarm },
  reason: {
    minHeight: t.reasonH,
    borderRadius: t.reasonRadius,
    paddingHorizontal: t.reasonPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.colGap,
  },
  reasonsFirst: { marginTop: t.reasonsTop },
  reasonNext: { marginTop: t.reasonGap },
  reasonText: { flex: 1, fontFamily: font.appBody, fontSize: t.reasonSize, color: c.ink },
  radio: {
    width: t.radio,
    height: t.radio,
    borderRadius: t.radio / 2,
    borderWidth: t.radioBorder,
    borderColor: dcDocumentsPalette.checkbox,
  },
  radioOn: { borderColor: c.brown, backgroundColor: c.brown },

  area: {
    marginTop: t.areaTop,
    height: t.areaH,
    borderRadius: t.areaRadius,
    padding: t.areaPad,
    backgroundColor: c.panel,
    textAlignVertical: 'top',
    fontFamily: font.appBody,
    fontSize: t.areaSize,
    lineHeight: t.areaLineHeight,
    color: c.ink,
  },
  lock: { marginTop: t.lockTop, flexDirection: 'row', alignItems: 'center', gap: t.lockGap },
  lockText: { flex: 1, fontFamily: font.appBody, fontSize: t.whySubSize, lineHeight: t.whySubLineHeight, color: c.inkMuted },

  beforeHead: { flexDirection: 'row', alignItems: 'center', gap: t.beforeGap },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: t.bulletTextGap, paddingLeft: t.bulletInset },
  bulletsFirst: { marginTop: t.bulletsTop },
  bulletNext: { marginTop: t.bulletGap },
  dot: {
    marginTop: (t.bulletLineHeight - t.bulletDot) / 2,
    width: t.bulletDot,
    height: t.bulletDot,
    borderRadius: t.bulletDot / 2,
    backgroundColor: c.inkWarm,
  },
  bulletText: { flex: 1, fontFamily: font.appBody, fontSize: t.bulletSize, lineHeight: t.bulletLineHeight, color: c.inkWarm },

  agree: { flexDirection: 'row', alignItems: 'flex-start', gap: t.boxGap },
  box: {
    width: t.box,
    height: t.box,
    borderRadius: t.boxRadius,
    borderWidth: t.boxBorder,
    borderColor: dcDocumentsPalette.checkbox,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: c.brown, borderColor: c.brown },
  agreeText: { fontFamily: font.appSemi, fontSize: t.agreeSize, lineHeight: t.agreeLineHeight, color: c.ink },
  agreeNote: {
    marginTop: t.agreeNoteTop,
    fontFamily: font.appBody,
    fontSize: t.agreeNoteSize,
    lineHeight: t.agreeNoteLineHeight,
    color: advForensicRed.declineColour,
  },

  btn: { height: t.btnH, borderRadius: t.btnH / 2, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { marginTop: t.btnTop, backgroundColor: c.helpGrey },
  btnKeep: { marginTop: t.btnGap, backgroundColor: c.card, ...shadow },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: c.ink },
  btnTextMuted: { color: c.inkMuted },
});
