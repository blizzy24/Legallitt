import { router } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  Factory,
  Folder,
  Grid2x2,
  Hash,
  House,
  Mail,
  MapPin,
  Phone,
  SlidersHorizontal,
  Store,
  Tractor,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StepIndicator3 from '../../components/StepIndicator3';
import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, psRequest as t } from '../../constants/theme';
import { usePropertySearch } from '../../context/propertySearch';
import {
  JURISDICTION_PLACEHOLDERS as ph,
  PROPERTY_TYPES,
  SEARCH_DURATIONS,
  SURVEY_PLACEHOLDER,
  propertyTypeLabel,
  type PropertyTypeId,
  type SearchDuration,
} from '../../data/propertySearch';

// Request Property Search Report (design/74, with the picker from design/75).
//
// REPORTED — NINTH HEADER STYLE. Back arrow, an all-caps title and a sliders button:
// no other screen in the app draws this. Built as its own header rather than bent
// into one of the existing eight.
//
// REPORTED — THIRD STEPPER STYLE, in components/StepIndicator3.tsx. Numbered circles
// with labels beneath, joined by a rule. WizardShell draws six circles with no
// labels; FirShell draws a percentage bar. Nothing is shared.
//
// REPORTED — design/74 shows "Madhya Pradesh" as the value in EVERY jurisdiction
// dropdown, including Ward Number and Colony where it cannot be one, and "...." in
// Tehsil / Village. Those are treated as placeholder text: each picker renders
// unselected with its own placeholder. See data/propertySearch.ts.
//
// The pickers other than Property Type are inert — design/74 draws only their closed
// state and no list for them.

const TYPE_ICONS: Record<PropertyTypeId, LucideIcon> = {
  residential: House,
  commercial: Store,
  agricultural: Tractor,
  plot: Grid2x2,
  industrial: Factory,
  apartment: Building2,
  other: Folder,
};

