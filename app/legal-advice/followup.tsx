import { router, type Href } from 'expo-router';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock,
  MessageSquare,
  Phone,
  ScrollText,
  ShieldCheck,
  UserRound,
  Video,
  Wallet,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { LA_ADVOCATE, LA_FOLLOWUP } from '../../data/legalAdvice';
import { colors, font, ink, laFollowup as t } from '../../constants/theme';

// Book a follow-up consultation (design/117-advocate-profile-b.png — the file name
// is wrong; the batch's numbering is shifted by one).
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — THE PLATFORM FEE IS ₹99 HERE AND ₹199 EVERYWHERE ELSE. Legal Notice,
// FIR, Property Search and Document Forensic all charge ₹199. This screen draws ₹99
// and totals ₹1,599. Rendered exactly as drawn and nothing computes it — but if ₹199
// is the platform rule, the drawn total is wrong by ₹100. This is the fifth distinct
// pricing problem in the Legal Advice batch; see app/legal-advice/payment.tsx.
//
// Type, date, time and duration selection all work. The fee figures do not move with
// them: no screen says whether a 60-minute follow-up costs more than a 30-minute
// one, so nothing is derived.
//
// The saved UPI method and "Change" are inert — no payment is taken anywhere.
// ─────────────────────────────────────────────────────────────────────────────

const TYPES = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'voice', label: 'Voice', icon: Phone },
  { id: 'video', label: 'Video', icon: Video },
];

const DAYS = [
  { dow: 'Fri', num: '19', mon: 'Sep' },
  { dow: 'Sat', num: '20', mon: 'Sep' },
  { dow: 'Sun', num: '21', mon: 'Sep' },
  { dow: 'Mon', num: '22', mon: 'Sep' },
  { dow: 'Tue', num: '23', mon: 'Sep' },
  { dow: 'Wed', num: '24', mon: 'Sep' },
  { dow: 'Thu', num: '25', mon: 'Sep' },
];

const SLOTS = [
  { label: '10:00 AM' },
  { label: '10:30 AM' },
  { label: '11:00 AM' },
  { label: '11:30 AM', booked: true },
  { label: '12:00 PM' },
  { label: '12:30 PM', booked: true },
  { label: '04:00 PM' },
  { label: '04:30 PM' },
  { label: '05:00 PM' },
  { label: '05:30 PM' },
  { label: '06:00 PM' },
  { label: '06:30 PM' },
];

