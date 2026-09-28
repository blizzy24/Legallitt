import { router, type Href } from 'expo-router';
import {
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronRight,
  FileText,
  Headset,
  LifeBuoy,
  LogOut,
  Languages,
  Settings,
  ShieldCheck,
  SquarePen,
  UserRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ConfirmModal from '../../components/ConfirmModal';
import { shrinkToFit } from '../../constants/textFit';
import { colors, font, profile as t, tabs } from '../../constants/theme';
import { useProfile } from '../../context/profile';
import { useSession } from '../../context/session';
import { APP_NAME, APP_VERSION, PROFILE_COUNTS } from '../../data/profile';

// Profile (design/50).
//
// TAB BAR — design/50 draws a FOUR-tab, icon-only bar. The app ships the five-tab
// labelled bar from design/14 and keeps it; see the note in the summary. Nothing on
// this screen touches the tab bar.
//
// ICONS — design/50 leaves several chips blank. Documents, Payments, Privacy &
// Security, Help Center and Contact Support are inferred; design/71 happens to draw
// Privacy & Security and Help Center, so those two follow that file. Each inferred
// icon is marked below.

type Row = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  href: Href;
  chip?: string;
  value?: string;
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const { signOut } = useSession();
  const [confirming, setConfirming] = useState(false);

  const account: Row[] = [
    {
      icon: BriefcaseBusiness,
      title: 'My Cases',
      subtitle: 'View and manage your active legal matters',
      href: '/(tabs)/cases',
      chip: PROFILE_COUNTS.activeCases,
    },
    {
      icon: CalendarCheck,
      title: 'My Requests',
      subtitle: 'Track consultation and representation requests',
      href: '/requests',
    },
    { icon: UserRound, title: 'Saved Advocates', subtitle: 'View your saved advocates', href: '/advocates' },
    // INFERRED — blank chip on design/50.
    { icon: FileText, title: 'Documents', subtitle: 'Access your uploaded legal documents', href: '/documents' },
    // INFERRED — blank chip on design/50.
    { icon: Wallet, title: 'Payments', subtitle: 'View payment history and transactions', href: '/payments' },
  ];

  const preferences: Row[] = [
    { icon: Bell, title: 'Notifications', subtitle: 'Manage notification preferences', href: '/notifications' },
    {
      icon: Languages,
      title: 'Language',
      subtitle: profile.language,
      href: '/language',
      value: profile.language,
    },
    // INFERRED — blank on design/50; design/71 draws a shield here.
    {
      icon: ShieldCheck,
      title: 'Privacy & Security',
      subtitle: 'Manage privacy and account security',
      href: '/privacy',
    },
  ];

  const help: Row[] = [
    // INFERRED — blank on design/50; design/71 draws a round glyph here.
    { icon: LifeBuoy, title: 'Help Center', subtitle: 'Get answers to common questions', href: '/help' },
    // INFERRED — blank chip on design/50.
    { icon: Headset, title: 'Contact Support', subtitle: 'Talk to Legalitt Support', href: '/support' },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + t.top,
            paddingBottom: tabs.bottom + tabs.labelled.height + t.sectionGap + insets.bottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Text style={styles.title}>Profile</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Settings" hitSlop={8} style={styles.gear}>
            <Settings size={t.gearIcon} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.identity}>
          <View style={styles.identityRow}>
            <View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{profile.initials}</Text>
              </View>
              <View style={styles.online} />
            </View>
            <View style={styles.identityText}>
              <View style={styles.nameRow}>
                <Text style={styles.name} {...shrinkToFit(0.8)}>
                  {profile.fullName}
                </Text>
                <View style={styles.accountChip}>
                  <Text style={styles.accountChipText} {...shrinkToFit(0.8)}>
                    {profile.accountType}
                  </Text>
                </View>
              </View>
              <Text style={styles.email} {...shrinkToFit(0.75)}>
                {profile.email}
              </Text>
              <Text style={styles.mobile} {...shrinkToFit(0.8)}>
                {profile.mobile}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/profile/edit')}
            style={({ pressed }) => [styles.edit, pressed && styles.pressed]}
          >
            <SquarePen size={t.editIcon} color={colors.textPrimary} />
            <Text style={styles.editLabel} {...shrinkToFit(0.8)}>
              Edit Profile
            </Text>
          </Pressable>
        </View>

        <Section label="ACCOUNT" rows={account} />
        <Section label="PREFERENCES" rows={preferences} />
        <Section label="HELP & SUPPORT" rows={help} />

        <View style={styles.logoutCard}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setConfirming(true)}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <View style={[styles.rowIcon, styles.logoutIcon]}>
              <LogOut size={t.rowIconGlyph} color={t.logoutColour} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, styles.logoutTitle]} {...shrinkToFit(0.8)}>
                Log Out
              </Text>
              <Text style={styles.rowSub} {...shrinkToFit(0.8)}>
                Sign out of your Legalitt account
              </Text>
            </View>
            <ChevronRight size={t.rowChevron} color={colors.textMuted} />
          </Pressable>
        </View>

        <Text style={styles.footer} {...shrinkToFit(0.8)}>
          {APP_NAME} • {APP_VERSION}
        </Text>
      </ScrollView>

      <ConfirmModal
        visible={confirming}
        icon={LogOut}
        title="Log Out?"
        body="Are you sure you want to sign out of your Legalitt account?"
        confirmLabel="Log Out"
        onConfirm={() => {
          setConfirming(false);
          signOut();
        }}
        onCancel={() => setConfirming(false)}
      />
    </View>
  );
}

