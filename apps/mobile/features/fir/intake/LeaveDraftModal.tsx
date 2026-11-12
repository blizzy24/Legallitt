// Flow C3 Back [DECIDE]: "Save as draft and leave?" with Save draft / Discard /
// Stay. No design exists; built on the ConfirmModal card (design/71) pattern.
import {FilePen} from 'lucide-react-native';
import {ActivityIndicator, Modal, Pressable, StyleSheet, Text, View} from 'react-native';

import {colors, confirmModal as t, font, ink} from '../../../constants/theme';
import {InlineError} from './ui';

export default function LeaveDraftModal({visible, busy, error, onSave, onDiscard, onStay}: {
  visible: boolean; busy: boolean; error?: string;
  onSave: () => void; onDiscard: () => void; onStay: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onStay}>
      <Pressable style={styles.scrim} accessibilityLabel="Stay on this step" onPress={busy ? undefined : onStay}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.icon}><FilePen size={t.iconGlyph} color={colors.textPrimary} /></View>
          <Text style={styles.title}>Save as draft and leave?</Text>
          <Text style={styles.body}>
            Your request stays under My Requests as “Draft – not submitted”, so you can finish it later. Discard removes what you entered on this step.
          </Text>
          <InlineError text={error} />
          <Pressable accessibilityRole="button" disabled={busy} onPress={onSave} style={({pressed}) => [styles.button, styles.save, (pressed || busy) && styles.dim]}>
            {busy ? <ActivityIndicator color={ink.onBrand} /> : <Text style={[styles.label, styles.saveLabel]}>Save draft</Text>}
          </Pressable>
          <Pressable accessibilityRole="button" disabled={busy} onPress={onDiscard} style={({pressed}) => [styles.button, styles.discard, (pressed || busy) && styles.dim]}>
            <Text style={[styles.label, styles.discardLabel]}>Discard</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={busy} onPress={onStay} style={({pressed}) => [styles.button, styles.stay, (pressed || busy) && styles.dim]}>
            <Text style={styles.label}>Stay</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {flex: 1, backgroundColor: t.scrim, alignItems: 'center', justifyContent: 'center', paddingHorizontal: t.padX},
  card: {alignSelf: 'stretch', borderRadius: t.radius, backgroundColor: colors.card, padding: t.pad, alignItems: 'center'},
  icon: {width: t.icon, height: t.icon, borderRadius: t.icon / 2, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center'},
  title: {marginTop: t.titleGap, fontFamily: font.appHeading, fontSize: t.titleSize - 2, color: colors.textPrimary, textAlign: 'center'},
  body: {marginTop: t.bodyGap, textAlign: 'center', fontFamily: font.appBody, fontSize: t.bodySize, lineHeight: t.bodyLineHeight, color: colors.textBody},
  button: {alignSelf: 'stretch', marginTop: t.buttonStackGap, minHeight: t.buttonHeight, borderRadius: t.buttonRadius, alignItems: 'center', justifyContent: 'center'},
  save: {marginTop: t.buttonGap, backgroundColor: colors.brand},
  saveLabel: {color: ink.onBrand},
  discard: {borderWidth: 1, borderColor: '#E7C3BF', backgroundColor: colors.card},
  discardLabel: {color: '#B3261E'},
  stay: {backgroundColor: t.cancelBg},
  label: {fontFamily: font.appSemi, fontSize: t.buttonSize, color: colors.textPrimary},
  dim: {opacity: 0.6},
});
