import routes from './auth-routes.json';

export type EntryRole = 'user' | 'lawyer';

function canonicalPath(path: string) {
  return path.replace(/\/\([^/]+\)/g, '').replace(/\/index$/, '').replace(/\/$/, '') || '/';
}

function matches(path: string, names: string[]) {
  return names.some((name) => {
    if (/^\([^/]+\)$/.test(name)) return false; // Group containers are not URLs.
    const segments = canonicalPath(`/${name}`).split('/');
    const actual = path.split('/');
    return segments.length === actual.length && segments.every((segment, i) =>
      /^\[[^\]]+\]$/.test(segment) ? !!actual[i] : segment === actual[i]);
  });
}

export function destinationAccess(path: string): 'client' | 'advocate' | 'shared' | null {
  path = canonicalPath(path);
  if (['/cases', '/messages', '/profile'].includes(path)) return 'client';
  if (['/dashboard', '/matters', '/clients', '/earnings'].includes(path) || matches(path, routes.advocate)) return 'advocate';
  if (matches(path, routes.authenticated)) return 'shared';
  return null;
}

// Store only real, protected app routes. Never turn login into an open redirect,
// or resume into another auth screen. Keep the query (especially caseId) intact.
export function authDestination(value: string | null): string | null {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\s\u0000-\u001f]/.test(value)) return null;
  const path = value.split(/[?#]/, 1)[0];
  if (/%(?:2f|5c|2e)/i.test(path) || path.split('/').some((part) => part === '.' || part === '..')) return null;
  return destinationAccess(path) ? canonicalPath(path) + value.slice(path.length) : null;
}

export function destinationRole(destination: string): EntryRole {
  return destinationAccess(destination.split(/[?#]/, 1)[0]) === 'advocate' ? 'lawyer' : 'user';
}

export function afterSignIn(destination: string | null, role: EntryRole): string {
  const target = authDestination(destination);
  const access = target && destinationAccess(target.split(/[?#]/, 1)[0]);
  if (target && (access === 'shared' || access === (role === 'lawyer' ? 'advocate' : 'client'))) return target;
  return role === 'lawyer' ? '/dashboard' : '/home';
}
