import type { ApiClient } from './api-client';
import { NOTIFICATION_POLL_MS, type ApiNotification, type NotificationPage } from './notifications';
export type NotificationSnapshot = {items: ApiNotification[]; unread: number; loading: boolean; error: string; next: string | null};
/** One feed per signed-in session. No navigation, progression or provider flags. */
export class NotificationFeed {
  private state: NotificationSnapshot = {items: [], unread: 0, loading: true, error: '', next: null};
  private listeners = new Set<() => void>();
  private revision = 0;
  private alive = false;
  private timer?: ReturnType<typeof setTimeout>;
  private refreshing = false;
  constructor(private readonly api: Pick<ApiClient, 'request'>) {}
  snapshot = () => this.state;
  subscribe = (listener: () => void) => {this.listeners.add(listener); return () => {this.listeners.delete(listener);};};
  private update(patch: Partial<NotificationSnapshot>) {this.state = {...this.state, ...patch}; this.listeners.forEach(fn => fn());}
  start() {this.alive = true; void this.refresh(); this.schedule(); return () => this.stop();}
  private schedule() {this.timer = setTimeout(() => {if (!this.alive) return; void this.refresh(); this.schedule();}, NOTIFICATION_POLL_MS);}
  private stop() {this.alive = false; this.revision++; this.refreshing = false; clearTimeout(this.timer);}
  refresh = async (more = false) => {
    if (!this.alive || this.refreshing || (more && !this.state.next)) return;
    this.refreshing = true;
    const version = this.revision;
    try {
      let page = await this.api.request<NotificationPage>(`/notifications?limit=100${more ? '&cursor=' + encodeURIComponent(this.state.next!) : ''}`);
      // Preserve a reader's expanded history across refreshes. Each page remains
      // server-scoped; no old private row is retained solely from a local cache.
      if (!more) {
        const target = this.state.items.length;
        while (page.next_cursor && page.items.length < target) {
          const older = await this.api.request<NotificationPage>('/notifications?limit=100&cursor=' + encodeURIComponent(page.next_cursor));
          page = {...page, items: [...page.items, ...older.items], next_cursor: older.next_cursor};
        }
      }
      if (!this.alive || version !== this.revision) return;
      const items = more ? [...this.state.items, ...page.items.filter(n => !this.state.items.some(p => p.id === n.id))] : page.items;
      this.update({items, unread: page.unread_count, next: page.next_cursor, loading: false, error: ''});
    } catch (e) {
      if (this.alive && version === this.revision) this.update({loading: false, error: e instanceof Error ? e.message : 'Unable to load notifications'});
    } finally {this.refreshing = false;}
  };
  private async mark(id?: string) {
    this.revision++; // A poll started before this write must not restore stale unread state.
    try {
      await this.api.request(id ? `/notifications/${encodeURIComponent(id)}/read` : '/notifications/read-all', {});
      if (!this.alive) return false;
      const now = new Date().toISOString(), count = this.state.items.filter(n => !n.read_at && (!id || n.id === id)).length;
      this.update({items: this.state.items.map(n => !id || n.id === id ? {...n, read_at: n.read_at ?? now} : n),
        unread: id ? Math.max(0, this.state.unread - count) : 0, error: ''});
      void this.refresh();
      return true;
    } catch (e) {if (this.alive) this.update({error: e instanceof Error ? e.message : 'Unable to mark notification as read'}); return false;}
  }
  read = (id: string) => this.mark(id);
  readAll = () => this.mark();
}
