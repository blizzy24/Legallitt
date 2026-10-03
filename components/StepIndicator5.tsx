import {
  CircleAlert,
  CircleCheck,
  Clock,
  CreditCard,
  FilePen,
  Mail,
  UserPlus,
  type LucideIcon,
} from 'lucide-react-native';
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
/** design/107's six-step variant splits "Pending for Payment" into two stages. */
const ICONS6: LucideIcon[] = [FilePen, Mail, CircleAlert, CreditCard, UserPlus, CircleCheck];

export const STEP5_LABELS = [
  'Your detail',
  'Review detail',
  'Pending for Payment',
  'Assign advocate',
  'Confirmation',
];

/**
 * REPORTED — design/107 draws SIX steps where design/105 and design/111 draw five.
 * It splits "Pending for Payment" into a "Pending" stage and a "Payment" stage, so
 * the same journey is numbered two different ways on consecutive screens. Both are
 * rendered as drawn; this list is what design/107 shows.
 */
export const STEP6_LABELS = [
  'Your detail',
  'Review detail',
  'Pending',
  'Payment',
  'Assign advocate',
  'Confirmation',
];

type Props = {
  /** 1-based: 1 = "Your detail". */
  active: number;
  /** Pass STEP6_LABELS for design/107's six-step variant. */
  labels?: string[];
  /** design/111 shows every circle filled, not just the active one. */
  allComplete?: boolean;
};

export default function StepIndicator5({ active, labels = STEP5_LABELS, allComplete }: Props) {
  const icons = labels.length === 6 ? ICONS6 : ICONS;
  return (
    <View style={styles.row}>
      {labels.map((label, i) => {
        const Icon = icons[i];
        const on = allComplete || i + 1 === active;
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
