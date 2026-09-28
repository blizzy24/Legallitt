import { Check, Download, Eye, FileText, MoreVertical } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { shrinkToFit } from '../constants/textFit';
import { colors, documents as t, font, ink } from '../constants/theme';
import type { DocumentItem, FooterTone } from '../data/documents';

type Props = {
  item: DocumentItem;
  /**
   * 'vault' is design/56 (beige file icon, kebab, eye + "View").
   * 'case'  is design/52 (red file icon, download glyph, "View Document", dot footer).
   */
  variant?: 'vault' | 'case';
  onView?: () => void;
};

// One card for both document screens. The two designs draw the same file with a
// different chip, a different footer line and a different trailing control, so the
// wording comes from the item's `vault` / `caseView` block and the chrome from here.
export default function DocumentCard({ item, variant = 'vault', onView }: Props) {
  const isCase = variant === 'case';
  const view = isCase ? item.caseView : item.vault;
  if (!view) return null;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={[styles.icon, isCase && styles.iconCase]}>
          <FileText
            size={t.fileIconGlyph}
            color={isCase ? t.caseFileIconColour : ink.accent}
          />
        </View>

        <View style={styles.text}>
          <Text style={styles.name} {...shrinkToFit(0.75)}>
            {item.name}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText} {...shrinkToFit(0.8)}>
                {view.chip}
              </Text>
            </View>
            <Text style={styles.size} {...shrinkToFit(0.8)}>
              {isCase ? item.size : `• ${item.size}`}
            </Text>
          </View>
          <View style={styles.dateRow}>
            <FileText size={t.dateIcon} color={colors.textMuted} />
            <Text style={styles.date} {...shrinkToFit(0.8)}>
              {isCase ? `Uploaded: ${item.uploaded}` : `Uploaded ${item.uploaded}`}
            </Text>
          </View>
        </View>

        {isCase ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Download" hitSlop={8}>
            <Download size={t.downloadIcon} color={colors.textPrimary} />
          </Pressable>
        ) : (
          // The kebab opens nothing — no menu is designed.
          <Pressable accessibilityRole="button" accessibilityLabel="More options" hitSlop={8}>
            <MoreVertical size={t.kebabIcon} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.foot}>
        <Footer tone={view.tone} label={view.footer} dot={isCase} />
        <Pressable
          accessibilityRole="button"
          onPress={onView}
          style={({ pressed }) => [styles.view, isCase && styles.viewCase, pressed && styles.pressed]}
        >
          {!isCase && <Eye size={t.viewIcon} color={colors.textPrimary} />}
          <Text style={[styles.viewLabel, !isCase && styles.viewLabelGap]} {...shrinkToFit(0.8)}>
            {isCase ? 'View Document' : 'View'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function Footer({ tone, label, dot }: { tone: FooterTone; label: string; dot: boolean }) {
  const colour = tone === 'verified' ? t.footVerified : ink.accent;
  return (
    <View style={styles.footText}>
      {dot ? (
        <View style={[styles.footDot, { backgroundColor: colour }]} />
      ) : tone === 'verified' ? (
        <Check size={t.footIcon} color={colour} strokeWidth={3} />
      ) : (
        <FileText size={t.footIcon} color={colour} />
      )}
      <Text
        style={[styles.footLabel, tone === 'verified' && !dot && { color: colour }]}
        {...shrinkToFit(0.8)}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.cardPad,
  },
  head: {
    flexDirection: 'row',
  },
  icon: {
    width: t.fileIcon,
    height: t.fileIcon,
    borderRadius: t.fileIconRadius,
    backgroundColor: t.fileIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCase: {
    backgroundColor: t.caseFileIconBg,
  },
  text: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.fileIconGap,
  },
  name: {
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  metaRow: {
    marginTop: t.chipGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  chipText: {
    fontFamily: font.appBody,
    fontSize: t.chipSize,
    color: colors.brandDark,
  },
  size: {
    marginLeft: t.sizeGap,
    fontFamily: font.appBody,
    fontSize: t.sizeSize,
    color: colors.textBody,
  },
  dateRow: {
    marginTop: t.dateGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    marginLeft: t.dateIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.dateSize,
    color: colors.textBody,
  },
  divider: {
    marginTop: t.footDividerGap,
    height: 1,
    backgroundColor: colors.border,
  },
  foot: {
    marginTop: t.footGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footText: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footDot: {
    width: t.caseFootDot,
    height: t.caseFootDot,
    borderRadius: t.caseFootDot / 2,
    marginRight: t.caseFootDotGap,
  },
  footLabel: {
    marginLeft: t.footIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.footSize,
    color: colors.textBody,
  },
  view: {
    marginLeft: 10,
    minHeight: t.viewHeight,
    borderRadius: t.viewRadius,
    paddingHorizontal: t.viewPadX,
    borderWidth: 1,
    borderColor: t.viewBorder,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCase: {
    minHeight: t.caseViewHeight,
    paddingHorizontal: t.caseViewPadX,
    backgroundColor: colors.appBg,
  },
  pressed: {
    opacity: 0.85,
  },
  viewLabel: {
    fontFamily: font.appSemi,
    fontSize: t.viewSize,
    color: colors.textPrimary,
  },
  viewLabelGap: {
    marginLeft: t.viewIconGap,
  },
});
