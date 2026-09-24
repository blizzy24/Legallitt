import { Building2, ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { allCases as a, colors, font, ink } from '../constants/theme';
import { formatDate, getAdvocate, getHearing, type Case } from '../data/cases';
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
    <View style={styles.card}>
      <View style={styles.pills}>
        <StatusPill label={item.categoryLabel.toUpperCase()} caps />
        <StatusPill label="Active" tone="active" dot />
      </View>

      <Text style={styles.title}>{item.title}</Text>
      <View style={styles.courtRow}>
        <Building2 size={a.courtIcon} color={ink.accent} />
        <Text style={styles.courtText} numberOfLines={1}>
          {item.court}
        </Text>
      </View>

      {advocate && (
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
      )}

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View style={styles.footerText}>
          <Text style={styles.footerLabel}>NEXT HEARING</Text>
          <Text style={styles.footerDate}>{hearing ? formatDate(hearing.date) : '—'}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
          <Text style={styles.buttonText}>View Case</Text>
          <ChevronRight size={a.buttonText} color={colors.textBody} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: a.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: a.cardPad,
    paddingBottom: a.cardPadBottom,
  },
  pills: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    marginTop: a.cardTitleGap,
    fontFamily: font.appSemi,
    fontSize: a.cardTitleSize,
    color: colors.textPrimary,
  },
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
  divider: {
    marginTop: a.dividerTop,
    height: 1,
    backgroundColor: colors.border,
  },
  footer: {
    marginTop: a.dividerBottom,
    flexDirection: 'row',
    alignItems: 'center',
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
