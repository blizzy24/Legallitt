import {router} from 'expo-router';
import {Download, FileText, Trash2, UserRound} from 'lucide-react-native';
import {useState} from 'react';
import {Platform, Share} from 'react-native';
import {backend} from '../../lib/auth';
import {Body, Card, Divider, ErrorState, Note, Pill, Row, Screen, SectionLabel, errorText} from '../../features/account/ui';

// Data & Documents (profile-18; older 67). D-24: Download My Data is a real export of
// this client's own profile, cases, payments and messages. Deletion is a request.
// The drawn "protected under Legalitt client privacy" footer is omitted (D-01).
export default function DataDocumentsScreen() {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [done, setDone] = useState('');
  const download = async () => {
    setBusy(true); setError(''); setDone('');
    try {
      const data = await backend.exportAccount(), text = JSON.stringify(data, null, 2), name = `legalitt-data-${new Date().toISOString().slice(0, 10)}.json`;
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(new Blob([text], {type: 'application/json'})), a = document.createElement('a');
        a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else await Share.share({title: name, message: text});
      setDone(`Your data was prepared as ${name}.`);
    } catch (e) { setError(errorText(e, 'Your data couldn’t be prepared. Try again.')); }
    finally { setBusy(false); }
  };
  return <Screen title="Data & Documents" fallback="/privacy">
    <Body muted>Your personal information and documents stored in your Legalitt account.</Body>
    <SectionLabel>YOUR DATA</SectionLabel>
    <Card>
      <Row icon={UserRound} title="Personal Information" subtitle="View and edit the information linked to your account" onPress={() => router.push('/profile/edit')}/>
      <Divider/>
      <Row icon={FileText} title="My Documents" subtitle="Documents across your cases" onPress={() => router.push('/documents')}/>
    </Card>
    <SectionLabel>DATA ACTIONS</SectionLabel>
    <Card>
      <Row icon={Download} title="Download My Data" subtitle="A copy of your profile, cases, payments and messages (JSON file)"
        onPress={busy ? undefined : () => void download()} right={busy ? <Pill>Preparing…</Pill> : undefined}/>
      <Divider/>
      <Row icon={Trash2} danger title="Delete Account" subtitle="Request deletion of your Legalitt account" onPress={() => router.push('/account/delete')}/>
    </Card>
    {!!error && <ErrorState message={error} retry={() => void download()}/>}
    {!!done && <Note>{done}</Note>}
    <Note>Documents attached to a case you’ve already submitted can’t be removed from that case. You can remove uploads that aren’t part of a submitted case from My Documents.</Note>
  </Screen>;
}
