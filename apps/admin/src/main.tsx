import { CaseDetail } from './case-detail';
import { StrictMode, useState, type FormEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes, NavLink, Outlet } from 'react-router';
import { SessionProvider, useSession } from './session';
import { Notices } from './notices';
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
  const {user, loading, logout} = useSession();
  const [drawer, setDrawer] = useState(false);
  if (loading) return <main className="auth"><p role="status">Checking session…</p></main>;
  if (!user) return <Navigate to="/sign-in" replace/>;
  return <div className="shell">
    <aside className={drawer ? 'sidebar open' : 'sidebar'}>
      <div className="wordmark">LEGALITT<span>ADMIN</span></div>
      <nav aria-label="Admin navigation"><NavLink to="/legal-notices" onClick={() => setDrawer(false)}><span aria-hidden="true">▤</span> Legal Notices</NavLink></nav>
      <div className="identity"><span>{user.name}</span><small>ADMIN</small><button onClick={logout}>Sign out</button></div>
    </aside>
    {drawer && <button className="scrim" aria-label="Close navigation" onClick={() => setDrawer(false)}/>}
    <div className="workspace"><header><button className="menu" aria-label="Toggle navigation" aria-expanded={drawer} onClick={() => setDrawer(!drawer)}>☰</button><span>Legal Notices</span><span className="role">ADMIN</span></header><Outlet/></div>
  </div>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><BrowserRouter><SessionProvider><Routes>
  <Route path="/sign-in" element={<SignIn/>}/>
  <Route element={<Shell/>}><Route path="/legal-notices" element={<Notices/>}/><Route path="/legal-notices/:id" element={<CaseDetail/>}/></Route>
  <Route path="*" element={<Navigate to="/legal-notices" replace/>}/>
</Routes></SessionProvider></BrowserRouter></StrictMode>);
