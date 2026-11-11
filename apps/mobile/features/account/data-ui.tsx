import {router} from 'expo-router';
import {ChevronLeft, ChevronRight, type LucideIcon} from 'lucide-react-native';
import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import {ActivityIndicator, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, font} from '../../constants/theme';

// Account area (D-15–D-19) building blocks in the existing cream/brown language.

export function useLoad<T>(load: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const token = useRef(0);
  const reload = useCallback(() => {
    const mine = ++token.current; setLoading(true); setError('');
    load().then(v => { if (mine === token.current) setData(v); })
      .catch(e => { if (mine === token.current) setError(e instanceof Error ? e.message : 'Something went wrong.'); })
      .finally(() => { if (mine === token.current) setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => { reload(); return () => { token.current++; }; }, [reload]);
  return {data, error, loading, reload, setData};
}

export function back(fallback: string) {
  if (router.canGoBack()) router.back(); else router.replace(fallback as never);
}

export function Screen({title, subtitle, fallback, right, children, footer}: {title: string; subtitle?: string; fallback: string; right?: ReactNode; children: ReactNode; footer?: ReactNode}) {
  const insets = useSafeAreaInsets();
  return <View style={s.screen}>
    <View style={[s.header, {paddingTop: insets.top + 12}]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={() => back(fallback)} style={s.round}><ChevronLeft size={22} color={colors.textPrimary}/></Pressable>
      <View style={s.headerText}><Text style={s.title} numberOfLines={1}>{title}</Text>{!!subtitle && <Text style={s.subtitle} numberOfLines={1}>{subtitle}</Text>}</View>
      <View style={s.headerRight}>{right}</View>
    </View>
    <ScrollView contentContainerStyle={[s.content, {paddingBottom: insets.bottom + 40}]} keyboardShouldPersistTaps="handled">{children}</ScrollView>
    {footer && <View style={[s.footer, {paddingBottom: insets.bottom + 14}]}>{footer}</View>}
  </View>;
}

export function Card({children, style}: {children: ReactNode; style?: object}) { return <View style={[s.card, style]}>{children}</View>; }
export function SectionLabel({children, right}: {children: string; right?: ReactNode}) {
  return <View style={s.sectionRow}><Text style={s.section}>{children}</Text>{right}</View>;
}
export function IconChip({icon: Icon}: {icon: LucideIcon}) { return <View style={s.iconChip}><Icon size={20} color={colors.brandDark}/></View>; }
export function Pill({label, tone = 'neutral'}: {label: string; tone?: 'neutral' | 'good' | 'warn' | 'bad'}) {
  const c = {neutral: ['#F3EEE8', colors.brandDark], good: ['#E7F6EE', '#16794A'], warn: ['#FBEFD9', '#9A6A12'], bad: ['#FBE7E4', '#A33A2A']}[tone];
  return <View style={[s.pill, {backgroundColor: c[0]}]}><View style={[s.dot, {backgroundColor: c[1]}]}/><Text style={[s.pillText, {color: c[1]}]}>{label}</Text></View>;
}
/** A row whose value is missing takes its label with it (§1a). */
export function Row({icon: Icon, label, value, chip}: {icon?: LucideIcon; label: string; value?: string | null; chip?: boolean}) {
  if (!value) return null;
  return <View style={s.row}>{Icon && <Icon size={17} color={colors.textBody}/>}<Text style={s.rowLabel}>{label}</Text>
    {chip ? <View style={s.valueChip}><Text style={s.valueChipText}>{value}</Text></View> : <Text style={s.rowValue}>{value}</Text>}</View>;
}
export function Filters<T extends string>({options, value, onChange}: {options: {id: T; label: string; count?: number}[]; value: T; onChange(v: T): void}) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 10, paddingVertical: 4}}>
    {options.map(o => { const on = o.id === value; return <Pressable key={o.id} accessibilityRole="tab" accessibilityState={{selected: on}} onPress={() => onChange(o.id)} style={[s.filter, on && s.filterOn]}>
      <Text style={[s.filterText, on && s.filterTextOn]}>{o.label}</Text>{o.count !== undefined && <View style={[s.count, on && s.countOn]}><Text style={[s.countText, on && s.filterTextOn]}>{o.count}</Text></View>}
    </Pressable>; })}
  </ScrollView>;
}
export function Button({title, onPress, disabled, variant = 'primary', icon: Icon}: {title: string; onPress(): void; disabled?: boolean; variant?: 'primary' | 'dark' | 'quiet' | 'danger'; icon?: LucideIcon}) {
  const style = {primary: s.btn, dark: [s.btn, {backgroundColor: '#6B5843'}], quiet: [s.btn, s.btnQuiet], danger: [s.btn, s.btnQuiet]}[variant];
  const color = variant === 'quiet' ? colors.textPrimary : variant === 'danger' ? '#B3261E' : '#fff';
  return <Pressable accessibilityRole="button" accessibilityState={{disabled: !!disabled}} disabled={disabled} onPress={onPress} style={({pressed}) => [style, (disabled || pressed) && {opacity: disabled ? .5 : .85}]}>
    {Icon && <Icon size={18} color={color}/>}<Text style={[s.btnText, {color}]}>{title}</Text></Pressable>;
}
export function LinkRow({title, sub, onPress}: {title: string; sub?: string; onPress(): void}) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={s.linkRow}><View style={{flex: 1}}><Text style={s.linkTitle}>{title}</Text>{!!sub && <Text style={s.body}>{sub}</Text>}</View><ChevronRight size={18} color={colors.textMuted}/></Pressable>;
}
export function Loading({what}: {what: string}) {
  return <View style={s.state} accessibilityRole="progressbar"><ActivityIndicator color={colors.brandDark}/><Text style={s.body} role="status">Loading {what}…</Text></View>;
}
export function ErrorState({message, retry, what}: {message: string; retry?: () => void; what: string}) {
  return <Card style={s.errorCard}><Text style={s.errorTitle} accessibilityRole="alert">Couldn’t load {what}</Text><Text style={s.body}>{message}</Text>
    <Text style={s.body}>Check your connection and try again.</Text>{retry && <Button title="Retry" onPress={retry}/>}</Card>;
}
export function Empty({icon: Icon, title, body, action}: {icon: LucideIcon; title: string; body: string; action?: {title: string; onPress(): void}}) {
  return <View style={s.empty}><View style={s.emptyIcon}><Icon size={30} color={colors.brandDark}/></View><Text style={s.emptyTitle}>{title}</Text><Text style={[s.body, {textAlign: 'center'}]}>{body}</Text>{action && <Button title={action.title} onPress={action.onPress}/>}</View>;
}
export function Note({children}: {children: ReactNode}) { return <View style={s.note}><Text style={s.body}>{children}</Text></View>; }

