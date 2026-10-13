import { Check } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { shrinkToFit } from '../constants/textFit';
import { courierTimeline as t, font, ink } from '../constants/theme';

export type TrackStep = {
  title: string;
  sub?: string;
  tone: 'done' | 'active' | 'todo';
};

/**
 * The vertical delivery tracker designs 280, 281 and 287 all draw.
 *
 * ONE COMPONENT FOR THREE SCREENS. The three were measured against each other
 * first: same marker vocabulary (green check / brown ring / grey dot), same
 * 2pt connector, same type. They differ only in whether each row carries a
 * second line — 280 has none, 281 and 287 do — so that is a per-row field, not
 * a variant.
 *
 * components/FirTimeline was checked before this was written and NOT extended.
 * It draws a different vocabulary (an Hourglass glyph for pending, a tinted
 * card behind the active row, an optional per-row "Completed / Active /
 * Pending" label), every one of its sizes comes from the firResult block, and
 * its item type lives in data/fir. Extending it would have meant a second
 * marker set, a second token set and a second data type inside one component —
 * a new component wearing the old one's name.
 *
 * design/283 draws no tracker at all, although it sits between 282 and the end
 * of the flow. That is recorded as note 16, not invented here.
 */
export default function CourierTimeline({ steps }: { steps: TrackStep[] }) {
  const hasSub = steps.some((s) => s.sub);
  return (
    <View>
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        const todo = s.tone === 'todo';
        const size = todo ? t.markerTodo : t.marker;
        return (
          <View key={s.title} style={styles.row}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.marker,
                  { width: size, height: size, borderRadius: size / 2 },
                  s.tone === 'done' && styles.done,
                  s.tone === 'active' && styles.active,
                  todo && styles.todoMarker,
                ]}
              >
                {s.tone === 'done' ? (
                  <Check size={t.markerGlyph} color={ink.onBrand} strokeWidth={3} />
                ) : (
                  <View
                    style={[
                      styles.inner,
                      s.tone === 'active' ? styles.innerActive : styles.innerTodo,
                    ]}
                  />
                )}
              </View>
              {!last ? (
                <View
                  style={[styles.line, s.tone === 'done' && styles.lineDone]}
                />
              ) : null}
            </View>
            <View style={[styles.text, !last && (hasSub ? styles.gapSub : styles.gap)]}>
              <Text
                style={[
                  styles.title,
                  s.tone === 'active' && styles.titleActive,
                  todo && styles.titleTodo,
                ]}
                {...shrinkToFit(0.8)}
              >
                {s.title}
              </Text>
              {s.sub ? (
                <Text style={styles.sub} {...shrinkToFit(0.8)}>
                  {s.sub}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  rail: { width: t.marker, alignItems: 'center' },
  marker: { alignItems: 'center', justifyContent: 'center' },
  done: { backgroundColor: t.done },
  active: { backgroundColor: t.active },
  todoMarker: { backgroundColor: t.todo },
  inner: { borderRadius: 99 },
  innerActive: { width: t.activeInner, height: t.activeInner, backgroundColor: t.activeDot },
  innerTodo: { width: t.todoInner, height: t.todoInner, backgroundColor: t.todoDot },
  line: { flex: 1, width: t.lineW, backgroundColor: t.line },
  lineDone: { backgroundColor: t.lineDone },
  text: { flex: 1, marginLeft: t.gap },
  gap: { paddingBottom: t.rowGap },
  gapSub: { paddingBottom: t.rowGapSub },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: '#1B1C1C' },
  titleActive: { color: t.titleActive },
  titleTodo: { fontFamily: font.appBody, color: t.titleTodo },
  sub: { marginTop: t.subTop, fontFamily: font.appBody, fontSize: t.subSize, color: t.titleTodo },
});
