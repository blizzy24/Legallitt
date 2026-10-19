import { StyleSheet, Text, View } from 'react-native';

import { shrinkToFit } from '../constants/textFit';
import { colors, font, ink, psRequest as t } from '../constants/theme';

export const PROPERTY_STEPS = ['Your detail', 'Confirmation', 'Payment'];

type Props = {
  /** 1-based, of PROPERTY_STEPS. */
  step: number;
};

// Horizontal three-step indicator: numbered circles joined by a rule, labels below
// (design/74, reused by design/76 and design/77).
//
// This is the app's THIRD stepper style and it shares nothing with the other two:
// WizardShell draws six numbered circles with no labels, and FirShell draws a
// percentage bar with a "STEP n OF 5" caption. Kept separate rather than forced into
// either — see the note in app/property-search/request.tsx.
export default function StepIndicator3({ step }: Props) {
  return (
    <View style={styles.wrap} accessibilityLabel={`Step ${step} of ${PROPERTY_STEPS.length}`}>
      <View style={styles.row}>
        {PROPERTY_STEPS.map((label, i) => {
          const n = i + 1;
          const done = n <= step;
          return (
            <View key={label} style={styles.item}>
              {i > 0 && <View style={[styles.line, done && styles.lineDone]} />}
              <View style={styles.cell}>
                <View style={[styles.circle, done && styles.circleDone]}>
                  <Text style={[styles.circleText, done && styles.circleTextDone]}>{n}</Text>
                </View>
                <Text
                  style={[styles.label, done && styles.labelDone]}
                  {...shrinkToFit(0.75)}
                >
                  {label}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: t.stepperGap,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  // The rule sits at the circle's vertical centre, so it is nudged up by half the
  // label block that hangs below.
  line: {
    flex: 1,
    height: t.stepperLine,
    marginHorizontal: t.stepperLineGap,
    marginBottom: t.stepperLabelGap + t.stepperLabelSize + 2,
    backgroundColor: t.stepperTodo,
  },
  lineDone: {
    backgroundColor: t.stepperDone,
  },
  cell: {
    alignItems: 'center',
  },
  circle: {
    width: t.stepperCircle,
    height: t.stepperCircle,
    borderRadius: t.stepperCircle / 2,
    borderWidth: 1,
    borderColor: t.stepperTodo,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    backgroundColor: t.stepperDone,
    borderColor: t.stepperDone,
  },
  circleText: {
    fontFamily: font.appSemi,
    fontSize: t.stepperCircleSize,
    color: t.stepperTodoText,
  },
  circleTextDone: {
    color: ink.onBrand,
  },
  label: {
    marginTop: t.stepperLabelGap,
    fontFamily: font.appBody,
    fontSize: t.stepperLabelSize,
    color: colors.textBody,
  },
  labelDone: {
    fontFamily: font.appSemi,
    color: colors.textPrimary,
  },
});
