import {createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode} from 'react';
import {Link, useNavigate} from 'react-router';
import {NotificationFeed, notificationDestination, type ApiCase} from '@legalitt/shared';
import {api, useSession} from './session';
const Context = createContext<NotificationFeed | null>(null);
export function NotificationsProvider({children}: {children: ReactNode}) {
  const {user} = useSession();
  const feed = useMemo(() => new NotificationFeed(api), [user?.id]);
  useEffect(() => user ? feed.start() : undefined, [feed, user?.id]);
  return <Context.Provider value={feed}>{children}</Context.Provider>;
}
function useInbox() {
  const feed=useContext(Context); if (!feed) throw new Error('NotificationsProvider required');
  const state=useSyncExternalStore(feed.subscribe,feed.snapshot,feed.snapshot);
  return {feed,...state};
}
export function NotificationBell() {
  const {unread}=useInbox();
  return <Link className="notification-bell" to="/notifications" aria-label={`Notifications, ${unread} unread`} data-testid="notifications-bell">
    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>
    {unread>0&&<span data-testid="notifications-count">{unread>99?'99+':unread}</span>}
  </Link>;
}
export function Notifications() {
  const {feed,items,unread,loading,error,next}=useInbox(),navigate=useNavigate();
  const open=async(id:string)=>{
    const row=items.find(n=>n.id===id);if(!row||!await feed.read(id))return;
    const target=notificationDestination(row,'admin');if(target)navigate(target);
  };
  return <main className="notifications-page"><div className="page-title"><div><p className="eyebrow">INBOX</p><h1>Notifications</h1><p className="muted">{unread} unread</p></div><button onClick={()=>{void feed.readAll();}}>Mark all as read</button></div>
    {!!error&&<div className="error" role="alert">{error}<button onClick={()=>{void feed.refresh();}}>Retry</button></div>}
    {loading&&<p role="status">Loading notifications…</p>}
    {!loading&&!error&&!items.length&&<div className="empty">No notifications</div>}
    <div className="notification-list">{items.map(n=><button key={n.id} className={`notification-row ${n.read_at?'':'unread'}`} onClick={()=>{void open(n.id);}}>
      <span className="notification-marker" aria-label={n.read_at?'Read':'Unread'}/><span className="notification-text"><strong>{n.title}</strong>{!!n.body&&<span>{n.body}</span>}</span>
      <time dateTime={n.created_at}>{new Date(n.created_at).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}</time>{n.case_id&&<span aria-hidden="true">→</span>}
    </button>)}</div>
    {next&&<button className="notification-more" onClick={()=>{void feed.refresh(true);}}>Load more</button>}
  </main>;
}
