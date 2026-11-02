import {createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode} from 'react';
import {router, type Href} from 'expo-router';
import {NotificationFeed, notificationDestination, type ApiNotification} from '@legalitt/shared';
import {useSession} from './session';
import {DATA_SOURCE} from '../lib/data-source';
import {backend} from '../lib/auth';
import {CLIENT_NOTIFICATIONS, type NotificationItem} from '../data/notifications';
import {ADV_NOTIFICATIONS} from '../data/advocateSide';
import {previewNotice} from '../components/PreviewNotice';

type Inbox = {items: NotificationItem[]; unread: number; loading: boolean; error: string; more: boolean;
  open(id: string): Promise<void>; readAll(): Promise<unknown>; refresh(): void; loadMore(): void};
const Context = createContext<Inbox | null>(null);
export function NotificationsProvider({children}: {children: ReactNode}) {
  const {user} = useSession();
  // Recreate the entire feed on identity changes; never carry one user's inbox into another session.
  return DATA_SOURCE === 'api' ? <ApiInbox key={user?.id ?? 'guest'} user={user}>{children}</ApiInbox>
    : <FixtureInbox key={user?.id ?? 'guest'} advocate={user?.role === 'advocate'}>{children}</FixtureInbox>;
}
function ApiInbox({children, user}: {children: ReactNode; user: ReturnType<typeof useSession>['user']}) {
  const feed = useMemo(() => new NotificationFeed(backend), []);
  const state = useSyncExternalStore(feed.subscribe, feed.snapshot, feed.snapshot);
  useEffect(() => user ? feed.start() : undefined, [feed, user?.id]);
  const open = async (id: string) => {
    const row = state.items.find(n => n.id === id);
    if (!row || !user || !await feed.read(id)) return;
    // Refresh the case at the moment of opening: an old alert must not reopen an obsolete action.
    let current = row;
    try {if (!row.case_id) return; const record = await backend.case(row.case_id); current = {...row, case: {reference: record.reference, status: record.status}};} catch { /* Route still uses the latest polled case and enforces access itself. */ }
    const path = notificationDestination(current, user.role);
    if (path) router.push(path as Href);
  };
  const items = user ? state.items.map(notificationItem) : [];
  return <Context.Provider value={{items, unread: user ? state.unread : 0, loading: !!user && state.loading, error: state.error,
    more: !!state.next, open, readAll: feed.readAll, refresh: () => {void feed.refresh();}, loadMore: () => {void feed.refresh(true);}}}>{children}</Context.Provider>;
}
function notificationItem(row: ApiNotification): NotificationItem {
  const date = new Date(row.created_at), today = date.toDateString() === new Date().toDateString();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  return {id: row.id, title: row.title, body: row.body ?? row.case?.reference ?? '', unread: !row.read_at,
    when: today ? date.toLocaleTimeString('en-IN', {hour: 'numeric', minute: '2-digit'}) : date.toLocaleDateString('en-IN', {day: 'numeric', month: 'short'}),
    group: today ? 'TODAY' : date.toDateString() === yesterday.toDateString() ? 'YESTERDAY' : 'EARLIER',
    category: row.kind === 'payment_captured' ? 'Payments' : 'Cases', icon: row.kind === 'payment_captured' ? 'wallet' : 'document',
    action: row.case ? 'View Details' : '', chip: '', tone: 'neutral'};
}
function FixtureInbox({children, advocate}: {children: ReactNode; advocate: boolean}) {
  const [read, setRead] = useState<string[]>([]);
  const rows: NotificationItem[] = advocate ? ADV_NOTIFICATIONS.map(n => ({...n, group: n.section === 'today' ? 'TODAY' : 'EARLIER',
    category: n.icon === 'wallet' ? 'Payments' : n.icon === 'consult' ? 'Consultations' : 'Cases', action: '', chip: '', tone: 'neutral'})) : CLIENT_NOTIFICATIONS;
  const items = rows.map(n => ({...n, unread: n.unread && !read.includes(n.id)}));
  return <Context.Provider value={{items, unread: items.filter(n => n.unread).length, loading: false, error: '', more: false,
    open: async id => {setRead(prior => [...prior, id]); const row = rows.find(n => n.id === id); if (row?.href) router.push(row.href as Href); else previewNotice('Notification details');},
    readAll: async () => setRead(rows.map(n => n.id)), refresh: () => {}, loadMore: () => {}}}>{children}</Context.Provider>;
}
export function useNotifications() {const context = useContext(Context); if (!context) throw new Error('NotificationsProvider required'); return context;}
