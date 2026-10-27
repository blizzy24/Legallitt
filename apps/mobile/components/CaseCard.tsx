import { ChevronRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cases, colors, font, ink, status } from '../constants/theme';
import { formatDate, getAdvocate, getHearing, type Case } from '../data/cases';
import RecordCard from './RecordCard';
import StatusPill from './StatusPill';

type Props = {
  item: Case;
  statusLabel?:string;
  onPress?: () => void;
};

// Active case card (design/14, 16): status pill and mono ID chip, title and meta, an
// inner jurisdiction/advocate block, then the next hearing and a "View Case" button.
export default function CaseCard({ item, onPress, statusLabel='Active' }: Props) {
  const advocate = getAdvocate(item.advocateId);
  const hearing = item.nextHearingId ? getHearing(item.nextHearingId) : undefined;

  return (
    <RecordCard
      radius={cases.cardRadius}
      pad={cases.cardPad}
      titleGap={cases.cardTitleGap}
      titleSize={cases.cardTitleSize}
      dividerGap={cases.dividerGap}
      footerGap={cases.dividerGap}
      pills={
        <>
          <StatusPill label={statusLabel} tone="active" dot />
          <View style={styles.chip}>
            <Text style={styles.chipText}>#{item.shortRef}</Text>
          </View>
        </>
      }
      title={item.title}
      meta={
        <Text style={styles.meta}>
          {item.categoryLabel} • {item.city}
        </Text>
      }
      inner={
        <View style={styles.inner}>
          <View style={styles.innerCol}>
            <Text style={styles.innerLabel}>JURISDICTION</Text>
            <Text style={styles.innerValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
              {item.court}
            </Text>
          </View>
          <View style={styles.innerCol}>
            <Text style={styles.innerLabel}>ASSIGNED ADVOCATE</Text>
            <View style={styles.advocateRow}>
              <View style={styles.advocateDot} />
              <Text style={styles.innerValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                {advocate?.name}
              </Text>
            </View>
          </View>
        </View>
      }
      footer={
        <>
          <Text style={styles.footerLabel}>Next Hearing: </Text>
          <Text style={styles.footerValue}>{hearing ? formatDate(hearing.date) : '—'}</Text>
          <View style={styles.spacer} />
          <Pressable accessibilityRole="button" onPress={onPress} style={styles.button}>
            <Text style={styles.buttonText}>View Case</Text>
            <ChevronRight size={cases.buttonText} color={ink.onBrand} />
          </Pressable>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  chip: {
    height: cases.chipHeight,
    borderRadius: cases.chipRadius,
    paddingHorizontal: cases.chipPadX,
    backgroundColor: colors.appBg,
    borderWidth: cases.hairline,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: font.mono,
    fontSize: cases.chipText,
    color: colors.textBody,
  },
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
  },
  innerCol: {
    flex: 1,
    minWidth: 0,
  },
  innerLabel: {
    fontFamily: font.appBody,
    fontSize: cases.innerLabelSize,
    letterSpacing: cases.capsSpacing,
    color: colors.textMuted,
  },
  innerValue: {
    marginTop: cases.innerValueGap,
    fontFamily: font.appSemi,
    fontSize: cases.innerValueSize,
    color: colors.textPrimary,
  },
  advocateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  advocateDot: {
    width: cases.footerDot - 1,
    height: cases.footerDot - 1,
    borderRadius: (cases.footerDot - 1) / 2,
    backgroundColor: status.active,
    marginRight: cases.footerDotGap - 2,
    marginTop: cases.innerValueGap,
  },
  footerLabel: {
    fontFamily: font.appBody,
    fontSize: cases.footerSize,
    color: colors.textBody,
  },
  footerValue: {
    fontFamily: font.appSemi,
    fontSize: cases.footerSize,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
  },
  button: {
    height: cases.buttonHeight,
    borderRadius: cases.buttonRadius,
    paddingHorizontal: cases.buttonPadX,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    gap: cases.buttonIconGap,
  },
  buttonText: {
    fontFamily: font.appSemi,
    fontSize: cases.buttonText,
    color: ink.onBrand,
  },
});
