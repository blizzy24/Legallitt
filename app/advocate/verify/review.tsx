import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Briefcase,
  Check,
  ChevronLeft,
  FileText,
  Scale,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';
import { ReactNode, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { AV_REVIEW } from '../../../data/advocateVerify';
import {
  advVerifyReview as t,
  advVerifyStep as s,
  colors,
  font,
  ink,
  status,
} from '../../../constants/theme';

// Advocate verification — review & submit (design/239).
//
// ⚠ A SIXTH header arrangement in six form screens: eyebrow, title, subtitle, a
// rounded "Final Step · 4 of 4 Completed" pill, then a SHORT centred progress
// bar 251.5pt wide rather than full width, with the back circle floated left.
// The export is framed like design/236 and was cropped to its 780px screen
// before anything was measured.
//
// ⚠ NOTE 4 — THIS SCREEN REVIEWS design/234 AND DISAGREES WITH IT. The email is
// rahul.sharma@legalitt.in here and adv.rahul.sharma@example.com there; the
// address is a different address; the date of birth is formatted differently;
// and two of the three practice areas differ from the ones design/235 selected.
// Every value is stored on the screen that draws it. Nothing is reconciled.
//
// ⚠ All three documents read "Verified" on a form that has not been submitted,
// and design/238 drew the third one mid-upload at 68%.
//
// The confirmation checkbox ticks, and only then does Submit enable and lead to
// design/240 (submitted). design/239 draws the unticked, muted state; the ticked
// state uses the brand fill (#B09C82) every other CTA in this flow is drawn in.
// Edit and View Documents go nowhere. Nothing is submitted anywhere.

const ICONS = [UserRound, Briefcase, Scale];

function Card({
  icon,
  title,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  action: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.tile}>{icon}</View>
        <Text style={styles.headTitle} {...shrinkToFit(0.75)}>
          {title}
        </Text>
        <Text style={styles.edit}>{action}</Text>
      </View>
      <View style={styles.headRule} />
      {children}
    </View>
  );
}

