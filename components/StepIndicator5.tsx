import { CircleCheck, Clock, FilePen, Mail, UserPlus, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { font, stepper5 as t } from '../constants/theme';

// The Legal Advice booking stepper (design/105 onwards): five circular icon badges
// with two-line labels beneath, joined by a hairline.
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — THIS IS THE FIFTH STEPPER IDIOM IN THE APP. The others are:
//
//   1. Legal Notice's six-step numbered bar          (design/33 onwards)
//   2. FIR's three-dot progress row                   (design/43 onwards)
//   3. StepIndicator3 — Property Search's labelled    (design/74)
//      three-step rail
//   4. The KYC pills ("STEP 2 OF 3"), which are a     (design/92-100)
//      counter rather than a rail
//   5. this one
//
// Nothing shares geometry, labelling or active-state treatment between them, and
// the KYC counter is nested inside the Legal Notice wizard's own counter. Worth a
// consolidation decision before more sections land.
// ─────────────────────────────────────────────────────────────────────────────

const ICONS: LucideIcon[] = [FilePen, Mail, Clock, UserPlus, CircleCheck];

export const STEP5_LABELS = [
  'Your detail',
  'Review detail',
  'Pending for Payment',
  'Assign advocate',
  'Confirmation',
];

/** `active` is 1-based: 1 = "Your detail". */
export default function StepIndicator5({ active }: { active: number }) {
  return (
    <View style={styles.row}>
      {STEP5_LABELS.map((label, i) => {
        const Icon = ICONS[i];
        const on = i + 1 === active;
        return (
          <View key={label} style={styles.cell}>
            {i > 0 && <View style={styles.connector} />}
            <View style={[styles.circle, on && styles.circleOn]}>
              <Icon size={t.glyph} color={on ? t.glyphOn : t.glyphOff} />
            </View>
            <Text style={[styles.label, on && styles.labelOn]}>{label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginTop: t.top, flexDirection: 'row', alignItems: 'flex-start' },
  cell: { flex: 1, minWidth: 0, alignItems: 'center' },
  // Sits behind the circle, running left from this cell's centre to the previous one.
  connector: {
    position: 'absolute',
    right: '50%',
    left: '-50%',
    top: t.circle / 2,
    // design/105 draws this as a dotted rule, not a solid one.
    borderTopWidth: t.connector,
    borderStyle: 'dotted',
    borderColor: t.connectorColour,
  },
  circle: {
    width: t.circle,
    height: t.circle,
    borderRadius: t.circle / 2,
    backgroundColor: t.circleOff,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOn: { backgroundColor: t.circleOn },
  label: {
    marginTop: t.labelGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.labelSize,
    lineHeight: t.labelLineHeight,
    color: t.labelOff,
  },
  labelOn: { fontFamily: font.appSemi, color: t.labelOn },
});