function Section({ label, rows }: { label: string; rows: Row[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel} {...shrinkToFit(0.8)}>
        {label}
      </Text>
      <View style={styles.card}>
        {rows.map((r, i) => (
          <View key={r.title}>
            {i > 0 && <View style={styles.divider} />}
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(r.href)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.rowIcon}>
                <r.icon size={t.rowIconGlyph} color={colors.brandDark} />
              </View>
              <View style={styles.rowText}>
                <View style={styles.rowTitleRow}>
                  <Text style={styles.rowTitle} {...shrinkToFit(0.8)}>
                    {r.title}
                  </Text>
                  {r.chip && (
                    <View style={styles.rowChip}>
                      <Text style={styles.rowChipText} {...shrinkToFit(0.8)}>
                        {r.chip}
                      </Text>
                    </View>
                  )}
                </View>
                {/* design/50 clips "Track consultation and representation requests"
                    against the chevron. Allowed to wrap instead, so no row loses
                    text — that row is the only one tall enough to notice. */}
                <Text style={styles.rowSub}>{r.subtitle}</Text>
              </View>
              {r.value && (
                <Text style={styles.rowValue} {...shrinkToFit(0.8)}>
                  {r.value}
                </Text>
              )}
              <ChevronRight size={t.rowChevron} color={colors.textMuted} />
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  content: {
    paddingHorizontal: t.padX,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  gear: {
    width: t.gear,
    height: t.gear,
    borderRadius: t.gear / 2,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identity: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    padding: t.cardPad,
  },
  identityRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: colors.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: font.appSemi,
    fontSize: t.avatarText,
    color: colors.brandDark,
  },
  online: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: t.dot,
    height: t.dot,
    borderRadius: t.dot / 2,
    backgroundColor: '#22C55E',
    borderWidth: t.dotBorder,
    borderColor: colors.card,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.avatarGap,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  accountChip: {
    marginLeft: t.nameChipGap,
    minHeight: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountChipText: {
    fontFamily: font.appBody,
    fontSize: t.chipSize,
    color: colors.textBody,
  },
  email: {
    marginTop: t.emailGap,
    fontFamily: font.appBody,
    fontSize: t.emailSize,
    color: colors.textBody,
  },
  mobile: {
    marginTop: t.mobileGap,
    fontFamily: font.appBody,
    fontSize: t.mobileSize,
    color: colors.textBody,
  },
  edit: {
    marginTop: t.editGap,
    minHeight: t.editHeight,
    borderRadius: t.editRadius,
    backgroundColor: t.editBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editLabel: {
    marginLeft: t.editIconGap,
    fontFamily: font.appSemi,
    fontSize: t.editSize,
    color: colors.textPrimary,
  },
  section: {
    marginTop: t.sectionGap,
  },
  sectionLabel: {
    marginBottom: t.sectionLabelGap,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: colors.textMuted,
  },
  card: {
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginHorizontal: t.rowPadX,
    backgroundColor: t.divider,
  },
  row: {
    minHeight: t.rowHeight,
    paddingHorizontal: t.rowPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  rowIcon: {
    width: t.rowIcon,
    height: t.rowIcon,
    borderRadius: t.rowIconRadius,
    backgroundColor: t.rowIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.rowIconGap,
  },
  rowTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowTitle: {
    flexShrink: 1,
    fontFamily: font.appHeading,
    fontSize: t.rowTitleSize,
    color: colors.textPrimary,
  },
  rowChip: {
    marginLeft: t.rowChipGap,
    minHeight: t.rowChipHeight,
    borderRadius: t.rowChipRadius,
    paddingHorizontal: t.rowChipPadX,
    backgroundColor: t.rowChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowChipText: {
    fontFamily: font.appSemi,
    fontSize: t.rowChipSize,
    color: colors.brandDark,
  },
  rowSub: {
    marginTop: t.rowSubGap,
    fontFamily: font.appBody,
    fontSize: t.rowSubSize,
    color: colors.textBody,
  },
  rowValue: {
    marginRight: t.rowValueGap,
    fontFamily: font.appBody,
    fontSize: t.rowValueSize,
    color: colors.brandDark,
  },
  logoutCard: {
    marginTop: t.logoutGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    overflow: 'hidden',
  },
  logoutIcon: {
    backgroundColor: t.logoutIconBg,
  },
  logoutTitle: {
    color: t.logoutColour,
  },
  footer: {
    marginTop: t.footerGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.footerSize,
    color: colors.textMuted,
  },
});
