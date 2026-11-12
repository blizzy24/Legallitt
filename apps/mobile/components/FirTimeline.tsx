import { Check, Hourglass } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { shrinkToFit } from '../constants/textFit';
import { colors, firResult as t, font, ink } from '../constants/theme';

export type TimelineTone = 'done' | 'active' | 'pending';
export type TimelineItem = {
  title: string;
  description: string;
  /** Right-hand label (design/48) or the active row's tag (design/49, F6). Empty hides it. */
  state: string;
  tone: TimelineTone;
  /** Extra line inside the highlighted active card (design/48 "Drafting team assigned"). */
  footnote?: string | null;
};

type Props = {
  items: TimelineItem[];
  /**
   * design/48 draws large markers with a "Completed / Active / Pending" label on
   * each row; design/49 draws small markers, no per-row label, and tags only the
   * active row.
   */
  variant?: 'status' | 'ready';
};

// Vertical progress timeline shared by design/48 and design/49. The active item's
// text block sits on a tinted card in both files; the marker and labelling differ.
export default function FirTimeline({ items, variant = 'status' }: Props) {
  const big = variant === 'status';
  const marker = big ? t.markerSize : t.markerSmall;

  return (
    <View style={styles.list}>
      {items.map((item, i) => {
        const last = i === items.length - 1;
        const active = item.tone === 'active';
        return (
          <View key={item.title} style={styles.row}>
            <View style={styles.rail}>
              <Marker tone={item.tone} size={marker} />
              {!last && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: item.tone === 'done' ? t.lineDone : t.lineTodo },
                  ]}
                />
              )}
            </View>

            <View style={[styles.body, !last && styles.bodyGap, active && styles.bodyActive]}>
              <View style={styles.titleRow}>
                <Text style={[styles.title, big && styles.titleBig]} {...shrinkToFit(0.8)}>
                  {item.title}
                </Text>
                {item.state !== '' &&
                  (big ? (
                    <Text style={styles.state} {...shrinkToFit(0.8)}>
                      {item.state}
                    </Text>
                  ) : (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{item.state}</Text>
                    </View>
                  ))}
              </View>
              <Text style={styles.desc}>{item.description}</Text>
              {item.footnote && (
                <View style={styles.footnote}>
                  <Hourglass size={t.footnoteIcon} color={colors.textBody} />
                  <Text style={styles.footnoteText} {...shrinkToFit(0.8)}>
                    {item.footnote}
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function Marker({ tone, size }: { tone: TimelineItem['tone']; size: number }) {
  if (tone === 'active') {
    return (
      <View
        style={[
          styles.marker,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: t.markerActiveRing },
        ]}
      >
        <View
          style={[
            styles.marker,
            {
              width: size - 8,
              height: size - 8,
              borderRadius: (size - 8) / 2,
              backgroundColor: t.markerActiveCore,
            },
          ]}
        >
          <View style={styles.activeDot} />
        </View>
      </View>
    );
  }
  const done = tone === 'done';
  return (
    <View
      style={[
        styles.marker,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: done ? t.markerDone : t.markerPending,
        },
      ]}
    >
      {done && <Check size={size * 0.5} color={ink.onBrand} strokeWidth={3} />}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    marginTop: t.timelineTop,
  },
  row: {
    flexDirection: 'row',
  },
  // The gap sits on the text block, not the row, so the rail stretches the full row
  // height and the connector line runs unbroken into the next marker.
  bodyGap: {
    marginBottom: t.itemGap,
  },
  rail: {
    alignItems: 'center',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeDot: {
    width: t.markerActiveDot,
    height: t.markerActiveDot,
    borderRadius: t.markerActiveDot / 2,
    backgroundColor: t.markerDone,
  },
  line: {
    flex: 1,
    width: t.lineWidth,
    marginTop: 2,
  },
  body: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.markerGap,
  },
  bodyActive: {
    marginTop: -t.activePad + 2,
    borderRadius: t.activeRadius,
    backgroundColor: t.activeBg,
    padding: t.activePad,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.itemTitleSize,
    color: colors.textPrimary,
  },
  titleBig: {
    fontSize: t.itemTitleSize,
  },
  state: {
    marginLeft: 8,
    fontFamily: font.appBody,
    fontSize: t.itemStateSize,
    color: colors.textBody,
  },
  tag: {
    marginLeft: 8,
    minHeight: t.activeTagHeight,
    borderRadius: t.activeTagRadius,
    paddingHorizontal: t.activeTagPadX,
    backgroundColor: t.activeTagBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontFamily: font.appSemi,
    fontSize: t.activeTagSize,
    letterSpacing: t.activeTagSpacing,
    color: ink.onBrand,
  },
  desc: {
    marginTop: t.itemDescGap,
    fontFamily: font.appBody,
    fontSize: t.itemDescSize,
    lineHeight: t.itemDescLineHeight,
    color: colors.textBody,
  },
  footnote: {
    marginTop: t.footnoteGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footnoteText: {
    marginLeft: t.footnoteIconGap,
    fontFamily: font.appBody,
    fontSize: t.footnoteSize,
    color: colors.textBody,
  },
});
