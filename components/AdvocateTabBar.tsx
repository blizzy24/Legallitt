import { router, usePathname, type Href } from 'expo-router';
import { House, Scale, UsersRound, Wallet, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, ink, tabBarShadow, tabs } from '../constants/theme';

// The ADVOCATE tab bar: four tabs, icon only (design/148 and design/151).
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
};

const ADVOCATE_TABS: AdvocateTab[] = [
  { key: 'dashboard', label: 'Dashboard', icon: House, route: '/(advocate)/dashboard' },
  { key: 'matters', label: 'Matters', icon: Scale, route: '/(advocate)/matters' },
  { key: 'clients', label: 'Clients', icon: UsersRound, route: '/(advocate)/clients' },
  { key: 'earnings', label: 'Earnings', icon: Wallet, route: '/(advocate)/earnings' },
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
              onPress={() => router.navigate(tab.route)}
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
