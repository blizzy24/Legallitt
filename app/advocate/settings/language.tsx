import DemoPressable from '../../../components/DemoPressable';
import { Check, Gavel, Globe, Languages } from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import SettingsHero from '../../../components/SettingsHero';
import { Card, Rule, SectionLabel } from '../../../components/SettingsRows';
import { shrinkToFit } from '../../../constants/textFit';
import { AS_LANGUAGE } from '../../../data/advocateSettings';
import { advSettingsPage as t, colors, font, ink, status } from '../../../constants/theme';

// Advocate settings — language (design/255).
//
// ⚠ NOTE 5 — THE COUNT DOES NOT MATCH THE LIST. The export says "5 Available"
// and draws TWO languages; the written spec for this screen says seven. Built
// exactly as drawn: two rows, the label "5 Available". Not reconciled.
//
// ⚠ This export draws no hero illustration at all — the pill sits directly
// under the header — where designs 251–254 all draw one.
//
// STATIC, NOT WIRED: the rows do not select, nothing changes locale, and
// "Save Language" saves nothing. There is no i18n in this project.

export default function AdvocateLanguageScreen() {
  const d = AS_LANGUAGE;
  return (
    <SettingsHero
      eyebrow={d.eyebrow}
      title={d.title}
      pill={d.pill}
      h1={d.h1}
      sub={d.sub}
      art={null}
      heroCard={false}
      showInfo={false}
      rightIcon={<Globe size={t.infoGlyph} color="#4D463D" strokeWidth={1.8} />}
    >
      <SectionLabel title={d.sectionTitle} meta={d.sectionMeta} metaTone="#8C6B3F" />
      <Card>
        {d.languages.map((l, i) => (
          <Fragment key={l.code}>
            {i > 0 ? <Rule /> : null}
            <View style={[styles.row, i > 0 && { marginTop: t.rowGap }]}>
              <View style={[styles.code, l.on && styles.codeOn]}>
                <Text style={[styles.codeText, l.on && styles.codeTextOn]} {...shrinkToFit(0.8)}>
                  {l.code}
                </Text>
              </View>
              <View style={styles.col}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} {...shrinkToFit(0.8)}>
                    {l.name}
                  </Text>
                  {l.pill ? (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText} {...shrinkToFit(0.8)}>
                        {l.pill}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.sub}>{l.sub}</Text>
              </View>
              {l.on ? (
                <View style={styles.tick}>
                  <Check size={17} color="#FFFFFF" strokeWidth={3} />
                </View>
              ) : (
                <View style={styles.radio} />
              )}
            </View>
          </Fragment>
        ))}
      </Card>

      <View style={styles.note}>
        <View style={styles.noteTile}>
          <Gavel size={t.noteGlyph} color="#8C6B3F" strokeWidth={1.8} />
        </View>
        <View style={styles.col}>
          <Text style={styles.noteTitle}>{d.note.title}</Text>
          <Text style={styles.noteText}>{d.note.body}</Text>
        </View>
      </View>

      <DemoPressable accessibilityRole="button" style={({ pressed }) => [styles.cta, pressed && styles.pressed]}>
        <Check size={20} color={ink.onBrand} strokeWidth={2.6} />
        <Text style={styles.ctaLabel} {...shrinkToFit(0.8)}>
          {d.cta}
        </Text>
      </DemoPressable>
    </SettingsHero>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  code: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: '#EFEDEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.tileGap,
  },
  codeOn: { backgroundColor: '#F5DEC0' },
  codeText: { fontFamily: font.appHeading, fontSize: 16, color: '#4D463D' },
  codeTextOn: { color: '#8C6B3F' },
  col: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { fontFamily: font.appHeading, fontSize: t.rowTitleSize, color: '#1B1C1C' },
  activePill: {
    marginLeft: 9,
    height: 24,
    borderRadius: 7,
    paddingHorizontal: 9,
    backgroundColor: status.activeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePillText: { fontFamily: font.appSemi, fontSize: 13, color: '#0F7A4F' },
  sub: {
    marginTop: t.rowSubTop,
    fontFamily: font.appBody,
    fontSize: t.rowSubSize,
    color: '#4D463D',
  },
  tick: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: status.active,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    marginLeft: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ECE9E6',
  },

  note: {
    marginTop: t.noteTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.noteBg,
    borderRadius: t.noteRadius,
    padding: t.notePad,
  },
  noteTile: {
    width: t.noteTile,
    height: t.noteTile,
    borderRadius: t.noteTile / 2,
    backgroundColor: '#F7E3C9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.noteGap,
  },
  noteTitle: { fontFamily: font.appHeading, fontSize: 16, color: '#1B1C1C' },
  noteText: {
    marginTop: 3,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: '#4D463D',
  },

  cta: {
    marginTop: 18,
    marginHorizontal: t.padX,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#6C5C45',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  ctaLabel: {
    marginLeft: 10,
    fontFamily: font.appHeading,
    fontSize: 18,
    color: ink.onBrand,
  },
});
