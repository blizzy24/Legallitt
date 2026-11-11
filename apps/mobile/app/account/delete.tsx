import {router, type Href} from 'expo-router';
import {CircleAlert, Clock, Trash2} from 'lucide-react-native';
import {useState} from 'react';
import {SERVICE_NAMES, unbuiltCasePath, type ServiceCode} from '@legalitt/shared';
import ConfirmModal from '../../components/ConfirmModal';
import {useSession} from '../../context/session';
import {backend} from '../../lib/auth';
import {accessToken} from '../../features/account/token';
import {Body, Button, Card, Divider, Empty, ErrorState, Field, Loading, Note, Row, Screen, SectionLabel, errorText, useLoad} from '../../features/account/ui';

const caseHref = (service: string, id: string): Href => (service === 'legal_notice' ? `/legal-notice/tracking?caseId=${id}` : unbuiltCasePath(service as ServiceCode, id, 'client')) as Href;

// Delete Account (profile-19; older 68). D-24: a deletion request. The account is
// deactivated at once and signed out everywhere; an admin completes the deletion.
// Blocked while a paid case is active, with the reason and a way to each case.
export default function DeleteAccountScreen() {
  const state = useLoad(() => backend.accountDeletion());
  const {signOut} = useSession();
  const [reason, setReason] = useState(''), [confirming, setConfirming] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const submit = async () => {
    setBusy(true); setError('');
    try { await backend.requestAccountDeletion({...(reason.trim() ? {reason: reason.trim()} : {}), access_token: await accessToken()}); setConfirming(false); signOut(); }
    catch (e) { setConfirming(false); setError(errorText(e, 'Your request couldn’t be sent. Try again.')); state.reload(); }
    finally { setBusy(false); }
  };
  const d = state.data;
  return <Screen title="Delete Account" fallback="/privacy">
    {state.loading ? <Loading label="Checking your account…"/> : state.error || !d ? <ErrorState message={`Couldn’t check your account. ${state.error}`} retry={state.reload}/>
    : d.request?.status === 'pending' ? <Empty icon={Clock} title="Deletion requested" body={`You requested deletion on ${new Date(d.request.created_at).toLocaleDateString('en-IN', {dateStyle: 'medium'})}. Legalitt’s team will complete it.`}/>
    : d.blockers.length ? <>
      <Card style={{borderColor: '#F3D7A8'}}><Row icon={CircleAlert} title="You have a paid case in progress" subtitle="Your account can’t be deleted while paid work is under way. Cancel the case or wait until it completes, then return here."/></Card>
      <SectionLabel meta={`${d.blockers.length}`}>CASES IN PROGRESS</SectionLabel>
      <Card>{d.blockers.map((c, i) => [i ? <Divider key={`d${c.id}`}/> : null,
        <Row key={c.id} title={c.reference} subtitle={SERVICE_NAMES[c.service_code as ServiceCode] ?? c.service_code} onPress={() => router.push(caseHref(c.service_code, c.id))}/>])}</Card>
      <Button title="Contact Support" variant="secondary" onPress={() => router.push('/support')}/>
    </> : <>
      <Card>
        <Row icon={Trash2} danger title="What happens" subtitle="Your account is deactivated immediately and signed out on every device. Legalitt’s team then completes the deletion."/>
      </Card>
      <Body muted>How long records are kept after deletion is being confirmed by Legalitt.</Body>
      <Field label="Reason (optional)" value={reason} onChange={setReason} multiline placeholder="Tell us why you’re leaving"/>
      {!!error && <ErrorState message={error}/>}
      <Button title="Request Account Deletion" variant="danger" onPress={() => setConfirming(true)}/>
      <Note>Changed your mind? Go back — nothing changes until you confirm.</Note>
    </>}
    <ConfirmModal visible={confirming} icon={Trash2} tone="danger" title="Delete your account?" confirmLabel={busy ? 'Sending…' : 'Delete Account'}
      body="Your account will be deactivated now and you’ll be signed out everywhere. You won’t be able to sign in again. This can’t be undone."
      onConfirm={() => {if (!busy) void submit();}} onCancel={() => setConfirming(false)}/>
  </Screen>;
}
