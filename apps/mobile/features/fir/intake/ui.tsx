// Small building blocks shared by the FIR intake screens (C1–C7). Styled from
// the measured FIR step tokens so undrawn states sit in the same visual system.
import {ArrowRight, Check, CircleAlert, X} from 'lucide-react-native';
import type {ReactNode} from 'react';
import {ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {colors, firStep as s, firStep2 as t, font, ink} from '../../../constants/theme';

export const danger = '#B3261E';

/** A field- or slot-level error: what failed and what to do, next to the thing. */
export function InlineError({text, style}: {text?: string | null; style?: object}) {
  if (!text) return null;
  return (
    <View accessibilityRole="alert" style={[styles.errorRow, style]}>
      <CircleAlert size={14} color={danger} style={styles.errorIcon} />
      <Text style={styles.errorText}>{text}</Text>
    </View>
  );
}

/** Loading panel: says what is loading, so it never reads as real emptiness. */
export function LoadingPanel({label}: {label: string}) {
  return (
    <View style={styles.panel} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={ink.accent} />
      <Text style={styles.panelText}>{label}</Text>
    </View>
  );
}

/** Error / notice panel with up to two actions. */
export function NoticePanel({title, body, tone = 'neutral', actions = []}: {
  title?: string; body: string; tone?: 'neutral' | 'error';
  actions?: {label: string; onPress: () => void; primary?: boolean; disabled?: boolean}[];
}) {
  return (
    <View style={[styles.panel, styles.panelLeft]} accessibilityRole={tone === 'error' ? 'alert' : undefined}>
      {title ? <Text style={styles.panelTitle}>{title}</Text> : null}
      <Text style={[styles.panelText, styles.panelTextLeft, tone === 'error' && {color: danger}]}>{body}</Text>
      {actions.map(a => (
        <Pressable
          key={a.label}
          accessibilityRole="button"
          accessibilityState={{disabled: !!a.disabled}}
          disabled={a.disabled}
          onPress={a.onPress}
          style={({pressed}) => [a.primary ? styles.primary : styles.secondary, styles.panelAction, (pressed || a.disabled) && styles.dim]}
        >
          <Text style={a.primary ? styles.primaryText : styles.secondaryText}>{a.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** The brand Continue button with the trailing arrow (design 42–46). */
export function ContinueButton({label, onPress, busy, busyLabel, disabled, style}: {
  label: string; onPress: () => void; busy?: boolean; busyLabel?: string; disabled?: boolean; style?: object;
}) {
  const off = !!busy || !!disabled;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{disabled: off, busy: !!busy}}
      disabled={off}
      onPress={onPress}
      style={({pressed}) => [styles.primary, style, (pressed || off) && styles.dim]}
    >
      {busy ? <ActivityIndicator color={ink.onBrand} /> : null}
      <Text style={styles.primaryText}>{busy ? busyLabel ?? 'Saving…' : label}</Text>
      {busy ? null : <ArrowRight size={s.buttonIcon} color={ink.onBrand} />}
    </Pressable>
  );
}

/** A square tick box with its label (Unknown, Primary accused, Key Witness). */
export function CheckRow({label, checked, onToggle, disabled}: {label: string; checked: boolean; onToggle: () => void; disabled?: boolean}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{checked, disabled: !!disabled}}
      disabled={disabled}
      onPress={onToggle}
      style={styles.checkRow}
    >
      <View style={[styles.checkBox, checked && styles.checkBoxOn]}>{checked ? <Check size={13} color={ink.onBrand} /> : null}</View>
      <Text style={styles.checkLabel}>{label}</Text>
    </Pressable>
  );
}

/** Pill choices in the incident-type chip style (design 42). */
export function ChoicePills({options, value, onChange, label}: {options: readonly string[]; value: string; onChange: (v: string) => void; label: string}) {
  return (
    <View style={styles.pills} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map(o => {
        const on = o === value;
        return (
          <Pressable key={o} accessibilityRole="radio" accessibilityState={{checked: on}} onPress={() => onChange(o)} style={[styles.pill, on && styles.pillOn]}>
            <Text style={[styles.pillText, on && styles.pillTextOn]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Bottom sheet used for the Step 3 person editors and the custom-slot name. */
export function Sheet({visible, title, subtitle, onClose, children, footer}: {
  visible: boolean; title: string; subtitle?: string; onClose: () => void; children: ReactNode; footer?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.sheetRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.scrim} accessibilityLabel="Close" onPress={onClose} />
        <View style={[styles.sheet, {paddingBottom: insets.bottom + 18}]}>
          <View style={styles.grabber} />
          <View style={styles.sheetHead}>
            <View style={styles.sheetHeadText}>
              <Text style={styles.sheetTitle}>{title}</Text>
              {subtitle ? <Text style={styles.sheetSubtitle}>{subtitle}</Text> : null}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={onClose} style={styles.sheetClose}>
              <X size={18} color={colors.textPrimary} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>
            {children}
          </ScrollView>
          {footer ? <View style={styles.sheetFooter}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export const intakeStyles = StyleSheet.create({
  textArea: {
    minHeight: 96,
    borderRadius: s.fieldRadius,
    backgroundColor: s.fieldBg,
    paddingHorizontal: s.fieldPadX,
    paddingTop: 13,
    paddingBottom: 13,
    fontFamily: font.appBody,
    fontSize: s.fieldTextSize,
    lineHeight: 21,
    color: s.fieldText,
    textAlignVertical: 'top',
    outlineWidth: 0,
  },
  muted: {
    fontFamily: font.appBody,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textBody,
  },
  link: {
    fontFamily: font.appSemi,
    fontSize: 13.5,
    color: ink.accent,
  },
});

const styles = StyleSheet.create({
  errorRow: {marginTop: 8, flexDirection: 'row', alignItems: 'flex-start'},
  errorIcon: {marginTop: 2, marginRight: 6},
  errorText: {flex: 1, minWidth: 0, fontFamily: font.appBody, fontSize: 12.5, lineHeight: 18, color: danger},
  panel: {
    marginTop: 12,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  panelLeft: {alignItems: 'stretch'},
  panelTitle: {fontFamily: font.appHeading, fontSize: 16, color: colors.textPrimary},
  panelText: {fontFamily: font.appBody, fontSize: 13.5, lineHeight: 20, color: colors.textBody, textAlign: 'center'},
  panelTextLeft: {textAlign: 'left'},
  panelAction: {marginTop: 4},
  primary: {
    minHeight: s.buttonHeight,
    borderRadius: s.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.buttonIconGap,
    paddingHorizontal: 16,
  },
  primaryText: {fontFamily: font.appSemi, fontSize: s.buttonSize, color: ink.onBrand},
  secondary: {
    minHeight: 44,
    borderRadius: s.buttonRadius,
    backgroundColor: s.fieldBg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryText: {fontFamily: font.appSemi, fontSize: 14, color: colors.textPrimary},
  dim: {opacity: 0.6},
  checkRow: {marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 10},
  checkBox: {
    width: 20, height: 20, borderRadius: 5, borderWidth: 1.5, borderColor: colors.brand,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card,
  },
  checkBoxOn: {backgroundColor: colors.brand},
  checkLabel: {flexShrink: 1, fontFamily: font.appBody, fontSize: 14, color: colors.textPrimary},
  pills: {flexDirection: 'row', flexWrap: 'wrap', columnGap: s.optionColGap, rowGap: s.optionRowGap},
  pill: {
    minHeight: 34, borderRadius: 17, paddingHorizontal: 16, backgroundColor: s.fieldBg,
    justifyContent: 'center',
  },
  pillOn: {backgroundColor: colors.brand},
  pillText: {fontFamily: font.appSemi, fontSize: 13.5, color: s.fieldText},
  pillTextOn: {color: ink.onBrand},
  sheetRoot: {flex: 1, justifyContent: 'flex-end'},
  scrim: {position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(28, 24, 20, 0.45)'},
  sheet: {
    maxHeight: '90%',
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  grabber: {alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2DCD5', marginBottom: 12},
  sheetHead: {flexDirection: 'row', alignItems: 'flex-start'},
  sheetHeadText: {flex: 1, minWidth: 0},
  sheetTitle: {fontFamily: font.appHeading, fontSize: 18, color: colors.textPrimary},
  sheetSubtitle: {marginTop: 4, fontFamily: font.appBody, fontSize: 13, lineHeight: 18, color: colors.textBody},
  sheetClose: {width: 32, height: 32, borderRadius: 16, backgroundColor: s.fieldBg, alignItems: 'center', justifyContent: 'center', marginLeft: 12},
  sheetBody: {paddingBottom: 12},
  sheetFooter: {paddingTop: 12, gap: 10},
});
