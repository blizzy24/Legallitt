import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, font } from '../constants/theme';

type Props = {
  /** Two pills, laid out at the card's outer edges. */
  pills: ReactNode;
  title: ReactNode;
  titleGap: number;
  titleSize: number;
  /** Whatever sits between the title and the inner block: a meta line, a court row. */
  meta?: ReactNode;
  /** The tinted or bordered block above the divider. Shape differs per card. */
  inner?: ReactNode;
  /** The row below the divider: a label plus a button, a link, a case number. */
  footer: ReactNode;

  radius: number;
  pad: number;
  /** Only design/21's card draws a deeper bottom than its other three sides. */
  padBottom?: number;
  dividerGap: number;
  footerGap: number;
  /** HearingCard's brand bar down the left edge (design/14, 15). */
  accentWidth?: number;
};

// The shell every record card in the app draws: a pills row, a title, optional meta
// and inner block, a hairline divider, and a footer row.
//
// CaseCard, CaseListCard, HearingCard and HearingListCard each wrote this out in
// full. Their four token blocks independently agree on a 16pt radius, 16.5pt padding
// and a 1pt border, which is what makes one shell defensible; the title size and the
// three gaps genuinely differ per design and stay props.
//
// The inner block and the footer differ too much to parameterise — a two-column
// jurisdiction panel, an advocate row, a three-column schedule, a brand button, a
// light pill, an arrow link — so they come in as children.
export default function RecordCard({
  pills,
  title,
  titleGap,
  titleSize,
  meta,
  inner,
  footer,
  radius,
  pad,
  padBottom,
  dividerGap,
  footerGap,
  accentWidth,
}: Props) {
  const body = (
    <>
      <View style={styles.pills}>{pills}</View>
      <Text style={[styles.title, { marginTop: titleGap, fontSize: titleSize }]}>{title}</Text>
      {meta}
      {inner}
      <View style={[styles.divider, { marginTop: dividerGap }]} />
      <View style={[styles.footer, { marginTop: footerGap }]}>{footer}</View>
    </>
  );

  if (accentWidth) {
    return (
      <View style={[styles.card, styles.accentCard, { borderRadius: radius }]}>
        <View style={[styles.accent, { width: accentWidth }]} />
        {/* The accent bar eats into the padding so the text still lines up with the
            cards that have no bar. */}
        <View style={[styles.accentBody, { padding: pad, paddingLeft: pad - accentWidth }]}>
          {body}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        { borderRadius: radius, padding: pad },
        padBottom !== undefined && { paddingBottom: padBottom },
      ]}
    >
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  accentCard: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  accent: {
    backgroundColor: colors.brand,
  },
  accentBody: {
    flex: 1,
    minWidth: 0,
  },
  pills: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: font.appSemi,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
