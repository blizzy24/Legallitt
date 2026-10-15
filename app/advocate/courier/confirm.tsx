import { DEMO_AUTO_ADVANCE } from '../../../constants/dev';
import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  FileText,
  Files,
  Hand,
  ShieldCheck,
  Truck,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../../components/CourierHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { CO_CONFIRM } from '../../../data/courier';
import { courierConfirm as t, courierGreen as g, font, ink } from '../../../constants/theme';

// ADVOCATE — confirm the physical documents arrived (design/282).
//
// WHY THIS IS ADVOCATE-SIDE. The brief put 282 and 283 under app/advocate/ and
// measuring them agrees. 282 asks "Did You Receive the Documents?", its
// checkbox reads "I have received the physical documents" and its action is
// "Confirm Received" — a client cannot confirm their own delivery, and
// design/281 says so in as many words: "The advocate will confirm in the
// system once physical documents are in hand." design/283's "Received By" is
// [Advocate Name] and its footer action is "Chat with Client". Both stay here.
//
// The chrome is the same back + title + avatar bar the client screens draw, so
// components/CourierHeader is reused across both apps.
//
// ⚠ Note 12 — drawn with placeholders: [Client Name], [Case Name], [Case ID],
//   [Document Name] x4, [Courier Name], [Waybill Number], [Date], [Time] and
//   "[Name if available]". Sample values rendered; all listed in PLACEHOLDERS.
// ⚠ Note 7 — "4 Documents" and four rows labelled "Original Hardcopy 1–4",
//   against 5 on designs 275/284 and 3 on design/281.
//
// The checkbox is REAL, not drawn: the export shows it unchecked with the
// action greyed out, and that state has to be leaveable for 282 to reach 283.
// Checking it enables the button; nothing else on the screen responds.
export default function AdvocateCourierConfirmScreen() {
  const insets = useSafeAreaInsets();
  const d = CO_CONFIRM;
  const [checked, setChecked] = useState(false);

  return (
    <View style={styles.screen}>
      <CourierHeader title={d.title} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.card, styles.cardFirst]}>
          <View style={styles.row}>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText} {...shrinkToFit(0.8)}>
                {d.deliveredPill}
              </Text>
            </View>
            <View style={styles.flex} />
            <BadgeCheck size={t.verifyGlyph} color={g.ink} strokeWidth={2} />
            <Text style={styles.verify} {...shrinkToFit(0.8)}>
              {d.verified}
            </Text>
          </View>
          <Text style={styles.deliveredBody}>{d.deliveredBody}</Text>
        </View>

        <View style={styles.card}>
          <Section icon="case" title={d.caseTitle} sub={d.caseSub} />
          {d.caseRows.map((r, i) => (
            <View key={r.label} style={[styles.dataRow, i === 0 ? styles.dataRowFirst : styles.dataRowNext]}>
              <Text style={styles.dataLabel} {...shrinkToFit(0.8)}>
                {r.label}
              </Text>
              <Text style={[styles.dataValue, r.mono && styles.mono]} {...shrinkToFit(0.75)}>
                {r.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.card, styles.docsCard]}>
          <View style={styles.row}>
            <View style={styles.tile}>
              <Files size={t.tileGlyph} color={t.inkMuted} strokeWidth={1.9} />
            </View>
            <Text style={styles.sectionTitle} {...shrinkToFit(0.8)}>
              {d.docsTitle}
            </Text>
            <View style={styles.flex} />
            <View style={styles.count}>
              <Text style={styles.countText} {...shrinkToFit(0.8)}>
                {d.docsCount}
              </Text>
            </View>
          </View>
          {d.docs.map((doc, i) => (
            <View key={doc.sub} style={[styles.docRow, i === 0 ? styles.docRowFirst : styles.docRowNext]}>
              <View style={styles.docGlyphBox}>
                <FileText size={t.docGlyph} color={t.brand} strokeWidth={2} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.docName} {...shrinkToFit(0.8)}>
                  {doc.name}
                </Text>
                <Text style={styles.docSub} {...shrinkToFit(0.8)}>
                  {doc.sub}
                </Text>
              </View>
              <FileText size={t.docTrailGlyph} color="#C9C3BD" strokeWidth={2} />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Section icon="truck" title={d.deliveryTitle} sub={d.deliverySub} />
          {d.deliveryRows.map((r, i) => (
            <View key={r.label} style={[styles.dataRow, i === 0 ? styles.dataRowFirst : styles.dataRowNext]}>
              <Text style={styles.dataLabel} {...shrinkToFit(0.8)}>
                {r.label}
              </Text>
              <Text style={[styles.dataValue, r.mono && styles.mono]} {...shrinkToFit(0.75)}>
                {r.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.ask}>
          <View style={styles.row}>
            <View style={styles.askCircle}>
              <Hand size={t.askGlyph} color={t.inkMuted} strokeWidth={2} />
            </View>
            <Text style={styles.askTitle}>{d.askTitle}</Text>
          </View>
          <Text style={styles.askBody}>{d.askBody}</Text>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityLabel={d.check}
            onPress={() => setChecked((v) => !v)}
            style={({ pressed }) => [styles.check, pressed && styles.pressed]}
          >
            <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
              {checked ? <Check size={t.checkGlyph} color={ink.onBrand} strokeWidth={3} /> : null}
            </View>
            <Text style={styles.checkText}>{d.check}</Text>
          </Pressable>
        </View>

        <View style={styles.note}>
          <ShieldCheck size={t.noteGlyph} color={t.inkMuted} strokeWidth={2} />
          <Text style={styles.noteText}>{d.note}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={d.cta}
          disabled={!checked && !DEMO_AUTO_ADVANCE}
          onPress={() => router.push('/advocate/courier/received' as Href)}
          style={({ pressed }) => [
            styles.cta,
            checked && styles.ctaOn,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.ctaText} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={t.ctaGlyph} color={ink.onBrand} strokeWidth={2.2} />
        </Pressable>
        <View style={styles.footRow}>
          <View style={styles.footDot} />
          <Text style={styles.foot} {...shrinkToFit(0.8)}>
            {d.foot}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ icon, title, sub }: { icon: 'case' | 'truck'; title: string; sub: string }) {
  const Glyph = icon === 'case' ? Files : Truck;
  return (
    <View style={styles.row}>
      <View style={styles.tile}>
        <Glyph size={t.tileGlyph} color={t.inkMuted} strokeWidth={1.9} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.sectionTitle} {...shrinkToFit(0.8)}>
          {title}
        </Text>
        <Text style={styles.sectionSub} {...shrinkToFit(0.8)}>
          {sub}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: {},
  flex: { flex: 1 },
  pressed: { opacity: 0.9 },
  row: { flexDirection: 'row', alignItems: 'center' },

  card: {
    marginTop: t.cardGap,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  docsCard: { paddingTop: t.docsPadTop },
  cardFirst: { marginTop: t.cardTop, paddingTop: t.card1PadTop, paddingBottom: t.card1PadBottom },

  pill: {
    height: t.pillH,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillDot: { width: t.pillDot, height: t.pillDot, borderRadius: t.pillDot / 2, backgroundColor: g.ink },
  pillText: {
    marginLeft: t.pillGap,
    fontFamily: font.appHeading,
    fontSize: t.pillSize,
    color: g.ink,
  },
  verify: { marginLeft: t.verifyGap, fontFamily: font.appSemi, fontSize: t.verifySize, color: g.ink },
  deliveredBody: {
    marginTop: t.deliveredBodyTop,
    fontFamily: font.appBody,
    fontSize: t.deliveredBodySize,
    lineHeight: t.deliveredBodyLine,
    color: t.inkMuted,
  },

  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: t.boxBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.tileGap,
  },
  sectionTitle: { fontFamily: font.appHeading, fontSize: t.sectionTitleSize, color: t.ink },
  sectionSub: {
    marginTop: t.sectionSubTop,
    fontFamily: font.appBody,
    fontSize: t.sectionSubSize,
    color: t.inkMuted,
  },

  dataRow: {
    height: t.rowH,
    borderRadius: t.rowRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.rowPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataRowFirst: { marginTop: t.rowTop },
  dataRowNext: { marginTop: t.rowGap },
  dataLabel: { flex: 1, fontFamily: font.appBody, fontSize: t.rowLabelSize, color: t.inkMuted },
  dataValue: { fontFamily: font.appHeading, fontSize: t.rowValueSize, color: t.ink },
  mono: { fontFamily: font.mono, fontSize: t.monoSize, color: t.brand },

  count: {
    height: t.countH,
    borderRadius: t.countRadius,
    paddingHorizontal: t.countPadX,
    backgroundColor: t.countBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { fontFamily: font.appSemi, fontSize: t.countSize, color: t.countInk },

  docRow: {
    height: t.docRowH,
    borderRadius: t.docRowRadius,
    backgroundColor: t.boxBg,
    paddingHorizontal: t.docRowPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docRowFirst: { marginTop: t.docRowTop },
  docRowNext: { marginTop: t.docRowGap },
  docGlyphBox: {
    width: t.docGlyphBox,
    height: t.docGlyphBox,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.docGap,
  },
  docName: { fontFamily: font.appHeading, fontSize: t.docNameSize, color: t.ink },
  docSub: {
    marginTop: t.docSubTop,
    fontFamily: font.appBody,
    fontSize: t.docSubSize,
    color: t.inkMuted,
  },

  ask: {
    marginTop: t.cardGap,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.askBg,
    paddingHorizontal: t.askPadX,
    paddingTop: t.askPadTop,
    paddingBottom: t.askPadBottom,
  },
  askCircle: {
    width: t.askCircle,
    height: t.askCircle,
    borderRadius: t.askCircle / 2,
    backgroundColor: t.askCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.askGap,
  },
  askTitle: {
    flex: 1,
    fontFamily: font.appHeading,
    fontSize: t.askTitleSize,
    lineHeight: t.askTitleLine,
    color: t.ink,
  },
  askBody: {
    marginTop: t.askBodyTop,
    fontFamily: font.appBody,
    fontSize: t.askBodySize,
    lineHeight: t.askBodyLine,
    color: t.inkMuted,
  },
  check: {
    marginTop: t.checkTop,
    borderRadius: t.checkRadius,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: t.checkPadX,
    paddingVertical: t.checkPadY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkBox: {
    width: t.checkBox,
    height: t.checkBox,
    borderRadius: t.checkBoxRadius,
    backgroundColor: t.checkBoxBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.checkGap,
  },
  checkBoxOn: { backgroundColor: t.checkBoxOn },
  checkText: {
    flex: 1,
    fontFamily: font.appHeading,
    fontSize: t.checkSize,
    lineHeight: t.checkLine,
    color: t.ink,
  },

  note: {
    marginTop: t.noteTop,
    marginHorizontal: t.padX,
    borderRadius: t.rowRadius,
    backgroundColor: t.noteBg,
    paddingHorizontal: t.notePadX,
    paddingVertical: t.notePadY,
    flexDirection: 'row',
  },
  noteText: {
    flex: 1,
    marginLeft: t.noteGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: t.inkMuted,
  },

  cta: {
    marginTop: t.ctaTop,
    marginHorizontal: t.padX,
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: t.ctaBgOff,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaOn: { backgroundColor: t.brand },
  ctaText: {
    marginRight: t.ctaGap,
    fontFamily: font.appHeading,
    fontSize: t.ctaSize,
    color: ink.onBrand,
  },
  footRow: {
    marginTop: t.footTop,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footDot: {
    width: t.footDot,
    height: t.footDot,
    borderRadius: t.footDot / 2,
    backgroundColor: '#C9C3BD',
    marginRight: 6,
  },
  foot: { fontFamily: font.appBody, fontSize: t.footSize, color: t.inkMuted },
});