export default function AdvocateVerifyReviewScreen() {
  const insets = useSafeAreaInsets();
  const d = AV_REVIEW;
  const [agreed, setAgreed] = useState(false);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <View style={styles.eyebrowRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={8}
            style={styles.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
          >
            <ChevronLeft size={t.backIcon} color="#222222" strokeWidth={2.4} />
          </Pressable>
          <Text style={styles.eyebrow}>{d.eyebrow}</Text>
          <View style={styles.back} />
        </View>

        <Text style={styles.title} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>
        <Text style={styles.sub} {...shrinkToFit(0.8)}>
          {d.sub}
        </Text>

        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              {d.pill}
            </Text>
          </View>
        </View>

        <View style={styles.progress}>
          {Array.from({ length: 4 }, (_, i) => (
            <View key={i} style={[styles.segment, i > 0 && { marginLeft: t.progressGap }]} />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {d.sections.map((sec, si) => {
          const Icon = ICONS[si];
          return (
            <Card
              key={sec.title}
              title={sec.title}
              action={sec.action}
              icon={<Icon size={t.tileGlyph} color={ink.accent} strokeWidth={1.8} />}
            >
              {sec.rows.map((r, i) => (
                <View key={r.label} style={[styles.row, { marginTop: i === 0 ? t.rowTop : t.rowGap }]}>
                  <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                    {r.label}
                  </Text>
                  <View style={styles.rowRight}>
                    {r.dot ? <View style={styles.dot} /> : null}
                    <Text style={[styles.rowValue, r.mono && styles.rowValueMono]}>{r.value}</Text>
                    {r.pill ? (
                      <View style={styles.vpill}>
                        <Check size={t.vpillGlyph} color={status.active} strokeWidth={3} />
                        <Text style={styles.vpillText} {...shrinkToFit(0.8)}>
                          {r.pill}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </Card>
          );
        })}

        <Card
          title={d.documents.title}
          action={d.documents.action}
          icon={<FileText size={t.tileGlyph} color={ink.accent} strokeWidth={1.8} />}
        >
          {d.documents.rows.map((r, i) => (
            <View key={r.name} style={[styles.doc, { marginTop: i === 0 ? t.docTop : t.docGap }]}>
              <View style={styles.docCheck}>
                <Check size={t.docCheckGlyph} color={status.active} strokeWidth={3} />
              </View>
              <View style={styles.docCol}>
                <Text style={styles.docName} {...shrinkToFit(0.8)}>
                  {r.name}
                </Text>
                <Text style={styles.docFile} {...shrinkToFit(0.8)}>
                  {r.file}
                </Text>
              </View>
              <Check size={t.vpillGlyph} color={status.active} strokeWidth={3} />
              <Text style={styles.docStatus}>{r.status}</Text>
            </View>
          ))}
        </Card>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agreed }}
          onPress={() => setAgreed((a) => !a)}
          style={styles.confirm}
        >
          <View style={[styles.confirmBox, agreed && styles.confirmBoxOn]}>
            {agreed && <Check size={t.confirmBox - 6} color={ink.onBrand} strokeWidth={3} />}
          </View>
          <View style={styles.docCol}>
            <Text style={styles.confirmTitle}>{d.confirm.title}</Text>
            <Text style={styles.confirmBody}>{d.confirm.body}</Text>
          </View>
        </Pressable>

        <View style={styles.bci}>
          <ShieldCheck size={t.bciGlyph} color={ink.accent} strokeWidth={1.8} />
          <Text style={styles.bciText}>
            <Text style={styles.bciLead}>{d.bci.lead}</Text>
            {d.bci.body}
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !agreed }}
          disabled={!agreed}
          onPress={() => router.push('/advocate/verify/submitted' as Href)}
          style={[styles.cta, agreed && styles.ctaOn]}
        >
          <Text style={[styles.ctaLabel, agreed && styles.ctaLabelOn]} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
          <ArrowRight size={s.ctaArrow} color={agreed ? ink.onBrand : t.ctaMutedInk} strokeWidth={2.4} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
        >
          <Text style={styles.secondary}>{d.secondary}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: s.bg },

  header: { paddingHorizontal: t.padX },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: s.backBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowTrack,
    color: ink.accent,
  },
  title: {
    marginTop: t.titleTop,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#222222',
  },
  sub: {
    marginTop: t.subTop,
    marginHorizontal: -t.padX + t.subPadX,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.subSize,
    color: colors.textBody,
  },
  pillRow: { marginTop: t.pillTop, alignItems: 'center' },
  pill: {
    height: t.pillH,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: { fontFamily: font.appSemi, fontSize: t.pillSize, color: ink.accent },
  progress: {
    marginTop: t.progressTop,
    width: t.progressW,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  segment: {
    flex: 1,
    height: t.progressH,
    borderRadius: t.progressH / 2,
    backgroundColor: colors.brand,
  },

  content: { paddingBottom: 24 },

  card: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: s.backBorder,
    padding: t.cardPad,
  },
  head: { flexDirection: 'row', alignItems: 'center' },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: t.tileBg,
    borderWidth: 1,
    borderColor: s.backBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.tileGap,
  },
  headTitle: {
    flex: 1,
    fontFamily: font.appHeading,
    fontSize: t.headSize,
    letterSpacing: t.headTrack,
    color: '#222222',
  },
  edit: { fontFamily: font.appBody, fontSize: t.editSize, color: ink.accent },
  headRule: { marginTop: t.headRuleTop, height: 1, backgroundColor: s.rule },

  row: { flexDirection: 'row', alignItems: 'flex-start' },
  rowLabel: { fontFamily: font.appBody, fontSize: t.rowLabelSize, color: colors.textBody },
  rowRight: {
    flex: 1,
    marginLeft: t.rowGapX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  rowValue: {
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: font.appSemi,
    fontSize: t.rowValueSize,
    lineHeight: t.rowValueLine,
    color: '#222222',
  },
  rowValueMono: { fontFamily: font.mono },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: status.active, marginRight: 8 },
  vpill: {
    marginLeft: t.vpillGap,
    height: t.vpillH,
    borderRadius: t.vpillRadius,
    paddingHorizontal: t.vpillPadX,
    backgroundColor: status.activeBg,
    borderWidth: 1,
    borderColor: status.activeBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vpillText: { marginLeft: 3, fontFamily: font.appSemi, fontSize: t.vpillSize, color: status.active },

  doc: {
    minHeight: t.docH,
    borderRadius: t.docRadius,
    backgroundColor: t.docBg,
    paddingHorizontal: t.docPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  docCheck: {
    width: t.docCheck,
    height: t.docCheck,
    borderRadius: t.docCheck / 2,
    backgroundColor: t.docCheckBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.docGapX,
  },
  docCol: { flex: 1 },
  docName: { fontFamily: font.appHeading, fontSize: t.docNameSize, color: '#222222' },
  docFile: {
    marginTop: t.docFileTop,
    fontFamily: font.appBody,
    fontSize: t.docFileSize,
    color: colors.textBody,
  },
  docStatus: {
    marginLeft: 4,
    fontFamily: font.appSemi,
    fontSize: t.vpillSize + 1.5,
    color: status.active,
  },

  confirm: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    borderWidth: 1,
    borderColor: s.backBorder,
    padding: t.cardPad,
  },
  confirmBox: {
    width: t.confirmBox,
    height: t.confirmBox,
    borderRadius: t.confirmBoxRadius,
    borderWidth: 1.5,
    borderColor: colors.brand,
    marginRight: t.confirmGap,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBoxOn: { backgroundColor: colors.brand },
  confirmTitle: {
    fontFamily: font.appBody,
    fontSize: t.confirmSize,
    lineHeight: t.confirmLine,
    color: '#222222',
  },
  confirmBody: {
    marginTop: t.confirmBodyTop,
    fontFamily: font.appBody,
    fontSize: t.confirmBodySize,
    lineHeight: t.confirmBodyLine,
    color: colors.textBody,
  },

  bci: {
    marginTop: t.bciTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.bciBg,
    borderRadius: t.cardRadius,
    padding: t.cardPad,
  },
  bciText: {
    flex: 1,
    marginLeft: t.bciGap,
    fontFamily: font.appBody,
    fontSize: t.bciSize,
    lineHeight: t.bciLine,
    color: colors.textBody,
  },
  bciLead: { fontFamily: font.appSemi, color: '#222222' },

  footer: {
    paddingTop: t.footerPadTop,
    paddingHorizontal: t.padX,
    borderTopWidth: 1,
    borderTopColor: s.rule,
    backgroundColor: s.bg,
  },
  cta: {
    marginTop: 12,
    height: t.ctaH,
    borderRadius: s.ctaRadius,
    backgroundColor: t.ctaMutedBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontFamily: font.appHeading,
    fontSize: t.ctaLabelSize,
    color: t.ctaMutedInk,
    marginRight: s.ctaArrowGap,
  },
  ctaOn: { backgroundColor: colors.brand },
  ctaLabelOn: { color: ink.onBrand },
  secondary: {
    marginTop: s.secondaryTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: s.secondarySize,
    color: colors.textBody,
  },
});