export default function LegalAdviceFollowupScreen() {
  const insets = useSafeAreaInsets();
  const [type, setType] = useState('video');
  const [day, setDay] = useState('24');
  const [slot, setSlot] = useState('05:30 PM');
  const [duration, setDuration] = useState(LA_FOLLOWUP.recommended);
  const [confirmed, setConfirmed] = useState(false);

  const typeLabel = TYPES.find((x) => x.id === type)?.label ?? 'Video';

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/legal-advice/completed')
          }
        >
          <ArrowLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title} numberOfLines={1}>
            Book Follow Up Consultation
          </Text>
          <Text style={styles.sub} {...shrinkToFit(0.8)}>
            Choose a time that works for you.
          </Text>
        </View>
        <View style={styles.avatar}>
          <UserRound size={t.avatarGlyph} color={ink.onBrand} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.cardGap }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <View style={styles.advRow}>
            {/* Placeholder for design/117's photograph, sized to its circle. */}
            <View style={styles.photo}>
              <Text style={styles.photoText}>{LA_ADVOCATE.initials}</Text>
            </View>
            <View style={styles.advText}>
              <Text style={styles.advName} {...shrinkToFit(0.75)}>
                {LA_ADVOCATE.name}
              </Text>
              <View style={styles.verified}>
                <BadgeCheck size={t.verifiedIcon} color={t.verifiedColour} />
                <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                  Verified
                </Text>
              </View>
              <Text style={styles.advLine} {...shrinkToFit(0.75)}>
                {LA_ADVOCATE.practice} Expert
              </Text>
              <Text style={styles.advLine} {...shrinkToFit(0.75)}>
                8+ Yrs Exp &nbsp;•&nbsp; Indore, MP
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/advocates/adv-1' as Href)}
              style={styles.profile}
            >
              <Text style={styles.profileText} {...shrinkToFit(0.75)}>
                Profile
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.card, styles.tinted]}>
          <View style={styles.fuRow}>
            <View style={styles.tileIcon}>
              <ScrollText size={t.tileIconGlyph} color={colors.textPrimary} />
            </View>
            <View style={styles.fuText}>
              <View style={styles.fuHead}>
                <Text style={styles.fuTitle} {...shrinkToFit(0.8)}>
                  Follow-up Consultation
                </Text>
                <Text style={styles.fuActive} {...shrinkToFit(0.8)}>
                  Active Matter
                </Text>
              </View>
              <Text style={styles.fuBody}>
                Continuing your previous discussion with the advocate.
              </Text>
              <View style={styles.prev}>
                <Text style={styles.prevLabel} {...shrinkToFit(0.8)}>
                  Previous Topic:
                </Text>
                <Text style={styles.prevValue} {...shrinkToFit(0.75)}>
                  {LA_FOLLOWUP.previousTopic}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <Text style={styles.section} {...shrinkToFit(0.8)}>
              Reason for Follow-up
            </Text>
            <Text style={styles.sectionNoteMuted} {...shrinkToFit(0.8)}>
              Optional
            </Text>
          </View>
          <TextInput
            style={styles.area}
            placeholder="Tell the advocate what you want to discuss next..."
            placeholderTextColor={colors.textMuted}
            multiline
          />
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <Text style={styles.section} {...shrinkToFit(0.8)}>
              Choose Consultation Type
            </Text>
            <Text style={styles.sectionNote} {...shrinkToFit(0.8)}>
              Direct Connect
            </Text>
          </View>
          <View style={styles.chipRow}>
            {TYPES.map((x) => {
              const on = x.id === type;
              return (
                <Pressable
                  key={x.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => setType(x.id)}
                  style={[styles.chip, on && styles.chipSelected]}
                >
                  <x.icon size={t.chipIcon} color={on ? ink.onBrand : colors.textPrimary} />
                  <Text style={[styles.chipText, on && styles.chipTextOn]} {...shrinkToFit(0.7)}>
                    {x.label}
                  </Text>
                  {on && <Check size={t.chipTick} color={ink.onBrand} style={styles.chipTick} />}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <Text style={styles.section} {...shrinkToFit(0.8)}>
              Choose Date
            </Text>
            <Pressable accessibilityRole="button" style={styles.calLink}>
              <CalendarDays size={t.noteIcon} color={t.sectionNoteColour} />
              <Text style={styles.sectionNote} {...shrinkToFit(0.8)}>
                View Calendar
              </Text>
            </Pressable>
          </View>
          <View style={styles.note}>
            <CalendarCheck size={t.noteIcon} color={colors.textBody} />
            <Text style={styles.noteText} {...shrinkToFit(0.8)}>
              Advocate available slots only
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayRow}
          >
            {DAYS.map((d) => {
              const on = d.num === day;
              return (
                <Pressable
                  key={d.num}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => setDay(d.num)}
                  style={[styles.day, on && styles.chipSelected]}
                >
                  <Text style={[styles.dayDow, on && styles.chipTextOn]}>{d.dow}</Text>
                  <Text style={[styles.dayNum, on && styles.chipTextOn]}>{d.num}</Text>
                  <Text style={[styles.dayMon, on && styles.chipTextOn]}>{d.mon}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.sectionHeadBare}>
          <Text style={styles.section} {...shrinkToFit(0.8)}>
            Available Time
          </Text>
          <Text style={styles.sectionNoteMuted} {...shrinkToFit(0.75)}>
            IST (Indian Standard Time)
          </Text>
        </View>
        <Text style={styles.slotSub} {...shrinkToFit(0.8)}>
          Choose one available time slot.
        </Text>
        <View style={styles.slots}>
          {SLOTS.map((s) => {
            const on = !s.booked && s.label === slot;
            return (
              <Pressable
                key={s.label}
                accessibilityRole="button"
                accessibilityState={{ disabled: !!s.booked, selected: on }}
                disabled={s.booked}
                onPress={() => setSlot(s.label)}
                style={[styles.slot, s.booked && styles.slotBooked, on && styles.chipSelected]}
              >
                <Clock
                  size={t.slotIcon}
                  color={on ? ink.onBrand : s.booked ? colors.textMuted : colors.brandDark}
                />
                <Text
                  style={[styles.slotText, s.booked && styles.slotBookedText, on && styles.chipTextOn]}
                  {...shrinkToFit(0.7)}
                >
                  {s.label}
                </Text>
                {s.booked && (
                  <View style={styles.booked}>
                    <Text style={styles.bookedText} {...shrinkToFit(0.7)}>
                      BOOKED
                    </Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <Text style={styles.section} {...shrinkToFit(0.8)}>
              Duration
            </Text>
            <Text style={styles.sectionNoteMuted} {...shrinkToFit(0.8)}>
              Recommended: {LA_FOLLOWUP.recommended}
            </Text>
          </View>
          <View style={styles.chipRow}>
            {LA_FOLLOWUP.durations.map((d) => {
              const on = d === duration;
              return (
                <Pressable
                  key={d}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  onPress={() => setDuration(d)}
                  style={[styles.chip, on && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, on && styles.chipTextOn]} {...shrinkToFit(0.75)}>
                    {d}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Fee Summary</Text>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel} {...shrinkToFit(0.8)}>
              Follow-up Consultation Fee
            </Text>
            <Text style={styles.feeValue} {...shrinkToFit(0.8)}>
              ₹{LA_FOLLOWUP.fee.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.feeRow}>
            <Text style={styles.feeLabel} {...shrinkToFit(0.8)}>
              Platform &amp; Security Fee
            </Text>
            {/* ₹99 as drawn — see the note at the top of this file. */}
            <Text style={styles.feeValue} {...shrinkToFit(0.8)}>
              ₹{LA_FOLLOWUP.platformFee}
            </Text>
          </View>
          <View style={styles.total}>
            <Text style={styles.totalLabel} {...shrinkToFit(0.8)}>
              Total Payable
            </Text>
            <Text style={styles.totalValue} {...shrinkToFit(0.8)}>
              ₹{LA_FOLLOWUP.total.toLocaleString('en-IN')}
            </Text>
          </View>
          <View style={styles.tax}>
            <ShieldCheck size={t.taxIcon} color={t.sectionNoteColour} />
            <Text style={styles.taxText} {...shrinkToFit(0.75)}>
              Inclusive of standard legal taxes &amp; platform security
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <Text style={styles.section} {...shrinkToFit(0.8)}>
              Payment Method
            </Text>
            <Pressable accessibilityRole="button" hitSlop={6}>
              <Text style={styles.sectionNote} {...shrinkToFit(0.8)}>
                Change
              </Text>
            </Pressable>
          </View>
          <View style={styles.payRow}>
            <View style={styles.payTile}>
              <Wallet size={t.payTileGlyph} color={colors.textPrimary} />
            </View>
            <View style={styles.payText}>
              <Text style={styles.payTitle} {...shrinkToFit(0.75)}>
                UPI •••• {LA_FOLLOWUP.upi.handle}
              </Text>
              <Text style={styles.paySub} {...shrinkToFit(0.75)}>
                {LA_FOLLOWUP.upi.bank} ••••••{LA_FOLLOWUP.upi.tail}
              </Text>
            </View>
            <View style={styles.selected}>
              <Text style={styles.selectedText} {...shrinkToFit(0.8)}>
                Selected
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionHead}>
            <Text style={styles.section} {...shrinkToFit(0.8)}>
              Follow-up Booking Summary
            </Text>
            <ClipboardCheck size={t.tileIconGlyph} color={colors.brandDark} />
          </View>
          <View style={styles.summary}>
            {[
              ['Advocate', LA_ADVOCATE.name],
              ['Date', LA_FOLLOWUP.date],
              ['Time Slot', LA_FOLLOWUP.timeSlot],
              ['Consultation Type', `${typeLabel} Call`],
              ['Duration', LA_FOLLOWUP.duration],
            ].map(([k, v]) => (
              <View key={k} style={styles.sumRow}>
                <Text style={styles.sumLabel} {...shrinkToFit(0.8)}>
                  {k}
                </Text>
                <Text style={styles.sumValue} {...shrinkToFit(0.7)}>
                  {v}
                </Text>
              </View>
            ))}
            <View style={styles.sumTotalRow}>
              <Text style={styles.sumTotal} {...shrinkToFit(0.8)}>
                Total Payable
              </Text>
              <Text style={styles.sumTotal} {...shrinkToFit(0.8)}>
                ₹{LA_FOLLOWUP.total.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: confirmed }}
          onPress={() => setConfirmed((v) => !v)}
          style={styles.check}
        >
          <View style={[styles.checkBox, confirmed && styles.checkBoxOn]}>
            {confirmed && <Check size={14} color={ink.onBrand} strokeWidth={3} />}
          </View>
          <Text style={styles.checkText}>
            I confirm the selected date, time, and consultation details. Standard rescheduling
            rules apply up to 2 hours prior.
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/legal-advice/confirmed')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>Confirm &amp; Book</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: { flex: 1, minWidth: 0, marginLeft: t.backGap, marginRight: 10 },
  title: { fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  sub: { marginTop: t.subGap, fontFamily: font.appBody, fontSize: t.subSize, color: colors.textBody },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingHorizontal: t.padX },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  tinted: { backgroundColor: t.tintBg },

  advRow: { flexDirection: 'row', alignItems: 'center' },
  photo: {
    width: t.photo,
    height: t.photo,
    borderRadius: t.photo / 2,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { fontFamily: font.appSemi, fontSize: 19, color: colors.brandDark },
  advText: { flex: 1, minWidth: 0, marginLeft: t.photoGap, marginRight: 8 },
  advName: { fontFamily: font.appHeading, fontSize: t.nameSize, color: colors.textPrimary },
  verified: {
    marginTop: t.verifiedGap,
    alignSelf: 'flex-start',
    minHeight: t.verifiedHeight,
    borderRadius: t.verifiedRadius,
    paddingHorizontal: t.verifiedPadX,
    backgroundColor: t.verifiedBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    marginLeft: t.verifiedIconGap,
    fontFamily: font.appSemi,
    fontSize: t.verifiedSize,
    color: t.verifiedColour,
  },
  advLine: {
    marginTop: t.advLineGap,
    fontFamily: font.appBody,
    fontSize: t.advLineSize,
    color: colors.textBody,
  },
  profile: {
    minHeight: t.profileHeight,
    borderRadius: t.profileRadius,
    paddingHorizontal: t.profilePadX,
    backgroundColor: t.profileBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: { fontFamily: font.appBody, fontSize: t.profileSize, color: colors.textBody },

  fuRow: { flexDirection: 'row' },
  tileIcon: {
    width: t.tileIcon,
    height: t.tileIcon,
    borderRadius: t.tileIconRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fuText: { flex: 1, minWidth: 0, marginLeft: t.tileIconGap },
  fuHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fuTitle: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.fuTitleSize, color: t.fuTitleColour },
  fuActive: {
    marginLeft: 8,
    fontFamily: font.appBody,
    fontSize: t.fuActiveSize,
    color: colors.textBody,
  },
  fuBody: {
    marginTop: t.fuBodyGap,
    fontFamily: font.appBody,
    fontSize: t.fuBodySize,
    lineHeight: t.fuBodyLineHeight,
    color: colors.textPrimary,
  },
  prev: {
    marginTop: t.prevGap,
    borderRadius: t.prevRadius,
    backgroundColor: colors.card,
    padding: t.prevPad,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prevLabel: { fontFamily: font.appBody, fontSize: t.prevLabelSize, color: colors.textBody },
  prevValue: {
    marginLeft: 8,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.prevValueSize,
    color: colors.textPrimary,
  },

  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionHeadBare: {
    marginTop: t.cardGap + 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.sectionSize, color: colors.textPrimary },
  sectionNote: {
    marginLeft: 8,
    fontFamily: font.appBody,
    fontSize: t.sectionNoteSize,
    color: t.sectionNoteColour,
  },
  sectionNoteMuted: {
    marginLeft: 8,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.sectionNoteSize,
    color: colors.textBody,
  },
  calLink: { flexDirection: 'row', alignItems: 'center' },

  area: {
    marginTop: t.areaGap,
    height: t.areaHeight,
    borderRadius: t.areaRadius,
    backgroundColor: t.chipBg,
    padding: t.areaPad,
    textAlignVertical: 'top',
    fontFamily: font.appBody,
    fontSize: t.areaSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },

  chipRow: { marginTop: t.chipGap, flexDirection: 'row', gap: t.chipColGap },
  chip: {
    flex: 1,
    minWidth: 0,
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    backgroundColor: t.chipBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  chipSelected: { backgroundColor: t.chipOn },
  chipText: {
    marginLeft: t.chipIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.chipSize,
    color: colors.textPrimary,
  },
  chipTextOn: { color: ink.onBrand },
  chipTick: { marginLeft: t.chipTickGap },

  note: { marginTop: t.chipGap, flexDirection: 'row', alignItems: 'center' },
  noteText: {
    marginLeft: t.noteIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    color: colors.textPrimary,
  },
  dayRow: { marginTop: t.dayGap, gap: t.dayColGap, paddingRight: 4 },
  day: {
    width: t.dayW,
    height: t.dayH,
    borderRadius: t.dayRadius,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDow: { fontFamily: font.appBody, fontSize: t.dayDowSize, color: colors.textBody },
  dayNum: {
    marginTop: t.dayNumGap,
    fontFamily: font.appHeading,
    fontSize: t.dayNumSize,
    color: colors.textPrimary,
  },
  dayMon: {
    marginTop: t.dayMonGap,
    fontFamily: font.appBody,
    fontSize: t.dayMonSize,
    color: colors.textBody,
  },

  slotSub: {
    marginTop: 6,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    color: colors.textBody,
  },
  slots: {
    marginTop: t.slotGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: t.slotColGap,
    rowGap: t.slotRowGap,
  },
  slot: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 130,
    maxWidth: '48%',
    minHeight: t.slotHeight,
    borderRadius: t.slotRadius,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  slotBooked: { backgroundColor: t.bookedBg },
  slotText: {
    marginLeft: t.slotIconGap,
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.slotSize,
    color: colors.textPrimary,
  },
  slotBookedText: {
    fontFamily: font.appBody,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  booked: {
    marginLeft: t.bookedGap,
    minHeight: t.bookedHeight,
    borderRadius: t.bookedRadius,
    paddingHorizontal: t.bookedPadX,
    backgroundColor: t.bookedChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookedText: { fontFamily: font.appSemi, fontSize: t.bookedSize, color: colors.textBody },

  feeRow: {
    marginTop: t.feeRowGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.feeLabelSize, color: colors.textBody },
  feeValue: {
    marginLeft: 10,
    fontFamily: font.appHeading,
    fontSize: t.feeValueSize,
    color: colors.textPrimary,
  },
  total: {
    marginTop: t.totalGap,
    borderRadius: t.totalRadius,
    backgroundColor: t.chipBg,
    padding: t.totalPad,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: { flexShrink: 1, fontFamily: font.appHeading, fontSize: t.totalLabelSize, color: colors.textPrimary },
  totalValue: {
    marginLeft: 10,
    fontFamily: font.appHeading,
    fontSize: t.totalValueSize,
    color: colors.textPrimary,
  },
  tax: { marginTop: t.taxGap, flexDirection: 'row', alignItems: 'center' },
  taxText: {
    marginLeft: t.taxIconGap,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.taxSize,
    color: colors.textPrimary,
  },

  payRow: {
    marginTop: t.payRowGap,
    borderRadius: t.payRowRadius,
    backgroundColor: t.chipBg,
    padding: t.payRowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  payTile: {
    width: t.payTile,
    height: t.payTile,
    borderRadius: t.payTileRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payText: { flex: 1, minWidth: 0, marginLeft: t.payTileGap, marginRight: 8 },
  payTitle: { fontFamily: font.appHeading, fontSize: t.payTitleSize, color: colors.textPrimary },
  paySub: {
    marginTop: t.paySubGap,
    fontFamily: font.appBody,
    fontSize: t.paySubSize,
    color: colors.textBody,
  },
  selected: {
    minHeight: t.selectedHeight,
    borderRadius: t.selectedRadius,
    paddingHorizontal: t.selectedPadX,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: { fontFamily: font.appBody, fontSize: t.selectedSize, color: t.sectionNoteColour },

  summary: {
    marginTop: t.payRowGap,
    borderRadius: t.payRowRadius,
    backgroundColor: t.chipBg,
    padding: t.payRowPad,
  },
  sumRow: {
    marginTop: t.sumRowGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sumLabel: { flexShrink: 1, fontFamily: font.appBody, fontSize: t.sumLabelSize, color: colors.textBody },
  sumValue: {
    marginLeft: 10,
    flexShrink: 1,
    textAlign: 'right',
    fontFamily: font.appHeading,
    fontSize: t.sumValueSize,
    color: colors.textPrimary,
  },
  sumTotalRow: {
    marginTop: t.sumTotalGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sumTotal: { fontFamily: font.appHeading, fontSize: t.sumTotalSize, color: colors.textPrimary },

  check: { marginTop: t.checkGap, flexDirection: 'row', alignItems: 'flex-start' },
  checkBox: {
    width: t.checkBox,
    height: t.checkBox,
    borderRadius: t.checkRadius,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: { backgroundColor: colors.brandDark, borderColor: colors.brandDark },
  checkText: {
    marginLeft: t.checkGapX,
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.checkSize,
    lineHeight: t.checkLineHeight,
    color: colors.textPrimary,
  },

  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.buttonBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appBody, fontSize: t.buttonSize, color: ink.onBrand },
  buttonIcon: { marginLeft: t.buttonIconGap },
});
