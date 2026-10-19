import { router, type Href } from 'expo-router';
import {
  CalendarCheck,
  CalendarDays,
  Check,
  FileText,
  Info,
  Landmark,
  Receipt,
  TrendingUp,
} from 'lucide-react-native';
import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import SettingsHero from '../../../components/SettingsHero';
import SettingsHeroArt from '../../../components/SettingsHeroArt';
import { Card, Row, Rule, SectionLabel } from '../../../components/SettingsRows';
import { shrinkToFit } from '../../../constants/textFit';
import { AS_PAYOUT } from '../../../data/advocateSettings';
import { advSettingsPage as t, colors, font, ink, status } from '../../../constants/theme';

// Advocate settings — payment & payout (design/256).
//
// ⚠ NOTE 7 — THE HEADER IS CLIPPED IN THE EXPORT, reading "ment And Payout
// Setting". The full string is stored and rendered whole; it shrinks to fit
// rather than being cut.
//
// ⚠ NOTE 3 — THE BANK CHANGES MID-FLOW. This screen says HDFC Bank, Current
// Account, ••••4821. designs 257–260, one tap away, say SBI, Savings, the same
// ••••4821. Same last four digits, different bank and different account type.
// Each screen is built as its own PNG draws it.
//
// STATIC, NOT WIRED: no earnings, no payouts, no schedule, no settlement. The
// figures are drawn values and every row opens nothing except Bank Account,
// which pushes to design/257's screen.

const ICONS = { trend: TrendingUp, receipt: Receipt, file: FileText };

export default function AdvocatePayoutScreen() {
  const d = AS_PAYOUT;
  return (
    <SettingsHero
      eyebrow={d.eyebrow}
      title={d.title}
      pill={d.pill}
      h1={d.h1}
      sub={d.sub}
      art={<SettingsHeroArt width={190} height={t.artH} subject="vault" />}
      heroCard={false}
    >
      <View style={styles.summary}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel} {...shrinkToFit(0.8)}>
            {d.statusLabel}
          </Text>
          <View style={styles.statusPill}>
            <Check size={15} color={status.active} strokeWidth={3} />
            <Text style={styles.statusPillText} {...shrinkToFit(0.8)}>
              {d.statusPill}
            </Text>
          </View>
        </View>
        <View style={styles.figures}>
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>{d.totalLabel}</Text>
            <Text style={styles.figureValue} {...shrinkToFit(0.8)}>
              {d.totalValue}
            </Text>
          </View>
          <View style={styles.figureDivider} />
          <View style={styles.figureCol}>
            <Text style={styles.figureLabel}>{d.pendingLabel}</Text>
            <Text style={[styles.figureValue, styles.figureValueAccent]} {...shrinkToFit(0.8)}>
              {d.pendingValue}
            </Text>
          </View>
        </View>
        <View style={styles.settlement}>
          <CalendarCheck size={17} color="#4D463D" strokeWidth={1.8} />
          <Text style={styles.settlementText}>{d.settlement}</Text>
        </View>
      </View>

      <SectionLabel title={d.prefsTitle} />
      <Card>
        <Row
          first
          icon={<Landmark size={t.tileGlyph} color="#8C6B3F" strokeWidth={1.8} />}
          tileBg="#F6EFE4"
          title={d.bank.title}
          sub={d.bank.sub}
          pill={d.bank.pill}
          pillTone="neutral"
          chevron
          onPress={() => router.push('/advocate/settings/bank' as Href)}
        />
        <Rule />
        <Row
          icon={<CalendarDays size={t.tileGlyph} color="#8C6B3F" strokeWidth={1.8} />}
          tileBg="#F6EFE4"
          title={d.schedule.title}
          sub={d.schedule.sub}
          chevron
        />
      </Card>

      <SectionLabel title={d.infoTitle} />
      <Card>
        {d.info.map((r, i) => {
          const Icon = ICONS[r.icon as keyof typeof ICONS];
          return (
            <Fragment key={r.title}>
              {i > 0 ? <Rule /> : null}
              <Row
                first={i === 0}
                icon={<Icon size={t.tileGlyph} color="#8C6B3F" strokeWidth={1.8} />}
                tileBg="#F6EFE4"
                title={r.title}
                sub={r.sub}
                chevron
                // Earnings History opens design/268's analytics — the screen data/
                // advocateTools.ts note 4 calls "one tap" from this one. Payout
                // History and Receipts & Invoices have no designed destination.
                onPress={r.icon === 'trend' ? () => router.push('/advocate/analytics' as Href) : undefined}
              />
            </Fragment>
          );
        })}
      </Card>

      <View style={styles.note}>
        <Info size={t.noteGlyph} color="#4D463D" strokeWidth={1.8} />
        <Text style={styles.noteText}>{d.note}</Text>
      </View>
    </SettingsHero>
  );
}

const styles = StyleSheet.create({
  summary: {
    marginTop: 10,
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadY,
    overflow: 'hidden',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusLabel: { fontFamily: font.appHeading, fontSize: 18, color: '#1B1C1C' },
  statusPill: {
    height: 32,
    borderRadius: 16,
    paddingHorizontal: 12,
    backgroundColor: status.activeBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusPillText: {
    marginLeft: 5,
    fontFamily: font.appHeading,
    fontSize: 15,
    color: '#0F7A4F',
  },
  figures: { marginTop: 18, flexDirection: 'row' },
  figureCol: { flex: 1 },
  figureDivider: { width: 1, backgroundColor: '#E8E2DA', marginHorizontal: 16 },
  figureLabel: {
    fontFamily: font.appSemi,
    fontSize: 12.5,
    letterSpacing: 0.8,
    color: '#6B6B6B',
  },
  figureValue: {
    marginTop: 6,
    fontFamily: font.appHeading,
    fontSize: 26,
    color: '#1B1C1C',
  },
  figureValueAccent: { color: '#8C6B3F' },
  settlement: {
    marginTop: 16,
    marginHorizontal: -t.cardPadX,
    paddingHorizontal: t.cardPadX,
    paddingVertical: 13,
    backgroundColor: '#F7F3EE',
    flexDirection: 'row',
  },
  settlementText: {
    flex: 1,
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: 14,
    lineHeight: 19,
    color: '#4D463D',
  },

  note: {
    marginTop: t.noteTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.noteBg,
    borderRadius: t.noteRadius,
    padding: t.notePad,
  },
  noteText: {
    flex: 1,
    marginLeft: t.noteGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: '#4D463D',
  },
});
