import { Building2, ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, hearings as h, ink } from '../constants/theme';
import { formatDate, getAdvocate, getCase, type Hearing } from '../data/cases';
import RecordCard from './RecordCard';
import StatusPill from './StatusPill';

type Props = {
  hearing: Hearing;
  onPress?: () => void;
};

const STATUS_LABEL: Record<Hearing['status'], string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

// Hearing card for the All Hearings list (design/19): category and status pills, case
// title, court, a three-column date/time/courtroom block, the assigned advocate with a
// bench pill, then the case number and a "View Details" link.
export default function HearingListCard({ hearing, onPress }: Props) {
  const c = getCase(hearing.caseId);
  const advocate = c ? getAdvocate(c.advocateId) : undefined;

  return (
    <RecordCard
      radius={h.cardRadius}
      pad={h.cardPad}
      titleGap={h.cardTitleGap}
      titleSize={h.cardTitleSize}
      dividerGap={h.dividerTop}
      footerGap={h.dividerBottom}
      pills={
        <>
          <StatusPill label={(c?.categoryLabel ?? '').toUpperCase()} caps />
          <StatusPill
            label={STATUS_LABEL[hearing.status]}
            tone={hearing.status === 'upcoming' ? 'active' : 'neutral'}
            dot={hearing.status === 'upcoming'}
          />
        </>
      }
      title={c?.title}
      meta={
        <View style={styles.courtRow}>
          <Building2 size={h.courtIcon} color={ink.accent} />
          <Text style={styles.courtText} numberOfLines={1}>
            {c?.court} • {c?.state}
          </Text>
        </View>
      }
      inner={
        <>
          <View style={styles.colBlock}>
            <Column label="HEARING DATE" value={formatDate(hearing.date)} />
            <View style={styles.colDivider} />
            <Column label="TIME" value={hearing.time} />
            <View style={styles.colDivider} />
            <Column label="COURTROOM" value={hearing.courtroom.replace('Courtroom', 'Room')} />
          </View>

          {advocate && (
            <View style={styles.advocateRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{advocate.initials}</Text>
              </View>
              <View style={styles.advocateText}>
                <Text style={styles.advocateLabel}>Assigned Advocate</Text>
                <Text style={styles.advocateName} numberOfLines={1}>
                  {advocate.name}
                </Text>
              </View>
              <View style={styles.bench}>
                <Text style={styles.benchText}>{hearing.bench}</Text>
              </View>
            </View>
          )}
        </>
      }
      footer={
        <>
          <Text style={styles.mono}>{hearing.caseId}</Text>
          <View style={styles.spacer} />
          <Pressable accessibilityRole="link" onPress={onPress} style={styles.link}>
            <Text style={styles.linkText}>View Details</Text>
            <ChevronRight size={h.linkSize} color={ink.accent} />
          </Pressable>
        </>
      }
    />
  );
}

function Column({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.col}>
      <Text style={styles.colLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.colValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  courtRow: {
    marginTop: h.courtGap,
    flexDirection: 'row',
    alignItems: 'center',
    gap: h.courtIconGap,
  },
  courtText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: h.courtSize,
    color: colors.textBody,
  },
  colBlock: {
    marginTop: h.colBlockGap,
    height: h.colBlockHeight,
    borderRadius: h.colBlockRadius,
    backgroundColor: colors.appBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  col: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  colDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginVertical: h.schedPad,
    backgroundColor: colors.border,
  },
  colLabel: {
    fontFamily: font.appSemi,
    fontSize: h.colLabelSize,
    letterSpacing: 0.5,
    color: colors.textBody,
  },
  colValue: {
    marginTop: h.colLabelGap,
    fontFamily: font.appSemi,
    fontSize: h.colValueSize,
    color: colors.textPrimary,
  },
  advocateRow: {
    marginTop: h.advocateGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: font.appSemi,
    fontSize: h.avatarText,
    color: ink.accent,
  },
  avatar: {
    width: h.avatar,
    height: h.avatar,
    borderRadius: h.avatar / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: h.courtIconGap + 3,
  },
  advocateText: {
    flex: 1,
    minWidth: 0,
  },
  advocateLabel: {
    fontFamily: font.appBody,
    fontSize: h.advocateLabelSize,
    color: colors.textBody,
  },
  advocateName: {
    marginTop: h.advocateLabelGap,
    fontFamily: font.appSemi,
    fontSize: h.advocateNameSize,
    color: colors.textPrimary,
  },
  bench: {
    height: h.benchHeight,
    borderRadius: 7,
    paddingHorizontal: h.benchPadX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benchText: {
    fontFamily: font.appBody,
    fontSize: h.benchText,
    color: colors.textBody,
  },
  mono: {
    fontFamily: font.mono,
    fontSize: h.monoSize,
    color: colors.textBody,
  },
  spacer: {
    flex: 1,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: h.linkGap,
  },
  linkText: {
    fontFamily: font.appSemi,
    fontSize: h.linkSize,
    color: ink.accent,
  },
});