export const date = (v?: string | null) => v ? new Date(v).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata'}) : null;
export const dateTime = (v?: string | null) => v ? new Date(v).toLocaleString('en-IN', {day: '2-digit', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata'}) : null;
export const size = (bytes: string | number) => { const n = Number(bytes); return n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`; };

/** Opens/downloads a base64 PDF produced by the API. */
export async function openBase64Pdf(file: {filename: string; pdf_base64: string}) {
  if (Platform.OS === 'web') {
    const bytes = Uint8Array.from(atob(file.pdf_base64), c => c.charCodeAt(0)), url = URL.createObjectURL(new Blob([bytes], {type: 'application/pdf'}));
    const a = document.createElement('a'); a.href = url; a.download = file.filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 60000);
  } else await Linking.openURL(`data:application/pdf;base64,${file.pdf_base64}`);
}

export const s = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.appBg},
  header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.appBg, gap: 12},
  round: {width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center'},
  headerText: {flex: 1, alignItems: 'center'}, headerRight: {minWidth: 44, alignItems: 'flex-end'},
  title: {fontFamily: font.appHeading, fontSize: 20, color: colors.textPrimary}, subtitle: {fontFamily: font.appBody, fontSize: 12, letterSpacing: 1, color: colors.textBody, marginTop: 2},
  content: {padding: 20, gap: 14},
  card: {backgroundColor: colors.card, borderRadius: 18, padding: 18, gap: 10, borderWidth: 1, borderColor: colors.border},
  sectionRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6},
  section: {fontFamily: font.appSemi, fontSize: 13, letterSpacing: 1.2, color: colors.textBody},
  iconChip: {width: 44, height: 44, borderRadius: 12, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center'},
  pill: {flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start'},
  dot: {width: 7, height: 7, borderRadius: 4}, pillText: {fontFamily: font.appSemi, fontSize: 13},
  row: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4},
  rowLabel: {flex: 1, fontFamily: font.appBody, fontSize: 15, color: colors.textBody},
  rowValue: {fontFamily: font.appSemi, fontSize: 15, color: colors.textPrimary, flexShrink: 1, textAlign: 'right'},
  valueChip: {borderWidth: 1, borderColor: colors.border, backgroundColor: '#FAF7F3', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, flexShrink: 1},
  valueChipText: {fontFamily: font.appBody, fontSize: 14, color: colors.textPrimary},
  filter: {flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card},
  filterOn: {backgroundColor: colors.brand, borderColor: colors.brand}, filterText: {fontFamily: font.appSemi, fontSize: 15, color: colors.textBody}, filterTextOn: {color: '#fff'},
  count: {minWidth: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: '#F1ECE6', alignItems: 'center'}, countOn: {backgroundColor: 'rgba(255,255,255,.25)'}, countText: {fontFamily: font.appSemi, fontSize: 12, color: colors.textBody},
  btn: {flexDirection: 'row', gap: 8, backgroundColor: colors.brand, borderRadius: 14, paddingVertical: 15, alignItems: 'center', justifyContent: 'center'},
  btnQuiet: {backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border}, btnText: {fontFamily: font.appSemi, fontSize: 16},
  linkRow: {flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10}, linkTitle: {fontFamily: font.appSemi, fontSize: 15, color: colors.textPrimary},
  body: {fontFamily: font.appBody, fontSize: 14, lineHeight: 21, color: colors.textBody},
  strong: {fontFamily: font.appSemi, fontSize: 16, color: colors.textPrimary},
  heading: {fontFamily: font.appHeading, fontSize: 20, color: colors.textPrimary},
  state: {alignItems: 'center', gap: 10, paddingVertical: 40},
  errorCard: {borderColor: '#F0C9C2', backgroundColor: '#FFF8F6'}, errorTitle: {fontFamily: font.appSemi, fontSize: 16, color: '#A33A2A'},
  empty: {alignItems: 'center', gap: 12, paddingVertical: 36, paddingHorizontal: 10},
  emptyIcon: {width: 72, height: 72, borderRadius: 36, backgroundColor: colors.iconChipBg, alignItems: 'center', justifyContent: 'center'},
  emptyTitle: {fontFamily: font.appHeading, fontSize: 19, color: colors.textPrimary, textAlign: 'center'},
  note: {backgroundColor: '#F3EEE8', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border},
  footer: {paddingHorizontal: 20, paddingTop: 12, backgroundColor: colors.appBg, borderTopWidth: 1, borderTopColor: colors.border, gap: 8},
  divider: {height: 1, backgroundColor: colors.border, marginVertical: 4},
  error: {fontFamily: font.appBody, fontSize: 14, color: '#A33A2A', lineHeight: 20},
});
