import { previewNotice } from '../../components/PreviewNotice';
import { router } from 'expo-router';
import {
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  CircleCheck,
  Languages,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  UserRound,
  Video,
  type LucideIcon,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GENDER_OPTIONS } from '@legalitt/shared';
import { DATA_SOURCE } from '../../lib/data-source';
import { backend } from '../../lib/auth';
import { ErrorState, Loading } from '../../features/account/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BoxField from '../../components/BoxField';
import { shrinkToFit } from '../../constants/textFit';
import { boxField as bf, colors, font, ink, profile as t } from '../../constants/theme';
import { useProfile } from '../../context/profile';
import { CONSULTATION_OPTIONS, type ConsultationMode } from '../../data/profile';

// Edit Profile (design/51).
//
// The fields use components/BoxField — the app's fifth field style, with the label
// inside the border. See the note on that component.
//
// Nothing here validates or uploads: Change Profile Photo is inert, the Gender and
// Language pickers are closed states only (design/51 draws no open picker), and Save
// writes the form straight to the profile context.

const MODE_ICONS: Record<ConsultationMode, LucideIcon> = {
  chat: MessageSquare,
  voice: Phone,
  video: Video,
};

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, update, account, accountError, accountLoading, refreshAccount } = useProfile();
  const live = DATA_SOURCE === 'api';

  const [form, setForm] = useState(profile);
  const [gender, setGender] = useState<string | null>(null), [genderOpen, setGenderOpen] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  // D-15: start from the saved account once it arrives.
  useEffect(() => { if (live && account) { setForm(profile); setGender(account.gender); } }, [live, account?.id]);
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const toggleMode = (id: ConsultationMode) =>
    set({
      consultation: form.consultation.includes(id)
        ? form.consultation.filter((m) => m !== id)
        : [...form.consultation, id],
    });

  const save = async () => {
    if (!live) { update(form); router.replace('/(tabs)/profile'); return; }
    if (busy) return;
    const dob = form.dateOfBirth.trim();
    if (!form.fullName.trim()) { setError('Enter your full name.'); return; }
    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) { setError('Enter your date of birth as YYYY-MM-DD, for example 2000-05-15.'); return; }
    setBusy(true); setError('');
    try {
      await backend.updateAccountProfile({name: form.fullName.trim(), date_of_birth: dob || null, gender: (gender as never) ?? null,
        city: form.city, state: form.state, country: form.country});
      await refreshAccount();
      router.replace('/(tabs)/profile');
    } catch (e) { setError(e instanceof Error ? e.message : 'Your changes could not be saved. Try again.'); }
    finally { setBusy(false); }
  };
  const cancel = () => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile');

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back" hitSlop={10} onPress={cancel}>
          <ChevronLeft size={t.backIcon} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Edit Profile
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => void save()}
          disabled={busy}
          style={({ pressed }) => [styles.save, (pressed || busy) && styles.pressed]}
        >
          <Text style={styles.saveLabel} {...shrinkToFit(0.8)}>
            Save
          </Text>
        </Pressable>
      </View>

      {live && !account ? <View style={styles.content}>{accountLoading || !accountError ? <Loading what="your profile"/> : <ErrorState what="your profile" message={accountError} retry={() => void refreshAccount()}/>}</View> :
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + t.sectionGap }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarBlock}>
          <View>
            <View style={styles.bigAvatar}>
              <Text style={styles.bigAvatarText}>{form.initials}</Text>
            </View>
            {/* No image picker in this build: the preview notice says so. */}
            {!live && <Pressable onPress={() => previewNotice("Change photo")} accessibilityRole="button" accessibilityLabel="Change photo" style={styles.camera}>
              <Camera size={t.cameraGlyph} color={ink.onBrand} />
            </Pressable>}
          </View>
          <Text style={styles.changePhoto} {...shrinkToFit(0.8)}>
            {live ? 'Profile photos are not available yet' : 'Change Profile Photo'}
          </Text>
        </View>

        <Group label="PERSONAL INFORMATION" first>
          <BoxField
            label="Full Name"
            icon={UserRound}
            value={form.fullName}
            onChangeText={(v) => set({ fullName: v })}
          />
          <BoxField
            label="Email Address"
            icon={Mail}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => set({ email: v })}
            editable={!live}
            style={styles.stacked}
          />
          <BoxField
            label="Mobile Number"
            icon={Phone}
            keyboardType="phone-pad"
            value={form.mobile}
            onChangeText={(v) => set({ mobile: v })}
            editable={!live}
            style={styles.stacked}
            accessory={
              form.mobileVerified ? (
                <View style={styles.verified}>
                  <CircleCheck size={t.verifiedIcon} color={t.verifiedText} />
                  <Text style={styles.verifiedText} {...shrinkToFit(0.8)}>
                    Verified
                  </Text>
                </View>
              ) : undefined
            }
          />

          <View style={styles.row}>
            <BoxField
              label="Date of Birth"
              icon={Calendar}
              value={form.dateOfBirth}
              onChangeText={(v) => set({ dateOfBirth: v })}
              placeholder={live ? 'YYYY-MM-DD' : undefined}
              style={styles.col}
            />
            {/* Closed state only — design/51 draws no open picker. */}
            {live ? <Pressable accessibilityRole="button" accessibilityLabel="Gender" onPress={() => setGenderOpen(true)} style={styles.col}>
              <BoxField label="Gender" icon={ChevronDown} iconSize={bf.chevron}>
                <Text style={styles.pickerValue} {...shrinkToFit(0.7)}>{GENDER_OPTIONS.find(g => g.code === gender)?.label ?? 'Select'}</Text>
              </BoxField></Pressable> :
            <BoxField label="Gender" icon={ChevronDown} iconSize={bf.chevron} style={styles.col}>
              <Text style={styles.pickerValue} {...shrinkToFit(0.7)}>
                {form.gender}
              </Text>
            </BoxField>}
          </View>
        </Group>

        <Group label="LOCATION">
          <View style={styles.rowFirst}>
            <BoxField
              label="City"
              value={form.city}
              onChangeText={(v) => set({ city: v })}
              style={styles.col}
            />
            <BoxField
              label="State"
              value={form.state}
              onChangeText={(v) => set({ state: v })}
              style={styles.col}
            />
          </View>
          <BoxField
            label="Country"
            icon={MapPin}
            value={form.country}
            onChangeText={(v) => set({ country: v })}
            style={styles.stacked}
          />
        </Group>

        <Group label="PREFERRED LANGUAGE">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/language')}
            style={({ pressed }) => [styles.language, pressed && styles.pressed]}
          >
            <View style={styles.langIcon}>
              <Languages size={t.langIconGlyph} color={colors.brandDark} />
            </View>
            <View style={styles.langText}>
              <Text style={styles.langValue} {...shrinkToFit(0.8)}>
                {form.language}
              </Text>
              <Text style={styles.langSub} numberOfLines={1}>
                Preferred for communication &amp; notices
              </Text>
            </View>
            <ChevronDown size={bf.chevron} color={colors.textMuted} />
          </Pressable>
        </Group>

        <Group label="CONSULTATION PREFERENCES">
          <Text style={styles.prefIntro}>Choose how you prefer to communicate with advocates.</Text>
          <View style={styles.prefRow}>
            {CONSULTATION_OPTIONS.map((o) => {
              const unavailable = live && o.id !== 'chat';
              const on = live ? o.id === 'chat' : form.consultation.includes(o.id);
              const Icon = MODE_ICONS[o.id];
              return (
                <Pressable
                  key={o.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: on, disabled: live }}
                  disabled={live}
                  onPress={() => toggleMode(o.id)}
                  style={[styles.pref, on && styles.prefOn]}
                >
                  <View style={styles.prefTop}>
                    <View style={[styles.prefIcon, on && styles.prefIconOn]}>
                      <Icon size={t.prefIconGlyph} color={on ? colors.brandDark : colors.textBody} />
                    </View>
                    {on ? (
                      <View style={styles.prefCheckOn}>
                        <Check size={t.prefCheck - 8} color={ink.onBrand} strokeWidth={3} />
                      </View>
                    ) : (
                      <View style={styles.prefCheckOff} />
                    )}
                  </View>
                  <Text style={styles.prefLabel} {...shrinkToFit(0.8)}>
                    {o.label}
                  </Text>
                  <Text style={styles.prefAvail} {...shrinkToFit(0.8)}>
                    {unavailable ? 'Not available yet' : o.availability}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Group>

        {!!error && <Text accessibilityRole="alert" style={{ color: '#A33A2A', marginTop: 16, fontSize: 14, lineHeight: 20 }}>{error}</Text>}
        <Pressable
          accessibilityRole="button"
          onPress={() => void save()}
          disabled={busy}
          style={({ pressed }) => [styles.button, (pressed || busy) && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>{busy ? 'Saving…' : 'Save Changes'}</Text>
        </Pressable>

        <Pressable accessibilityRole="button" onPress={cancel} hitSlop={8} style={styles.cancel}>
          <Text style={styles.cancelLabel}>Cancel</Text>
        </Pressable>
      </ScrollView>}
      <Modal visible={genderOpen} transparent animationType="fade" onRequestClose={() => setGenderOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,.35)', justifyContent: 'flex-end' }} onPress={() => setGenderOpen(false)}>
          <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22, gap: 4 }}>
            <Text style={styles.groupLabel}>GENDER</Text>
            {GENDER_OPTIONS.map(g => <Pressable key={g.code} accessibilityRole="radio" accessibilityState={{ checked: gender === g.code }} onPress={() => { setGender(g.code); setGenderOpen(false); }} style={{ paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.pickerValue}>{g.label}</Text>{gender === g.code && <Check size={18} color={colors.brandDark} />}</Pressable>)}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function Group({
  label,
  first,
  children,
}: {
  label: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={first ? styles.groupFirst : styles.group}>
      <Text style={styles.groupLabel} {...shrinkToFit(0.8)}>
        {label}
      </Text>
      {children}
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
    backgroundColor: colors.appBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.headerTitleSize,
    color: colors.textPrimary,
  },
  save: {
    minHeight: t.saveHeight,
    borderRadius: t.saveRadius,
    paddingHorizontal: t.savePadX,
    backgroundColor: t.saveBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveLabel: {
    fontFamily: font.appSemi,
    fontSize: t.saveSize,
    color: colors.brandDark,
  },
  pressed: {
    opacity: 0.85,
  },
  content: {
    paddingHorizontal: t.padX,
  },
  avatarBlock: {
    marginTop: t.bigAvatarTop,
    alignItems: 'center',
  },
  bigAvatar: {
    width: t.bigAvatar,
    height: t.bigAvatar,
    borderRadius: t.bigAvatar / 2,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigAvatarText: {
    fontFamily: font.appSemi,
    fontSize: t.bigAvatarText,
    color: colors.brandDark,
  },
  camera: {
    position: 'absolute',
    right: -2,
    bottom: 0,
    width: t.cameraBadge,
    height: t.cameraBadge,
    borderRadius: t.cameraBadge / 2,
    backgroundColor: colors.brand,
    borderWidth: 2,
    borderColor: colors.appBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhoto: {
    marginTop: t.changePhotoGap,
    fontFamily: font.appBody,
    fontSize: t.changePhotoSize,
    color: colors.brandDark,
  },
  groupFirst: {
    marginTop: t.groupGap,
  },
  group: {
    marginTop: t.groupGap,
  },
  groupLabel: {
    marginBottom: t.groupLabelGap,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textMuted,
  },
  stacked: {
    marginTop: t.fieldGap,
  },
  row: {
    marginTop: t.fieldGap,
    flexDirection: 'row',
    gap: t.fieldColGap,
  },
  rowFirst: {
    flexDirection: 'row',
    gap: t.fieldColGap,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  pickerValue: {
    fontFamily: font.appSemi,
    fontSize: bf.valueSize,
    color: colors.textPrimary,
  },
  verified: {
    marginLeft: 8,
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
    color: t.verifiedText,
  },
  language: {
    borderRadius: bf.radius,
    backgroundColor: bf.bg,
    borderWidth: 1,
    borderColor: bf.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  langIcon: {
    width: t.langIcon,
    height: t.langIcon,
    borderRadius: t.langIconRadius,
    backgroundColor: t.rowIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.langIconGap,
  },
  langValue: {
    fontFamily: font.appSemi,
    fontSize: t.langSize,
    color: colors.textPrimary,
  },
  langSub: {
    marginTop: t.langSubGap,
    fontFamily: font.appBody,
    fontSize: t.langSubSize,
    color: colors.textBody,
  },
  prefIntro: {
    marginTop: -t.groupLabelGap + t.prefIntroGap,
    marginBottom: t.prefGap,
    fontFamily: font.appBody,
    fontSize: t.prefIntroSize,
    color: colors.textBody,
  },
  prefRow: {
    flexDirection: 'row',
    gap: t.prefColGap,
  },
  pref: {
    flex: 1,
    minWidth: 0,
    minHeight: t.prefHeight,
    borderRadius: t.prefRadius,
    borderWidth: 1,
    borderColor: t.prefOffBorder,
    backgroundColor: colors.card,
    padding: t.prefPad,
  },
  prefOn: {
    borderColor: t.prefOnBorder,
    backgroundColor: t.prefOnBg,
  },
  prefTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prefIcon: {
    width: t.prefIcon,
    height: t.prefIcon,
    borderRadius: t.prefIconRadius,
    backgroundColor: colors.appBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefIconOn: {
    backgroundColor: colors.card,
  },
  prefCheckOn: {
    width: t.prefCheck,
    height: t.prefCheck,
    borderRadius: t.prefCheck / 2,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefCheckOff: {
    width: t.prefCheck,
    height: t.prefCheck,
    borderRadius: t.prefCheck / 2,
    borderWidth: 1.5,
    borderColor: t.prefOffBorder,
  },
  prefLabel: {
    marginTop: t.prefLabelGap,
    fontFamily: font.appHeading,
    fontSize: t.prefLabelSize,
    color: colors.textPrimary,
  },
  prefAvail: {
    marginTop: t.prefAvailGap,
    fontFamily: font.appBody,
    fontSize: t.prefAvailSize,
    color: colors.textBody,
  },
  button: {
    marginTop: t.saveButtonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
  cancel: {
    marginTop: t.cancelGap,
    alignItems: 'center',
  },
  cancelLabel: {
    fontFamily: font.appSemi,
    fontSize: t.cancelSize,
    color: colors.textBody,
  },
});
