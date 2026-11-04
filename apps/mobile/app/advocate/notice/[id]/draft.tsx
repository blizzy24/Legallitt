import NoticeScreenFeedback from '../../../../components/NoticeScreenFeedback';
import { useRef } from 'react';
import NoticeDraftFeedback, {type NoticeDraftFeedbackProps} from '../../../../components/NoticeDraftFeedback';
import { useAdvocateNoticeModel } from "../../../../features/legal-notice/useAdvocateNoticeModel";
import { previewNotice } from '../../../../components/PreviewNotice';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AiMark } from '../../../../components/AiFlowerMark';
import NoticeDraftSections from '../../../../components/NoticeDraftSections';
import { shrinkToFit } from '../../../../constants/textFit';
import { ADV_NOTICE_DRAFT } from '../../../../data/advocateSide';
import {
  advNoticeDraft as t,
  legalittAi as ai,
  colors,
  font,
  ink,
} from '../../../../constants/theme';

// Draft legal notice (design/188).
//
// Filing sections and the template closing are read-only. The advocate edits
// Background & Facts, Offences and the structured compliance period; Generate Draft saves them.
// The separate "Legalitt AI" edit-assistant card remains a drawn placeholder.
//
// ⚠ "Step 3 of 5" is a SIXTH STEPPER IDIOM, and a bare text label at that: no dots,
// no bar, no numbered track. Nothing else in the notice flow shows a step count, so
// which five steps it means cannot be read off any screen.
//
// ⚠ design/188 names the advocate "Adv. Abhishek Sahu" where design/148 has
// "Abhishek Chouhan", and spells its own chip "Fix Grammer". Both kept as drawn.

