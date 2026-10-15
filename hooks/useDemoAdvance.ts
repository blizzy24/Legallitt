import { router, useFocusEffect, useLocalSearchParams, usePathname, type Href } from 'expo-router';
import { useCallback } from 'react';

import { DEMO_AUTO_ADVANCE } from '../constants/dev';
import { nextRoute } from '../data/flowMap';

/** How long a "waiting for the other party" state holds before moving on. */
export const DEMO_WAIT_MS = 5000;

/**
 * DEMO ONLY. `advance(label)` pushes the flow's next screen for the current route
 * (data/flowMap.ts); `can(label)` says whether there is one. Both are inert when
 * DEMO_AUTO_ADVANCE is false.
 */
export function useDemoAdvance() {
  const path = usePathname();
  // The court screens' District Court variant rides along on ?service=dc.
  const dc = useLocalSearchParams<{ service?: string }>().service === 'dc';
  const can = useCallback((label?: string) => DEMO_AUTO_ADVANCE && nextRoute(path, label) !== undefined, [path]);
  const advance = useCallback(
    (label?: string, suffix = '') => {
      const to = DEMO_AUTO_ADVANCE ? nextRoute(path, label) : undefined;
      const svc = dc && to?.startsWith('/advocate/court/') ? `${to.includes('?') ? '&' : '?'}service=dc` : '';
      if (to) router.push(`${to}${suffix}${svc}` as Href);
    },
    [path, dc],
  );
  return { can, advance };
}

/**
 * DEMO ONLY. While `waiting` is true, moves on after DEMO_WAIT_MS — to the
 * flow's next screen, or by calling `then` where the next state lives on the
 * same screen. The one hook every waiting state uses.
 */
export function useDemoWait(waiting = true, then?: () => void) {
  const { advance } = useDemoAdvance();
  // Focus, not mount: expo-router keeps earlier screens mounted, and their
  // timers must not fire once another screen is on top.
  useFocusEffect(
    useCallback(() => {
      if (!DEMO_AUTO_ADVANCE || !waiting) return;
      const id = setTimeout(() => (then ? then() : advance()), DEMO_WAIT_MS);
      return () => clearTimeout(id);
    }, [waiting, advance, then]),
  );
}
