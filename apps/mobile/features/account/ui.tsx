import {router, type Href} from 'expo-router';
import {ChevronLeft, ChevronRight, type LucideIcon} from 'lucide-react-native';
import {useCallback, useEffect, useState, type ReactNode} from 'react';
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, font} from '../../constants/theme';

// Account-area building blocks in the cream-and-brown style of profile-11…26.
export const ink = {bg: '#F8F6F2', card: '#FFFFFF', border: '#ECE6DD', brown: '#8E7A5E', accent: '#9A7B4F', chip: '#F4EEE6',
  muted: '#6B6560', title: '#1F1B16', danger: '#D9534F', dangerBg: '#FDECEA', green: '#1E9E62', greenBg: '#E7F7EF'};

export function goBack(fallback: Href = '/(tabs)/profile') {
  if (router.canGoBack()) router.back(); else router.replace(fallback);
}

export function Screen({title, subtitle, children, right, fallback}: {title: string; subtitle?: string; children: ReactNode; right?: ReactNode; fallback?: Href}) {
  const insets = useSafeAreaInsets();
  return <View style={s.screen}>
    <View style={[s.header, {paddingTop: insets.top + 14}]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => goBack(fallback)} style={s.back}><ChevronLeft size={20} color={ink.title}/></Pressable>
      <View style={{flex: 1}}><Text style={s.title}>{title}</Text>{!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}</View>
      {right}
    </View>
    <ScrollView contentContainerStyle={[s.content, {paddingBottom: insets.bottom + 40}]} keyboardShouldPersistTaps="handled">{children}</ScrollView>
  </View>;
}
export function SectionLabel({children, meta}: {children: string; meta?: string}) {
  return <View style={s.sectionRow}><Text style={s.section}>{children}</Text>{!!meta && <Text style={s.meta}>{meta}</Text>}</View>;
}
export function Card({children, style}: {children: ReactNode; style?: object}) {return <View style={[s.card, style]}>{children}</View>;}
export function Divider() {return <View style={s.divider}/>;}
export function Row({icon: Icon, title, subtitle, onPress, danger, right, badge, disabled}: {icon?: LucideIcon; title: string; subtitle?: string; onPress?: () => void;
  danger?: boolean; right?: ReactNode; badge?: string; disabled?: boolean}) {
  const body = <View style={[s.row, disabled && {opacity: .55}]}>
    {Icon && <View style={[s.rowIcon, danger && {backgroundColor: ink.dangerBg}]}><Icon size={18} color={danger ? ink.danger : ink.brown}/></View>}
    <View style={{flex: 1}}>
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}><Text style={[s.rowTitle, danger && {color: ink.danger}]}>{title}</Text>{!!badge && <Pill>{badge}</Pill>}</View>
      {!!subtitle && <Text style={s.rowSub}>{subtitle}</Text>}
    </View>
    {right ?? (onPress && <ChevronRight size={18} color={danger ? ink.danger : ink.muted}/>)}
  </View>;
  return onPress && !disabled ? <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => pressed && {opacity: .8}}>{body}</Pressable> : body;
}
export function Pill({children, tone = 'neutral'}: {children: string; tone?: 'neutral' | 'green' | 'muted'}) {
  return <Text style={[s.pill, tone === 'green' && {backgroundColor: ink.greenBg, color: ink.green}, tone === 'muted' && {backgroundColor: '#F1EFEC', color: ink.muted}]}>{children}</Text>;
}
export function Button({title, onPress, disabled, variant = 'primary', icon: Icon}: {title: string; onPress: () => void; disabled?: boolean; variant?: 'primary' | 'secondary' | 'danger'; icon?: LucideIcon}) {
  const color = variant === 'secondary' ? ink.title : '#fff';
  return <Pressable accessibilityRole="button" accessibilityState={{disabled: !!disabled}} disabled={disabled} onPress={onPress}
    style={({pressed}) => [s.button, variant === 'secondary' && s.secondary, variant === 'danger' && {backgroundColor: ink.danger}, (disabled || pressed) && {opacity: disabled ? .5 : .85}]}>
    {Icon && <Icon size={17} color={color}/>}<Text style={[s.buttonText, {color}]}>{title}</Text>
  </Pressable>;
}
export function Body({children, muted}: {children: ReactNode; muted?: boolean}) {return <Text style={[s.body, muted && {color: ink.muted, fontSize: 13}]}>{children}</Text>;}
export function Note({children}: {children: ReactNode}) {return <View style={s.note}><Text style={s.noteText}>{children}</Text></View>;}
export function Loading({label}: {label: string}) {return <View style={s.state} accessibilityRole="progressbar"><ActivityIndicator color={ink.brown}/><Text style={s.stateText}>{label}</Text></View>;}
export function ErrorState({message, retry}: {message: string; retry?: () => void}) {
  return <Card style={{borderColor: '#F3C9C5'}}><Text accessibilityRole="alert" style={s.error}>{message}</Text>{retry && <Button title="Try again" variant="secondary" onPress={retry}/>}</Card>;
}
export function Empty({icon: Icon, title, body, action}: {icon: LucideIcon; title: string; body: string; action?: ReactNode}) {
  return <Card style={{alignItems: 'center', paddingVertical: 28}}>
    <View style={s.emptyIcon}><Icon size={26} color={ink.brown}/></View><Text style={s.emptyTitle}>{title}</Text><Text style={[s.body, {textAlign: 'center', color: ink.muted}]}>{body}</Text>{action}
  </Card>;
}
export function Field({label, value, onChange, secure, placeholder, multiline, error}: {label: string; value: string; onChange: (v: string) => void; secure?: boolean; placeholder?: string; multiline?: boolean; error?: string}) {
  return <View style={{gap: 8, marginBottom: 14}}><Text style={s.label}>{label}</Text>
    <TextInput accessibilityLabel={label} value={value} onChangeText={onChange} secureTextEntry={secure} placeholder={placeholder} placeholderTextColor="#A39B92"
      multiline={multiline} autoCapitalize="none" style={[s.input, multiline && {minHeight: 96, textAlignVertical: 'top', paddingTop: 12}, !!error && {borderColor: ink.danger}]}/>
    {!!error && <Text style={s.error}>{error}</Text>}
  </View>;
}

