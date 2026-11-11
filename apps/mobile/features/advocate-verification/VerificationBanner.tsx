import {useEffect, useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {router, type Href} from 'expo-router';
import {ShieldCheck} from 'lucide-react-native';
import type {VerificationState} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {DATA_SOURCE} from '../../lib/data-source';
import {ink} from '../account/ui';

const COPY: Record<VerificationState['status'], [string, string, string] | null> = {
  not_started: ['Verify your profile', 'Complete verification to be assigned cases and booked for consultations.', 'Start verification'],
  needs_update: ['Legalitt needs an update', 'Update your verification and submit it again.', 'Update verification'],
  rejected: ['Verification not approved', 'See the reason and submit again with corrected details.', 'View details'],
  in_review: ['Verification under review', "You'll be notified in the app when there's a decision.", 'View status'],
  approved: null,
};

/** D-35 entry point on the advocate dashboard. Hidden once approved. */
export default function VerificationBanner() {
  const [state, setState] = useState<VerificationState['status'] | null>(null), [failed, setFailed] = useState(false), [n, setN] = useState(0);
  useEffect(() => {
    if (DATA_SOURCE !== 'api') return;
    let alive = true; setFailed(false);
    backend.verification().then(r => alive && setState(r.status)).catch(() => alive && setFailed(true));
    return () => { alive = false; };
  }, [n]);
  if (DATA_SOURCE !== 'api') return null;
  const box = {backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: ink.border, padding: 16, marginBottom: 16, gap: 6} as const;
  if (failed) return <View style={box}><Text accessibilityRole="alert" style={{color: ink.danger}}>Your verification status could not be loaded.</Text>
    <Pressable accessibilityRole="button" onPress={() => setN(x => x + 1)}><Text style={{color: ink.accent, fontWeight: '600'}}>Retry</Text></Pressable></View>;
  const copy = state ? COPY[state] : null;
  if (!copy) return null;
  return <Pressable accessibilityRole="button" accessibilityLabel={copy[2]} onPress={() => router.push('/advocate/verify/intro' as Href)} style={box}>
    <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}><ShieldCheck size={20} color={ink.brown}/><Text style={{fontWeight: '700', color: ink.title, fontSize: 15}}>{copy[0]}</Text></View>
    <Text style={{color: ink.muted, lineHeight: 20}}>{copy[1]}</Text>
    <Text style={{color: ink.accent, fontWeight: '600'}}>{copy[2]} →</Text>
  </Pressable>;
}
