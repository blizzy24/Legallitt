import {Bell, MessageSquare, Smartphone} from 'lucide-react-native';
import {useState} from 'react';
import {Switch} from 'react-native';
import {NOTIFICATION_CATEGORIES, type NotificationCategory} from '@legalitt/shared';
import {backend} from '../lib/auth';
import {Body, Card, Divider, ErrorState, Loading, Note, Pill, Row, Screen, SectionLabel, errorText, ink, useLoad} from '../features/account/ui';

// Notification Preferences (profile-11's Configure). D-20 / D-70: in-app categories.
// A quieted category still files every notification in your inbox, but it arrives
// already read so it raises no badge. SMS and WhatsApp aren't built (DLT pending).
export default function NotificationPreferencesScreen() {
  const prefs = useLoad(() => backend.accountPreferences());
  const [error, setError] = useState(''), [saving, setSaving] = useState<string | null>(null);
  const toggle = async (code: NotificationCategory, value: boolean) => {
    setSaving(code); setError('');
    try { prefs.setData(await backend.updateAccountPreferences({notifications: {[code]: value}})); }
    catch (e) { setError(errorText(e, 'Your preference couldn’t be saved. Try again.')); }
    finally { setSaving(null); }
  };
  return <Screen title="Notification Preferences" fallback="/notifications">
    <Body muted>Choose which updates alert you in the app.</Body>
    {prefs.loading ? <Loading label="Loading your preferences…"/> : prefs.error || !prefs.data ? <ErrorState message={`Couldn’t load your preferences. ${prefs.error}`} retry={prefs.reload}/> : <>
      <SectionLabel>IN-APP ALERTS</SectionLabel>
      <Card>
        {NOTIFICATION_CATEGORIES.map((c, i) => [i ? <Divider key={`d${c.code}`}/> : null,
          <Row key={c.code} icon={Bell} title={c.label} subtitle={c.description}
            right={<Switch accessibilityLabel={c.label} value={prefs.data!.notifications[c.code]} disabled={saving === c.code}
              onValueChange={v => void toggle(c.code, v)} trackColor={{true: ink.brown, false: '#DDD6CC'}}/>}/>])}
      </Card>
      {!!error && <ErrorState message={error}/>}
      <Note>Turning a category off doesn’t hide anything: those notifications still appear in your inbox, marked as read.</Note>
      <SectionLabel>OTHER CHANNELS</SectionLabel>
      <Card>
        <Row icon={Smartphone} title="SMS" subtitle="Text-message alerts" right={<Pill tone="muted">Not available yet</Pill>}/>
        <Divider/>
        <Row icon={MessageSquare} title="WhatsApp" subtitle="WhatsApp alerts" right={<Pill tone="muted">Not available yet</Pill>}/>
      </Card>
    </>}
  </Screen>;
}
