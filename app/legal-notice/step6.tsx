import { router } from 'expo-router';
import { ArrowRight, CreditCard, FileText, Landmark, QrCode, Smartphone } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import WizardShell from '../../components/WizardShell';
import { buttonShadow, colors, font, ink, payment as p, wizard as w } from '../../constants/theme';
import { INVOICE, invoiceTotal, rupees } from '../../data/legalNotice';

type Method = 'upi' | 'cards' | 'netbanking';
type UpiMode = 'app' | 'qr';

const BAR_HEIGHT = p.barPadTop + 20 + p.barButtonGap + 52 + p.captionGap + 16 + p.barPadBottom;

// Step 6 — Complete Payment (design/28). The file's header reads "Step 3 of 3 ·
// Final Step" against a "Step 6 of 6" stepper; both say 6 of 6 here. The UPI parent
// and its "Scan QR Code" child are both selected in the file: modelled as method +
// sub-option.
export default function Step6Screen() {
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState<Method>('upi');
  const [upiMode, setUpiMode] = useState<UpiMode>('qr');
  const total = invoiceTotal();

  return (
    <View style={styles.screen}>
      <WizardShell
        step={6}
        header="leading"
        title="Complete Payment"
        subtitle="Step 6 of 6"
        align="top"
        background="tinted"
        hideButton
        bottomInset={BAR_HEIGHT + insets.bottom + w.contentGap}
        buttonLabel=""
        onContinue={() => {}}
      >
        <View style={styles.invoice}>
          <View style={styles.chip}>
            <FileText size={p.chipIcon} color={ink.accent} />
          </View>
          <View style={styles.tile}>
            <FileText size={p.tileIcon} color={ink.accent} />
          </View>
          <Text style={styles.invoiceTitle}>{INVOICE.service}</Text>
          <Text style={styles.ref}>
            Ref ID: <Text style={styles.mono}>#{INVOICE.refId}</Text> ·
          </Text>
          <View style={styles.divider} />
          <View style={styles.rows}>
            {INVOICE.lines.map((l) => (
              <View key={l.label} style={styles.row}>
                <Text style={styles.rowLabel}>{l.label}</Text>
                <Text style={styles.rowValue}>{rupees(l.amount)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>{rupees(total)}</Text>
          </View>
          <Text style={styles.note}>Inclusive of all legal taxes</Text>
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>SELECT PAYMENT METHOD</Text>
          <Text style={styles.sectionLink}>Fast &amp; Secure</Text>
        </View>

        <View style={[styles.group, method === 'upi' && styles.groupSelected]}>
          <Pressable accessibilityRole="radio" accessibilityState={{ checked: method === 'upi' }} onPress={() => setMethod('upi')} style={styles.groupHead}>
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
              onPress={() => { setMethod('upi'); setUpiMode('app'); }}
            />
            <SubOption
              icon={<QrCode size={p.subTileIcon} color={colors.textBody} />}
              title="Scan QR Code"
              subtitle="Scan the QR using any UPI-enabled app"
              selected={method === 'upi' && upiMode === 'qr'}
              onPress={() => { setMethod('upi'); setUpiMode('qr'); }}
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
      </WizardShell>

      <View style={[styles.bar, { paddingBottom: insets.bottom + p.barPadBottom }]}>
        <View style={styles.amountRow}>
          <Text style={styles.amountLabel}>Amount to pay</Text>
          <Text style={styles.amountValue}>{rupees(total)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/legal-notice/scan-pay')}
          style={({ pressed }) => [styles.pay, pressed && styles.pressed]}
        >
          <Text style={styles.payLabel}>Pay</Text>
          <ArrowRight size={p.buttonIcon} color={ink.onBrand} />
        </Pressable>
        <Text style={styles.caption}>Opens dynamic QR payment screen for instant verification</Text>
      </View>
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

type OptionProps = { icon: ReactNode; title: string; subtitle: string; selected: boolean; onPress: () => void };

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
        <Text style={styles.subSub} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Radio checked={selected} size={p.subRadio} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  invoice: {
    borderRadius: p.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: p.cardPad,
    paddingBottom: p.cardPadBottom,
  },
  chip: {
    width: p.chipW,
    height: p.chipH,
    borderRadius: p.chipRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tile: {
    position: 'absolute',
    top: p.cardPad - 2,
    right: p.cardPad - 1,
    width: p.tile,
    height: p.tile,
    borderRadius: p.tileRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceTitle: {
    marginTop: p.titleGap,
    fontFamily: font.appHeading,
    fontSize: p.titleSize,
    color: p.invoiceText,
  },
  ref: {
    marginTop: p.refGap,
    fontFamily: font.appBody,
    fontSize: p.refSize,
    color: colors.textBody,
  },
  mono: {
    fontFamily: font.mono,
  },
  divider: {
    marginTop: p.dividerGap,
    height: 1,
    backgroundColor: colors.border,
  },
  rows: {
    marginTop: p.rowsGap,
  },
  row: {
    height: p.rowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontFamily: font.appBody,
    fontSize: p.rowLabelSize,
    color: p.rowLabel,
  },
  rowValue: {
    fontFamily: font.appSemi,
    fontSize: p.rowValueSize,
    color: p.invoiceText,
  },
  totalRow: {
    marginTop: p.totalGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontFamily: font.appHeading,
    fontSize: p.totalLabelSize,
    color: p.invoiceText,
  },
  totalValue: {
    fontFamily: font.appHeading,
    fontSize: p.totalValueSize,
    color: p.invoiceText,
  },
  note: {
    marginTop: p.noteGap,
    textAlign: 'right',
    fontFamily: font.appBody,
    fontSize: p.noteSize,
    color: p.rowLabel,
  },
  sectionRow: {
    marginTop: p.sectionGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: font.appSemi,
    fontSize: p.sectionSize,
    letterSpacing: p.sectionSpacing,
    color: p.sectionText,
  },
  sectionLink: {
    fontFamily: font.appBody,
    fontSize: p.sectionLinkSize,
    color: ink.accent,
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
    fontSize: p.subSubSize,
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
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: p.barTopColor,
    paddingTop: p.barPadTop,
    paddingHorizontal: w.padX,
  },
  amountRow: {
    paddingHorizontal: p.barRowInset,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontFamily: font.appBody,
    fontSize: p.amountLabelSize,
    color: p.rowLabel,
  },
  amountValue: {
    fontFamily: font.appHeading,
    fontSize: p.amountValueSize,
    color: colors.textPrimary,
  },
  pay: {
    marginTop: p.barButtonGap,
    height: 52,
    borderRadius: p.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: p.buttonIconGap,
    ...buttonShadow,
  },
  pressed: {
    opacity: 0.85,
  },
  payLabel: {
    fontFamily: font.appSemi,
    fontSize: p.buttonLabelSize,
    color: ink.onBrand,
  },
  caption: {
    marginTop: p.captionGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: p.captionSize,
    color: p.rowLabel,
  },
});
