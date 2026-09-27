import { router, usePathname, type Href } from 'expo-router';
import {
  FileText,
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

// Five-tab bar from design/14 (labelled) and design/21 (icon only). Outline icons; the
// active tab sits in a filled brand pill with a white icon (and label, when labelled).
// TODO: labels are the design's wording — "Cases" and "Messages" not yet client-confirmed.
const TABS: TabConfig[] = [
  { key: 'home', label: 'Home', icon: House, route: '/(tabs)/home' },
  { key: 'services', label: 'Services', icon: LayoutGrid, route: '/(tabs)/services' },
  { key: 'cases', label: 'Cases', icon: FileText, route: '/(tabs)/cases' },
  { key: 'messages', label: 'Messages', icon: MessageSquareText, route: '/(tabs)/messages' },
  { key: 'profile', label: 'Profile', icon: UserRound, route: '/(tabs)/profile' },
];

// Earlier four-tab bar from design/11 + 12, kept in case the client prefers it. It used
// FILLED MaterialCommunityIcons glyphs (import MaterialCommunityIcons from
// '@expo/vector-icons/MaterialCommunityIcons') at 32pt, with the `iconOnly` layout but the
// larger `home.tab*` metrics of that design (68 tall, 74×47 pill, ink.accent fill):
//
// const LEGACY_TABS = [
//   { key: 'home',    label: 'Home',    icon: 'home',          route: '/(tabs)/home' },
//   { key: 'tab2',    label: 'Cases',   icon: 'scale-balance', route: '/(tabs)/tab2' },
//   { key: 'tab3',    label: 'Lawyers', icon: 'account-group', route: '/(tabs)/tab3' },
//   { key: 'profile', label: 'Profile', icon: 'account',       route: '/(tabs)/profile' },
// ];

type Props = {
  variant?: TabBarVariant;
  items?: TabConfig[];
};

export default function TabBar({ variant = 'labelled', items = TABS }: Props) {
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
