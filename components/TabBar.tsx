import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, home, ink, space, tabBarShadow } from '../constants/theme';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;
type Tab = { name: string; label: string; icon: IconName };

// Four filled icons, per design/11 + 12.
// TODO: "Cases" and "Lawyers" are placeholder names the client has not confirmed. They
// are accessibility labels only — no visible UI text uses them — so renaming is safe.
const TABS: Tab[] = [
  { name: 'home', label: 'Home', icon: 'home' },
  { name: 'tab2', label: 'Cases', icon: 'scale-balance' },
  { name: 'tab3', label: 'Lawyers', icon: 'account-group' },
  { name: 'profile', label: 'Profile', icon: 'account' },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <View style={styles.tabBar}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = pathname === `/${tab.name}`;
          return (
            <Pressable
              key={tab.name}
              role="tab"
              aria-selected={active}
              accessibilityLabel={tab.label}
              onPress={() => router.navigate(`/${tab.name}` as never)}
              style={styles.tabSlot}
            >
              <View style={[styles.tabItem, active && styles.tabItemActive]}>
                <MaterialCommunityIcons
                  name={tab.icon}
                  size={home.tabIcon}
                  color={active ? ink.onBrand : ink.accent}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: space.screenX,
    right: space.screenX,
    bottom: home.tabBottom,
    height: home.tabHeight,
    borderRadius: home.tabHeight / 2,
    backgroundColor: colors.card,
    justifyContent: 'center',
    ...tabBarShadow,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: home.tabPadX,
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
  },
  tabItem: {
    width: home.tabActiveWidth,
    height: home.tabActiveHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    borderRadius: home.tabActiveHeight / 2,
    backgroundColor: ink.accent,
  },
});
