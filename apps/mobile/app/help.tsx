import {router, useLocalSearchParams} from 'expo-router';
import {ChevronDown, ChevronUp, Headset, Search} from 'lucide-react-native';
import {useState} from 'react';
import {Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {font} from '../constants/theme';
import {FAQS, FAQ_CATEGORIES, SUPPORT_HOURS, type Faq} from '../features/account/faq';
import {Button, Card, Empty, Screen, SectionLabel, ink, s} from '../features/account/ui';

/** The FIR Draft topic: questions that mention FIR (FirShell's (?) opens /help?topic=fir, flow C4). */
const FIR_TOPIC = 'FIR Draft' as const;
const aboutFir = (f: Faq) => /\bFIR\b/.test(f.q + ' ' + f.a);
type Filter = 'All' | Faq['category'] | typeof FIR_TOPIC;

// Help Center (profile-20; older 69). D-25: searchable FAQs whose answers describe
// what the app actually does. The drawn "Confidential Legal Assistance" footer is omitted (D-01).
// Opened with ?topic=fir (the FIR steps' (?) button), it starts on the FIR questions,
// the first one expanded; a "FIR Draft" chip shows the filter and "All FAQs" clears it.
export default function HelpCenterScreen() {
  const {topic} = useLocalSearchParams<{topic?: string}>();
  const fir = topic === 'fir';
  const [query, setQuery] = useState(''), [category, setCategory] = useState<Filter>(fir ? FIR_TOPIC : 'All');
  const [open, setOpen] = useState<string | null>(() => (fir ? (FAQS.find(f => /\bFIR\b/.test(f.q)) ?? FAQS.find(aboutFir)) : FAQS[0])?.q ?? null);
  const q = query.trim().toLowerCase();
  const inFilter = (f: Faq) => category === 'All' || (category === FIR_TOPIC ? aboutFir(f) : f.category === category);
  const rows = FAQS.filter(f => inFilter(f) && (!q || (f.q + ' ' + f.a).toLowerCase().includes(q)));
  const chips: Filter[] = ['All', ...(fir ? [FIR_TOPIC] : []), ...FAQ_CATEGORIES];
  return <Screen title="Help Center" subtitle="Support & FAQs">
    <View style={[s.input, {flexDirection: 'row', alignItems: 'center', gap: 10}]}>
      <Search size={18} color={ink.brown}/>
      <TextInput accessibilityLabel="Search help" value={query} onChangeText={setQuery} placeholder="How can we help?" placeholderTextColor="#A39B92"
        style={{flex: 1, fontFamily: font.appBody, fontSize: 15, minHeight: 46}}/>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap: 8}}>
      {chips.map(c => <Pressable key={c} accessibilityRole="button" accessibilityState={{selected: c === category}} onPress={() => setCategory(c)}
        style={{paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1, borderColor: ink.border, backgroundColor: c === category ? ink.chip : '#fff'}}>
        <Text style={{fontFamily: font.appBody, fontSize: 14, color: c === category ? ink.accent : '#3D3832'}}>{c === 'All' ? 'All FAQs' : c}</Text></Pressable>)}
    </ScrollView>
    <SectionLabel meta={`${rows.length} ${rows.length === 1 ? 'Topic' : 'Topics'}`}>FREQUENTLY ASKED QUESTIONS</SectionLabel>
    {!rows.length ? <Empty icon={Search} title="No matching questions" body="Try different words, or contact Legalitt Support and we’ll help." action={<Button title="Clear search" variant="secondary" onPress={() => {setQuery(''); setCategory('All');}}/>}/>
    : rows.map(f => {
      const expanded = open === f.q;
      return <Card key={f.q}>
        <Pressable accessibilityRole="button" accessibilityState={{expanded}} onPress={() => setOpen(expanded ? null : f.q)} style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
          <View style={{flex: 1, gap: 8}}><Text style={[s.pill, {alignSelf: 'flex-start'}]}>{f.category.toUpperCase()}</Text><Text style={s.rowTitle}>{f.q}</Text></View>
          {expanded ? <ChevronUp size={20} color={ink.brown}/> : <ChevronDown size={20} color={ink.brown}/>}
        </Pressable>
        {expanded && <Text style={[s.body, {color: ink.muted}]}>{f.a}</Text>}
      </Card>;
    })}
    <Card>
      <View style={{flexDirection: 'row', gap: 12}}><View style={s.rowIcon}><Headset size={18} color={ink.brown}/></View>
        <View style={{flex: 1}}><Text style={s.rowTitle}>Need More Help?</Text><Text style={s.rowSub}>Legalitt Support is available {SUPPORT_HOURS}.</Text></View></View>
      <Button title="Contact Support" onPress={() => router.push('/support')}/>
    </Card>
  </Screen>;
}
