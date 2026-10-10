import { ChevronRight, CircleCheck, CircleSlash } from 'lucide-react-native';
import { Fragment, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { shrinkToFit } from '../constants/textFit';
import { advSettingsPage as t, colors, font } from '../constants/theme';

/** The labelled section heading used across designs 251–254. */
export function SectionLabel({
  title,
  meta,
  metaTone,
  dot,
}: {
  title: string;
  meta?: string;
  metaTone?: string;
  dot?: boolean;
}) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.section}>{title}</Text>
      {meta ? (
        <View style={styles.metaRow}>
          {dot ? <View style={[styles.metaDot, metaTone ? { backgroundColor: metaTone } : null]} /> : null}
          <Text style={[styles.sectionMeta, metaTone ? { color: metaTone } : null]} {...shrinkToFit(0.8)}>
            {meta}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Rule() {
  return <View style={styles.rule} />;
}

/**
 * One settings row: icon tile, title, subtitle, and a trailing control that is
 * either a toggle, a status pill with a chevron, a plain chevron, or a button.
 * STATIC — none of these controls does anything.
 */
export function Row({
  icon,
  title,
  sub,
  pill,
  pillTone,
  toggle,
  chevron,
  trailing,
  danger,
  tileBg,
  first,
}: {
  icon?: ReactNode;
  title: string;
  sub?: string;
  pill?: string;
  pillTone?: 'allowed' | 'denied' | 'neutral';
  toggle?: boolean;
  chevron?: boolean;
  trailing?: ReactNode;
  danger?: string;
  tileBg?: string;
  first?: boolean;
}) {
  return (
    <View style={[styles.row, !first && { marginTop: t.rowGap }]}>
      {icon ? <View style={[styles.tile, tileBg ? { backgroundColor: tileBg } : null]}>{icon}</View> : null}
      <View style={styles.col}>
        <Text style={[styles.title, danger ? { color: danger } : null]} {...shrinkToFit(0.8)}>
          {title}
        </Text>
        {sub ? (
          <Text style={styles.sub} {...shrinkToFit(0.8)}>
            {sub}
          </Text>
        ) : null}
      </View>
      {pill ? (
        <View
          style={[
            styles.pill,
            pillTone === 'allowed' && styles.pillAllowed,
            pillTone === 'denied' && styles.pillDenied,
          ]}
        >
          {pillTone === 'allowed' ? (
            <CircleCheck size={t.statusGlyph} color="#4D463D" strokeWidth={2} />
          ) : pillTone === 'denied' ? (
            <CircleSlash size={t.statusGlyph} color="#4D463D" strokeWidth={2} />
          ) : null}
          <Text
            style={[styles.pillText, pillTone === 'neutral' && styles.pillTextNeutral]}
            {...shrinkToFit(0.8)}
          >
            {pill}
          </Text>
        </View>
      ) : null}
      {toggle ? (
        <View style={styles.toggle}>
          <View style={styles.knob} />
        </View>
      ) : null}
      {trailing}
      {chevron ? (
        <ChevronRight size={t.chevron} color={danger ?? '#4D463D'} strokeWidth={2.2} style={styles.chev} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    marginTop: t.sectionTop,
    marginBottom: t.sectionGap,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: {
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionTrack,
    color: '#6B6B6B',
  },
  sectionMeta: { fontFamily: font.appSemi, fontSize: t.sectionMetaSize, color: '#6B6B6B' },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaDot: { width: 8, height: 8, borderRadius: 4, marginRight: 7, backgroundColor: '#6B6B6B' },

  card: {
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  rule: { marginTop: t.ruleTop, height: 1, backgroundColor: '#EFEBE8' },

  row: { flexDirection: 'row', alignItems: 'center' },
  tile: {
    width: t.tile,
    height: t.tile,
    borderRadius: t.tileRadius,
    backgroundColor: t.tileBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.tileGap,
  },
  col: { flex: 1 },
  title: { fontFamily: font.appHeading, fontSize: t.rowTitleSize, color: '#1B1C1C' },
  sub: {
    marginTop: t.rowSubTop,
    fontFamily: font.appBody,
    fontSize: t.rowSubSize,
    lineHeight: t.rowSubLine,
    color: '#4D463D',
  },

  pill: {
    marginLeft: 8,
    height: t.statusH,
    borderRadius: t.statusRadius,
    paddingHorizontal: t.statusPadX,
    backgroundColor: '#F1EDE9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillAllowed: { backgroundColor: '#F2DFC6' },
  pillDenied: { backgroundColor: '#E8E4E1' },
  pillText: {
    marginLeft: t.statusGap,
    fontFamily: font.appSemi,
    fontSize: t.statusSize,
    color: '#4D463D',
  },
  pillTextNeutral: { marginLeft: 0 },

  toggle: {
    marginLeft: 10,
    width: t.toggleW,
    height: t.toggleH,
    borderRadius: t.toggleH / 2,
    backgroundColor: t.toggleOn,
    padding: t.togglePad,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  knob: {
    width: t.toggleKnob,
    height: t.toggleKnob,
    borderRadius: t.toggleKnob / 2,
    backgroundColor: '#FFFFFF',
  },
  chev: { marginLeft: 8 },
});
