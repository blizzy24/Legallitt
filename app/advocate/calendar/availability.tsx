import { ChevronRight, Plus } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AdvToolHeader from '../../../components/AdvToolHeader';
import { shrinkToFit } from '../../../constants/textFit';
import { AT_AVAILABILITY } from '../../../data/advocateTools';
import { advManageAvailability as t, font, ink } from '../../../constants/theme';

// Advocate — manage availability (design/274).
//
// Built as drawn, including:
// ⚠ Note 8 — the Evening slot reads "03:00 AM - 01:00 PM". It runs backwards
//   and it overlaps the Morning slot (09:00 AM - 01:00 PM) above it.
// ⚠ Note 9 — Sunday is labelled "San", as it is on design/271.
// ⚠ Note 21 — this screen prints the available hours as "09:00 AM - 06:00 PM"
//   where design/271's identical row prints "09:00 AM - 6:00 PM".
//
// STATIC, NOT WIRED: the day circles do not toggle, "Edit Hours" opens no
// picker, the slot rows open nothing, and "+ Add Time Slot" adds nothing.
export default function AdvocateAvailabilityScreen() {
  const d = AT_AVAILABILITY;

  return (
    <View style={styles.screen}>
      <AdvToolHeader title={d.title} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title} {...shrinkToFit(0.8)}>
            {d.workingHours}
          </Text>
          <View style={styles.circles}>
            {d.days.map((day) => (
              <View key={day.label} style={[styles.circle, day.on && styles.circleOn]}>
                <Text style={[styles.circleText, day.on && styles.circleTextOn]} {...shrinkToFit(0.75)}>
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.hoursCard}>
          <View style={styles.hoursRow}>
            <View style={styles.hoursCol}>
              <Text style={styles.hoursTitle} {...shrinkToFit(0.8)}>
                {d.hoursTitle}
              </Text>
              <Text style={styles.hoursValue} {...shrinkToFit(0.8)}>
                {d.hours}
              </Text>
            </View>
            <View style={styles.edit}>
              <Text style={styles.editText} {...shrinkToFit(0.8)}>
                {d.edit}
              </Text>
            </View>
          </View>

          {d.slots.map((s, i) => (
            <View key={s.label} style={[styles.slot, i === 0 ? styles.firstSlot : styles.nextSlot]}>
              <View style={styles.hoursCol}>
                <Text style={styles.slotTitle} {...shrinkToFit(0.8)}>
                  {s.label}
                </Text>
                <Text style={styles.slotValue} {...shrinkToFit(0.8)}>
                  {s.value}
                </Text>
              </View>
              <ChevronRight size={t.slotChevron} color={t.brand} strokeWidth={2.2} />
            </View>
          ))}

          <Pressable
            accessibilityRole="button"
            style={({ pressed }) => [styles.add, pressed && styles.pressed]}
          >
            <Plus size={t.addGlyph} color={t.brand} strokeWidth={2.4} />
            <Text style={styles.addText} {...shrinkToFit(0.8)}>
              {d.addSlot}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingBottom: t.contentBottom },

  card: {
    marginTop: t.cardTop,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  title: {
    fontFamily: font.appSemi,
    fontSize: t.titleSize,
    lineHeight: t.titleLine,
    color: t.ink,
  },
  circles: { marginTop: t.circlesTop, flexDirection: 'row', justifyContent: 'space-between' },
  circle: {
    width: t.circle,
    height: t.circle,
    borderRadius: t.circle / 2,
    borderWidth: 1,
    borderColor: t.circleBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOn: { backgroundColor: t.circleOn, borderColor: t.circleOn },
  circleText: { fontFamily: font.appBody, fontSize: t.circleSize, color: t.circleOff },
  circleTextOn: { color: ink.onBrand },

  hoursCard: {
    marginTop: t.hoursCardTop,
    marginHorizontal: t.padX,
    borderRadius: t.cardRadius,
    backgroundColor: t.cardBg,
    paddingHorizontal: t.cardPadX,
    paddingTop: t.hoursPadTop,
    paddingBottom: t.hoursPadBottom,
  },
  hoursRow: { flexDirection: 'row', alignItems: 'center' },
  hoursCol: { flex: 1 },
  hoursTitle: {
    fontFamily: font.appSemi,
    fontSize: t.hoursTitleSize,
    lineHeight: t.hoursTitleLine,
    color: t.ink,
  },
  hoursValue: {
    marginTop: t.hoursValueTop,
    fontFamily: font.appBody,
    fontSize: t.hoursValueSize,
    color: t.ink,
  },
  edit: {
    width: t.editW,
    height: t.editH,
    borderRadius: t.editRadius,
    borderWidth: 1,
    borderColor: t.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: { fontFamily: font.appBody, fontSize: t.editSize, color: t.brand },

  slot: {
    height: t.slotH,
    borderRadius: t.slotRadius,
    borderWidth: 1,
    borderColor: t.slotBorder,
    paddingHorizontal: t.slotPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  firstSlot: { marginTop: t.slotsTop },
  nextSlot: { marginTop: t.slotGap },
  slotTitle: {
    fontFamily: font.appSemi,
    fontSize: t.slotTitleSize,
    lineHeight: t.slotTitleLine,
    color: t.ink,
  },
  slotValue: {
    marginTop: t.slotValueTop,
    fontFamily: font.appBody,
    fontSize: t.slotValueSize,
    color: t.ink,
  },

  add: {
    marginTop: t.addTop,
    height: t.addH,
    borderRadius: t.addRadius,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: t.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  addText: {
    marginLeft: t.addGap,
    fontFamily: font.appHeading,
    fontSize: t.addSize,
    color: t.brand,
  },
});
