import { router, type Href } from 'expo-router';
import {
  Briefcase,
  Calendar,
  Camera,
  Check,
  ChevronLeft,
  ImageIcon,
  Info,
  Lock,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react-native';
import { Fragment, ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { AS_EDIT_PROFILE } from '../../../data/advocateSettings';
import { advEditProfile as t, colors, font, ink, status } from '../../../constants/theme';

// Advocate settings — edit profile (design/246).
//
// ⚠ A THIRD PAGE BACKGROUND IN THREE SCREENS: #F7F7F5 here, #F4F6F8 on
// design/245, and #FAF8F5 everywhere else in the project. Built as drawn.
//
// ⚠ Note 2 — Priya Sharma, D/1842/2015, Bar Council of Delhi. The verification
// wizard one batch earlier enrolls Rahul Sharma, MP/1428/2018, MP Bar Council.
//
// STATIC, NOT WIRED. No text inputs, no date picker, no chip editing: the ×
// on a chip removes nothing and "+ Add Area" adds nothing. "Change Profile
// Photo" and the camera badge open nothing — there is still no image picker
// anywhere in this project. "Save Changes" saves nothing.

function Field({
  label,
  children,
  gap,
}: {
  label: string;
  children: ReactNode;
  gap?: number;
}) {
  return (
    <View style={gap !== undefined ? { marginTop: gap } : undefined}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <View style={styles.smallPill}>
      <Check size={12} color={status.active} strokeWidth={3} />
      <Text style={styles.smallPillText} {...shrinkToFit(0.8)}>
        {label}
      </Text>
    </View>
  );
}

function Chips({ items }: { items: string[] }) {
  return (
    <View style={styles.chips}>
      {items.map((c) => (
        <View key={c} style={styles.chip}>
          <Text style={styles.chipText} {...shrinkToFit(0.8)}>
            {c}
          </Text>
          <X size={t.chipClose} color="#6B6B6B" strokeWidth={2} />
        </View>
      ))}
    </View>
  );
}

export default function AdvocateEditProfileScreen() {
  const insets = useSafeAreaInsets();
  const d = AS_EDIT_PROFILE;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          style={styles.back}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/advocate/settings' as Href))}
        >
          <ChevronLeft size={t.backIcon} color="#1B1C1C" strokeWidth={2.4} />
        </Pressable>
        <View style={styles.headCol}>
          <Text style={styles.eyebrow}>{d.eyebrow}</Text>
          <Text style={styles.title} {...shrinkToFit(0.8)}>
            {d.title}
          </Text>
        </View>
        <View style={styles.info}>
          <Info size={t.infoGlyph} color={ink.accent} strokeWidth={2} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <UserRound size={t.avatarGlyph} color={ink.accent} strokeWidth={1.4} />
            </View>
            <View style={styles.camera}>
              <Camera size={t.cameraGlyph} color={ink.onBrand} strokeWidth={1.8} />
            </View>
          </View>
          <Text style={styles.name} {...shrinkToFit(0.8)}>
            {d.name}
          </Text>
          <View style={styles.vpill}>
            <Check size={t.vpillGlyph} color={status.active} strokeWidth={3} />
            <Text style={styles.vpillText} {...shrinkToFit(0.8)}>
              {d.badge}
            </Text>
          </View>
          <Text style={styles.meta} {...shrinkToFit(0.8)}>
            {d.meta}
          </Text>
          <View style={styles.change}>
            <ImageIcon size={t.changeGlyph} color={ink.accent} strokeWidth={1.8} />
            <Text style={styles.changeText} {...shrinkToFit(0.8)}>
              {d.changePhoto}
            </Text>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <UserRound size={t.sectionGlyph} color={ink.accent} strokeWidth={1.8} />
          <Text style={styles.section}>{d.personalTitle}</Text>
        </View>

        <View style={styles.card}>
          {d.personal.map((f, i) => (
            <Field key={f.label} label={f.label} gap={i === 0 ? undefined : t.fieldGap}>
              <View style={styles.input}>
                <Text style={styles.value} {...shrinkToFit(0.8)}>
                  {f.value}
                </Text>
                {f.icon ? <Calendar size={18} color={ink.accent} strokeWidth={1.8} /> : null}
                {f.pill ? <Pill label={f.pill} /> : null}
              </View>
            </Field>
          ))}
          <View style={styles.cols}>
            <View style={styles.col}>
              <Field label={d.city.label} gap={t.fieldGap}>
                <View style={styles.input}>
                  <Text style={styles.value} {...shrinkToFit(0.8)}>
                    {d.city.value}
                  </Text>
                </View>
              </Field>
            </View>
            <View style={[styles.col, { marginLeft: t.colGap }]}>
              <Field label={d.state.label} gap={t.fieldGap}>
                <View style={styles.input}>
                  <Text style={styles.value} {...shrinkToFit(0.8)}>
                    {d.state.value}
                  </Text>
                </View>
              </Field>
            </View>
          </View>
        </View>

        <View style={styles.sectionRow}>
          <Briefcase size={t.sectionGlyph} color={ink.accent} strokeWidth={1.8} />
          <Text style={styles.section}>{d.professionalTitle}</Text>
        </View>

        <View style={styles.card}>
          <Field label={d.chamber.label}>
            <View style={styles.input}>
              <Text style={styles.value} {...shrinkToFit(0.8)}>
                {d.chamber.value}
              </Text>
            </View>
          </Field>
          <Field label={d.qualification.label} gap={t.fieldGap}>
            <View style={styles.input}>
              <Text style={styles.value} {...shrinkToFit(0.75)}>
                {d.qualification.value}
              </Text>
            </View>
          </Field>
          <View style={styles.cols}>
            <View style={styles.col}>
              <Field label={d.years.label} gap={t.fieldGap}>
                <View style={styles.input}>
                  <Text style={styles.value} {...shrinkToFit(0.8)}>
                    {d.years.value}
                  </Text>
                </View>
              </Field>
            </View>
            <View style={[styles.col, { marginLeft: t.colGap }]}>
              <Field label={d.enrollment.label} gap={t.fieldGap}>
                <View style={[styles.input, styles.inputLocked]}>
                  <Text style={styles.value} {...shrinkToFit(0.8)}>
                    {d.enrollment.value}
                  </Text>
                  <Lock size={16} color={ink.accent} strokeWidth={1.8} />
                </View>
              </Field>
            </View>
          </View>

          <View style={[styles.labelRow, { marginTop: t.fieldGap }]}>
            <Text style={styles.label}>{d.areas.label}</Text>
            <Text style={styles.add}>{d.areas.action}</Text>
          </View>
          <Chips items={d.areas.chips} />

          <View style={[styles.labelRow, { marginTop: t.fieldGap }]}>
            <Text style={styles.label}>{d.courts.label}</Text>
            <Text style={styles.add}>{d.courts.action}</Text>
          </View>
          <Chips items={d.courts.chips} />

          <Field label={d.languages.label} gap={t.fieldGap}>
            <View style={styles.input}>
              <Text style={styles.value} {...shrinkToFit(0.8)}>
                {d.languages.value}
              </Text>
            </View>
          </Field>

          <Field label={d.about.label} gap={t.fieldGap}>
            <View style={styles.area}>
              <Text style={styles.areaText}>{d.about.value}</Text>
            </View>
          </Field>
        </View>

        <View style={styles.note}>
          <ShieldCheck size={t.noteGlyph} color={ink.accent} strokeWidth={1.8} />
          <Text style={styles.noteText}>{d.note}</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/advocate/settings' as Href))}
        >
          <Text style={styles.ctaLabel} {...shrinkToFit(0.8)}>
            {d.cta}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/advocate/settings' as Href))}
        >
          <Text style={styles.cancel}>{d.secondary}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEAE4',
  },
  back: {
    width: t.backBtn,
    height: t.backBtn,
    borderRadius: t.backBtn / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#E8E2DA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headCol: { flex: 1, alignItems: 'center' },
  eyebrow: {
    fontFamily: font.appSemi,
    fontSize: t.eyebrowSize,
    letterSpacing: t.eyebrowTrack,
    color: ink.accent,
  },
  title: {
    marginTop: t.titleTop,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#1B1C1C',
  },
  info: {
    width: t.infoBtn,
    height: t.infoBtn,
    borderRadius: t.infoBtn / 2,
    borderWidth: 1,
    borderColor: ink.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: { paddingBottom: 28 },

  profile: {
    marginTop: t.profileTop,
    marginHorizontal: t.padX,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: t.profileRadius,
    paddingVertical: t.profilePadY,
  },
  avatarWrap: { width: t.avatar, height: t.avatar },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    borderWidth: t.avatarRing,
    borderColor: colors.brand,
    backgroundColor: '#F4EEE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    position: 'absolute',
    right: -2,
    bottom: 0,
    width: t.camera,
    height: t.camera,
    borderRadius: t.camera / 2,
    backgroundColor: '#8C7961',
    borderWidth: 3,
    borderColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    marginTop: t.nameTop,
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: '#1B1C1C',
  },
  vpill: {
    marginTop: t.vpillTop,
    height: t.vpillH,
    borderRadius: t.vpillRadius,
    paddingHorizontal: t.vpillPadX,
    backgroundColor: status.activeBg,
    borderWidth: 1,
    borderColor: status.activeBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  vpillText: {
    marginLeft: 7,
    fontFamily: font.appHeading,
    fontSize: t.vpillSize,
    color: '#0F7A4F',
  },
  meta: {
    marginTop: t.metaTop,
    fontFamily: font.appBody,
    fontSize: t.metaSize,
    color: '#6B6B6B',
  },
  change: { marginTop: t.changeTop, flexDirection: 'row', alignItems: 'center' },
  changeText: {
    marginLeft: t.changeGap,
    fontFamily: font.appSemi,
    fontSize: t.changeSize,
    color: ink.accent,
  },

  sectionRow: {
    marginTop: t.sectionTop,
    marginBottom: t.sectionBottom,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginLeft: t.sectionGap,
    fontFamily: font.appHeading,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionTrack,
    color: ink.accent,
  },

  card: {
    marginHorizontal: t.padX,
    backgroundColor: colors.card,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
    paddingVertical: t.cardPadY,
  },
  label: { fontFamily: font.appBody, fontSize: t.labelSize, color: '#6B6B6B' },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  add: { fontFamily: font.appSemi, fontSize: t.addSize, color: ink.accent },
  input: {
    marginTop: t.labelGap,
    minHeight: t.inputH,
    borderRadius: t.inputRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#E8E2DA',
    paddingHorizontal: t.inputPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputLocked: { backgroundColor: '#FBF8F3' },
  value: { flex: 1, fontFamily: font.appBody, fontSize: t.inputSize, color: '#1B1C1C' },
  cols: { flexDirection: 'row' },
  col: { flex: 1 },

  smallPill: {
    marginLeft: 8,
    height: t.vpillSmallH,
    borderRadius: t.vpillSmallH / 2,
    paddingHorizontal: 10,
    backgroundColor: status.activeBg,
    borderWidth: 1,
    borderColor: status.activeBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallPillText: {
    marginLeft: 4,
    fontFamily: font.appSemi,
    fontSize: t.vpillSmallSize,
    color: '#0F7A4F',
  },

  chips: { marginTop: t.chipTop - t.chipGapY, flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    height: t.chipH,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    borderWidth: 1,
    borderColor: '#E3D7C4',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: t.chipGapX,
    marginTop: t.chipGapY,
  },
  chipText: {
    marginRight: 7,
    fontFamily: font.appBody,
    fontSize: t.chipSize,
    color: '#1B1C1C',
  },

  area: {
    marginTop: t.labelGap,
    minHeight: t.areaH,
    borderRadius: t.inputRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#E8E2DA',
    paddingHorizontal: t.inputPadX,
    paddingVertical: t.areaPadY,
  },
  areaText: {
    fontFamily: font.appBody,
    fontSize: t.inputSize,
    lineHeight: t.areaLine,
    color: '#1B1C1C',
  },

  note: {
    marginTop: t.noteTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.noteBg,
    borderRadius: t.noteRadius,
    padding: t.notePad,
  },
  noteText: {
    flex: 1,
    marginLeft: t.noteGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLine,
    color: '#6B5B45',
  },

  footer: {
    paddingTop: t.footerPadTop,
    paddingHorizontal: t.padX,
    borderTopWidth: 1,
    borderTopColor: '#EDEAE4',
    backgroundColor: t.bg,
  },
  cta: {
    height: t.ctaH,
    borderRadius: t.ctaRadius,
    backgroundColor: t.ctaBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  ctaLabel: { fontFamily: font.appHeading, fontSize: t.ctaLabelSize, color: ink.onBrand },
  cancel: {
    marginTop: t.cancelTop,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.cancelSize,
    color: '#6B6B6B',
  },
});