/** One request at a time, with loading, error and reload. */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [n, setN] = useState(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(load, deps);
  useEffect(() => {
    let alive = true; setLoading(true); setError('');
    run().then(v => {if (alive) setData(v);}).catch(e => {if (alive) setError(e instanceof Error ? e.message : 'Something went wrong.');}).finally(() => {if (alive) setLoading(false);});
    return () => {alive = false;};
  }, [run, n]);
  return {data, setData, error, loading, reload: () => setN(x => x + 1)};
}
export const errorText = (e: unknown, fallback: string) => e instanceof Error && e.message ? e.message : fallback;

export const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: ink.bg},
  header: {flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: ink.border},
  back: {width: 42, height: 42, borderRadius: 21, backgroundColor: '#fff', borderWidth: 1, borderColor: ink.border, alignItems: 'center', justifyContent: 'center'},
  title: {fontFamily: font.appHeading, fontSize: 22, color: ink.title}, subtitle: {fontFamily: font.appBody, fontSize: 13, color: ink.muted, marginTop: 2},
  content: {padding: 20, gap: 12},
  sectionRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10},
  section: {fontFamily: font.appSemi, fontSize: 12.5, letterSpacing: 1, color: ink.accent}, meta: {fontFamily: font.appBody, fontSize: 12, color: ink.muted},
  card: {backgroundColor: ink.card, borderRadius: 18, borderWidth: 1, borderColor: ink.border, padding: 16, gap: 12},
  divider: {height: 1, backgroundColor: ink.border, marginHorizontal: -16},
  row: {flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4},
  rowIcon: {width: 40, height: 40, borderRadius: 12, backgroundColor: ink.chip, alignItems: 'center', justifyContent: 'center'},
  rowTitle: {fontFamily: font.appSemi, fontSize: 15.5, color: ink.title}, rowSub: {fontFamily: font.appBody, fontSize: 13, color: ink.muted, marginTop: 3, lineHeight: 19},
  pill: {fontFamily: font.appSemi, fontSize: 11.5, color: ink.accent, backgroundColor: ink.chip, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, overflow: 'hidden'},
  button: {minHeight: 50, borderRadius: 14, backgroundColor: ink.brown, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 16},
  secondary: {backgroundColor: '#fff', borderWidth: 1, borderColor: ink.border},
  buttonText: {fontFamily: font.appSemi, fontSize: 15.5},
  body: {fontFamily: font.appBody, fontSize: 14.5, lineHeight: 22, color: '#3D3832'},
  note: {backgroundColor: '#F1EEE9', borderRadius: 14, padding: 14}, noteText: {fontFamily: font.appBody, fontSize: 13, color: ink.muted, lineHeight: 19},
  state: {alignItems: 'center', paddingVertical: 30, gap: 10}, stateText: {fontFamily: font.appBody, fontSize: 13.5, color: ink.muted},
  error: {fontFamily: font.appBody, fontSize: 13.5, color: '#A12B25', lineHeight: 20},
  emptyIcon: {width: 64, height: 64, borderRadius: 32, backgroundColor: ink.chip, alignItems: 'center', justifyContent: 'center'},
  emptyTitle: {fontFamily: font.appHeading, fontSize: 18, color: ink.title},
  label: {fontFamily: font.appSemi, fontSize: 14, color: ink.title},
  input: {minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: ink.border, backgroundColor: '#fff', paddingHorizontal: 14, fontFamily: font.appBody, fontSize: 15, color: colors.textPrimary},
});
