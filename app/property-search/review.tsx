import { router } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  House,
  Mail,
  MapPin,
  Phone,
  SquarePen,
  SquareStack,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import StepIndicator3 from '../../components/StepIndicator3';
import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, psReview as t } from '../../constants/theme';
import { usePropertySearch } from '../../context/propertySearch';
import { PROPERTY_REVIEW_SAMPLE as sample, propertyTypeLabel } from '../../data/propertySearch';

// Review Request (design/76), step 2 of the three-step indicator.
//
// Values come from the flow context and fall back to design/76's own samples where
// nothing has been entered.
//
// REPORTED — "Purpose of Report" is drawn here but the request form on design/74
// never collects it, so it always shows the sample. Nothing upstream can set it.

export default function PropertySearchReviewScreen() {
  const insets = useSafeAreaInsets();
  const { form } = usePropertySearch();
  const { contact, jurisdiction } = form;

  const locationLine1 =
    [jurisdiction.colony, jurisdiction.district].filter(Boolean).join(', ') || sample.locationLine1;
  const locationLine2 =
    [jurisdiction.tehsil, jurisdiction.state].filter(Boolean).join(', ') || sample.locationLine2;

  const rows: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: UserRound, label: 'Full Name', value: contact.fullName || sample.fullName },
    { icon: Phone, label: 'Mobile Number', value: contact.mobile || sample.mobile },
    { icon: Mail, label: 'Email Address', value: contact.email || sample.email },
    { icon: House, label: 'Property Location', value: `${locationLine1}\n${locationLine2}` },
    {
      icon: MapPin,
      label: 'Property Type',
      value: propertyTypeLabel(form.propertyType) || sample.propertyType,
    },
    // Never collected upstream — see the note above.
    { icon: SquareStack, label: 'Purpose of Report', value: sample.purpose },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/property-search/request')
          }
        >
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Review Request
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.buttonGap }]}
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator3 step={2} />

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle} {...shrinkToFit(0.8)}>
              Property Details
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/property-search/request')}
              style={({ pressed }) => [styles.edit, pressed && styles.pressed]}
            >
              <SquarePen size={t.editIcon} color={ink.accent} />
              <Text style={styles.editLabel} {...shrinkToFit(0.8)}>
                Edit
              </Text>
            </Pressable>
          </View>

          {rows.map((r) => (
            <View key={r.label} style={styles.row}>
              <r.icon size={t.rowIcon} color={ink.accent} style={styles.rowIcon} />
              <View style={styles.rowText}>
                <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                  {r.label}
                </Text>
                <Text style={styles.rowValue}>{r.value}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.delivery}>
          <Text style={styles.deliveryLabel} {...shrinkToFit(0.8)}>
            {sample.deliveryLabel}
          </Text>
          <Text style={styles.deliveryValue} {...shrinkToFit(0.8)}>
            {sample.delivery}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/property-search/payment')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Proceed to Payment</Text>
          <ChevronRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
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
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: t.backIcon,
  },
  content: {
    paddingHorizontal: t.padX,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.cardPad,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  edit: {
    marginLeft: 10,
    minHeight: t.editHeight,
    borderRadius: t.editRadius,
    paddingHorizontal: t.editPadX,
    borderWidth: 1,
    borderColor: t.editBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editLabel: {
    marginLeft: t.editIconGap,
    fontFamily: font.appSemi,
    fontSize: t.editSize,
    color: ink.accent,
  },
  row: {
    marginTop: t.rowGap,
    flexDirection: 'row',
  },
  rowIcon: {
    marginTop: 2,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.rowIconGap,
  },
  rowLabel: {
    fontFamily: font.appBody,
    fontSize: t.rowLabelSize,
    color: colors.textBody,
  },
  rowValue: {
    marginTop: t.rowValueGap,
    fontFamily: font.appSemi,
    fontSize: t.rowValueSize,
    lineHeight: t.rowValueLineHeight,
    color: colors.textPrimary,
  },
  delivery: {
    marginTop: t.deliveryGap,
    borderRadius: t.deliveryRadius,
    backgroundColor: t.deliveryBg,
    borderWidth: 1,
    borderColor: t.deliveryBorder,
    padding: t.deliveryPad,
  },
  deliveryLabel: {
    fontFamily: font.appBody,
    fontSize: t.deliveryLabelSize,
    color: colors.textBody,
  },
  deliveryValue: {
    marginTop: t.deliveryValueGap,
    fontFamily: font.appHeading,
    fontSize: t.deliveryValueSize,
    color: colors.textPrimary,
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
    position: 'absolute',
    right: t.cardPad,
  },
});
