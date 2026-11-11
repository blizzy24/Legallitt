import {type ReactNode} from 'react';
import {ActivityIndicator, Linking, Pressable, StyleSheet, Text, View} from 'react-native';
import {router, type Href} from 'expo-router';
import {ChevronLeft, FileText} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ApiError} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {colors, font} from '../../constants/theme';

export const tone = {bg: '#F9F7F3', card: '#FFFFFF', line: '#EEE7DD', chip: '#F3EDE5', brand: '#B09C82', brandDark: '#8E7A60', ink: '#1F1B16', body: '#5E554B', muted: '#9A8F82', danger: '#C0453A', ok: '#1F9D63'};
export const errorText = (e: unknown) => e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Something went wrong. Try again.';
export const back = (fallback: Href = '/messages') => router.canGoBack() ? router.back() : router.replace(fallback);
export const initials = (name: string) => name.replace(/^Adv\.?\s*/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]!.toUpperCase()).join('') || '?';
export function when(iso: string) {
  const d = new Date(iso), now = new Date();
  const day = (x: Date) => x.toLocaleDateString('en-CA', {timeZone: 'Asia/Kolkata'});
  if (day(d) === day(now)) return d.toLocaleTimeString('en-IN', {timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit'});
  const y = new Date(now.getTime() - 86_400_000);
  if (day(d) === day(y)) return 'Yesterday';
  return d.toLocaleDateString('en-IN', {timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short'});
}
export const time = (iso: string) => new Date(iso).toLocaleTimeString('en-IN', {timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit'});
export const dayLabel = (iso: string) => {
  const d = new Date(iso), key = (x: Date) => x.toLocaleDateString('en-CA', {timeZone: 'Asia/Kolkata'});
  if (key(d) === key(new Date())) return 'TODAY';
  if (key(d) === key(new Date(Date.now() - 86_400_000))) return 'YESTERDAY';
  return d.toLocaleDateString('en-IN', {timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric'}).toUpperCase();
};
export const bytes = (value: string | number) => {
  const n = Number(value); if (!n) return null;
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1000))} KB`;
};
export async function openDocument(id: string) {
  const r = await backend.documentUrl(id);
  await Linking.openURL(r.url);
}

export function Header({title, subtitle, right, onBack}: {title: string; subtitle?: string; right?: ReactNode; onBack?: () => void}) {
  const insets = useSafeAreaInsets();
  return <View style={[s.header, {paddingTop: insets.top + 14}]}>
    <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack ?? (() => back())} style={s.backButton}><ChevronLeft size={22} color={tone.ink}/></Pressable>
    <View style={{flex: 1}}><Text style={s.headerTitle} numberOfLines={1}>{title}</Text>{!!subtitle && <Text style={s.headerSub} numberOfLines={1}>{subtitle}</Text>}</View>
    {right}
  </View>;
}
export function Notice({children, tone: kind = 'info', action}: {children: ReactNode; tone?: 'info' | 'error'; action?: {label: string; onPress: () => void}}) {
  return <View style={[s.notice, kind === 'error' && s.noticeError]} accessibilityRole={kind === 'error' ? 'alert' : undefined}>
    <Text style={[s.noticeText, kind === 'error' && {color: tone.danger}]}>{children}</Text>
    {action && <Pressable accessibilityRole="button" onPress={action.onPress}><Text style={s.noticeAction}>{action.label}</Text></Pressable>}
  </View>;
}
export function Loading({label}: {label: string}) {
  return <View style={s.loading} accessibilityRole="progressbar" accessibilityLabel={label}><ActivityIndicator color={tone.brandDark}/><Text style={s.muted}>{label}</Text></View>;
}
export function PrimaryButton({title, onPress, disabled, busy}: {title: string; onPress: () => void; disabled?: boolean; busy?: boolean}) {
  return <Pressable accessibilityRole="button" accessibilityState={{disabled: !!disabled || !!busy}} disabled={disabled || busy} onPress={onPress} style={[s.primary, (disabled || busy) && {opacity: 0.55}]}>
    <Text style={s.primaryText}>{busy ? 'Please wait…' : title}</Text>
  </Pressable>;
}
export function SecondaryButton({title, onPress}: {title: string; onPress: () => void}) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={s.secondary}><Text style={s.secondaryText}>{title}</Text></Pressable>;
}
export function DocumentCard({filename, size, mime, onView, action = 'View'}: {filename: string; size?: string | null; mime?: string; onView: () => void; action?: string}) {
  const type = mime === 'application/pdf' ? 'PDF Document' : mime?.startsWith('image/') ? 'Image' : 'Document';
  return <View style={s.docCard}>
    <View style={s.docIcon}><FileText size={20} color={tone.brandDark}/></View>
    <View style={{flex: 1}}><Text style={s.docName} numberOfLines={1}>{filename}</Text><Text style={s.muted}>{[size, type].filter(Boolean).join(' · ')}</Text></View>
    <Pressable accessibilityRole="button" accessibilityLabel={`${action} ${filename}`} onPress={onView} style={s.docView}><Text style={s.docViewText}>{action}</Text></Pressable>
  </View>;
}
export function Chip({label, active, onPress}: {label: string; active: boolean; onPress: () => void}) {
  return <Pressable accessibilityRole="button" accessibilityState={{selected: active}} onPress={onPress} style={[s.chip, active && s.chipActive]}><Text style={[s.chipText, active && {color: '#fff'}]}>{label}</Text></Pressable>;
}

export const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: tone.bg},
  content: {padding: 20, paddingBottom: 48, gap: 14},
  header: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingBottom: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: tone.line},
  backButton: {width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: tone.line, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'},
  headerTitle: {fontFamily: font.appHeading, fontSize: 19, color: tone.ink},
  headerSub: {fontFamily: font.appBody, fontSize: 13, color: tone.muted, marginTop: 2},
  h1: {fontFamily: font.appHeading, fontSize: 30, color: tone.ink},
  h2: {fontFamily: font.appHeading, fontSize: 22, color: tone.ink},
  label: {fontFamily: font.appSemi, fontSize: 13, letterSpacing: 1, color: tone.body, textTransform: 'uppercase'},
  body: {fontFamily: font.appBody, fontSize: 15, lineHeight: 22, color: tone.body},
  muted: {fontFamily: font.appBody, fontSize: 13, color: tone.muted},
  card: {backgroundColor: tone.card, borderRadius: 18, borderWidth: 1, borderColor: tone.line, padding: 18, gap: 8},
  input: {backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: tone.line, paddingHorizontal: 16, paddingVertical: 14, fontFamily: font.appBody, fontSize: 15, color: tone.ink},
  notice: {backgroundColor: '#F4EFE8', borderRadius: 14, padding: 14, gap: 6, borderWidth: 1, borderColor: tone.line},
  noticeError: {backgroundColor: '#FCEFED', borderColor: '#F2C9C3'},
  noticeText: {fontFamily: font.appBody, fontSize: 14, lineHeight: 20, color: tone.body},
  noticeAction: {fontFamily: font.appSemi, fontSize: 14, color: tone.brandDark},
  loading: {padding: 32, alignItems: 'center', gap: 10},
  primary: {backgroundColor: '#8E7A60', borderRadius: 16, paddingVertical: 17, alignItems: 'center'},
  primaryText: {fontFamily: font.appSemi, fontSize: 17, color: '#fff'},
  secondary: {borderRadius: 16, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: tone.brand, backgroundColor: '#fff'},
  secondaryText: {fontFamily: font.appSemi, fontSize: 16, color: tone.brandDark},
  docCard: {flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: tone.line, padding: 14},
  docIcon: {width: 44, height: 44, borderRadius: 12, backgroundColor: tone.chip, alignItems: 'center', justifyContent: 'center'},
  docName: {fontFamily: font.appSemi, fontSize: 15, color: tone.ink},
  docView: {backgroundColor: tone.chip, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 9},
  docViewText: {fontFamily: font.appSemi, fontSize: 14, color: tone.brandDark},
  chip: {paddingHorizontal: 18, paddingVertical: 10, borderRadius: 22, backgroundColor: tone.chip},
  chipActive: {backgroundColor: tone.brand},
  chipText: {fontFamily: font.appSemi, fontSize: 14, color: tone.body},
});
export {colors};
