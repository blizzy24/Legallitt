import type { LucideIcon } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, confirmModal as t, font, ink } from '../constants/theme';

type Props = {
  visible: boolean;
  icon: LucideIcon;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** design/71's destructive treatment: red icon chip and a solid red button. */
  tone?: 'danger' | 'neutral';
};

// Centred confirmation card over a scrim (design/71 "Log Out?").
//
// Extracted rather than inlined because design/67 (data & documents) and design/68
// (delete account) draw the same card with different copy and icons. Those two
// screens are not built yet; this takes their shape so they can reuse it.
export default function ConfirmModal({
  visible,
  icon: Icon,
  title,
  body,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  tone = 'danger',
}: Props) {
  const danger = tone === 'danger';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {/* Tapping the scrim dismisses, matching the platform convention. */}
      <Pressable style={styles.scrim} accessibilityLabel="Dismiss" onPress={onCancel}>
        {/* Swallow taps on the card itself so they do not reach the scrim. */}
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={[styles.icon, danger && styles.iconDanger]}>
            <Icon size={t.iconGlyph} color={danger ? t.dangerBg : colors.textPrimary} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          <Pressable
            accessibilityRole="button"
            onPress={onConfirm}
            style={({ pressed }) => [
              styles.button,
              danger ? styles.confirmDanger : styles.confirmNeutral,
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.buttonLabel, danger && styles.confirmDangerLabel]}>
              {confirmLabel}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={onCancel}
            style={({ pressed }) => [styles.button, styles.cancel, pressed && styles.pressed]}
          >
            <Text style={styles.buttonLabel}>{cancelLabel}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: t.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.padX,
  },
  card: {
    alignSelf: 'stretch',
    borderRadius: t.radius,
    backgroundColor: colors.card,
    padding: t.pad,
    alignItems: 'center',
  },
  icon: {
    width: t.icon,
    height: t.icon,
    borderRadius: t.icon / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDanger: {
    backgroundColor: t.dangerIconBg,
  },
  title: {
    marginTop: t.titleGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  body: {
    marginTop: t.bodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  button: {
    alignSelf: 'stretch',
    marginTop: t.buttonStackGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDanger: {
    marginTop: t.buttonGap,
    backgroundColor: t.dangerBg,
  },
  confirmNeutral: {
    marginTop: t.buttonGap,
    backgroundColor: colors.brand,
  },
  confirmDangerLabel: {
    color: ink.onBrand,
  },
  cancel: {
    backgroundColor: t.cancelBg,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: colors.textPrimary,
  },
});
