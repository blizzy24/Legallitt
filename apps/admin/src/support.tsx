import {useEffect, useState, type FormEvent} from 'react';
import {Link, useNavigate, useParams, useSearchParams} from 'react-router';
import {ApiError, adminCasePath, ServiceCodeSchema, SERVICE_NAMES, type ServiceCode, type SupportAdminTicket, type SupportInboxRow} from '@legalitt/shared';
import {api, useSession} from './session';
import {WaitingAge} from './fir-approval';

const kinds: Record<SupportInboxRow['kind'], string> = {ticket: 'Contact form', callback: 'Callback', chat: 'Support chat'};
const ist = (iso: string) => new Date(iso).toLocaleString('en-IN', {timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'}) + ' IST';
function useRefuse() {
  const {refuse} = useSession();
  return (e: unknown, fallback: string) => {
    if (e instanceof ApiError && [401, 403].includes(e.status)) { refuse(e.status === 403 ? 'Admin access required. Sign in with an admin account.' : 'Your session has expired. Sign in again.'); return ''; }
    return e instanceof Error ? e.message : fallback;
  };
}

/** D-42 Support inbox — built without a design in the panel's existing style. */
export function SupportInbox() {
  const [params, setParams] = useSearchParams(), status = params.get('status') === 'closed' ? 'closed' : 'open';
  const [data, setData] = useState<{items: SupportInboxRow[]; counts: {open: number; closed: number}} | null>(null);
  const [error, setError] = useState(''), [loading, setLoading] = useState(true), [reload, setReload] = useState(0), fail = useRefuse();
  useEffect(() => {
    let alive = true; setLoading(true); setError('');
    api.adminSupport(status).then(r => alive && setData(r)).catch(e => alive && setError(fail(e, 'Unable to load support requests'))).finally(() => alive && setLoading(false));
    const timer = setInterval(() => setReload(n => n + 1), 30000);
    return () => { alive = false; clearInterval(timer); };
  }, [status, reload]);
  return <main className="notices"><div className="page-title"><div><h1>Support inbox</h1><p>Contact requests, callbacks and support chats · unanswered first, oldest first</p></div></div>
    <div className="counters" aria-label="Support status filters">{(['open', 'closed'] as const).map(s => <button key={s} className={'counter ' + (status === s ? 'selected' : '')} aria-pressed={status === s} onClick={() => setParams(s === 'open' ? {} : {status: s})}>
      <span className={'counter-dot ' + (s === 'open' ? 'open' : 'completed')}/><span>{s === 'open' ? 'Open' : 'Closed'}</span><strong>{data?.counts[s] ?? '—'}</strong></button>)}</div>
    <section className="table-panel">
      {error && <div role="alert" className="error">{error} <button onClick={() => setReload(n => n + 1)}>Retry</button></div>}
      <div className="table-scroll" aria-busy={loading}><table><thead><tr>{['REQUEST', 'FROM', 'TYPE', 'LATEST MESSAGE', 'WAITING', 'RECEIVED', 'ACTIONS'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>
        {loading && !data ? <tr><td colSpan={7} className="empty" role="status">Loading support requests…</td></tr> : data?.items.map(row => <tr key={row.id}>
          <td className="reference"><Link className="case-reference-link" to={`/support/${row.id}`}>{row.subject ?? kinds[row.kind]}</Link>{row.service_code && <small className="demo">{SERVICE_NAMES[row.service_code as ServiceCode] ?? row.service_code}</small>}{row.unread > 0 && <small className="demo">{row.unread} new</small>}</td>
          <td className="client">{row.requester.name}<small> · {row.requester.role}</small></td>
          <td>{kinds[row.kind]}</td>
          <td className="matter">{row.last_message && <div className="party">{row.last_message.length > 90 ? row.last_message.slice(0, 90) + '…' : row.last_message}</div>}</td>
          <td>{row.waiting_since ? <div className="waiting-age"><WaitingAge since={row.waiting_since}/></div> : row.status === 'open' ? <span className="status in_progress">Replied</span> : <span className="status completed">Closed</span>}</td>
          <td className="date">{ist(row.created_at)}</td>
          <td><Link to={`/support/${row.id}`}>{row.status === 'open' ? 'Open and reply' : 'View'}</Link></td>
        </tr>)}
        {!loading && !error && !data?.items.length && <tr><td colSpan={7} className="empty">{status === 'open' ? 'No open support requests. New contact requests, callbacks and chats appear here.' : 'No closed support requests yet.'}</td></tr>}
      </tbody></table></div>
    </section>
  </main>;
}

export function SupportTicketDetail() {
  const {id = ''} = useParams(), navigate = useNavigate(), fail = useRefuse();
  const [t, setT] = useState<SupportAdminTicket | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true), [reload, setReload] = useState(0);
  const [reply, setReply] = useState(''), [busy, setBusy] = useState(false), [actionError, setActionError] = useState(''), [confirmClose, setConfirmClose] = useState(false);
  useEffect(() => {
    let alive = true; setLoading(true); setError('');
    api.adminSupportTicket(id).then(r => alive && setT(r)).catch(e => alive && setError(fail(e, 'Unable to load this support request'))).finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id, reload]);
  const send = async (e: FormEvent) => {
    e.preventDefault(); if (!reply.trim()) return; setBusy(true); setActionError('');
    try { await api.adminSupportReply(id, reply.trim()); setReply(''); setReload(n => n + 1); } catch (err) { setActionError(fail(err, 'Reply failed') || 'Reply failed'); } finally { setBusy(false); }
  };
  const close = async () => {
    setBusy(true); setActionError('');
    try { await api.adminSupportClose(id); setConfirmClose(false); setReload(n => n + 1); } catch (err) { setActionError(fail(err, 'Close failed') || 'Close failed'); } finally { setBusy(false); }
  };
  if (loading && !t) return <main className="notices"><p role="status">Loading support request…</p></main>;
  if (!t) return <main className="notices"><div role="alert" className="error">{error || 'Support request not found.'} <button onClick={() => setReload(n => n + 1)}>Retry</button> <button onClick={() => navigate('/support')}>Back to inbox</button></div></main>;
  const service = t.case ? ServiceCodeSchema.safeParse(t.case.service_code) : null;
  return <main className="notices">
    <div className="page-title"><div><p><Link to="/support">← Support inbox</Link></p><h1>{t.subject ?? kinds[t.kind]}</h1><p>{kinds[t.kind]}{t.service_code ? ` · Regarding: ${SERVICE_NAMES[t.service_code as ServiceCode] ?? t.service_code}` : ''} · {t.status === 'open' ? 'Open' : `Closed ${t.closed_at ? ist(t.closed_at) : ''}`} · received {ist(t.created_at)}</p></div></div>
    <section className="detail-panel" aria-label="Requester">
      <div className="section-title"><h2>Requester</h2></div>
      <p><strong>{t.requester.name}</strong> · {t.requester.role}</p>
      {t.requester.email && <p>Email: {t.requester.email}</p>}
      {(t.contact_phone || t.requester.phone) && <p>Phone: {t.contact_phone ?? t.requester.phone}{t.contact_name && t.contact_name !== t.requester.name ? ` (ask for ${t.contact_name})` : ''}</p>}
      {t.contact_method && <p>Preferred contact: {t.contact_method === 'chat' ? 'In-app chat' : t.contact_method === 'phone' ? 'Phone call' : 'Email'}</p>}
      {t.related_to && <p>Related to: {t.related_to}</p>}
      {t.case && service?.success && <p>Case: <Link to={adminCasePath(service.data, t.case.id)}>{t.case.reference}</Link></p>}
      {t.kind === 'callback' && t.status === 'open' && <p>Call the requester, then post a short note below and close the request.</p>}
    </section>
    <section className="detail-panel" aria-label="Conversation">
      <div className="section-title"><h2>Conversation</h2></div>
      <div className="notification-list">{t.messages.map(m => <div key={m.id} className="notification-row"><div className="notification-text"><strong>{m.from === 'support' ? 'Legalitt Support' : t.requester.name}</strong> <small>{ist(m.created_at)}</small><p style={{whiteSpace: 'pre-wrap'}}>{m.body}</p></div></div>)}</div>
      {actionError && <div role="alert" className="error">{actionError}</div>}
      {t.status === 'open' ? <form onSubmit={send}>
        <label>Reply to {t.requester.name} (appears in their Messages under Support)<textarea value={reply} onChange={e => setReply(e.target.value)} maxLength={2000} rows={4} style={{width: '100%'}}/></label>
        <button className="primary" type="submit" disabled={busy || !reply.trim()}>{busy ? 'Sending…' : 'Send reply'}</button>{' '}
        {!confirmClose ? <button type="button" disabled={busy} onClick={() => setConfirmClose(true)}>Close request</button> :
          <span role="alert">Close this request? The requester can no longer reply to it and will need to start a new one. <button type="button" disabled={busy} onClick={() => void close()}>Yes, close it</button> <button type="button" onClick={() => setConfirmClose(false)}>Keep open</button></span>}
      </form> : <p>This request is closed.</p>}
    </section>
  </main>;
}
