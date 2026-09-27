import { ArrowRight, Building2 } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cases, colors, font, ink, status } from '../constants/theme';
import {
  daysUntil,
  formatDate,
  getCase,
  type Hearing,
} from '../data/cases';
import RecordCard from './RecordCard';
import StatusPill from './StatusPill';

type Props = {
  hearing: Hearing;
  onPress?: () => void;
};

// Upcoming hearing card (design/14, 15): brown accent bar down the left, a type pill and
// a "days remaining" pill, then the case title, an inner court/date block and a footer.
export default function HearingCard({ hearing, onPress }: Props) {
  const c = getCase(hearing.caseId);
  const days = daysUntil(hearing.date);

  return (
    <RecordCard
      radius={cases.cardRadius}
      pad={cases.cardPad}
      accentWidth={cases.accentWidth}
      titleGap={cases.cardTitleGap}
      titleSize={cases.cardTitleSize}
      dividerGap={cases.dividerGap}
      footerGap={cases.dividerGap}
      pills={
        <>
          <StatusPill label={hearing.type} />
          {days > 0 && <StatusPill label={`${days} days remaining`} tone="pending" />}
        </>
      }
      title={c?.title}
      meta={
        <Text style={styles.meta}>
          {c?.categoryLabel} • Case #{c?.shortRef}
        </Text>
      }
      inner={
        <View style={styles.inner}>
          <View style={styles.innerIcon}>
            <Building2 size={cases.innerValueSize + 3} color={ink.accent} />
          </View>
          <View style={styles.innerText}>
            <Text style={styles.innerTitle}>{c?.court}</Text>
            <Text style={styles.innerSub}>
              {hearing.courtroom}
              {hearing.itemNo ? ` • Item No. ${hearing.itemNo}` : ''}
            </Text>
          </View>
          <View style={styles.innerRight}>
            <Text style={styles.innerTitle}>{formatDate(hearing.date)}</Text>
            <Text style={styles.innerSub}>{hearing.time}</Text>
          </View>
        </View>
      }
      footer={
        <>
          <View style={styles.footerDot} />
          <Text style={styles.footerText} numberOfLines={1}>
            {hearing.attendance}
          </Text>
          <View style={styles.spacer} />
          <Pressable accessibilityRole="link" onPress={onPress} style={styles.link}>
            <Text style={styles.linkText}>View Details</Text>
            <ArrowRight size={cases.linkSize} color={ink.accent} />
          </Pressable>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  meta: {
    marginTop: cases.metaGap,
    fontFamily: font.appBody,
    fontSize: cases.metaSize,
    color: colors.textBody,
  },
  inner: {
    marginTop: cases.innerGap,
    borderRadius: cases.innerRadius,
    backgroundColor: colors.appBg,
    padding: cases.innerPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  innerIcon: {
    width: cases.clockButton,
    height: cases.clockButton,
    borderRadius: cases.chipRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: cases.innerPad - 2,
  },
  innerText: {
    flex: 1,
    minWidth: 0,
  },
  innerRight: {
    alignItems: 'flex-end',
  },
  innerTitle: {
    fontFamily: font.appSemi,
    fontSize: cases.innerValueSize,
    color: colors.textPrimary,
  },
  innerSub: {
    marginTop: 3,
    fontFamily: font.appBody,
    fontSize: cases.metaSize - 1,
    color: colors.textBody,
  },
  footerDot: {
    width: cases.footerDot,
    height: cases.footerDot,
    borderRadius: cases.footerDot / 2,
    backgroundColor: status.active,
    marginRight: cases.footerDotGap,
  },
  footerText: {
    fontFamily: font.appBody,
    fontSize: cases.footerSize,
    color: colors.textBody,
  },
  spacer: {
    flex: 1,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: cases.buttonIconGap,
  },
  linkText: {
    fontFamily: font.appSemi,
    fontSize: cases.linkSize,
    color: ink.accent,
  },
});
