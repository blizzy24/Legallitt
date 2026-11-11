import {router} from 'expo-router';
import {KeyRound, LogOut, Mail, Monitor, Smartphone} from 'lucide-react-native';
import {useState} from 'react';
import {Text, View} from 'react-native';
import ConfirmModal from '../../components/ConfirmModal';
import {useSession} from '../../context/session';
import {backend} from '../../lib/auth';
import {accessToken} from '../../features/account/token';
import {Body, Card, Divider, ErrorState, Loading, Pill, Row, Screen, SectionLabel, errorText, s, useLoad} from '../../features/account/ui';

function mask(phone: string) {return phone.length > 6 ? phone.slice(0, 5) + 'X'.repeat(Math.max(0, phone.length - 7)) + phone.slice(-2) : phone;}

// Login & Security (profile-15; older 64). D-21: real verified states; Google sign-in
// "Not available yet"; Two-Step Verification and Login Alerts omitted until built.
export default function LoginSecurityScreen() {
  const data = useLoad(() => backend.accountSecurity());
  const {signOut} = useSession();
  const [confirming, setConfirming] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const everywhere = async () => {
    setBusy(true); setError('');
    try { await backend.signOutEverywhere(await accessToken()); setConfirming(false); signOut(); }
    catch (e) { setConfirming(false); setError(errorText(e, 'Couldn’t sign out of your devices. Try again.')); }
    finally { setBusy(false); }
  };
  const d = data.data;
  return <Screen title="Login & Security" fallback="/privacy">
    <Body muted>Manage how you sign in.</Body>
    {data.loading ? <Loading label="Loading your sign-in details…"/> : data.error || !d ? <ErrorState message={`Couldn’t load your sign-in details. ${data.error}`} retry={data.reload}/> : <>
      {(d.email || d.phone) && <><SectionLabel>LOGIN</SectionLabel>
        <Card>
          {d.email && <Row icon={Mail} title={d.email} subtitle="Your login email" badge={d.email_verified ? 'Verified' : undefined}/>}
          {d.email && d.phone && <Divider/>}
          {d.phone && <Row icon={Smartphone} title={mask(d.phone)} subtitle="Mobile number on your account" badge={d.phone_verified ? 'Verified' : undefined}/>}
        </Card></>}
      <SectionLabel>SIGN-IN METHODS</SectionLabel>
      <Card>
        <Row icon={KeyRound} title="Password" subtitle={d.password_change === 'one_time_code' ? 'You sign in with a one-time code' : d.password_change === 'demo_managed' ? 'Demo account — managed by Legalitt' : 'Change your account password'}
          onPress={() => router.push('/account/password')}/>
        <Divider/>
        <Row title="Google" subtitle="Google sign-in" right={<Pill tone="muted">Not available yet</Pill>}/>
      </Card>
      <SectionLabel>SECURITY ACTIVITY</SectionLabel>
      <Card>
        <Row icon={Monitor} title="Active Sessions" subtitle="Recent sign-ins to your account" onPress={() => router.push('/account/sessions')}/>
      </Card>
      {!!error && <ErrorState message={error}/>}
      <Card>
        <Row icon={LogOut} title="Sign Out of All Devices" subtitle="Sign out everywhere, including this device" onPress={() => setConfirming(true)}/>
      </Card>
      <View style={s.note}><Text style={s.noteText}>This signs your account out of every device where it’s signed in, including this one. You’ll need to sign in again.</Text></View>
    </>}
    <ConfirmModal visible={confirming} icon={LogOut} tone="danger" title="Sign out of all devices?" confirmLabel={busy ? 'Signing out…' : 'Sign Out Everywhere'}
      body="Every device signed in to your account, including this one, will be signed out. This can’t be undone; you’ll need to sign in again."
      onConfirm={() => {if (!busy) void everywhere();}} onCancel={() => setConfirming(false)}/>
  </Screen>;
}
