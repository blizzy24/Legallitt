import {router} from 'expo-router';
import {Check, KeyRound} from 'lucide-react-native';
import {useState} from 'react';
import {Text, View} from 'react-native';
import {backend} from '../../lib/auth';
import {accessToken} from '../../features/account/token';
import {Body, Button, Card, Empty, ErrorState, Field, Loading, Note, Screen, SectionLabel, errorText, ink, s, useLoad} from '../../features/account/ui';

// Change Password (profile-14; older 63). D-21: Cognito password change for password
// accounts; one-time-code and demo accounts are told why there is nothing to change.
export default function ChangePasswordScreen() {
  const security = useLoad(() => backend.accountSecurity());
  const [current, setCurrent] = useState(''), [next, setNext] = useState(''), [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState(false);
  const length = next.length >= 8, mix = /[A-Za-z]/.test(next) && /\d/.test(next), match = !!next && next === confirm;
  const submit = async () => {
    setBusy(true); setError('');
    try { await backend.changePassword(current, next, await accessToken()); setDone(true); setCurrent(''); setNext(''); setConfirm(''); }
    catch (e) { setError(errorText(e, 'Your password couldn’t be changed. Try again.')); }
    finally { setBusy(false); }
  };
  return <Screen title="Change Password" fallback="/privacy">
    {security.loading ? <Loading label="Checking how you sign in…"/> : security.error ? <ErrorState message={`Couldn’t load your sign-in details. ${security.error}`} retry={security.reload}/>
    : security.data?.password_change === 'one_time_code' ? <Empty icon={KeyRound} title="You sign in with a one-time code" body="Your account uses a one-time code instead of a password, so there is no password to change."/>
    : security.data?.password_change === 'demo_managed' ? <Empty icon={KeyRound} title="Demo account" body="This demonstration account’s password is managed by Legalitt and can’t be changed in the app."/>
    : done ? <Empty icon={Check} title="Password updated" body="Use your new password the next time you sign in." action={<Button title="Back to Privacy & Security" onPress={() => router.replace('/privacy')}/>}/>
    : <>
      <Body muted>Create a new password for your Legalitt account.</Body>
      <Field label="Current Password" value={current} onChange={setCurrent} secure placeholder="Enter your current password"/>
      <Field label="New Password" value={next} onChange={setNext} secure placeholder="Enter your new password"/>
      <Field label="Confirm New Password" value={confirm} onChange={setConfirm} secure placeholder="Enter your new password again"
        error={confirm && !match ? 'The two new passwords don’t match.' : undefined}/>
      <Card>
        <SectionLabel>PASSWORD REQUIREMENTS</SectionLabel>
        {[[length, 'At least 8 characters'], [mix, 'Use letters and numbers']].map(([ok, label]) =>
          <View key={String(label)} style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}><Check size={16} color={ok ? ink.green : '#C9C1B6'}/><Text style={s.body}>{label as string}</Text></View>)}
      </Card>
      {!!error && <ErrorState message={error}/>}
      <Button title={busy ? 'Updating…' : 'Update Password'} disabled={busy || !current || !length || !mix || !match} onPress={() => void submit()}/>
      {(!current || !length || !mix || !match) && <Note>Enter your current password and a new password that meets both requirements to continue.</Note>}
      <Note>Forgot your current password? Password reset isn’t available in the app yet — contact Legalitt Support from Help & Support.</Note>
    </>}
  </Screen>;
}
