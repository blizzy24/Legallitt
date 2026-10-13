import { router, usePathname, type Href } from 'expo-router';
import { House, Scale, UserRound, UsersRound, Wallet, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, ink, tabBarShadow, tabs } from '../constants/theme';

// The ADVOCATE tab bar: five tabs, icon only (design/148 and design/151 draw four;
// Profile is the fifth).
//
// PROFILE is not a tab screen. The client's flow diagram hangs the settings tree,
// the verification wizard and the bank flow under Profile, but design/245 — the
// settings root — draws a back chevron and no tab bar. So the Profile tab pushes
// /advocate/settings as a full screen, and the bar is not drawn there. Its icon is
// the client bar's Profile icon (components/TabBar.tsx).
//
// ─────────────────────────────────────────────────────────────────────────────
// DELIBERATELY SEPARATE FROM components/TabBar.tsx. It repeats about forty lines of
// layout rather than taking another prop, because the two bars are expected to
// diverge: the client bar's shape is still an open question with the client (its
// designs show a four-tab icon-only bar against the one labelled design it was built
// from), and the advocate bar's is settled. Coupling them would mean every future
// change to one has to be justified against the other.
//
// The two route groups also never render both: each has its own Tabs navigator.
// ─────────────────────────────────────────────────────────────────────────────

type AdvocateTab = {
  key: string;
  label: string;
  icon: LucideIcon;
  route: Href;
  /** Opens as a pushed screen rather than switching tab. */
  push?: boolean;
};

const ADVOCATE_TABS: AdvocateTab[] = [
  { key: 'dashboard', label: 'Dashboard', icon: House, route: '/(advocate)/dashboard' },
  { key: 'matters', label: 'Matters', icon: Scale, route: '/(advocate)/matters' },
  { key: 'clients', label: 'Clients', icon: UsersRound, route: '/(advocate)/clients' },
  { key: 'earnings', label: 'Earnings', icon: Wallet, route: '/(advocate)/earnings' },
  { key: 'profile', label: 'Profile', icon: UserRound, route: '/advocate/settings', push: true },
];

export default function AdvocateTabBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const m = tabs.iconOnly;

  return (
    <View
      style={[
        styles.bar,
        {
          bottom: tabs.bottom + insets.bottom,
          left: m.inset,
          right: m.inset,
          height: m.height,
          borderRadius: m.height / 2,
        },
      ]}
    >
      <View style={styles.row}>
        {ADVOCATE_TABS.map((tab) => {
          const active = pathname === `/${tab.key}`;
          const Icon = tab.icon;
          return (
            <Pressable
              key={tab.key}
              role="tab"
              aria-selected={active}
              accessibilityLabel={tab.label}
              onPress={() => (tab.push ? router.push(tab.route) : router.navigate(tab.route))}
              style={styles.slot}
            >
              <View
                style={[
                  styles.item,
                  { width: m.pillWidth, height: m.pillHeight, borderRadius: m.pillHeight / 2 },
                  active && styles.itemActive,
                ]}
              >
                <Icon size={m.icon} color={active ? ink.onBrand : ink.accent} />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    backgroundColor: colors.card,
    justifyContent: 'center',
    ...tabBarShadow,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  slot: { flex: 1, alignItems: 'center' },
  item: { alignItems: 'center', justifyContent: 'center' },
  itemActive: { backgroundColor: colors.brand },
});
