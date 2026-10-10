import { Check, Plus } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { shrinkToFit } from '../constants/textFit';
import { advVerifyChip as t, colors, font, ink } from '../constants/theme';

/**
 * The multi-select chips on designs 235 and 237 — practice areas, courts,
 * languages. Three drawn states: picked (brand border, tinted fill, tick),
 * available (grey border, white fill, plus) and the dashed "add" chip.
 *
 * STATIC. These do not toggle. Nothing on this wizard holds state, and the
 * exports draw one fixed selection per screen.
 */
export type ChipState = 'on' | 'off' | 'add';

export default function VerifySelectChip({ label, state }: { label: string; state: ChipState }) {
  const on = state === 'on';
  return (
    <View style={[styles.chip, on && styles.chipOn, state === 'add' && styles.chipAdd]}>
      {on ? (
        <Check size={t.glyph} color="#222222" strokeWidth={2.6} />
      ) : (
        <Plus size={t.glyph} color={state === 'add' ? ink.accent : colors.textBody} strokeWidth={2} />
      )}
      <Text
        style={[styles.label, on && styles.labelOn, state === 'add' && styles.labelAdd]}
        {...shrinkToFit(0.8)}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    height: t.height,
    borderRadius: t.radius,
    paddingHorizontal: t.padX,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.offBorder,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: t.gapX,
    marginTop: t.gapY,
  },
  chipOn: { backgroundColor: t.onBg, borderColor: colors.brand },
  chipAdd: { borderStyle: 'dashed', borderColor: t.addBorder, backgroundColor: 'transparent' },
  label: {
    marginLeft: t.glyphGap,
    fontFamily: font.appBody,
    fontSize: t.size,
    color: colors.textBody,
  },
  labelOn: { fontFamily: font.appSemi, color: '#222222' },
  labelAdd: { color: ink.accent },
});
