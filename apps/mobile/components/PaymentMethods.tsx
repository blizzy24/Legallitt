import { CreditCard, Landmark, QrCode, Smartphone } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, font, ink, payment as p } from '../constants/theme';

export type PaymentMethod = 'upi' | 'cards' | 'netbanking';
export type UpiMode = 'app' | 'qr';
export type PaymentSelection = { method: PaymentMethod; upiMode: UpiMode };
export const DEFAULT_PAYMENT_SELECTION: PaymentSelection = { method: 'upi', upiMode: 'qr' };

// The payment method list: UPI (with its two sub-options), Cards and Net Banking.
//
// Extracted from app/legal-notice/step6.tsx when design/77 drew the same list for
// Property Search. It generalised cleanly because nothing in it is service-specific
// — no amount, no reference, no copy that names a service. The INVOICE card above it
// on design/28 did NOT generalise and stays in step6: design/77 draws a "Service
// Summary" card in its place with different rows entirely.
//
// Every file draws UPI with "Scan QR Code" pre-selected. Callers that don't act on
// the choice render it bare and the selection stays internal; a caller that does
// (FIR F3: Scan QR goes to Scan & Pay, the others pay in place) passes `value` and
// `onChange`. `disabled` freezes the list while a payment is processing.
export default function PaymentMethods({
  value,
  onChange,
  disabled = false,
}: {
  value?: PaymentSelection;
  onChange?: (next: PaymentSelection) => void;
  disabled?: boolean;
} = {}) {
  const [internal, setInternal] = useState<PaymentSelection>(DEFAULT_PAYMENT_SELECTION);
  const current = value ?? internal;
  const { method, upiMode } = current;
  const select = (next: PaymentSelection) => {
    if (disabled) return;
    if (!value) setInternal(next);
    onChange?.(next);
  };
  const setMethod = (m: PaymentMethod) => select({ method: m, upiMode });
  const setUpiMode = (mode: UpiMode) => select({ method: 'upi', upiMode: mode });

  return (
    <View style={disabled && styles.disabled} pointerEvents={disabled ? 'none' : 'auto'}>
      <View style={[styles.group, method === 'upi' && styles.groupSelected]}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: method === 'upi' }}
          onPress={() => setMethod('upi')}
          style={styles.groupHead}
        >
          <View style={styles.optionTile}>
            <Text style={styles.upiMark}>UPI</Text>
          </View>
          <View style={styles.optionText}>
            <View style={styles.optionTitleRow}>
              <Text style={styles.optionTitle}>UPI</Text>
              <View style={styles.recChip}>
                <Text style={styles.recChipText}>Recommended</Text>
              </View>
            </View>
            <Text style={styles.optionSub}>Pay using any UPI app</Text>
          </View>
          <Radio checked={method === 'upi'} />
        </Pressable>
        <View style={styles.groupDivider} />
        <View style={styles.subList}>
          <SubOption
            icon={<Smartphone size={p.subTileIcon} color={colors.textBody} />}
            title="Pay via UPI App"
            subtitle="Google Pay, PhonePe, Paytm & other UPI apps"
            selected={method === 'upi' && upiMode === 'app'}
            onPress={() => setUpiMode('app')}
          />
          <SubOption
            icon={<QrCode size={p.subTileIcon} color={colors.textBody} />}
            title="Scan QR Code"
            subtitle="Scan the QR using any UPI-enabled app"
            selected={method === 'upi' && upiMode === 'qr'}
            onPress={() => setUpiMode('qr')}
          />
        </View>
      </View>

      <Option
        icon={<CreditCard size={p.optionTileIcon} color={colors.textBody} />}
        title="Cards"
        subtitle="Visa, MasterCard, RuPay"
        selected={method === 'cards'}
        onPress={() => setMethod('cards')}
      />
      <Option
        icon={<Landmark size={p.optionTileIcon} color={colors.textBody} />}
        title="Net Banking"
        subtitle="All major banks supported"
        selected={method === 'netbanking'}
        onPress={() => setMethod('netbanking')}
      />
    </View>
  );
}

function Radio({ checked, size = p.radio }: { checked: boolean; size?: number }) {
  return (
    <View
      style={[
        styles.radio,
        { width: size, height: size, borderRadius: size / 2 },
        checked && styles.radioChecked,
      ]}
    >
      {checked && <View style={styles.radioDot} />}
    </View>
  );
}

type OptionProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
};

function Option({ icon, title, subtitle, selected, onPress }: OptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <View style={styles.optionTile}>{icon}</View>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSub}>{subtitle}</Text>
      </View>
      <Radio checked={selected} />
    </Pressable>
  );
}

function SubOption({ icon, title, subtitle, selected, onPress }: OptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[styles.sub, selected && styles.subSelected]}
    >
      <View style={styles.subTile}>{icon}</View>
      <View style={styles.optionText}>
        <View style={styles.optionTitleRow}>
          <Text style={styles.subTitle}>{title}</Text>
          {selected && (
            <View style={styles.selChip}>
              <Text style={styles.selChipText}>Selected</Text>
            </View>
          )}
        </View>
        <Text style={styles.subSub} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
          {subtitle}
        </Text>
      </View>
      <Radio checked={selected} size={p.subRadio} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.6,
  },
  group: {
    marginTop: p.groupGap,
    borderRadius: p.groupRadius,
    borderWidth: p.groupBorder,
    borderColor: colors.border,
    backgroundColor: p.groupBg,
    overflow: 'hidden',
  },
  groupSelected: {
    borderColor: p.selectedBorder,
  },
  groupHead: {
    height: p.optionHeight,
    paddingHorizontal: p.optionPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  subList: {
    padding: p.groupPad,
    gap: p.subGap,
  },
  option: {
    marginTop: p.optionGap,
    height: p.optionHeight,
    borderRadius: p.optionRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: p.optionPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionSelected: {
    borderColor: p.selectedBorder,
  },
  optionTile: {
    width: p.optionTile,
    height: p.optionTile,
    borderRadius: p.optionTileRadius,
    backgroundColor: p.tileBg,
    borderWidth: 1,
    borderColor: p.tileBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: p.optionTextGap,
  },
  upiMark: {
    fontFamily: font.appHeading,
    fontSize: p.upiMarkSize,
    color: ink.accent,
  },
  optionText: {
    flex: 1,
    minWidth: 0,
  },
  optionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTitle: {
    fontFamily: font.appHeading,
    fontSize: p.optionTitleSize,
    color: colors.textPrimary,
  },
  optionSub: {
    marginTop: p.optionLineGap,
    fontFamily: font.appBody,
    fontSize: p.optionSubSize,
    color: p.rowLabel,
  },
  recChip: {
    marginLeft: p.recChipGap,
    height: p.recChipH,
    borderRadius: 6,
    paddingHorizontal: p.recChipPadX,
    backgroundColor: p.recChipBg,
    justifyContent: 'center',
  },
  recChipText: {
    fontFamily: font.appSemi,
    fontSize: p.recChipSize,
    color: ink.accent,
  },
  sub: {
    height: p.subHeight,
    borderRadius: p.subRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: p.subPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subSelected: {
    borderWidth: p.groupBorder,
    borderColor: p.selectedBorder,
    backgroundColor: p.selectedBg,
    paddingHorizontal: p.subPadX - (p.groupBorder - 1),
  },
  subTile: {
    width: p.subTile,
    height: p.subTile,
    borderRadius: p.subTileRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: p.tileBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: p.subTextGap,
  },
  subTitle: {
    fontFamily: font.appHeading,
    fontSize: p.subTitleSize,
    color: colors.textPrimary,
  },
  subSub: {
    marginTop: p.optionLineGap - 1,
    fontFamily: font.appBody,
    fontSize: p.subSubSize,
    color: p.rowLabel,
  },
  selChip: {
    marginLeft: p.recChipGap,
    height: p.selChipH,
    borderRadius: 4,
    paddingHorizontal: p.selChipPadX,
    backgroundColor: colors.brand,
    justifyContent: 'center',
  },
  selChipText: {
    fontFamily: font.appSemi,
    fontSize: p.selChipSize,
    color: ink.onBrand,
  },
  radio: {
    borderWidth: p.radioRing,
    borderColor: p.radioIdle,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioChecked: {
    borderColor: p.selectedBorder,
  },
  radioDot: {
    width: p.radioDot,
    height: p.radioDot,
    borderRadius: p.radioDot / 2,
    backgroundColor: p.selectedBorder,
  },
});
