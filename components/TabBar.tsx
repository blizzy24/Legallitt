import { router, usePathname, type Href } from 'expo-router';
import {
  Scale,
  UsersRound,
  House,
  LayoutGrid,
  MessageSquareText,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, font, ink, tabBarShadow, tabs } from '../constants/theme';

type TabConfig = {
  key: string;
  label: string;
  icon: LucideIcon;
  route: Href;
};

type TabBarVariant = 'labelled' | 'iconOnly';

// Confirmed role-wide navigation: majority four-icon client design (11, 12, 50, 142).
const TABS: TabConfig[] = [
  { key: 'home', label: 'Home', icon: House, route: '/(tabs)/home' },
  { key: 'cases', label: 'Cases', icon: Scale, route: '/(tabs)/cases' },
  { key: 'advocates', label: 'Advocates', icon: UsersRound, route: '/advocates' },
  { key: 'profile', label: 'Profile', icon: UserRound, route: '/(tabs)/profile' },
];

type Props = {
  variant?: TabBarVariant;
  items?: TabConfig[];
};

export default function TabBar({ variant = 'iconOnly', items = TABS }: Props) {
  const pathname = usePathname();
  // The scrolling tab screens reserve `tabs.bottom + height + insets.bottom`, so the
  // bar has to float above the gesture bar too or the two disagree on a device.
  const insets = useSafeAreaInsets();
  const labelled = variant === 'labelled';
  const m = labelled ? tabs.labelled : tabs.iconOnly;

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
      <View style={[styles.row, { paddingHorizontal: m.padX }]}>
        {items.map((tab) => {
          const active = pathname === `/${tab.key}`;
          const Icon = tab.icon;
          const tint = active ? ink.onBrand : ink.accent;
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
                  {
                    width: m.pillWidth,
                    height: m.pillHeight,
                    borderRadius: m.pillHeight / 2,
                  },
                  active && styles.itemActive,
                ]}
              >
                <Icon size={m.icon} color={tint} />
                {labelled && (
                  <Text style={[styles.label, { color: tint }]} numberOfLines={1}>
                    {tab.label}
                  </Text>
                )}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slot: {
    flex: 1,
    alignItems: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemActive: {
    backgroundColor: colors.brand,
  },
  label: {
    marginTop: tabs.labelled.labelGap,
    fontFamily: font.appBody,
    fontSize: tabs.labelled.labelSize,
  },
});