export function AdvocateNoticeDraftScreenView({ data, navigate, onChangeSection, offences, onChangeOffences, intakeSections, complianceDays, onChangeComplianceDays, feedback }: {
  feedback?: NoticeDraftFeedbackProps;
  onChangeSection?: (index: number, value: string) => void;
  offences?: string; onChangeOffences?: (value: string) => void;
  intakeSections?: readonly number[];
  complianceDays?:string; onChangeComplianceDays?:(value:string)=>void;
  data: { ADV_NOTICE_DRAFT: typeof ADV_NOTICE_DRAFT }; navigate: typeof router;
}) {
  const { ADV_NOTICE_DRAFT } = data;
  const router = navigate;
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const d = ADV_NOTICE_DRAFT;
  const scroll = useRef<ScrollView>(null);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
          style={styles.backBtn}
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} {...shrinkToFit(0.75)}>
            {d.title}
          </Text>
          {/* ⚠ Sixth stepper idiom — see the note at the top of this file. */}
          <Text style={styles.step} {...shrinkToFit(0.7)}>
            {d.step}
          </Text>
        </View>
        <View style={styles.status}>
          <Text style={styles.statusText} {...shrinkToFit(0.8)}>
            {d.statusChip}
          </Text>
        </View>
      </View>

      <View style={styles.party}>
        <Text style={styles.partyText} {...shrinkToFit(0.7)}>
          {d.parties.client} {Boolean(d.parties.client && d.parties.opponent) && <Text style={styles.partyVs}>vs</Text>} {d.parties.opponent}
        </Text>
        {/* Inert — the assist chip has no designed destination. */}
        <Pressable onPress={() => previewNotice(d.assistChip)} accessibilityRole="button" style={styles.assist}>
          <AiMark size={t.assistMark} />
          <Text style={styles.assistText} {...shrinkToFit(0.8)}>
            {d.assistChip}
          </Text>
        </Pressable>
      </View>

      <ScrollView ref={scroll} onContentSizeChange={()=>{if(feedback?.error)scroll.current?.scrollToEnd({animated:true});}} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <NoticeDraftSections onChange={onChangeSection} sections={d.sections}
          offences={offences} onChangeOffences={onChangeOffences} intakeSections={intakeSections} complianceDays={complianceDays} onChangeComplianceDays={onChangeComplianceDays} />

        <View style={styles.card}>
          <View style={styles.aiChip}>
            <AiMark size={t.aiChipMark} />
            <Text style={styles.aiChipText} {...shrinkToFit(0.8)}>
              {d.ai.chip}
            </Text>
          </View>
          <Text style={styles.aiTitle} {...shrinkToFit(0.75)}>
            {d.ai.title}
          </Text>
          <Text style={styles.aiSub} {...shrinkToFit(0.75)}>
            {d.ai.sub}
          </Text>
          {/* Static: the prototype has no text entry and generates nothing. */}
          <View style={styles.aiBox}>
            <Text style={styles.aiBoxText}>{d.ai.placeholder}</Text>
          </View>
          <View style={styles.suggs}>
            {d.ai.suggestions.map((s) => (
              <Pressable key={s} accessibilityRole="button" style={styles.sugg}>
                <Text style={styles.suggText} {...shrinkToFit(0.8)}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <NoticeDraftFeedback {...feedback} />
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/advocate/notice/${id}/response` as Href)}
          style={({ pressed }) => [styles.gen, pressed && styles.pressed]}
        >
          <Text style={styles.genText} {...shrinkToFit(0.8)}>
            {d.generate}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: t.headerBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: t.backBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.backGap, marginRight: 8 },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  step: { marginTop: t.stepGap, fontFamily: font.appBody, fontSize: t.stepSize, color: colors.textBody },
  status: {
    minHeight: t.statusHeight,
    borderRadius: t.statusRadius,
    paddingHorizontal: t.statusPadX,
    backgroundColor: t.statusBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: { fontFamily: font.appBody, fontSize: t.statusSize, color: t.statusColour },

  party: {
    paddingHorizontal: t.padX,
    paddingVertical: t.partyPadY,
    backgroundColor: t.partyBg,
    borderBottomWidth: 1,
    borderBottomColor: t.partyBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  partyText: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.partySize,
    color: colors.textPrimary,
  },
  partyVs: { fontFamily: font.appBody, fontSize: t.partyVsSize, color: colors.textBody },
  assist: {
    minHeight: t.assistHeight,
    borderRadius: t.assistRadius,
    paddingHorizontal: t.assistPadX,
    backgroundColor: t.assistBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  assistText: {
    marginLeft: t.assistGap,
    fontFamily: font.appBody,
    fontSize: t.assistSize,
    color: ai.purpleDeep,
  },

  content: { paddingHorizontal: t.padX, paddingTop: t.cardGap, paddingBottom: 36 },
  card: {
    marginBottom: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  secHead: { flexDirection: 'row', alignItems: 'center' },
  secTitle: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.secTitleSize,
    color: colors.brandDark,
  },
  body: {
    marginTop: t.bodyGap,
    borderRadius: t.bodyRadius,
    borderWidth: 1,
    borderColor: t.bodyBorder,
    backgroundColor: t.bodyBg,
    padding: t.bodyPad,
  },
  bodyText: {
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textPrimary,
  },

  aiChip: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: t.aiChipHeight,
    borderRadius: t.aiChipRadius,
    paddingHorizontal: t.aiChipPadX,
    backgroundColor: t.aiChipBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiChipText: {
    marginLeft: t.aiChipGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.aiChipSize,
    color: ai.purpleDeep,
  },
  aiTitle: {
    marginTop: t.aiTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.aiTitleSize,
    color: colors.textPrimary,
  },
  aiSub: { marginTop: t.aiSubGap, fontFamily: font.appBody, fontSize: t.aiSubSize, color: colors.textBody },
  aiBox: {
    marginTop: t.aiBoxGap,
    minHeight: t.aiBoxMinHeight,
    borderRadius: t.aiBoxRadius,
    borderWidth: 1,
    borderColor: ai.purple,
    backgroundColor: t.aiBoxBg,
    padding: t.aiBoxPad,
  },
  aiBoxText: {
    fontFamily: font.appBody,
    fontSize: t.aiBoxSize,
    lineHeight: t.aiBoxLineHeight,
    color: colors.textBody,
  },
  suggs: { marginTop: t.suggGap, flexDirection: 'row', gap: t.suggGapX },
  sugg: {
    minHeight: t.suggHeight,
    borderRadius: t.suggRadius,
    paddingHorizontal: t.suggPadX,
    backgroundColor: t.suggBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  suggText: { fontFamily: font.appBody, fontSize: t.suggSize, color: ai.purpleDeep },

  gen: {
    marginTop: t.genGap - t.cardGap,
    minHeight: t.genHeight,
    borderRadius: t.genRadius,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genText: { fontFamily: font.appHeading, fontSize: t.genSize, color: ink.onBrand },
  pressed: { opacity: 0.85 },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function AdvocateNoticeDraftScreen() {
  const model = useAdvocateNoticeModel("draft");
  return <NoticeScreenFeedback state={model.screenState}><AdvocateNoticeDraftScreenView feedback={model.feedback} data={model.data} navigate={model.navigate}
    onChangeSection={model.onEditSection} offences={model.offences} onChangeOffences={model.onEditOffences} intakeSections={model.intakeSections} complianceDays={model.complianceDays} onChangeComplianceDays={model.onEditComplianceDays} /></NoticeScreenFeedback>;
}
