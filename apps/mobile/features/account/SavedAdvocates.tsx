import {router} from 'expo-router';
import {Heart, MapPin, Search} from 'lucide-react-native';
import {useEffect, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {formatPaise, type SavedAdvocate} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {Button, Card, Empty, ErrorState, Loading, Pill, Screen, SectionLabel, errorText, ink, s, useLoad} from './ui';
import {forgetSaved, preferAdvocate} from './saved';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const initials = (name: string) => name.replace(/^Adv\.?\s+/i, '').split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
function availability(days: number[]) {
  if (!days.length) return null;
  const today = new Date(Date.now() + 330 * 60_000).getUTCDay();
  if (days.includes(today)) return 'Hours today';
  return `Hours: ${days.map(d => DAYS[d]).join(', ')}`;
}

// Saved Advocates (profile-6; older 55). D-27 with D-02: only data the database
// holds — no invented ratings, presence dots or "Available Today" claims beyond
// the advocate's published weekly hours. Price is the confirmed consultation total.
export default function SavedAdvocatesScreen() {
  const list = useLoad(() => {forgetSaved(); return backend.savedAdvocates();});
  const [items, setItems] = useState<SavedAdvocate[]>([]), [error, setError] = useState(''), [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {if (list.data) setItems(list.data.items);}, [list.data]);
  const remove = async (a: SavedAdvocate) => {
    setBusy(a.id); setError('');
    try { await backend.unsaveAdvocate(a.id); forgetSaved(); setItems(x => x.filter(i => i.id !== a.id)); }
    catch (e) { setError(errorText(e, `Couldn’t remove ${a.name}. Try again.`)); }
    finally { setBusy(null); }
  };
  const book = (id: string) => {preferAdvocate(id); router.push('/legal-advice');};
  return <Screen title="Saved Advocates" subtitle="Your saved advocates">
    {list.loading ? <Loading label="Loading saved advocates…"/> : list.error ? <ErrorState message={`Couldn’t load saved advocates. ${list.error}`} retry={list.reload}/>
    : !items.length ? <Empty icon={Heart} title="No Saved Advocates" body="Save advocates you may want to contact later." action={<Button title="Find Advocates" icon={Search} onPress={() => router.push('/legal-advice')}/>}/> : <>
      <SectionLabel meta={`${items.length} saved`}>SAVED COUNSEL</SectionLabel>
      {!!error && <ErrorState message={error}/>}
      {items.map(a => {
        const hours = availability(a.available_days), place = [a.city, a.state].filter(Boolean).join(', ');
        return <Card key={a.id}>
          <View style={{flexDirection: 'row', gap: 14}}>
            <View style={{width: 56, height: 56, borderRadius: 28, backgroundColor: ink.chip, alignItems: 'center', justifyContent: 'center'}}><Text style={[s.rowTitle, {color: ink.brown}]}>{initials(a.name)}</Text></View>
            <View style={{flex: 1, gap: 4}}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}><Text style={s.rowTitle}>{a.name}</Text>{a.verified && <Pill tone="green">Approved by Legalitt</Pill>}</View>
              {!!a.practice_areas.length && <Text style={s.rowSub}>{a.practice_areas.join(' · ')}</Text>}
              {!!place && <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}><MapPin size={14} color={ink.muted}/><Text style={s.rowSub}>{place}</Text></View>}
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${a.name} from saved advocates`} disabled={busy === a.id} onPress={() => void remove(a)}
              style={{width: 40, height: 40, borderRadius: 20, backgroundColor: ink.chip, alignItems: 'center', justifyContent: 'center', opacity: busy === a.id ? .5 : 1}}>
              <Heart size={18} color={ink.brown} fill={ink.brown}/></Pressable>
          </View>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, borderTopWidth: 1, borderTopColor: ink.border, paddingTop: 12}}>
            {a.consultation_total_paise ? <Text style={s.body}>Consultation: <Text style={s.rowTitle}>{formatPaise(a.consultation_total_paise).replace(/\.00$/, '')}</Text> / 30 min</Text> : <Text style={s.rowSub}>Consultation fee shown when you book</Text>}
            {hours ? <Pill tone={hours === 'Hours today' ? 'green' : 'neutral'}>{hours}</Pill> : <Pill tone="muted">No hours published</Pill>}
          </View>
          <Button title="Book Consultation" onPress={() => book(a.id)} disabled={!a.available_days.length}/>
          {!a.available_days.length && <Text style={s.rowSub}>This advocate hasn’t published consultation hours yet.</Text>}
        </Card>;
      })}
    </>}
  </Screen>;
}
