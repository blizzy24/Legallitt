import { router } from 'expo-router';
import { Bell, Search } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ServiceCard from '../../components/ServiceCard';
import { serviceIcon } from '../../components/serviceIcons';
import { colors, font, home, ink, space, tabs } from '../../constants/theme';
import { useSession } from '../../context/session';
import { SERVICE_ROUTES } from '../../data/serviceRoutes';
import { homeServices, popularServices, type ResolvedService } from '../../data/services';

const POPULAR = popularServices();
const GRID = homeServices();

// Two independent columns: each card sizes to its content, so a taller card on one side
// does not stretch the other (design/11 + 12).
const LEFT = GRID.filter((_, i) => i % 2 === 0);
const RIGHT = GRID.filter((_, i) => i % 2 === 1);

/** Services without a built route are inert until that section is built. */
const pressFor = (s: ResolvedService) =>
  SERVICE_ROUTES[s.id] ? () => router.push(SERVICE_ROUTES[s.id]!) : undefined;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { isLoggedIn } = useSession();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + (isLoggedIn ? home.topMember : home.topGuest),
            paddingBottom: tabs.bottom + tabs.labelled.height + home.gridGap + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoggedIn ? <MemberHeader /> : <GuestHeader />}

        <View style={styles.search}>
          <Search size={home.searchIcon} color={ink.accent} />
          <TextInput
            placeholder="Search legal services"
            placeholderTextColor={colors.textBody}
            editable={false}
            style={styles.searchInput}
          />
        </View>

        <SectionRow title="Popular Services" badge />
        <View style={styles.popularRow}>
          {POPULAR.map((s) => (
            <ServiceCard
              key={s.id}
              icon={serviceIcon(s.icon)}
              title={s.title}
              description={s.description}
              variant="popular"
              onPress={pressFor(s)}
              style={styles.popularItem}
            />
          ))}
        </View>

        <SectionRow title="Our Services" style={styles.ourServicesRow} />
        <View style={styles.grid}>
          <View style={styles.column}>
            {LEFT.map((s) => (
              <ServiceCard
                key={s.id}
                icon={serviceIcon(s.icon)}
                title={s.title}
                description={s.description}
                onPress={pressFor(s)}
              />
            ))}
          </View>
          <View style={styles.column}>
            {RIGHT.map((s) => (
              <ServiceCard
                key={s.id}
                icon={serviceIcon(s.icon)}
                title={s.title}
                description={s.description}
                onPress={pressFor(s)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionRow({ title, badge, style }: { title: string; badge?: boolean; style?: object }) {
  return (
    <View style={[styles.sectionRow, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>TOP</Text>
        </View>
      )}
      <View style={styles.sectionSpacer} />
      <Pressable accessibilityRole="link" onPress={() => router.navigate('/(tabs)/services')}>
        <Text style={styles.viewAll}>View All</Text>
      </Pressable>
    </View>
  );
}

function GuestHeader() {
  return (
    <>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>
          Already have an account?{' '}
          <Text style={styles.bannerLink} onPress={() => router.push('/(auth)/login')}>
            Log in
          </Text>
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/(auth)/login')}
          style={styles.signup}
        >
          <Text style={styles.signupText}>Sign up</Text>
        </Pressable>
      </View>

      <Text style={styles.eyebrow}>LEGALITT CLIENT</Text>
      <Text style={styles.welcome}>Welcome to Legalitt</Text>
      <Text style={styles.guestSubtitle}>How can we help you today?</Text>
    </>
  );
}

function MemberHeader() {
  return (
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
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  content: {
    paddingHorizontal: space.screenX,
  },

  // Guest header
  banner: {
    height: home.bannerHeight,
    borderRadius: home.bannerRadius,
    backgroundColor: colors.iconChipBg,
    paddingHorizontal: home.bannerPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
    fontFamily: font.appBody,
    fontSize: home.bannerTextSize,
    color: colors.textBody,
  },
  bannerLink: {
    fontFamily: font.appSemi,
    color: ink.accent,
  },
  signup: {
    width: home.signupWidth,
    height: home.signupHeight,
    borderRadius: home.signupRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupText: {
    fontFamily: font.appSemi,
    fontSize: home.signupTextSize,
    color: colors.textPrimary,
  },
  eyebrow: {
    marginTop: home.eyebrowGap,
    fontFamily: font.appSemi,
    fontSize: home.eyebrowSize,
    letterSpacing: home.eyebrowSpacing,
    color: ink.accent,
  },
  welcome: {
    marginTop: home.welcomeGap,
    fontFamily: font.appHeading,
    fontSize: home.welcomeSize,
    color: colors.textPrimary,
  },
  guestSubtitle: {
    marginTop: home.guestSubtitleGap,
    fontFamily: font.appBody,
    fontSize: home.guestSubtitleSize,
    color: colors.textBody,
  },

  // Logged-in header
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: font.appSemi,
    fontSize: home.initialsSize,
    color: ink.accent,
  },

  // Search
  search: {
    marginTop: home.searchGap,
    height: home.searchHeight,
    borderRadius: home.searchRadius,
    backgroundColor: colors.card,
    borderWidth: home.hairline,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: home.searchPadX,
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

  // Section rows
  sectionRow: {
    marginTop: home.sectionGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ourServicesRow: {
    marginTop: home.ourServicesGap,
  },
  sectionTitle: {
    fontFamily: font.appHeading,
    fontSize: home.sectionTitleSize,
    color: colors.textPrimary,
  },
  sectionSpacer: {
    flex: 1,
  },
  badge: {
    marginLeft: home.badgeGap,
    height: home.badgeHeight,
    borderRadius: home.badgeHeight / 2,
    paddingHorizontal: home.badgePadX,
    backgroundColor: ink.badgeBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: font.appSemi,
    fontSize: home.badgeTextSize,
    letterSpacing: home.badgeSpacing,
    color: ink.accent,
  },
  viewAll: {
    fontFamily: font.appBody,
    fontSize: home.viewAllSize,
    color: ink.accent,
  },

  // Cards
  popularRow: {
    marginTop: home.popularGap,
    flexDirection: 'row',
    gap: home.colGap,
  },
  popularItem: {
    flex: 1,
  },
  grid: {
    marginTop: home.gridGap,
    flexDirection: 'row',
    gap: home.colGap,
  },
  column: {
    flex: 1,
    gap: home.rowGap,
  },
});
