import type { NoticeIntakeModel } from "../../features/legal-notice/screen-model";
import { useIntakeModel } from "../../features/legal-notice/useIntakeModel";
import { router } from 'expo-router';
import { Ellipsis, FilePenLine, House, IndianRupee, ShoppingCart, Users, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import ChatBubble from '../../components/ChatBubble';
import WizardShell from '../../components/WizardShell';
import { colors, font, ink, quickActions as q, wizardBubble as b, wizardCardShadow } from '../../constants/theme';
import { useLegalNotice, type IssueType } from '../../context/legalNotice';

type Action = { id: IssueType; label: string; icon: LucideIcon; filled?: boolean };

// design/26 lays these out as a fixed two-column grid, left-aligned, with each pill
// sized to its own content. Rows are explicit rather than wrapped: wrapping re-pairs
// the pills as soon as the text measures wider (as it does on Android).
// Tenant Issue is the one solid house in the file.
const ROWS: Action[][] = [
  [
    { id: 'property-dispute', label: 'Property Dispute', icon: House },
    { id: 'money-recovery', label: 'Money Recovery', icon: IndianRupee },
  ],
  [
    { id: 'tenant-issue', label: 'Tenant Issue', icon: House, filled: true },
    { id: 'family-dispute', label: 'Family Dispute', icon: Users },
  ],
  [
    { id: 'cheque-bounce', label: 'Cheque Bounce', icon: FilePenLine },
    { id: 'consumer-complaint', label: 'Consumer Complaint', icon: ShoppingCart },
  ],
  [{ id: 'other', label: 'Any other', icon: Ellipsis }],
];

// Step 3 — issue type (design/26). The file shows a timestamp with no bubble above the
// heading; drawn as is. No selected state is designed: brand border + brand chip here.
export function Step3ScreenView({ model }: { model: NoticeIntakeModel }) {
  const { form, update } = model;
  // The two-column pairing is fixed, so on narrow screens the pills have to give up
  // a little size rather than re-wrap or ellipsize. 390 and wider are untouched.
  const { width } = useWindowDimensions();
  const k = width < q.compactBelow ? q.compactScale : 1;

  return (
    <WizardShell step={3} buttonLabel="Continue" onContinue={model.continue}>
      <ChatBubble time="10:30 AM" />
      <Text style={styles.title}>Quick Actions</Text>
      <View style={styles.pills}>
        {ROWS.map((row) => (
          <View key={row[0].id} style={styles.pillRow}>
            {row.map((a) => {
              const selected = form.issueType === a.id;
              const Icon = a.icon;
              return (
                <Pressable
                  key={a.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => update({ issueType: a.id })}
                  style={[
                    styles.pill,
                    {
                      paddingLeft: q.padLeft * k - q.selectedBorder,
                      paddingRight: q.padRight * k - q.selectedBorder,
                    },
                    selected && styles.pillSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.chip,
                      { width: q.chip * k, height: q.chip * k, borderRadius: (q.chip * k) / 2, marginRight: q.chipGap * k },
                      selected && styles.chipSelected,
                    ]}
                  >
                    <Icon
                      size={q.chipIcon * k}
                      color={selected ? ink.onBrand : b.text}
                      fill={a.filled ? (selected ? ink.onBrand : b.text) : 'none'}
                    />
                  </View>
                  <Text style={[styles.label, { fontSize: q.textSize * k }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                    {a.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </WizardShell>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: q.titleGap,
    fontFamily: font.appSemi,
    fontSize: q.titleSize,
    color: b.text,
  },
  pills: {
    marginTop: q.pillsGap,
    gap: q.rowGap,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: q.colGap,
  },
  pill: {
    // Content-sized, but able to give ground rather than overflow the row.
    flexShrink: 1,
    minWidth: 0,
    height: q.pillHeight,
    borderRadius: q.pillHeight / 2,
    backgroundColor: colors.card,
    borderWidth: q.selectedBorder,
    borderColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    ...wizardCardShadow,
  },
  pillSelected: {
    borderColor: colors.brand,
  },
  chip: {
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: colors.brand,
  },
  label: {
    fontFamily: font.appSemi,
    color: b.text,
  },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function Step3Screen() {
  const { model } = useIntakeModel("step3");
  return <Step3ScreenView model={model} />;
}
