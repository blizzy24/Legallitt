import { router, type Href } from 'expo-router';
import {
  BadgeCheck,
  Building,
  Check,
  Clock,
  ClockFading,
  Copy,
  Folder,
  Gavel,
  Headset,
  LockKeyhole,
  RotateCw,
  Truck,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../../components/CourierHeader';
import { shrinkToFit } from '../../../../constants/textFit';
import { font, hcPalette as c, hcTracking as t, ink, shadow, status } from '../../../../constants/theme';
import { HC_TRACKING } from '../../../../data/highCourt';

// High Court courier — document delivery tracking (design/311). Measured at
// 2.000 px/pt. Reached from View Tracking on design/310.
//
// Conflicts 4 and 5 are commented on HC_TRACKING.
//
// STATIC, NOT WIRED: no courier feed. The progress list is a drawing, Copy
// copies nothing, and Refresh Tracking refreshes nothing — the screen's own
// "Real courier tracking" / "Live data synced" labels are drawn, not true.
// Need Help opens support chat. No designed control leads on to design/312
// (Documents Delivered); it is reachable as a development preview state.

const STEP_ICON = { check: Check, truck: Truck, clock: Clock, building: Building, badge: BadgeCheck } as const;

export default function HighCourtTrackingScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_TRACKING;

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} center backHref={'/services/high-court/courier/shipment' as Href} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>{d.intro}</Text>

        <View style={[styles.card, styles.top]}>
          <View style={styles.between}>
            <View style={[styles.pill, styles.pillGrey]}>
              <Truck size={t.pillIcon} color={c.inkWarm} strokeWidth={1.9} />
              <Text style={styles.pillText}>{d.courier}</Text>
            </View>
            <View style={[styles.pill, styles.pillPeach]}>
              <View style={styles.pillDot} />
              <Text style={[styles.pillText, styles.brownText]}>{d.state}</Text>
            </View>
          </View>
          <View style={styles.way}>
            <View style={styles.flex}>
              <Text style={styles.wayLabel}>{d.wayLabel}</Text>
              <Text style={styles.wayValue} {...shrinkToFit(0.8)}>
                {d.waybill}
              </Text>
            </View>
            {/* Inert — nothing is copied. */}
            <View style={styles.copy}>
              <Copy size={t.copyIcon} color={c.brown} strokeWidth={1.9} />
              <Text style={styles.copyText}>{d.copy}</Text>
            </View>
          </View>
          <View style={styles.exp}>
            <Clock size={t.expIcon} color={c.inkWarm} strokeWidth={1.9} />
            <Text style={styles.expText}>
              {d.expLead}
              <Text style={styles.expBold}>{d.exp}</Text>
            </Text>
          </View>
        </View>

        <View style={[styles.card, styles.prog]}>
          <Text style={styles.progTitle}>{d.progTitle}</Text>
          <Text style={styles.progSub}>{d.progSub}</Text>
          <View style={styles.steps}>
            {d.steps.map((s, i) => {
              const Icon = STEP_ICON[s.icon];
              const last = i === d.steps.length - 1;
              const nextWaiting = !last && d.steps[i + 1].state === 'waiting';
              const waiting = s.state === 'waiting';
              return (
                <View key={s.title} style={styles.step}>
                  <View style={styles.railCol}>
                    <View
                      style={[
                        styles.disc,
                        s.state === 'done' && styles.discDone,
                        s.state === 'current' && styles.discCurrent,
                        waiting && styles.discWait,
                      ]}
                    >
                      <Icon
                        size={t.discGlyph}
                        color={waiting ? c.inkMuted : ink.onBrand}
                        strokeWidth={s.state === 'done' ? 3 : 2}
                      />
                    </View>
                    {!last && <View style={[styles.rail, s.state === 'done' && !nextWaiting && styles.railDone]} />}
                  </View>
                  <View style={[styles.stepBody, !last && (s.state === 'done' ? styles.stepSpaced : styles.waitSpaced)]}>
                    <View style={styles.stepHead}>
                      <Text style={[styles.stepTitle, waiting && styles.stepTitleWait]} {...shrinkToFit(0.8)}>
                        {s.title}
                      </Text>
                      {'label' in s && (
                        <Text style={[styles.stepState, s.state === 'current' && styles.stepStateCurrent]}>{s.label}</Text>
                      )}
                    </View>
                    <Text style={[styles.stepDesc, waiting && styles.stepDescWait]}>{s.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={[styles.card, styles.send]}>
          <View style={styles.head}>
            <View style={styles.tile}>
              <Gavel size={t.tileGlyph} color={c.brown} strokeWidth={1.9} />
            </View>
            <Text style={styles.headText}>{d.sendTitle}</Text>
            <View style={styles.ver}>
              <BadgeCheck size={t.verIcon} color={c.greenInk} strokeWidth={2} />
              <Text style={styles.verText}>{d.verified}</Text>
            </View>
          </View>
          <View style={styles.panel}>
            <Text style={styles.name}>{d.toName}</Text>
            <Text style={styles.addr}>{d.toAddr}</Text>
          </View>
        </View>

        <View style={[styles.card, styles.send]}>
          <View style={styles.head}>
            <View style={styles.tile}>
              <Folder size={t.tileGlyph} color={c.brown} strokeWidth={1.9} />
            </View>
            <Text style={styles.headText}>{d.docsTitle}</Text>
            <View style={styles.items}>
              <Text style={styles.itemsText}>{d.items}</Text>
            </View>
          </View>
          <View style={styles.panel}>
            <Text style={styles.docsText}>{d.docsText}</Text>
            <View style={styles.seal}>
              <LockKeyhole size={t.sealIcon} color={c.greenInk} strokeWidth={2.2} />
              <Text style={styles.sealText}>{d.seal}</Text>
            </View>
          </View>
        </View>

        <View style={styles.last}>
          <View style={styles.between}>
            <View style={styles.lastHead}>
              <ClockFading size={t.lastIcon} color={c.inkWarm} strokeWidth={2} />
              <Text style={styles.lastTitle}>{d.lastTitle}</Text>
            </View>
            <Text style={styles.lastMeta}>{d.lastMeta}</Text>
          </View>
          <View style={[styles.between, styles.lastRow]}>
            <Text style={styles.hub} {...shrinkToFit(0.8)}>
              {d.hub}
            </Text>
            <Text style={styles.time}>{d.time}</Text>
          </View>
          <View style={[styles.between, styles.dateRow]}>
            <Text style={styles.time}>{d.date}</Text>
            <Text style={[styles.lastMeta, styles.synced]}>{d.synced}</Text>
          </View>
        </View>

        {/* Static — refreshes nothing. */}
        <View style={styles.refresh}>
          <RotateCw size={t.refreshIcon} color={ink.onBrand} strokeWidth={2.4} />
          <Text style={styles.refreshText}>{d.refresh}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/support-chat' as Href)}
          style={styles.help}
        >
          <Headset size={t.helpIcon} color={c.inkWarm} strokeWidth={1.9} />
          <Text style={styles.helpText} {...shrinkToFit(0.75)}>
            {d.help}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX },
  flex: { flex: 1, minWidth: 0 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.pillGap },
  brownText: { color: c.brownInk },

  intro: { marginTop: t.introTop, fontFamily: font.appBody, fontSize: t.introSize, lineHeight: t.introLineHeight, color: c.inkWarm },

  card: { ...shadow, marginLeft: t.cardLeft - t.padX, marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: c.card, paddingHorizontal: t.cardPadX },
  top: { marginTop: t.topTop, paddingTop: t.topPadTop, paddingBottom: t.topPadBottom },
  pill: { height: t.pillH, borderRadius: t.pillH / 2, paddingHorizontal: t.pillPadX, flexDirection: 'row', alignItems: 'center', gap: t.pillGap },
  pillGrey: { backgroundColor: c.tileGrey },
  pillPeach: { backgroundColor: c.peach },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: c.brown },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: c.inkWarm },
  way: {
    marginTop: t.wayTop,
    minHeight: t.wayH,
    borderRadius: t.wayRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.wayPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  wayLabel: {
    fontFamily: font.appSemi,
    fontSize: t.wayLabelSize,
    lineHeight: t.wayLabelLineHeight,
    letterSpacing: t.wayLabelSpacing,
    color: c.inkWarm,
  },
  wayValue: {
    fontFamily: font.appSemi,
    fontSize: t.wayValueSize,
    lineHeight: t.wayValueLineHeight,
    letterSpacing: t.wayValueSpacing,
    color: c.ink,
  },
  copy: {
    height: t.copyH,
    borderRadius: t.copyH / 2,
    paddingHorizontal: t.copyPadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap - 1,
  },
  copyText: { fontFamily: font.appSemi, fontSize: t.copySize, color: c.inkWarm },
  exp: { marginTop: t.expTop, minHeight: t.expLineHeight, flexDirection: 'row', alignItems: 'center', gap: t.expGap },
  expText: { flex: 1, fontFamily: font.appBody, fontSize: t.expSize, lineHeight: t.expLineHeight, color: c.inkWarm },
  expBold: { fontFamily: font.appSemi, color: c.ink },

  prog: { paddingTop: t.progPadTop, paddingBottom: t.progPadBottom },
  progTitle: { fontFamily: font.appSemi, fontSize: t.progTitleSize, lineHeight: t.progTitleLineHeight, color: c.ink },
  progSub: { fontFamily: font.appBody, fontSize: t.progSubSize, lineHeight: t.progSubLineHeight, color: c.inkWarm },
  steps: { marginTop: t.stepsTop },
  step: { flexDirection: 'row' },
  railCol: { marginLeft: t.discX, width: t.disc, alignItems: 'center', paddingTop: (t.stepTitleLineHeight - t.disc) / 2 },
  disc: { width: t.disc, height: t.disc, borderRadius: t.disc / 2, alignItems: 'center', justifyContent: 'center' },
  discDone: { backgroundColor: c.greenInk },
  discCurrent: { backgroundColor: c.currentDisc },
  discWait: { backgroundColor: c.tileGrey },
  rail: { flex: 1, width: t.rail, backgroundColor: c.rail },
  railDone: { backgroundColor: status.active },
  stepBody: { flex: 1, minWidth: 0, marginLeft: t.discGap },
  stepSpaced: { paddingBottom: t.stepGap },
  waitSpaced: { paddingBottom: t.waitGap },
  stepHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.pillGap },
  stepTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.stepTitleSize, lineHeight: t.stepTitleLineHeight, color: c.ink },
  stepTitleWait: { color: c.inkWarm },
  stepState: { fontFamily: font.appSemi, fontSize: t.stepStateSize, color: c.greenInk },
  stepStateCurrent: { color: c.brownLift },
  stepDesc: { fontFamily: font.appBody, fontSize: t.stepDescSize, lineHeight: t.stepDescLineHeight, color: c.inkWarm },
  stepDescWait: { marginTop: t.waitDescTop, color: c.inkMuted },

  send: { paddingTop: t.sendPadTop, paddingBottom: t.sendPadBottom },
  head: { flexDirection: 'row', alignItems: 'center', gap: t.tileGap },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: c.tileGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: { flex: 1, fontFamily: font.appSemi, fontSize: t.headSize, lineHeight: t.headLineHeight, color: c.ink },
  ver: {
    height: t.verH,
    borderRadius: t.verH / 2,
    paddingHorizontal: t.verPadX,
    backgroundColor: c.panel,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.verGap,
  },
  verText: { fontFamily: font.appSemi, fontSize: t.verSize, color: c.greenInk },
  items: { height: t.itemsH, borderRadius: t.itemsH / 2, paddingHorizontal: t.itemsPadX, backgroundColor: c.tileGrey, justifyContent: 'center' },
  itemsText: { fontFamily: font.appSemi, fontSize: t.itemsSize, color: c.inkWarm },
  panel: {
    marginTop: t.panelTop,
    borderRadius: t.panelRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.panelPadX,
    paddingVertical: t.panelPadY,
  },
  name: { fontFamily: font.appSemi, fontSize: t.nameSize, lineHeight: t.nameLineHeight, color: c.ink },
  addr: { fontFamily: font.appBody, fontSize: t.addrSize, lineHeight: t.addrLineHeight, color: c.inkWarm },
  docsText: { fontFamily: font.appSemi, fontSize: t.docsTextSize, lineHeight: t.docsTextLineHeight, color: c.ink },
  seal: { marginTop: t.sealTop, flexDirection: 'row', alignItems: 'center', gap: t.sealGap },
  sealText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.sealSize, lineHeight: t.sealLineHeight, color: c.greenInk },

  last: {
    marginTop: t.cardGap,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: c.helpGrey,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.lastPadTop,
    paddingBottom: t.lastPadBottom,
  },
  lastHead: { flexDirection: 'row', alignItems: 'center', gap: t.lastGap },
  lastTitle: { fontFamily: font.appSemi, fontSize: t.lastTitleSize, lineHeight: t.lastTitleLineHeight, color: c.ink },
  lastMeta: { flexShrink: 1, textAlign: 'right', fontFamily: font.appSemi, fontSize: t.lastMetaSize, color: c.inkWarm },
  synced: { color: c.brownLift },
  lastRow: { marginTop: t.lastRowTop },
  dateRow: { marginTop: t.dateTop },
  hub: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.hubSize, lineHeight: t.hubLineHeight, color: c.ink },
  time: { fontFamily: font.appBody, fontSize: t.timeSize, lineHeight: t.dateLineHeight, color: c.inkWarm },

  refresh: {
    marginTop: t.refreshTop,
    marginLeft: t.cardLeft - t.padX,
    height: t.refreshH,
    borderRadius: t.refreshH / 2,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.refreshGap,
  },
  refreshText: { fontFamily: font.appSemi, fontSize: t.refreshSize, color: ink.onBrand },
  help: {
    marginTop: t.helpTop,
    marginLeft: t.cardLeft - t.padX,
    height: t.helpH,
    borderRadius: t.helpH / 2,
    paddingHorizontal: t.cardPadX,
    backgroundColor: c.tileGrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.refreshGap,
  },
  helpText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.helpSize, color: c.inkWarm },
});
