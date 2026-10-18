import { router, type Href } from 'expo-router';
import { ArrowRight, ChevronLeft, SquarePen } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PaymentMethods from '../../components/PaymentMethods';
import StepIndicator3 from '../../components/StepIndicator3';
import { shrinkToFit } from '../../constants/textFit';
import { colors, font, ink, psPayment as t, psReview as r } from '../../constants/theme';
import { usePropertySearch } from '../../context/propertySearch';
import { rupees } from '../../data/legalNotice';
import {
  PROPERTY_REVIEW_SAMPLE as sample,
  PS_REQUEST_ID,
  PS_SERVICE,
  propertyTypeLabel,
  psInvoiceTotal,
} from '../../data/propertySearch';

// Complete Payment (design/77), step 3 of the three-step indicator.
//
// PRICING — design/77 prints ₹1,377 and that figure is NOT reproduced. The total is
// computed from the tier chosen on design/72 using the Legal Notice method (fee +
// 18% GST rounded + ₹199 platform fee): ₹788 for Ordinary, ₹1,378 for Urgent.
// design/77's figure happens to be the Urgent total, but the landing screen it
// follows pre-selects Ordinary — so the two screens disagree about which tier is
// being paid for. See the header note in data/propertySearch.ts.
//
// The method list is components/PaymentMethods, shared with the Legal Notice payment
// screen. Pay routes into the Legal Notice scan-pay and success screens, which now
// take this service's name, amount and reference as params.

const BAR_HEIGHT = t.barPadTop + 20 + 12 + t.payHeight + t.barPadBottom;

export default function PropertySearchPaymentScreen() {
  const insets = useSafeAreaInsets();
  const { form } = usePropertySearch();
  const total = psInvoiceTotal(form.tier);

  const rows = [
    {
      label: 'Property Location',
      value:
        [form.jurisdiction.colony, form.jurisdiction.district].filter(Boolean).join(', ') ||
        sample.locationLine1,
    },
    {
      label: 'Property Type',
      value: propertyTypeLabel(form.propertyType) || sample.propertyType,
    },
    { label: 'Estimated Delivery', value: sample.delivery },
    { label: 'Request ID', value: PS_REQUEST_ID },
  ];

  const payHref = (() => {
    const q = new URLSearchParams({
      service: PS_SERVICE,
      amount: String(total),
      ref: PS_REQUEST_ID,
      next: '/property-search/track',
    });
    return `/legal-notice/scan-pay?${q}` as Href;
  })();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + r.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/property-search/review')
          }
        >
          <ChevronLeft size={r.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Complete Payment
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: BAR_HEIGHT + insets.bottom + t.summaryGap },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator3 step={3} />

        <View style={styles.summary}>
          <View style={styles.summaryHead}>
            <Text style={styles.summaryTitle} {...shrinkToFit(0.8)}>
              Service Summary
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace('/property-search/review')}
              style={({ pressed }) => [styles.edit, pressed && styles.pressed]}
            >
              <SquarePen size={r.editIcon} color={ink.accent} />
              <Text style={styles.editLabel} {...shrinkToFit(0.8)}>
                Edit
              </Text>
            </Pressable>
          </View>

          <Text style={styles.service}>{PS_SERVICE}</Text>

          {rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.rowLabel} {...shrinkToFit(0.8)}>
                {row.label}
              </Text>
              <Text style={styles.rowValue} {...shrinkToFit(0.7)}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.methodHead}>
          <Text style={styles.methodLabel} {...shrinkToFit(0.8)}>
            SELECT PAYMENT METHOD
          </Text>
          <Text style={styles.methodNote} {...shrinkToFit(0.8)}>
            Fast &amp; Secure
          </Text>
        </View>

        <PaymentMethods />
      </ScrollView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + t.barPadBottom }]}>
        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel} {...shrinkToFit(0.8)}>
            Amount to pay
          </Text>
          <Text style={styles.amountValue} {...shrinkToFit(0.8)}>
            {rupees(total)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(payHref)}
          style={({ pressed }) => [styles.pay, pressed && styles.pressed]}
        >
          <Text style={styles.payLabel}>Pay</Text>
          <ArrowRight size={t.payIcon} color={ink.onBrand} style={styles.payIcon} />
        </Pressable>
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
    minHeight: r.headerHeight,
    paddingHorizontal: r.padX,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: r.titleSize,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: r.backIcon,
  },
  content: {
    paddingHorizontal: r.padX,
  },
  summary: {
    marginTop: t.summaryGap,
    borderRadius: t.summaryRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: t.summaryPad,
  },
  summaryHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTitle: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.summaryTitleSize,
    color: colors.textPrimary,
  },
  edit: {
    marginLeft: 10,
    minHeight: r.editHeight,
    borderRadius: r.editRadius,
    paddingHorizontal: r.editPadX,
    borderWidth: 1,
    borderColor: r.editBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editLabel: {
    marginLeft: r.editIconGap,
    fontFamily: font.appSemi,
    fontSize: r.editSize,
    color: ink.accent,
  },
  service: {
    marginTop: t.rowGap,
    fontFamily: font.appHeading,
    fontSize: t.summaryTitleSize,
    color: colors.textPrimary,
  },
  row: {
    marginTop: t.rowGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.rowLabelSize,
    color: colors.textBody,
  },
  rowValue: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    textAlign: 'right',
    fontFamily: font.appSemi,
    fontSize: t.rowValueSize,
    color: colors.textPrimary,
  },
  methodHead: {
    marginTop: t.methodGap,
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodLabel: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.methodLabelSize,
    letterSpacing: t.methodLabelSpacing,
    color: colors.textBody,
  },
  methodNote: {
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.methodNoteSize,
    color: ink.accent,
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: r.padX,
    paddingTop: t.barPadTop,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountBlock: {
    flex: 1,
    minWidth: 0,
  },
  amountLabel: {
    fontFamily: font.appBody,
    fontSize: t.barLabelSize,
    color: colors.textBody,
  },
  amountValue: {
    marginTop: t.barAmountGap,
    fontFamily: font.appHeading,
    fontSize: t.barAmountSize,
    color: colors.textPrimary,
  },
  pay: {
    marginLeft: 14,
    minHeight: t.payHeight,
    borderRadius: t.payRadius,
    paddingHorizontal: t.payPadX,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  payLabel: {
    fontFamily: font.appSemi,
    fontSize: t.paySize,
    color: ink.onBrand,
  },
  payIcon: {
    marginLeft: t.payIconGap,
  },
});
