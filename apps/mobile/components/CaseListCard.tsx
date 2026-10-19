import { Building2, ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { allCases as a, colors, font, ink } from '../constants/theme';
import { formatDate, getAdvocate, getHearing, type Case } from '../data/cases';
import RecordCard from './RecordCard';
import StatusPill from './StatusPill';

type Props = {
  item: Case;
  onPress?: () => void;
};

// Case card for the All Active Cases list (design/21). Differs from the My Cases card:
// a category chip instead of an ID chip, a single advocate row with a role label, and a
// light "View Case" pill rather than the brand button.
export default function CaseListCard({ item, onPress }: Props) {
  const advocate = getAdvocate(item.advocateId);
  const hearing = item.nextHearingId ? getHearing(item.nextHearingId) : undefined;

  return (
    <RecordCard
      radius={a.cardRadius}
      pad={a.cardPad}
      padBottom={a.cardPadBottom}
      titleGap={a.cardTitleGap}
      titleSize={a.cardTitleSize}
      dividerGap={a.dividerTop}
      footerGap={a.dividerBottom}
      pills={
        <>
          <StatusPill label={item.categoryLabel.toUpperCase()} caps />
          <StatusPill label="Active" tone="active" dot />
        </>
      }
      title={item.title}
      meta={
        <View style={styles.courtRow}>
          <Building2 size={a.courtIcon} color={ink.accent} />
          <Text style={styles.courtText} numberOfLines={1}>
            {item.court}
          </Text>
        </View>
      }
      inner={
        advocate && (
          <View style={styles.advocateRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{advocate.initials}</Text>
            </View>
            <Text style={styles.advocateName} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
              {advocate.name}
            </Text>
            <View style={styles.spacer} />
            <Text style={styles.role} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
              {advocate.role}
            </Text>
          </View>
        )
      }
      footer={
        <>
          <View style={styles.footerText}>
            <Text style={styles.footerLabel}>NEXT HEARING</Text>
            <Text style={styles.footerDate}>{hearing ? formatDate(hearing.date) : '—'}</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
            <Text style={styles.buttonText}>View Case</Text>
            <ChevronRight size={a.buttonText} color={colors.textBody} />
          </Pressable>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  courtRow: {
    marginTop: a.courtGap,
    flexDirection: 'row',
    alignItems: 'center',
    gap: a.courtIconGap,
  },
  courtText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: a.courtSize,
    color: colors.textBody,
  },
  advocateRow: {
    marginTop: a.rowGap,
    borderRadius: a.rowRadius,
    backgroundColor: colors.appBg,
    padding: a.rowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: a.avatar,
    height: a.avatar,
    borderRadius: a.avatar / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: a.advocateGap,
  },
  avatarText: {
    fontFamily: font.appSemi,
    fontSize: a.avatarText,
    color: ink.accent,
  },
  advocateName: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: a.advocateName,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
    minWidth: a.advocateGap,
  },
  role: {
    fontFamily: font.appBody,
    fontSize: a.roleSize,
    color: colors.textBody,
  },
  footerText: {
    flex: 1,
    minWidth: 0,
  },
  footerLabel: {
    fontFamily: font.appSemi,
    fontSize: a.footerLabelSize,
    letterSpacing: 0.5,
    color: colors.textBody,
  },
  footerDate: {
    marginTop: a.footerLabelGap,
    fontFamily: font.appSemi,
    fontSize: a.footerDateSize,
    color: colors.textPrimary,
  },
  button: {
    height: a.buttonHeight,
    borderRadius: a.buttonRadius,
    paddingHorizontal: a.buttonPadX,
    backgroundColor: colors.iconChipBg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  buttonText: {
    fontFamily: font.appSemi,
    fontSize: a.buttonText,
    color: colors.textBody,
  },
});
