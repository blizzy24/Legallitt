import {AccountDeletions} from './account-deletions';
import {AdvocateApprovals, AdvocateApprovalDetailPage} from './advocate-approvals';
import {Payouts} from './payouts';
import {SupportInbox, SupportTicketDetail} from './support';
import {NotificationsProvider, Notifications, NotificationBell} from './notifications';
import { CaseDetail } from './case-detail';
import { StrictMode, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, NavLink, Outlet, useParams } from 'react-router';
import {ServiceCodeSchema, SERVICE_NAMES} from '@legalitt/shared';
import { SessionProvider, useSession } from './session';
import { Notices } from './notices';
import { Cancellations } from './cancellations';
import './style.css';

function SignIn() {
  const {user, loading, error: sessionError, login} = useSession();
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  if (loading) return <main className="auth"><p role="status">Checking session…</p></main>;
  if (user) return <Navigate to="/legal-notices" replace/>;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setBusy(true); setError('');
    try { await login(String(fields.get('email') ?? ''), String(fields.get('password') ?? '')); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in'); }
    finally { setBusy(false); }
  };
  return <main className="auth"><form className="auth-card" onSubmit={submit}>
    <div className="wordmark">LEGALITT<span>ADMIN</span></div>
    <h1>Sign in</h1>
    {(error || sessionError) && <div role="alert" className="error">{error || sessionError}</div>}
    <label>Email<input type="email" name="email" autoComplete="username" required/></label>
    <label>Password<input type="password" name="password" autoComplete="current-password" required/></label>
    <button className="primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
  </form></main>;
}
function Shell() {
  const service = ServiceCodeSchema.safeParse(useParams().service);
  const heading = service.success && service.data !== 'legal_notice' ? SERVICE_NAMES[service.data] : location.pathname.startsWith('/support') ? 'Support inbox' : location.pathname.startsWith('/account-deletions') ? 'Account deletions' : location.pathname.startsWith('/payouts') ? 'Payouts' : location.pathname.startsWith('/advocate-approvals') ? 'Advocate approvals' : 'Legal Notices';
  const {user, loading, logout} = useSession();
  const [drawer, setDrawer] = useState(false);
  if (loading) return <main className="auth"><p role="status">Checking session…</p></main>;
  if (!user) return <Navigate to="/sign-in" replace/>;
  return <div className="shell">
    <aside className={drawer ? 'sidebar open' : 'sidebar'}>
      <div className="wordmark">LEGALITT<span>ADMIN</span></div>
      <nav aria-label="Admin navigation"><NavLink to="/legal-notices" onClick={() => setDrawer(false)}><span aria-hidden="true">▤</span> Legal Notices</NavLink><NavLink to="/services/fir_draft/cases?queue=approval" onClick={()=>setDrawer(false)}><span aria-hidden="true">▤</span> FIR Drafts</NavLink>
      {(['legal_advice','district_court','high_court','property_search','document_forensic','court_marriage'] as const).map(code=><NavLink key={code} to={`/services/${code}/cases`} onClick={()=>setDrawer(false)}><span aria-hidden="true">▤</span> {SERVICE_NAMES[code]}</NavLink>)}
      <NavLink to="/cancellations" onClick={()=>setDrawer(false)}><span aria-hidden="true">▤</span> Cancellations &amp; refunds</NavLink>
      <NavLink to="/support" onClick={()=>setDrawer(false)}><span aria-hidden="true">▤</span> Support inbox</NavLink>
      <NavLink to="/account-deletions" onClick={()=>setDrawer(false)}><span aria-hidden="true">▤</span> Account deletions</NavLink>

      <NavLink to="/advocate-approvals" onClick={()=>setDrawer(false)}><span aria-hidden="true">▤</span> Advocate approvals</NavLink>

      <NavLink to="/payouts" onClick={()=>setDrawer(false)}><span aria-hidden="true">▤</span> Payouts</NavLink></nav>
      <div className="identity"><span>{user.name}</span><small>ADMIN</small><button onClick={logout}>Sign out</button></div>
    </aside>
    {drawer && <button className="scrim" aria-label="Close navigation" onClick={() => setDrawer(false)}/>}
    <div className="workspace"><header><button className="menu" aria-label="Toggle navigation" aria-expanded={drawer} onClick={() => setDrawer(!drawer)}>☰</button><span>{heading}</span><NotificationBell/><span className="role">ADMIN</span></header><Outlet/></div>
  </div>;
}
function ServiceCases() {
  const service = ServiceCodeSchema.safeParse(useParams().service);
  return service.success ? <Notices key={service.data} service={service.data}/> : <main role="alert">Unknown service</main>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><SessionProvider><NotificationsProvider><Routes>
  <Route path="/sign-in" element={<SignIn/>}/>
  <Route element={<Shell/>}><Route path="/notifications" element={<Notifications/>}/><Route path="/cancellations" element={<Cancellations/>}/><Route path="/legal-notices" element={<Notices/>}/><Route path="/legal-notices/:id" element={<CaseDetail/>}/><Route path="/services/:service/cases" element={<ServiceCases/>}/><Route path="/services/:service/cases/:id" element={<CaseDetail/>}/><Route path="/support" element={<SupportInbox/>}/><Route path="/account-deletions" element={<AccountDeletions/>}/><Route path="/support/:id" element={<SupportTicketDetail/>}/><Route path="/advocate-approvals" element={<AdvocateApprovals/>}/><Route path="/advocate-approvals/:id" element={<AdvocateApprovalDetailPage/>}/><Route path="/payouts" element={<Payouts/>}/></Route>
  <Route path="*" element={<Navigate to="/legal-notices" replace/>}/>
</Routes></NotificationsProvider></SessionProvider></BrowserRouter></StrictMode>);
