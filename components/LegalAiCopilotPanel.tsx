import { ArrowUp, BookmarkPlus, Copy, FileText, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AiMark } from './AiFlowerMark';
import { shrinkToFit } from '../constants/textFit';
import { ADV_COPILOT } from '../data/advocateSide';
import { legalAiCopilot as t, colors, font, ink } from '../constants/theme';

// The in-call Legal AI copilot (designs 178 and 182).
//
// ⚠ STATIC. The answer and its citation are strings in data/advocateSide.ts.
// "Source: Contract.pdf • Page 12" is drawn text, not a reference into a real
// document, and View Source, Copy and Save to Memo are inert. Typing appends the
// advocate's own message; no response is generated.
//
// ⚠ Its purple palette is quarantined in constants/tokens/legalittAi.ts.

export default function LegalAiCopilotPanel({ onClose }: { onClose: () => void }) {
  const a = ADV_COPILOT;
  const [draft, setDraft] = useState('');
  const [asked, setAsked] = useState<string[]>([]);

  function send() {
    const text = draft.trim();
    if (!text) return;
    setAsked((s) => [...s, text]);
    setDraft('');
  }

  return (
    <View style={styles.panel}>
      <View style={styles.grab} />

      <View style={styles.head}>
        <View style={styles.tile}>
          <AiMark size={t.tileIcon} />
        </View>
        <View style={styles.headText}>
          <View style={styles.titleRow}>
            <Text style={styles.title} {...shrinkToFit(0.75)}>
              {a.title}
            </Text>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.75)}>
                {a.chip}
              </Text>
            </View>
          </View>
          <Text style={styles.sub} {...shrinkToFit(0.75)}>
            {a.sub}
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={8}>
          <X size={t.closeIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.rule} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.suggRow}
        contentContainerStyle={styles.suggContent}
      >
        {a.suggestions.map((s) => (
          <Pressable key={s} accessibilityRole="button" style={styles.sugg}>
            <Text style={styles.suggText} numberOfLines={1}>
              {s}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        <View style={styles.aiRow}>
          <View style={styles.mark}>
            <AiMark size={t.markInner} />
          </View>
          <View style={styles.aiBubble}>
            <Text style={styles.msg}>{a.greeting}</Text>
          </View>
        </View>

        <View style={styles.meRow}>
          <View style={styles.meBubble}>
            <Text style={[styles.msg, styles.meMsg]}>{a.question}</Text>
          </View>
        </View>

        <View style={styles.aiRow}>
          <View style={styles.mark}>
            <AiMark size={t.markInner} />
          </View>
          <View style={styles.aiBubble}>
            <Text style={styles.msg}>{a.answer}</Text>
            <View style={styles.srcRule} />
            <View style={styles.srcRow}>
              <FileText size={t.srcIcon} color={colors.textBody} />
              <Text style={styles.srcText} {...shrinkToFit(0.7)}>
                {a.source}
              </Text>
              {/* Inert — no document viewer is designed. */}
              <Pressable accessibilityRole="button">
                <Text style={styles.srcLink} {...shrinkToFit(0.8)}>
                  {a.viewSource}
                </Text>
              </Pressable>
            </View>
            <View style={styles.acts}>
              <Pressable accessibilityRole="button" style={styles.act}>
                <Copy size={t.actIcon} color={colors.textPrimary} />
                <Text style={styles.actText} {...shrinkToFit(0.8)}>
                  {a.copy}
                </Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={styles.act}>
                <BookmarkPlus size={t.actIcon} color="#7F48FE" />
                <Text style={styles.actText} {...shrinkToFit(0.8)}>
                  {a.saveToMemo}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {asked.map((q, i) => (
          <View key={`${q}-${i}`} style={styles.meRow}>
            <View style={styles.meBubble}>
              <Text style={[styles.msg, styles.meMsg]}>{q}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.barRow}>
        <View style={styles.bar}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder={a.placeholder}
            placeholderTextColor={colors.textBody}
            onSubmitEditing={send}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear"
            onPress={() => setDraft('')}
            hitSlop={8}
          >
            <X size={t.clearIcon} color={colors.textPrimary} />
          </Pressable>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          onPress={send}
          style={styles.send}
        >
          <ArrowUp size={t.sendIcon} color={ink.onBrand} />
        </Pressable>
      </View>
      <Text style={styles.disc}>{a.disclaimer}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderTopLeftRadius: t.radius,
    borderTopRightRadius: t.radius,
    backgroundColor: t.bg,
    paddingHorizontal: t.padX,
    paddingTop: t.padTop,
    paddingBottom: t.padBottom,
  },
  grab: {
    alignSelf: 'center',
    width: t.grabW,
    height: t.grabH,
    borderRadius: t.grabH / 2,
    backgroundColor: t.grabColour,
  },
  head: { marginTop: t.grabGap, flexDirection: 'row', alignItems: 'center' },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: t.tileBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: { flex: 1, minWidth: 0, marginLeft: t.tileGap, marginRight: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  title: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  chip: {
    marginLeft: t.chipGap,
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  chipText: {
    fontFamily: font.appSemi,
    fontSize: t.chipSize,
    letterSpacing: t.chipSpacing,
    color: t.chipColour,
  },
  sub: { marginTop: t.subGap, fontFamily: font.appBody, fontSize: t.subSize, color: colors.textBody },
  rule: { marginTop: t.ruleGap, height: 1, backgroundColor: t.rule },

  suggRow: { marginTop: t.suggGap, flexGrow: 0, height: t.suggHeight },
  suggContent: { gap: t.suggGapX },
  sugg: {
    height: t.suggHeight,
    borderRadius: t.suggRadius,
    borderWidth: 1,
    borderColor: t.suggBorder,
    paddingHorizontal: t.suggPadX,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggText: { fontFamily: font.appBody, fontSize: t.suggSize, color: colors.textPrimary },

  list: { marginTop: t.listTop, maxHeight: t.listMaxH },
  aiRow: { marginBottom: t.msgGap, flexDirection: 'row', alignItems: 'flex-start' },
  mark: {
    width: t.markSize,
    height: t.markSize,
    borderRadius: t.markSize / 2,
    backgroundColor: t.markBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBubble: {
    marginLeft: t.markGap,
    flexShrink: 1,
    maxWidth: t.bubbleMaxW,
    borderRadius: t.bubbleRadius,
    backgroundColor: t.aiBubbleBg,
    paddingHorizontal: t.bubblePadX,
    paddingVertical: t.bubblePadY,
  },
  meRow: { marginBottom: t.meGap, alignItems: 'flex-end' },
  meBubble: {
    maxWidth: t.bubbleMaxW,
    borderRadius: t.bubbleRadius,
    backgroundColor: t.meBubbleBg,
    paddingHorizontal: t.bubblePadX,
    paddingVertical: t.bubblePadY,
  },
  msg: {
    fontFamily: font.appBody,
    fontSize: t.msgSize,
    lineHeight: t.msgLineHeight,
    color: colors.textPrimary,
  },
  meMsg: { color: ink.onBrand },

  srcRule: { marginTop: t.srcRuleGap, height: 1, backgroundColor: t.rule },
  srcRow: { marginTop: t.srcGap, flexDirection: 'row', alignItems: 'center' },
  srcText: {
    marginLeft: t.srcIconGap,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appBody,
    fontSize: t.srcSize,
    color: colors.textBody,
  },
  srcLink: { fontFamily: font.appSemi, fontSize: t.srcLinkSize, color: colors.brandDark },
  acts: { marginTop: t.actGap, flexDirection: 'row', gap: t.actGapX },
  act: {
    minHeight: t.actHeight,
    borderRadius: t.actRadius,
    borderWidth: 1,
    borderColor: t.actBorder,
    paddingHorizontal: t.actPadX,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  actText: {
    marginLeft: t.actIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.actSize,
    color: colors.textPrimary,
  },

  barRow: { marginTop: t.barGap, flexDirection: 'row', alignItems: 'center' },
  bar: {
    flex: 1,
    minWidth: 0,
    minHeight: t.barHeight,
    borderRadius: t.barRadius,
    paddingHorizontal: t.barPadX,
    backgroundColor: t.barBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    paddingVertical: 10,
    fontFamily: font.appBody,
    fontSize: t.barSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  send: {
    marginLeft: t.sendGap,
    width: t.sendBtn,
    height: t.sendBtn,
    borderRadius: t.sendBtn / 2,
    backgroundColor: t.sendBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disc: {
    marginTop: t.discGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.discSize,
    lineHeight: t.discLineHeight,
    color: colors.textBody,
  },
});
