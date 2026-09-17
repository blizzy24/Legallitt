import { router } from 'expo-router';
import {
  Bell,
  ClipboardList,
  CreditCard,
  File,
  FileText,
  House,
  LayoutGrid,
  MessageCircle,
  MessageSquareText,
  Search,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ServiceCard from '../components/ServiceCard';
import {
  colors,
  font,
  home,
  homeControlShadow,
  ink,
  space,
  tabBarShadow,
} from '../constants/theme';

const SERVICES: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: MessageCircle, title: 'Legal Advice', description: 'Get guidance from a qualified advocate' },
  { icon: FileText, title: 'Legal Notice', description: 'Prepare and send a professional notice' },
  { icon: ClipboardList, title: 'FIR Draft', description: 'Assistance with precise FIR drafting' },
  { icon: CreditCard, title: 'Cheque Bounce', description: 'Assistance for dishonour matters' },
  { icon: House, title: 'Property Search', description: 'Check records and legal verification' },
  { icon: ShieldCheck, title: 'Document Forensic', description: 'Examine documents by expert panel' },
];

const ROWS = [SERVICES.slice(0, 2), SERVICES.slice(2, 4), SERVICES.slice(4, 6)];

const TABS: LucideIcon[] = [LayoutGrid, File, MessageSquareText, UserRound];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + home.top }]}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingText}>
            <Text style={styles.greeting}>Hello, Rahul</Text>
            <Text style={styles.subtitle}>How can we help you today?</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Notifications" style={styles.bell}>
            <Bell size={home.bellIcon} color={ink.accent} />
            <View style={styles.dot} />
          </Pressable>
          <View style={styles.avatar}>
            <Text style={styles.initials}>RS</Text>
          </View>
        </View>

        <View style={styles.search}>
          <Search size={home.searchIcon} color={ink.accent} />
          <TextInput
            placeholder="Search legal services"
            placeholderTextColor={colors.textBody}
            editable={false}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <Pressable accessibilityRole="link" onPress={() => router.push('/services')}>
            <Text style={styles.viewAll}>View All ›</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.grid,
          { paddingBottom: home.tabBottom + home.tabHeight + home.gridGap + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {ROWS.map((row) => (
          <View key={row[0].title} style={styles.gridRow}>
            {row.map((s) => (
              <ServiceCard
                key={s.title}
                icon={s.icon}
                title={s.title}
                description={s.description}
                style={styles.gridItem}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <View style={styles.tabBar}>
        <View style={styles.tabRow}>
          <View style={[styles.tabSlot, styles.tabSlotActive]}>
            <View style={styles.tabActive}>
              <House size={home.tabIcon} color={ink.onBrand} fill={ink.onBrand} />
            </View>
          </View>
          {TABS.map((Icon, i) => (
            <View key={i} style={styles.tabSlot}>
              <Icon size={home.tabIcon} color={ink.accent} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    paddingHorizontal: space.screenX,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontFamily: font.appHeading,
    fontSize: home.greetingSize,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: home.subtitleGap,
    fontFamily: font.appBody,
    fontSize: home.subtitleSize,
    color: colors.textBody,
  },
  bell: {
    marginTop: home.headerButtonTop,
    width: home.headerButton,
    height: home.headerButton,
    borderRadius: home.headerButton / 2,
    backgroundColor: colors.card,
    borderWidth: home.hairline,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...homeControlShadow,
  },
  dot: {
    position: 'absolute',
    top: home.dotOffset,
    right: home.dotOffset,
    width: home.dotSize,
    height: home.dotSize,
    borderRadius: home.dotSize / 2,
    backgroundColor: ink.accent,
  },
  avatar: {
    marginTop: home.headerButtonTop,
    marginLeft: home.headerButtonGap,
    width: home.headerButton,
    height: home.headerButton,
    borderRadius: home.headerButton / 2,
    backgroundColor: colors.iconChipBg,
    borderWidth: home.hairline,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: font.appSemi,
    fontSize: home.initialsSize,
    color: ink.accent,
  },
  search: {
    marginTop: home.searchGap,
    height: home.searchHeight,
    borderRadius: home.searchHeight / 2,
    backgroundColor: colors.card,
    borderWidth: home.hairline,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: home.searchPadX,
    ...homeControlShadow,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    marginLeft: home.searchTextGap,
    fontFamily: font.appBody,
    fontSize: home.placeholderSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  sectionRow: {
    marginTop: home.sectionGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: font.appHeading,
    fontSize: home.sectionTitleSize,
    color: colors.textPrimary,
  },
  viewAll: {
    fontFamily: font.appBody,
    fontSize: home.viewAllSize,
    color: ink.accent,
  },
  scroll: {
    flex: 1,
  },
  grid: {
    paddingTop: home.gridTop,
    paddingHorizontal: space.screenX,
    gap: home.gridGap,
  },
  gridRow: {
    flexDirection: 'row',
    gap: home.gridGap,
  },
  gridItem: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    left: space.screenX,
    right: space.screenX,
    bottom: home.tabBottom,
    height: home.tabHeight,
    borderRadius: home.tabHeight / 2,
    backgroundColor: colors.card,
    borderWidth: home.hairline,
    borderColor: colors.border,
    justifyContent: 'center',
    ...tabBarShadow,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: home.tabPadLeft,
    marginRight: home.tabPadRight,
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
  },
  tabSlotActive: {
    alignItems: 'flex-start',
  },
  tabActive: {
    width: home.tabActiveWidth,
    height: home.tabActiveHeight,
    borderRadius: home.tabActiveHeight / 2,
    backgroundColor: ink.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
