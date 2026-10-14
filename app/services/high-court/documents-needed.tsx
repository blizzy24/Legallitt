import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Circle,
  CircleCheck,
  CircleQuestionMark,
  FolderOpen,
  Gavel,
  IdCard,
  MessageSquareDot,
  MessageSquareText,
  Scale,
  ShieldCheck,
  Truck,
  UserRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { courierHeader as h, font, hcDocsNeeded as t, hcPalette as c, ink, shadow } from '../../../constants/theme';
import { HC_DOCS_NEEDED } from '../../../data/highCourt';

// High Court — documents you need (design/303). Measured at 2.000 px/pt.
//
// Conflicts 4, 6 and 11 are commented on HC_DOCS_NEEDED.
//
// The desk photograph is a neutral block at the drawn size — no asset exists.
//
// STATIC, NOT WIRED: the checklist is a drawing. Ready / Not Added are not
// toggles (no confirmed state is drawn for ID Proof or the advocate papers),
// and nothing is uploaded. Continue opens design/304 (Send Documents); "Ask
// Adv. Rahul in Chat" opens the advocate chat (design/301).

const DOC_ICON = { folder: FolderOpen, scale: Scale, id: IdCard, briefcase: Briefcase } as const;

export default function HighCourtDocumentsNeededScreen() {
  const insets = useSafeAreaInsets();
  const d = HC_DOCS_NEEDED;

  return (
    <View style={styles.screen}>
      <CourierHeader
        title={d.title}
        backHref={'/services/high-court/confirm-advocate' as Href}
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
        <View style={styles.stepRow}>
          <View style={styles.step}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText} {...shrinkToFit(0.7)}>
              {d.step}
            </Text>
          </View>
          <Text style={styles.count} {...shrinkToFit(0.75)}>
            {d.count}
          </Text>
        </View>

        <View style={styles.adv}>
          <Gavel size={t.advIcon} color={c.inkWarm} strokeWidth={1.9} />
          <View style={styles.advText}>
            <Text style={styles.advName} {...shrinkToFit(0.8)}>
              {d.advName}
            </Text>
            <Text style={styles.advSub} {...shrinkToFit(0.75)}>
              {d.advSub}
            </Text>
          </View>
          <View style={styles.advDisc}>
            <BadgeCheck size={t.advDiscGlyph} color={c.brownInk} strokeWidth={2} />
          </View>
        </View>

        <Text style={styles.h1}>{d.h1}</Text>
        <Text style={styles.body}>{d.body}</Text>
        <Text style={styles.h2}>{d.h2}</Text>
        <Text style={styles.h2Sub}>{d.h2Sub}</Text>

        <View style={styles.list}>
          {d.docs.map((doc) => {
            const Icon = DOC_ICON[doc.icon];
            return (
              <View key={doc.title} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.tile}>
                    <Icon size={t.tileGlyph} color={c.brownInk} strokeWidth={1.8} />
                  </View>
                  <View style={styles.cardText}>
                    <View style={styles.titleRow}>
                      <Text style={styles.title} {...shrinkToFit(0.75)}>
                        {doc.title}
                      </Text>
                      {doc.required && (
                        <View style={styles.req}>
                          <Text style={styles.reqText}>{d.required}</Text>
                        </View>
                      )}
                    </View>
                    {!doc.required && (
                      <View style={styles.opt}>
                        <Text style={styles.optText}>{d.optional}</Text>
                      </View>
                    )}
                    <Text style={[styles.desc, !doc.required && styles.descAfterOpt]}>{doc.desc}</Text>
                  </View>
                </View>
                <View style={styles.foot}>
                  {doc.ready ? (
                    <View style={styles.footLead}>
                      <CircleCheck size={t.footIcon} color={c.greenInk} strokeWidth={2} />
                      <Text style={[styles.footText, styles.footReady]} {...shrinkToFit(0.75)}>
                        {doc.foot}
                      </Text>
                    </View>
                  ) : (
                    <Text style={[styles.footText, styles.footLead]}>{doc.foot}</Text>
                  )}
                  {/* Static — not a toggle. */}
                  <View style={[styles.pill, doc.ready ? styles.pillReady : styles.pillMissing]}>
                    {doc.ready ? (
                      <CircleCheck size={t.pillIcon} color={c.greenInk} strokeWidth={2} />
                    ) : (
                      <Circle size={t.pillIcon} color={c.ink} strokeWidth={2} />
                    )}
                    <Text style={[styles.pillText, doc.ready ? styles.pillTextReady : styles.pillTextMissing]}>
                      {doc.ready ? d.ready : d.notAdded}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.note}>
          <View style={styles.noteHead}>
            <View style={styles.noteAvatar}>
              <UserRound size={t.noteAvatarGlyph} color={ink.onBrand} strokeWidth={2} />
            </View>
            <Text style={styles.noteTitle} {...shrinkToFit(0.75)}>
              {d.noteTitle}
            </Text>
          </View>
          <Text style={styles.quote}>{d.note}</Text>
        </View>

        <View style={styles.next}>
          <View style={styles.image}>
            <View style={styles.pick}>
              <Truck size={t.pickIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.pickText}>{d.pickup}</Text>
            </View>
          </View>
          <View style={styles.nextBody}>
            <View style={styles.nextHead}>
              <MessageSquareDot size={t.nextIcon} color={c.ink} strokeWidth={1.9} />
              <Text style={styles.nextTitle}>{d.nextTitle}</Text>
            </View>
            <Text style={styles.nextBold}>{d.nextBold}</Text>
            <Text style={styles.nextText}>{d.nextBody}</Text>
          </View>
        </View>

        <View style={styles.imp}>
          <ShieldCheck size={t.impIcon} color={c.inkWarm} strokeWidth={1.9} />
          <Text style={styles.impText}>
            <Text style={styles.impLead}>{d.impLead}</Text>
            {d.imp}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/high-court/send-documents' as Href)}
          style={styles.btn}
        >
          <Text style={styles.btnText}>{d.cta}</Text>
          <ArrowRight size={t.btnIcon} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <Text style={styles.caption}>{d.caption}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/services/high-court/chat' as Href)}
          style={styles.ask}
        >
          <MessageSquareText size={t.askIcon} color={c.brownInk} strokeWidth={1.9} />
          <Text style={styles.askText} {...shrinkToFit(0.75)}>
            {d.ask}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.page },
  content: { paddingHorizontal: t.padX, paddingBottom: t.scrollBottom },
  help: { marginRight: t.helpGap },

  stepRow: { marginTop: t.stepTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.advGap },
  step: {
    flexShrink: 1,
    height: t.stepH,
    borderRadius: t.stepH / 2,
    paddingHorizontal: t.stepPadX,
    backgroundColor: c.peachSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.stepGap,
  },
  stepDot: { width: t.stepDot, height: t.stepDot, borderRadius: t.stepDot / 2, backgroundColor: c.brown },
  stepText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.stepSize, letterSpacing: t.stepSpacing, color: c.brownInk },
  count: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.countSize, color: c.inkWarm },

  adv: {
    marginTop: t.advTop,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.advRadius,
    backgroundColor: c.panel,
    paddingLeft: t.advPadL,
    paddingRight: t.advPadR,
    paddingVertical: t.advPadY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  advText: { flex: 1, minWidth: 0, marginLeft: t.advGap },
  advName: { fontFamily: font.appSemi, fontSize: t.advNameSize, lineHeight: t.advNameLineHeight, color: c.ink },
  advSub: { fontFamily: font.appBody, fontSize: t.advSubSize, lineHeight: t.advSubLineHeight, color: c.inkWarm },
  advDisc: {
    marginLeft: t.advGap,
    width: t.advDisc,
    height: t.advDisc,
    borderRadius: t.advDisc / 2,
    backgroundColor: c.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },

  h1: { marginTop: t.h1Top, fontFamily: font.appSemi, fontSize: t.h1Size, lineHeight: t.h1LineHeight, color: c.ink },
  body: { marginTop: t.bodyTop, fontFamily: font.appBody, fontSize: t.bodySize, lineHeight: t.bodyLineHeight, color: c.inkWarm },
  h2: { marginTop: t.h2Top, fontFamily: font.appSemi, fontSize: t.h2Size, lineHeight: t.h2LineHeight, color: c.ink },
  h2Sub: { fontFamily: font.appBody, fontSize: t.h2SubSize, lineHeight: t.h2SubLineHeight, color: c.inkWarm },

  list: { marginTop: t.listTop, marginLeft: t.cardLeft - t.padX, gap: t.cardGap },
  card: {
    ...shadow,
    borderRadius: t.cardRadius,
    backgroundColor: c.card,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: c.helpGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, minWidth: 0, marginLeft: t.tileGap, marginTop: t.textTop },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: t.titleGap },
  title: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.titleSize, lineHeight: t.titleLineHeight, color: c.ink },
  req: { height: t.reqH, borderRadius: t.reqRadius, paddingHorizontal: t.reqPadX, backgroundColor: c.reqDark, justifyContent: 'center' },
  reqText: { fontFamily: font.appSemi, fontSize: t.reqSize, letterSpacing: t.reqSpacing, color: ink.onBrand },
  opt: {
    marginTop: t.optTop,
    alignSelf: 'flex-start',
    height: t.reqH,
    borderRadius: t.reqRadius,
    paddingHorizontal: t.reqPadX,
    backgroundColor: c.tileGrey,
    justifyContent: 'center',
  },
  optText: { fontFamily: font.appSemi, fontSize: t.optSize, color: c.inkWarm },
  desc: { marginTop: t.descTop, fontFamily: font.appBody, fontSize: t.descSize, lineHeight: t.descLineHeight, color: c.inkWarm },
  descAfterOpt: { marginTop: t.optDescTop },
  foot: { marginTop: t.footTop, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.pillGap },
  footLead: { flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: t.footIconGap },
  footText: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.footSize, color: c.ink },
  footReady: { color: c.greenInk },
  pill: {
    height: t.pillH,
    borderRadius: t.pillH / 2,
    paddingHorizontal: t.pillPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pillGap,
  },
  pillReady: { backgroundColor: c.greenSoft },
  pillMissing: { backgroundColor: c.helpGrey },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize },
  pillTextReady: { color: c.greenInk },
  pillTextMissing: { color: c.ink },

  note: {
    marginTop: t.noteTop,
    borderRadius: t.noteRadius,
    borderLeftWidth: t.noteBar,
    borderLeftColor: c.brown,
    backgroundColor: c.panel,
    paddingLeft: t.notePadL,
    paddingRight: t.notePadR,
    paddingTop: t.notePadTop,
    paddingBottom: t.notePadBottom,
  },
  noteHead: { flexDirection: 'row', alignItems: 'center', gap: t.noteGap },
  noteAvatar: {
    width: t.noteAvatar,
    height: t.noteAvatar,
    borderRadius: t.noteAvatar / 2,
    backgroundColor: c.brown,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteTitle: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.noteTitleSize, lineHeight: t.noteTitleLineHeight, color: c.ink },
  quote: { marginTop: t.quoteTop, fontFamily: font.appBody, fontSize: t.quoteSize, lineHeight: t.quoteLineHeight, color: c.inkWarm },

  next: {
    ...shadow,
    marginTop: t.nextTop,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: c.card,
    overflow: 'hidden',
  },
  image: { height: t.imageH, backgroundColor: c.heroArt },
  pick: {
    position: 'absolute',
    top: t.pickTop,
    right: t.pickRight,
    height: t.pickH,
    borderRadius: t.pickH / 2,
    paddingHorizontal: t.pickPadX,
    backgroundColor: c.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.pickGap,
  },
  pickText: { fontFamily: font.appSemi, fontSize: t.pickSize, color: c.ink },
  nextBody: { paddingHorizontal: t.nextPadX, paddingTop: t.nextPadTop, paddingBottom: t.nextPadBottom },
  nextHead: { flexDirection: 'row', alignItems: 'center', gap: t.nextIconGap },
  nextTitle: { fontFamily: font.appSemi, fontSize: t.nextTitleSize, lineHeight: t.nextTitleLineHeight, color: c.ink },
  nextBold: { marginTop: t.nextBoldTop, fontFamily: font.appSemi, fontSize: t.nextBoldSize, lineHeight: t.nextBoldLineHeight, color: c.ink },
  nextText: { marginTop: t.nextBodyTop, fontFamily: font.appBody, fontSize: t.nextBodySize, lineHeight: t.nextBodyLineHeight, color: c.inkWarm },

  imp: {
    marginTop: t.impTop,
    marginLeft: t.cardLeft - t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: c.panel,
    paddingHorizontal: t.impPadX,
    paddingTop: t.impPadTop,
    paddingBottom: t.impPadBottom,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.impGap,
  },
  impText: { flex: 1, fontFamily: font.appBody, fontSize: t.impSize, lineHeight: t.impLineHeight, color: c.inkWarm },
  impLead: { fontFamily: font.appSemi, color: c.ink },

  bar: { backgroundColor: c.card, paddingHorizontal: t.cardLeft, paddingTop: t.barPadTop },
  btn: {
    height: t.btnH,
    borderRadius: t.btnH / 2,
    backgroundColor: c.brown,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.btnGap,
  },
  btnText: { fontFamily: font.appSemi, fontSize: t.btnSize, color: ink.onBrand },
  caption: { marginTop: t.capTop, textAlign: 'center', fontFamily: font.appBody, fontSize: t.capSize, lineHeight: t.capLineHeight, color: c.inkWarm },
  ask: { marginTop: t.askTop, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: t.askGap, maxWidth: '100%' },
  askText: { flexShrink: 1, fontFamily: font.appSemi, fontSize: t.askSize, lineHeight: t.askLineHeight, color: c.brownInk },
});
