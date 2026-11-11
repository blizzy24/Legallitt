import {router} from 'expo-router';
import {LogIn, Monitor} from 'lucide-react-native';
import {backend} from '../../lib/auth';
import {Button, Card, Divider, Empty, ErrorState, Loading, Note, Row, Screen, SectionLabel, useLoad} from '../../features/account/ui';

// Active Sessions (profile-16; older 65). D-21: recent successful sign-ins from
// auth_events — method and time, the device type only where it was recorded.
// Location is omitted (it would be a guess from an IP address); per-device sign-out
// is omitted (Cognito can't target a single device without device tracking).
export default function ActiveSessionsScreen() {
  const data = useLoad(() => backend.accountSecurity());
  const sessions = data.data?.sessions ?? [];
  return <Screen title="Active Sessions" subtitle="Recent sign-ins to your account" fallback="/privacy">
    {data.loading ? <Loading label="Loading recent sign-ins…"/> : data.error ? <ErrorState message={`Couldn’t load your sign-ins. ${data.error}`} retry={data.reload}/>
    : !sessions.length ? <Empty icon={Monitor} title="No sign-ins recorded yet" body="Sign-ins made from now on appear here with their time and method."/> : <>
      <SectionLabel meta={`${sessions.length} recent`}>SIGN-INS</SectionLabel>
      <Card>
        {sessions.map((x, i) => <Row key={x.id} icon={i === 0 ? Monitor : LogIn}
          title={x.device ?? (x.method === 'one_time_code' ? 'Signed in with one-time code' : 'Signed in with password')}
          subtitle={[x.device ? (x.method === 'one_time_code' ? 'One-time code' : 'Password') : null, new Date(x.at).toLocaleString('en-IN', {dateStyle: 'medium', timeStyle: 'short'})].filter(Boolean).join(' · ')}
          badge={i === 0 ? 'Latest' : undefined}/>).flatMap((row, i) => i ? [<Divider key={`d${i}`}/>, row] : [row])}
      </Card>
      <Note>Don’t recognise a sign-in? Change your password, then sign out of all devices.</Note>
      <Button title="Sign Out of All Devices" variant="secondary" onPress={() => router.push('/account/security')}/>
    </>}
  </Screen>;
}