export default function PropertySearchRequestScreen() {
  const insets = useSafeAreaInsets();
  const { form, update, updateContact, updateJurisdiction } = usePropertySearch();
  const [picking, setPicking] = useState(false);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/property-search'))}
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          PROPERTY SEARCH REPORT
        </Text>
        {/* Sliders opens nothing — no filter panel is designed. */}
        <Pressable accessibilityRole="button" accessibilityLabel="Options" hitSlop={10}>
          <SlidersHorizontal size={t.slidersIcon} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.buttonGap }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator3 step={1} />

        <Text style={styles.heading}>Request Property Search Report</Text>
        <Text style={styles.subtitle}>
          Enter essential details to initiate a comprehensive title check and encumbrance search.
        </Text>

        <IconField
          icon={UserRound}
          label="Full Name"
          placeholder="Enter Your Full Name"
          value={form.contact.fullName}
          onChangeText={(v) => updateContact({ fullName: v })}
        />
        <IconField
          icon={Phone}
          label="Mobile Number"
          placeholder="Enter Your Mobile Number"
          keyboardType="phone-pad"
          value={form.contact.mobile}
          onChangeText={(v) => updateContact({ mobile: v })}
        />
        <IconField
          icon={Mail}
          label="Email Address"
          placeholder="Enter Your Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.contact.email}
          onChangeText={(v) => updateContact({ email: v })}
        />

        <View style={styles.groupHead}>
          <MapPin size={t.groupIcon} color={ink.accent} />
          <Text style={styles.groupTitle} {...shrinkToFit(0.8)}>
            Jurisdiction &amp; Location
          </Text>
        </View>

        <View style={styles.row}>
          <Select label="State" placeholder={ph.state} value={form.jurisdiction.state} style={styles.col} />
          <Select label="District" placeholder={ph.district} value={form.jurisdiction.district} style={styles.col} />
        </View>
        <View style={[styles.row, styles.rowSpaced]}>
          <Select label="Ward Number" placeholder={ph.ward} value={form.jurisdiction.ward} style={styles.col} />
          <Select label="Tehsil / Village" placeholder={ph.tehsil} value={form.jurisdiction.tehsil} style={styles.col} />
        </View>
        <Select
          label="Colony"
          placeholder={ph.colony}
          value={form.jurisdiction.colony}
          style={styles.stacked}
        />

        <Text style={[styles.fieldLabel, styles.groupLabel]} {...shrinkToFit(0.8)}>
          Property Type <Text style={styles.star}>*</Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: picking }}
          onPress={() => setPicking(true)}
          style={[styles.picker, picking && styles.pickerOpen]}
        >
          {form.propertyType ? (
            <View style={styles.pickerIcon}>
              {(() => {
                const Icon = TYPE_ICONS[form.propertyType];
                return <Icon size={t.fieldIconGlyph} color={ink.accent} />;
              })()}
            </View>
          ) : (
            <View style={styles.pickerIcon}>
              <House size={t.fieldIconGlyph} color={colors.textMuted} />
            </View>
          )}
          <Text
            style={[styles.pickerValue, !form.propertyType && styles.placeholder]}
            {...shrinkToFit(0.8)}
          >
            {form.propertyType ? propertyTypeLabel(form.propertyType) : ph.propertyType}
          </Text>
          {picking ? (
            <ChevronUp size={t.fieldChevron} color={colors.textPrimary} />
          ) : (
            <ChevronDown size={t.fieldChevron} color={colors.textPrimary} />
          )}
        </Pressable>
        <Text style={styles.helper}>
          Specify property categorization for applicable registrar jurisdiction.
        </Text>

        <Text style={[styles.fieldLabel, styles.groupLabel]} {...shrinkToFit(0.8)}>
          Survey No. / Plot No. / Khata No.
        </Text>
        <View style={styles.surveyField}>
          <Hash size={t.fieldIconGlyph} color={colors.textMuted} />
          <TextInput
            placeholder={SURVEY_PLACEHOLDER}
            placeholderTextColor={colors.textMuted}
            value={form.surveyNo}
            onChangeText={(v) => update({ surveyNo: v })}
            style={styles.surveyInput}
          />
        </View>
        <Text style={styles.helper}>Accurate numbers avoid sub-registrar title ambiguities.</Text>

        <View style={styles.durationHead}>
          <Text style={styles.groupTitle} {...shrinkToFit(0.8)}>
            Search Duration
          </Text>
          <Text style={styles.recommended} {...shrinkToFit(0.8)}>
            Recommended: 30 Yrs
          </Text>
        </View>
        <View style={styles.segs}>
          {SEARCH_DURATIONS.map((d) => {
            const on = form.duration === d.id;
            return (
              <Pressable
                key={d.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => update({ duration: d.id as SearchDuration })}
                style={[styles.seg, on && styles.segOn]}
              >
                <Text style={[styles.segLabel, on && styles.segLabelOn]} {...shrinkToFit(0.75)}>
                  {d.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/property-search/review')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Continue</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>
      </ScrollView>

      {/* design/75 — the property type list, floating over the screen. */}
      <Modal visible={picking} transparent animationType="fade" onRequestClose={() => setPicking(false)}>
        <Pressable style={styles.scrim} accessibilityLabel="Dismiss" onPress={() => setPicking(false)}>
          <Pressable style={styles.panel} onPress={() => {}}>
            {PROPERTY_TYPES.map((p, i) => {
              const Icon = TYPE_ICONS[p.id];
              const on = form.propertyType === p.id;
              return (
                <View key={p.id}>
                  {i > 0 && <View style={styles.pickerDivider} />}
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => {
                      update({ propertyType: p.id });
                      setPicking(false);
                    }}
                    style={({ pressed }) => [styles.pickerRow, pressed && styles.pressed]}
                  >
                    <Icon size={t.pickerIcon} color={colors.textPrimary} />
                    <Text style={styles.pickerRowText} {...shrinkToFit(0.8)}>
                      {p.label}
                    </Text>
                    {on && <Check size={t.pickerTick} color={colors.textPrimary} strokeWidth={2.5} />}
                  </Pressable>
                </View>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// The screen's SIXTH field style: a flat bordered box with a leading icon chip, the
// label above the value. Local to this screen for now — designs 76 and 77 reuse the
// stepper but not this field.
function IconField({
  icon: Icon,
  label,
  ...inputProps
}: { icon: LucideIcon; label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldIcon}>
        <Icon size={t.fieldIconGlyph} color={ink.accent} />
      </View>
      <View style={styles.fieldText}>
        <Text style={styles.fieldLabel} {...shrinkToFit(0.8)}>
          {label}
        </Text>
        <TextInput placeholderTextColor={colors.textMuted} style={styles.fieldInput} {...inputProps} />
      </View>
    </View>
  );
}

function Select({
  label,
  placeholder,
  value,
  style,
}: {
  label: string;
  placeholder: string;
  value: string;
  style?: object;
}) {
  return (
    <View style={style}>
      <Text style={styles.selectLabel} {...shrinkToFit(0.8)}>
        {label}
      </Text>
      {/* Inert: design/74 draws only the closed state for these. */}
      <View style={styles.select}>
        <Text
          style={[styles.selectValue, !value && styles.placeholder]}
          {...shrinkToFit(0.7)}
        >
          {value || placeholder}
        </Text>
        <ChevronDown size={t.fieldChevron} color={colors.textPrimary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    minHeight: t.headerHeight,
    paddingHorizontal: t.padX,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: 12,
    fontFamily: font.appSemi,
    fontSize: t.titleSize,
    letterSpacing: t.titleSpacing,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: t.padX,
  },
  heading: {
    marginTop: t.headingGap,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    lineHeight: t.headingLineHeight,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: t.subtitleGap,
    fontFamily: font.appBody,
    fontSize: t.subtitleSize,
    lineHeight: t.subtitleLineHeight,
    color: colors.textBody,
  },
  field: {
    marginTop: t.fieldGap,
    borderRadius: t.fieldRadius,
    backgroundColor: t.fieldBg,
    borderWidth: 1,
    borderColor: t.fieldBorder,
    paddingHorizontal: t.fieldPadX,
    paddingVertical: t.fieldPadY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldIcon: {
    width: t.fieldIcon,
    height: t.fieldIcon,
    borderRadius: t.fieldIconRadius,
    backgroundColor: t.fieldIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.fieldIconGap,
  },
  fieldLabel: {
    fontFamily: font.appBody,
    fontSize: t.fieldLabelSize,
    color: colors.textBody,
  },
  star: {
    color: '#C0392B',
  },
  fieldInput: {
    marginTop: t.fieldValueGap,
    padding: 0,
    fontFamily: font.appBody,
    fontSize: t.fieldValueSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  groupHead: {
    marginTop: t.groupGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupTitle: {
    marginLeft: t.groupIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.groupTitleSize,
    color: colors.textPrimary,
  },
  groupLabel: {
    marginTop: t.groupGap,
    marginBottom: 6,
  },
  row: {
    marginTop: t.groupFieldGap,
    flexDirection: 'row',
    gap: t.colGap,
  },
  rowSpaced: {
    marginTop: t.groupFieldGap,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  stacked: {
    marginTop: t.groupFieldGap,
    width: '50%',
    paddingRight: t.colGap / 2,
  },
  selectLabel: {
    marginBottom: 6,
    fontFamily: font.appBody,
    fontSize: t.fieldLabelSize + 1,
    color: colors.textBody,
  },
  select: {
    minHeight: 46,
    borderRadius: t.fieldRadius,
    backgroundColor: '#F7F2F1',
    paddingHorizontal: t.fieldPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectValue: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
    fontFamily: font.appBody,
    fontSize: t.fieldValueSize,
    color: colors.textPrimary,
  },
  placeholder: {
    color: colors.textMuted,
  },
  picker: {
    minHeight: 50,
    borderRadius: t.fieldRadius,
    backgroundColor: t.fieldBg,
    borderWidth: 1,
    borderColor: t.fieldBorder,
    paddingHorizontal: t.fieldPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerOpen: {
    borderColor: colors.brand,
  },
  pickerIcon: {
    width: t.fieldIcon,
    height: t.fieldIcon,
    borderRadius: t.fieldIconRadius,
    backgroundColor: t.fieldIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerValue: {
    flex: 1,
    minWidth: 0,
    marginHorizontal: t.fieldIconGap,
    fontFamily: font.appSemi,
    fontSize: t.fieldValueSize,
    color: colors.textPrimary,
  },
  helper: {
    marginTop: t.helperGap,
    fontFamily: font.appBody,
    fontSize: t.helperSize,
    lineHeight: t.helperLineHeight,
    color: colors.textBody,
  },
  surveyField: {
    minHeight: 50,
    borderRadius: t.fieldRadius,
    backgroundColor: '#F7F2F1',
    paddingHorizontal: t.fieldPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  surveyInput: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.fieldIconGap,
    padding: 0,
    fontFamily: font.appBody,
    fontSize: t.fieldValueSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  durationHead: {
    marginTop: t.groupGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recommended: {
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.durationChipSize + 1,
    color: colors.textBody,
  },
  segs: {
    marginTop: t.segGap,
    flexDirection: 'row',
    gap: t.segColGap,
  },
  seg: {
    flex: 1,
    minWidth: 0,
    minHeight: t.segHeight,
    borderRadius: t.segRadius,
    backgroundColor: '#F7F2F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segOn: {
    backgroundColor: '#EFD9B8',
  },
  segLabel: {
    fontFamily: font.appBody,
    fontSize: t.segSize,
    color: colors.textPrimary,
  },
  segLabelOn: {
    fontFamily: font.appSemi,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
  buttonIcon: {
    marginLeft: t.buttonIconGap,
  },
  scrim: {
    flex: 1,
    backgroundColor: t.pickerScrim,
    justifyContent: 'center',
    paddingHorizontal: t.padX + 8,
  },
  panel: {
    borderRadius: t.pickerRadius,
    backgroundColor: colors.card,
    paddingVertical: t.pickerPadY,
    overflow: 'hidden',
  },
  pickerDivider: {
    height: 1,
    marginHorizontal: t.pickerRowPadX,
    backgroundColor: t.pickerDivider,
  },
  pickerRow: {
    minHeight: t.pickerRowHeight,
    paddingHorizontal: t.pickerRowPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerRowText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.pickerIconGap,
    fontFamily: font.appBody,
    fontSize: t.pickerSize,
    color: colors.textPrimary,
  },
});
