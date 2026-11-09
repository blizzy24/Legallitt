import { previewNotice } from '../../../components/PreviewNotice';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FilePen,
  FolderOpen,
  IdCard,
  Plus,
  ShieldCheck,
  SquarePen,
  UserRound,
  UserRoundX,
} from 'lucide-react-native';
import { Fragment, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { FIR_GENERATOR } from '../../../data/advocateFir';
import { advFirGenerator as t, colors, font, ink, status } from '../../../constants/theme';

// FIR draft generator (design/217).
//
// ⚠ "Generate with AI" / "Create Manually" AND the "Important AI Rules" card are on
// THIS screen, design/217 — not on design/218 as briefed. Both buttons are static
// UI: no AI call, no model wiring, nothing generated. The AI surfaces in this flow
// are unscoped and no behaviour has been agreed for them.
//
// ⚠ THE CHARACTER COUNT IS WRONG. design/217 prints "230 characters" under a
// statement that is 212 characters. Same defect as design/211's 86/300 over an
// 83-character message. The counter here is live, so it reads 212.
//
// ⚠ design/217 CLIPS "Vikram Singh & 2 Associates" to "Vikram Singh & 2 Associ".
// Stored and rendered whole — the project never ellipsizes.
//
// ⚠ "5 Attached" where design/216 shows four files. See data/advocateFir.ts note 4.
//
// ⚠ The "Accused" chip and avatar are status.redContainer / status.onRedContainer
// — the design/210 red, now a shared palette pair.
//
// Both text fields are live; everything else is static.

function FixtureAdvocateFirGeneratorScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const f = FIR_GENERATOR;
  const [body, setBody] = useState(f.happened.body);
  const [other, setOther] = useState('');

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/matters' as Href))}
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.75)}>
          {f.title}
        </Text>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.ready}>
          <View style={styles.readyDot} />
          <Text style={styles.readyText} {...shrinkToFit(0.8)}>
            {f.readyChip}
          </Text>
        </View>
        <Text style={styles.lead}>{f.lead}</Text>

        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
              {f.complainant.title}
            </Text>
            <IdCard size={t.titleIcon} color={colors.brandDark} />
          </View>
          {f.complainant.fields.map((fl, i) => (
            <Fragment key={fl.label}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.field}>
                <Text style={styles.fieldLabel} {...shrinkToFit(0.75)}>
                  {fl.label}
                </Text>
                <Text style={styles.fieldValue}>{fl.value}</Text>
              </View>
            </Fragment>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
              {f.incident.title}
            </Text>
            <CalendarDays size={t.titleIcon} color={colors.brandDark} />
          </View>
          <View style={styles.cells}>
            {f.incident.cells.map((c) => (
              <View key={c.label} style={[styles.cell, 'half' in c && c.half ? styles.cellHalf : styles.cellFull]}>
                <Text style={styles.cellLabel} {...shrinkToFit(0.8)}>
                  {c.label}
                </Text>
                <Text style={styles.cellValue}>{c.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
              {f.people.title}
            </Text>
            <View style={styles.addedChip}>
              <Text style={styles.addedChipText} {...shrinkToFit(0.8)}>
                {f.people.chip}
              </Text>
            </View>
          </View>
          {f.people.rows.map((p, i) => (
            <View key={p.name} style={[styles.person, i === 0 ? styles.personFirst : styles.personNext]}>
              <View style={[styles.personAvatar, p.accused && styles.personAvatarAccused]}>
                {p.accused ? (
                  <UserRoundX size={t.personAvatarGlyph} color={status.onRedContainer} />
                ) : (
                  <UserRound size={t.personAvatarGlyph} color={colors.brandDark} />
                )}
              </View>
              <View style={styles.personText}>
                {/* ⚠ Clipped in design/217. Shrinks or wraps here, never ellipsized. */}
                <Text style={styles.personName} {...shrinkToFit(0.7)}>
                  {p.name}
                </Text>
                <Text style={[styles.personRole, p.accused && styles.personRoleAccused]} {...shrinkToFit(0.8)}>
                  {p.role}
                </Text>
              </View>
              <View style={[styles.personChip, p.accused && styles.personChipAccused]}>
                <Text
                  style={[styles.personChipText, p.accused && styles.personChipTextAccused]}
                  {...shrinkToFit(0.75)}
                >
                  {p.chip}
                </Text>
              </View>
            </View>
          ))}
          <Pressable onPress={() => previewNotice(f.people.add)} accessibilityRole="button" style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
            <Plus size={t.addIcon} color={t.addColour} />
            <Text style={styles.addText} {...shrinkToFit(0.8)}>
              {f.people.add}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
              {f.happened.title}
            </Text>
            <SquarePen size={t.titleIcon} color={colors.brandDark} />
          </View>
          <Text style={styles.sub}>{f.happened.sub}</Text>
          <View style={styles.box}>
            <TextInput
              style={styles.boxInput}
              value={body}
              onChangeText={setBody}
              multiline
              textAlignVertical="top"
            />
          </View>
          {/* ⚠ design/217 prints 230 over a 212-character statement. */}
          <Text style={styles.count} {...shrinkToFit(0.8)}>
            {body.length} {f.happened.countSuffix}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
            {f.other.title}
          </Text>
          <Text style={styles.sub}>{f.other.sub}</Text>
          <View style={styles.box}>
            <TextInput
              style={styles.boxInput}
              value={other}
              onChangeText={setOther}
              multiline
              textAlignVertical="top"
              placeholder={f.other.placeholder}
              placeholderTextColor={t.boxPlaceholderColour}
            />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.titleRow}>
            <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
              {f.documents.title}
            </Text>
            <View style={styles.addedChip}>
              <Text style={styles.addedChipText} {...shrinkToFit(0.8)}>
                {f.documents.chip}
              </Text>
            </View>
          </View>
          <Text style={styles.sub}>{f.documents.sub}</Text>
          {/* "View Documents" names the whole set, so it opens design/216's document
              review screen, which lists each one with its own View. */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/advocate/fir/documents?id=${id ?? ''}` as Href)}
            style={({ pressed }) => [styles.viewDoc, pressed && styles.pressed]}
          >
            <FolderOpen size={t.viewDocIcon} color={colors.brandDark} />
            <Text style={styles.viewDocText} {...shrinkToFit(0.8)}>
              {f.documents.view}
            </Text>
            <ChevronRight size={t.viewDocChevron} color={colors.textPrimary} style={styles.viewDocChevron} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
            {f.create.title}
          </Text>
          <Text style={styles.sub}>{f.create.sub}</Text>

          {/* Static copy. No AI call is wired anywhere in this flow. */}
          <View style={styles.rules}>
            <View style={styles.rulesHead}>
              <ShieldCheck size={t.rulesIcon} color={t.rulesTitleColour} />
              <Text style={styles.rulesTitle} {...shrinkToFit(0.8)}>
                {f.create.rulesTitle}
              </Text>
            </View>
            {f.create.rules.map((r, i) => (
              <View key={r} style={i === 0 ? styles.ruleFirst : styles.ruleNext}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.ruleText}>{r}</Text>
              </View>
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/advocate/fir/draft?id=${id ?? ''}` as Href)}
            style={({ pressed }) => [styles.action, styles.ai, pressed && styles.pressed]}
          >
            <Text style={styles.aiText} {...shrinkToFit(0.8)}>
              {f.create.ai}
            </Text>
            <ArrowRight size={t.actionIcon} color={ink.onBrand} style={styles.actionIcon} />
          </Pressable>
          <Text style={styles.actionCap}>{f.create.aiCaption}</Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/advocate/fir/draft?id=${id ?? ''}` as Href)}
            style={({ pressed }) => [styles.action, styles.manual, styles.actionPair, pressed && styles.pressed]}
          >
            <FilePen size={t.actionIcon} color={t.manualColour} />
            <Text style={styles.manualText} {...shrinkToFit(0.8)}>
              {f.create.manual}
            </Text>
          </Pressable>
          <Text style={styles.actionCap}>{f.create.manualCaption}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 10,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX, paddingBottom: 28 },

  ready: {
    marginTop: t.readyGap,
    alignSelf: 'flex-start',
    minHeight: t.readyHeight,
    borderRadius: t.readyRadius,
    backgroundColor: t.readyBg,
    paddingHorizontal: t.readyPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  readyDot: {
    width: t.readyDot,
    height: t.readyDot,
    borderRadius: t.readyDot / 2,
    backgroundColor: t.readyColour,
    marginRight: t.readyDotGap,
  },
  readyText: { fontFamily: font.appSemi, fontSize: t.readySize, color: t.readyColour },
  lead: { marginTop: t.leadGap, fontFamily: font.appBody, fontSize: t.leadSize, color: t.leadColour },

  card: { marginTop: t.cardGap, borderRadius: t.cardRadius, backgroundColor: t.cardBg, padding: t.cardPad },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { flex: 1, minWidth: 0, marginRight: 10, fontFamily: font.appHeading, fontSize: t.titleRowSize, color: colors.textPrimary },

  field: { marginTop: t.fieldGap },
  fieldLabel: {
    fontFamily: font.appSemi,
    fontSize: t.fieldLabelSize,
    letterSpacing: t.fieldLabelSpacing,
    color: t.fieldLabelColour,
  },
  fieldValue: {
    marginTop: t.fieldValueGap,
    fontFamily: font.appBody,
    fontSize: t.fieldValueSize,
    lineHeight: t.fieldValueLineHeight,
    color: colors.textPrimary,
  },
  divider: { marginTop: t.fieldDividerGap, height: 1, backgroundColor: t.fieldDivider },

  cells: { marginTop: t.cellGap, flexDirection: 'row', flexWrap: 'wrap', gap: t.cellGapY },
  cell: { borderRadius: t.cellRadius, backgroundColor: t.cellBg, padding: t.cellPad },
  cellHalf: { width: '48%', flexGrow: 1 },
  cellFull: { width: '100%' },
  cellLabel: { fontFamily: font.appBody, fontSize: t.cellLabelSize, color: t.cellLabelColour },
  cellValue: {
    marginTop: t.cellValueGap,
    fontFamily: font.appHeading,
    fontSize: t.cellValueSize,
    lineHeight: t.cellValueLineHeight,
    color: colors.textPrimary,
  },

  addedChip: {
    minHeight: t.addedChipHeight,
    borderRadius: t.addedChipRadius,
    backgroundColor: t.addedChipBg,
    paddingHorizontal: t.addedChipPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  addedChipText: { fontFamily: font.appSemi, fontSize: t.addedChipSize, color: t.addedChipColour },

  person: {
    borderRadius: t.personRadius,
    backgroundColor: t.personBg,
    padding: t.personPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  personFirst: { marginTop: t.personGap },
  personNext: { marginTop: t.personGapY },
  personAvatar: {
    width: t.personAvatar,
    height: t.personAvatar,
    borderRadius: t.personAvatar / 2,
    backgroundColor: t.personAvatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAvatarAccused: { backgroundColor: status.redContainer },
  personText: { flex: 1, minWidth: 0, marginHorizontal: t.personAvatarGap },
  personName: { fontFamily: font.appHeading, fontSize: t.personNameSize, color: colors.textPrimary },
  personRole: { marginTop: t.personRoleGap, fontFamily: font.appSemi, fontSize: t.personRoleSize, color: t.personRoleColour },
  personRoleAccused: { color: status.onRedContainer },
  personChip: {
    minHeight: t.personChipHeight,
    borderRadius: t.personChipRadius,
    backgroundColor: t.personChipBg,
    paddingHorizontal: t.personChipPadX,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  personChipAccused: { backgroundColor: status.redContainer },
  personChipText: { fontFamily: font.appSemi, fontSize: t.personChipSize, color: t.personChipColour },
  personChipTextAccused: { color: status.onRedContainer },

  add: {
    marginTop: t.addGap,
    minHeight: t.addHeight,
    borderRadius: t.addRadius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: t.addBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { marginLeft: t.addIconGap, fontFamily: font.appHeading, fontSize: t.addSize, color: t.addColour },

  sub: { marginTop: t.subGap, fontFamily: font.appBody, fontSize: t.subSize, lineHeight: t.subLineHeight, color: t.subColour },

  box: { marginTop: t.boxGap, borderRadius: t.boxRadius, backgroundColor: t.boxBg, padding: t.boxPad },
  boxInput: {
    minHeight: t.boxMinHeight,
    fontFamily: font.appBody,
    fontSize: t.boxSize,
    lineHeight: t.boxLineHeight,
    color: colors.textPrimary,
    padding: 0,
    outlineWidth: 0,
  },
  count: { marginTop: t.countGap, alignSelf: 'flex-end', fontFamily: font.appSemi, fontSize: t.countSize, color: t.countColour },

  viewDoc: {
    marginTop: t.viewDocGap,
    minHeight: t.viewDocHeight,
    borderRadius: t.viewDocRadius,
    backgroundColor: t.viewDocBg,
    paddingHorizontal: t.viewDocPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDocText: { marginLeft: t.viewDocIconGap, flex: 1, minWidth: 0, fontFamily: font.appBody, fontSize: t.viewDocSize, color: colors.textPrimary },
  viewDocChevron: { marginLeft: 8 },

  rules: { marginTop: t.rulesGap, borderRadius: t.rulesRadius, backgroundColor: t.rulesBg, padding: t.rulesPad },
  rulesHead: { flexDirection: 'row', alignItems: 'center' },
  rulesTitle: { marginLeft: t.rulesIconGap, flexShrink: 1, fontFamily: font.appHeading, fontSize: t.rulesTitleSize, color: t.rulesTitleColour },
  ruleFirst: { marginTop: t.rulesListGap, flexDirection: 'row', alignItems: 'flex-start' },
  ruleNext: { marginTop: t.rulesItemGap, flexDirection: 'row', alignItems: 'flex-start' },
  bullet: { width: t.rulesBulletGap + 4, fontFamily: font.appBody, fontSize: t.rulesSize, lineHeight: t.rulesLineHeight, color: t.rulesColour },
  ruleText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.rulesSize,
    lineHeight: t.rulesLineHeight,
    color: t.rulesColour,
  },

  action: {
    marginTop: t.actionGap,
    minHeight: t.actionHeight,
    borderRadius: t.actionRadius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  actionPair: { marginTop: t.actionPairGap },
  ai: { backgroundColor: t.aiBg },
  aiText: { fontFamily: font.appHeading, fontSize: t.actionSize, color: ink.onBrand, flexShrink: 1 },
  actionIcon: { marginLeft: t.actionIconGap },
  manual: { borderWidth: 1, borderColor: t.manualBorder },
  manualText: { marginLeft: t.actionIconGap, fontFamily: font.appHeading, fontSize: t.actionSize, color: t.manualColour, flexShrink: 1 },
  actionCap: {
    marginTop: t.actionCapGap,
    textAlign: 'center',
    fontFamily: font.appSemi,
    fontSize: t.actionCapSize,
    lineHeight: t.actionCapLineHeight,
    color: t.actionCapColour,
  },
  pressed: { opacity: 0.85 },
});
import FirAdvocate from '../../../features/fir/FirAdvocate';
import {DATA_SOURCE} from '../../../lib/data-source';
export default function LiveFirScreen() { return DATA_SOURCE === 'api' ? <FirAdvocate/> : <FixtureAdvocateFirGeneratorScreen/>; }
