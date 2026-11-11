import {Check, Circle} from 'lucide-react-native';
import {useState} from 'react';
import {LANGUAGES} from '@legalitt/shared';
import PreviewStep from '../components/PreviewStep';
import {backend} from '../lib/auth';
import {DATA_SOURCE} from '../lib/data-source';
import {Body, Card, Divider, ErrorState, Loading, Note, Pill, Row, Screen, SectionLabel, errorText, ink, useLoad} from '../features/account/ui';

// Language (profile-12; older 61). D-22: English is the only translated language.
// The others appear as drawn, disabled, "Coming soon". The choice is stored.
export default function LanguageScreen() {
  const prefs = useLoad(() => DATA_SOURCE === 'api' ? backend.accountPreferences() : Promise.resolve(null));
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  if (DATA_SOURCE !== 'api') return <PreviewStep header="Language" service="Language"/>;
  const choose = async (code: string) => {
    setBusy(true); setError('');
    try { prefs.setData(await backend.updateAccountPreferences({language: code})); }
    catch (e) { setError(errorText(e, 'Your language couldn’t be saved. Try again.')); }
    finally { setBusy(false); }
  };
  return <Screen title="Language">
    <Body muted>Choose the language for the Legalitt app.</Body>
    {prefs.loading ? <Loading label="Loading your language…"/> : prefs.error ? <ErrorState message={`Couldn’t load your language. ${prefs.error}`} retry={prefs.reload}/> : <>
      <SectionLabel>APP LANGUAGE</SectionLabel>
      <Card>
        {LANGUAGES.map((l, i) => {
          const selected = prefs.data?.language === l.code;
          return [i ? <Divider key={`d${l.code}`}/> : null,
            <Row key={l.code} title={l.label} subtitle={l.native !== l.label ? l.native : undefined} disabled={!l.available || busy}
              onPress={l.available && !selected ? () => void choose(l.code) : undefined}
              right={!l.available ? <Pill tone="muted">Coming soon</Pill> : selected ? <Check size={20} color={ink.brown}/> : <Circle size={20} color="#C9C1B6"/>}/>];
        })}
      </Card>
      {!!error && <ErrorState message={error}/>}
      <Note>Hindi, Marathi, Gujarati, Bengali, Tamil and Telugu are being prepared. Your choice of English is saved to your account.</Note>
    </>}
  </Screen>;
}
