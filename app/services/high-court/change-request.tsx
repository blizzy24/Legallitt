import { router, type Href } from 'expo-router';
import { Check, X } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { font, hcChangeSheet as t, hcPalette as c, hcSheetPalette as s } from '../../../constants/theme';
import { HC_CHANGE } from '../../../data/highCourt';
import HighCourtReviewFilingScreen from './review-filing';

// High Court — change-request tracking (design/319), a sheet over design/318.
// Measured at 2.000 px/pt.
//
// Expo Router's `transparentModal` presentation is iOS/Android only (Expo v57
// router docs), so on web this route draws design/318 itself underneath and
// lays the scrim and sheet over it — the drawing shows 318 dimmed behind. The
// sheet's own off-palette colours are quarantined in hcSheetPalette.
//
// Conflict 5 and the request/note mismatch are commented on HC_CHANGE.
//
// STATIC, NOT WIRED: the tracking timeline is a drawing ("Live Status" is
// drawn, not live). Close, the X and the scrim return to design/318.

export default function HighCourtChangeRequestScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_CHANGE;
  const close = () =>
    router.canGoBack() ? router.back() : router.replace('/services/high-court/review-filing' as Href);

  return (
    <View style={styles.screen}>
      <HighCourtReviewFilingScreen />
      <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} style={styles.scrim} />

      <View style={[styles.sheet, { top: insets.top + t.sheetTop }]}>
        <View style={styles.handle} />
        <View style={styles.head}>
          <View style={styles.flex}>
            <View style={styles.titleRow}>
              <Text style={styles.title} {...shrinkToFit(0.8)}>
                {d.title}
              </Text>
              <View style={styles.round}>
                <Text style={styles.roundText}>{d.round}</Text>
              </View>
            </View>
            <Text style={styles.sub} {...shrinkToFit(0.75)}>
              {d.sub}
            </Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} style={styles.x}>
            <X size={t.closeIcon} color={s.grey} strokeWidth={2} />
          </Pressable>
        </View>
        <View style={styles.divider} />

        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          <View style={styles.req}>
            <View style={styles.between}>
              <Text style={styles.caps}>{d.reqLabel}</Text>
              <Text style={styles.date}>{d.reqDate}</Text>
            </View>
            <Text style={styles.quote}>{d.reqQuote}</Text>
            <View style={styles.rule} />
            <View style={[styles.metaRow, styles.metaFirst]}>
              <Text style={styles.metaLabel}>{d.requestedBy}</Text>
              <Text style={styles.metaValue}>{d.requester}</Text>
              <View style={styles.client}>
                <Text style={styles.clientText}>{d.client}</Text>
              </View>
            </View>
            <View style={[styles.metaRow, styles.metaNext]}>
              <Text style={styles.metaLabel}>{d.advLabel}</Text>
              <Text style={styles.metaValue}>{d.adv}</Text>
            </View>
          </View>

          <View style={[styles.between, styles.tlHead]}>
            <Text style={styles.tlTitle}>{d.tlTitle}</Text>
            <View style={styles.live}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{d.live}</Text>
            </View>
          </View>

          <View style={styles.steps}>
            {d.steps.map((st, i) => {
              const last = i === d.steps.length - 1;
              return (
                <View key={st.title} style={styles.step}>
                  <View style={styles.railCol}>
                    {st.state === 'done' && (
                      <View style={[styles.disc, styles.discDone]}>
                        <Check size={t.discGlyph} color={s.surface} strokeWidth={3} />
                      </View>
                    )}
                    {st.state === 'active' && (
                      <View style={[styles.disc, styles.discActive]}>
                        <View style={styles.ringDot} />
                      </View>
                    )}
                    {st.state === 'pending' && (
                      <View style={[styles.disc, styles.discPending]}>
                        <Text style={styles.num}>{i + 1}</Text>
                      </View>
                    )}
                    {!last && <View style={[styles.rail, st.state === 'done' && styles.railDone]} />}
                  </View>
                  <View style={[styles.flex, !last && styles.stepBody]}>
                    <View style={styles.between}>
                      <Text style={[styles.stepTitle, st.state === 'pending' && styles.stepTitleMuted]} {...shrinkToFit(0.75)}>
                        {st.title}
                      </Text>
                      <View
                        style={[
                          styles.badge,
                          st.state === 'done' && styles.badgeDone,
                          st.state === 'active' && styles.badgeActive,
                          st.state === 'pending' && styles.badgePending,
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            st.state === 'done' && styles.badgeTextDone,
                            st.state === 'active' && styles.badgeTextActive,
                          ]}
                        >
                          {st.badge}
                        </Text>
                      </View>
                    </View>
                    {'desc' in st && <Text style={styles.desc}>{st.desc}</Text>}
                    {'box' in st && (
                      <View style={styles.box}>
                        <Text style={styles.boxText}>{st.box}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
          <Pressable accessibilityRole="button" onPress={close} style={styles.btn}>
            <Text style={styles.btnText}>{d.close}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.metaGap },
  scrim: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: s.scrim },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: t.sheetRadius,
    borderTopRightRadius: t.sheetRadius,
    backgroundColor: c.card,
    overflow: 'hidden',
  },
  handle: { marginTop: t.handleTop, alignSelf: 'center', width: t.handleW, height: t.handleH, borderRadius: t.handleH / 2, backgroundColor: s.handle },
  head: { marginTop: t.headTop, paddingHorizontal: t.padX, flexDirection: 'row', alignItems: 'center', gap: t.metaGap },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: t.metaGap + 2 },
  title: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.titleSize, lineHeight: t.titleLineHeight, color: s.ink },
  round: { height: t.roundH, borderRadius: t.roundH / 2, paddingHorizontal: t.roundPadX, backgroundColor: s.brownSoft, justifyContent: 'center' },
  roundText: { fontFamily: font.appSemi, fontSize: t.roundSize, color: s.brown },
  sub: { marginTop: t.subTop, fontFamily: font.appBody, fontSize: t.subSize, lineHeight: t.subLineHeight, color: s.grey },
  x: {
    width: t.close,
    height: t.close,
    borderRadius: t.close / 2,
    borderWidth: 1,
    borderColor: s.border,
    backgroundColor: s.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { marginTop: t.dividerTop, height: 1, backgroundColor: s.border },

  list: { paddingHorizontal: t.padX, paddingBottom: t.listBottom },
  req: {
    marginTop: t.reqTop,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.reqRadius,
    borderWidth: 1,
    borderColor: s.border,
    backgroundColor: s.surface,
    paddingHorizontal: t.reqPadX,
    paddingTop: t.reqPadTop,
    paddingBottom: t.reqPadBottom,
  },
  caps: { fontFamily: font.appSemi, fontSize: t.capsSize, lineHeight: t.capsLineHeight, letterSpacing: t.capsSpacing, color: s.brown },
  date: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.dateSize, color: s.grey },
  quote: { marginTop: t.quoteTop, fontFamily: font.appSemi, fontSize: t.quoteSize, lineHeight: t.quoteLineHeight, color: s.ink },
  rule: { marginTop: t.ruleTop, height: 1, backgroundColor: s.border },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: t.metaGap },
  metaFirst: { marginTop: t.metaTop },
  metaNext: { marginTop: t.metaRowGap },
  metaLabel: { fontFamily: font.appBody, fontSize: t.metaSize, lineHeight: t.metaLineHeight, color: s.brown },
  metaValue: { fontFamily: font.appSemi, fontSize: t.metaSize, lineHeight: t.metaLineHeight, color: s.ink },
  client: { height: t.clientH, borderRadius: t.clientH / 4, paddingHorizontal: t.clientPadX, backgroundColor: s.chip, justifyContent: 'center' },
  clientText: { fontFamily: font.appBody, fontSize: t.clientSize, color: s.grey },

  tlHead: { marginTop: t.tlTop },
  tlTitle: { fontFamily: font.appSemi, fontSize: t.tlTitleSize, letterSpacing: t.tlTitleSpacing, color: s.ink },
  live: { flexDirection: 'row', alignItems: 'center', gap: t.metaGap },
  liveDot: { width: t.liveDot, height: t.liveDot, borderRadius: t.liveDot / 2, backgroundColor: s.amber },
  liveText: { fontFamily: font.appBody, fontSize: t.liveSize, color: s.grey },

  steps: { marginTop: t.stepsTop },
  step: { flexDirection: 'row', gap: t.stepGap },
  railCol: { width: t.disc, alignItems: 'center', marginLeft: t.discX },
  disc: { width: t.disc, height: t.disc, borderRadius: t.disc / 2, alignItems: 'center', justifyContent: 'center', marginTop: (t.stepTitleLineHeight - t.disc) / 2 },
  discDone: { backgroundColor: s.green },
  discActive: { borderWidth: t.ringBorder, borderColor: s.brown, backgroundColor: s.brownSoft },
  ringDot: { width: t.ringDot, height: t.ringDot, borderRadius: t.ringDot / 2, backgroundColor: s.brown },
  discPending: { borderWidth: 1, borderColor: s.border, backgroundColor: s.surface },
  num: { fontFamily: font.appSemi, fontSize: t.numSize, color: s.brown },
  rail: { flex: 1, width: t.railW, backgroundColor: s.border },
  railDone: { backgroundColor: s.green },
  stepBody: { paddingBottom: t.stepPadBottom },
  stepTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.stepTitleSize, lineHeight: t.stepTitleLineHeight, color: s.ink },
  stepTitleMuted: { fontFamily: font.appBody, color: s.grey },
  badge: { height: t.badgeH, borderRadius: t.badgeH / 2, paddingHorizontal: t.badgePadX, borderWidth: 1, justifyContent: 'center' },
  badgeDone: { backgroundColor: s.greenSoft, borderColor: s.greenSoft },
  badgeActive: { backgroundColor: s.brownSoft, borderColor: s.border },
  badgePending: { backgroundColor: s.surface, borderColor: s.border },
  badgeText: { fontFamily: font.appBody, fontSize: t.badgeSize, color: s.grey },
  badgeTextDone: { color: s.green },
  badgeTextActive: { color: s.brown },
  desc: { marginTop: t.descTop, fontFamily: font.appBody, fontSize: t.descSize, lineHeight: t.descLineHeight, color: s.grey },
  box: {
    marginTop: t.boxTop,
    borderRadius: t.boxRadius,
    borderWidth: 1,
    borderColor: s.border,
    paddingHorizontal: t.boxPadX,
    paddingVertical: t.boxPadY,
  },
  boxText: { fontFamily: font.appBody, fontSize: t.boxSize, lineHeight: t.boxLineHeight, color: s.grey },

  bar: { paddingHorizontal: t.padX, paddingTop: t.barPadTop },
  btn: {
    height: t.btnH,
    borderRadius: t.btnRadius,
    borderWidth: 1,
    borderColor: s.border,
    backgroundColor: s.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: s.ink },
});
