import {Heart} from 'lucide-react-native';
import {useEffect, useState} from 'react';
import {Pressable, Text} from 'react-native';
import {backend} from '../../lib/auth';
import {ink} from './ui';

// D-27: saved advocates. One small shared cache so every heart agrees.
let cache: Set<string> | null = null;
let loading: Promise<Set<string>> | null = null;
const listeners = new Set<() => void>();
export function savedIds() {
  if (cache) return Promise.resolve(cache);
  loading ??= backend.savedAdvocates().then(r => (cache = new Set(r.items.map(i => i.id)))).finally(() => {loading = null;});
  return loading;
}
export function forgetSaved() {cache = null;}

/** "Book Consultation" from Saved Advocates hands the advocate to the booking step. */
let preferred: string | null = null;
export const preferAdvocate = (id: string) => {preferred = id;};
export const preferredAdvocate = () => preferred;
export const clearPreferredAdvocate = () => {preferred = null;};

export function SaveHeart({advocateId, name}: {advocateId: string; name: string}) {
  const [saved, setSaved] = useState<boolean | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    const sync = () => {if (alive && cache) setSaved(cache.has(advocateId));};
    listeners.add(sync);
    savedIds().then(sync).catch(() => {if (alive) setSaved(false);});
    return () => {alive = false; listeners.delete(sync);};
  }, [advocateId]);
  const toggle = async () => {
    if (busy || saved === null) return;
    setBusy(true); setError('');
    try {
      if (saved) await backend.unsaveAdvocate(advocateId); else await backend.saveAdvocate(advocateId);
      const ids = await savedIds(); if (saved) ids.delete(advocateId); else ids.add(advocateId);
      listeners.forEach(l => l());
    } catch { setError(saved ? 'Couldn’t remove. Try again.' : 'Couldn’t save. Try again.'); }
    finally { setBusy(false); }
  };
  return <Pressable accessibilityRole="button" accessibilityLabel={saved ? `Remove ${name} from saved advocates` : `Save ${name}`}
    accessibilityState={{selected: !!saved, disabled: busy || saved === null}} onPress={() => void toggle()} hitSlop={8}
    style={{flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4}}>
    <Heart size={20} color={ink.brown} fill={saved ? ink.brown : 'transparent'}/>
    <Text style={{fontSize: 13, color: error ? '#A12B25' : ink.muted}}>{error || (saved ? 'Saved' : 'Save advocate')}</Text>
  </Pressable>;
}
