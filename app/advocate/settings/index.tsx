import { router, type Href } from 'expo-router';
import { Bell, ChevronLeft, ChevronRight, MessageSquare, UserRound } from 'lucide-react-native';
import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SettingsIcon from '../../../components/SettingsIcon';
import { shrinkToFit } from '../../../constants/textFit';
import { AS_ROOT } from '../../../data/advocateSettings';
import { advSettings as t, colors, font, ink, status } from '../../../constants/theme';

// Advocate settings root (design/245).
//
// ⚠ THIS IS A NEW PUSHED SCREEN, NOT A REDRAWN TAB. There is no advocate
// Profile tab in this app to replace: app/(advocate)/ holds dashboard, matters,
// clients and earnings, AdvocateTabBar lists exactly those four, and the
// advocateProfile token block belongs to app/advocates/[id].tsx, which is the
// CLIENT-facing advocate profile. design/245 itself draws a back chevron and no
// tab bar, which settles it.
//
// ⚠ PALETTE. This screen is drawn on #F4F6F8, a cool blue-grey, where every
// other screen in the project uses the warm #FAF8F5 — with warm #FCF3EB icon
// chips sitting on top of it. Built as drawn and kept local to the advSettings
// token block. See the header of constants/tokens/advSettings.ts.
//
// ⚠ Note 2: this advocate is Priya Sharma, Bar Council of Delhi. The
// verification flow one batch earlier is Rahul Sharma, MP Bar Council.
//
// STATIC, NOT WIRED. The nine toggles do not toggle, nothing is persisted, and
// no preference is read from or written to anything.

export default function AdvocateSettingsScreen() {
  const insets = useSafeAreaInsets();
  const d = AS_ROOT;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/dashboard' as Href))}
        >
          <ChevronLeft size={t.backIcon} color="#1B1C1C" strokeWidth={2.6} />
        </Pressable>
        <Text style={styles.title} {...shrinkToFit(0.8)}>
          {d.title}
        </Text>
        <MessageSquare size={t.headerIcon} color="#4D463D" strokeWidth={1.8} />
        <Bell size={t.headerIcon} color="#4D463D" strokeWidth={1.8} style={styles.bell} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <UserRound size={34} color={ink.accent} strokeWidth={1.6} />
          </View>
          <View style={styles.profileCol}>
            <Text style={styles.name} {...shrinkToFit(0.8)}>
              {d.profile.name}
            </Text>
            <View style={styles.badgeRow}>
              <SettingsIcon name="badge" size={t.badgeGlyph} color={status.active} />
              <Text style={styles.badge} {...shrinkToFit(0.8)}>
                {d.profile.badge}
              </Text>
            </View>
            <Text style={styles.email} {...shrinkToFit(0.8)}>
              {d.profile.email}
            </Text>
            <Pressable
              accessibilityRole="button"
              style={styles.edit}
              onPress={() => router.push('/advocate/settings/edit-profile' as Href)}
            >
              <Text style={styles.editText} {...shrinkToFit(0.8)}>
                {d.profile.action}
              </Text>
            </Pressable>
          </View>
        </View>

        {d.sections.map((sec, si) => (
          <Fragment key={sec.title}>
            <Text style={[styles.section, si === 0 && styles.sectionFirst]}>{sec.title}</Text>
            <View style={styles.card}>
              {sec.rows.map((r, i) => (
                <Fragment key={r.key}>
                  {i > 0 ? <View style={styles.rule} /> : null}
                  <Pressable
                    accessibilityRole={r.toggle ? 'switch' : 'button'}
                    disabled={!r.href}
                    style={styles.row}
                    onPress={() => (r.href ? router.push(r.href as Href) : undefined)}
                  >
                    <View style={styles.chip}>
                      <SettingsIcon name={r.icon} size={t.chipGlyph} color={ink.accent} />
                    </View>
                    <View style={styles.rowCol}>
                      <Text style={styles.rowTitle} {...shrinkToFit(0.8)}>
                        {r.title}
                      </Text>
                      {r.sub ? <Text style={styles.rowSub}>{r.sub}</Text> : null}
                    </View>
                    {r.toggle ? (
                      <View style={styles.toggle}>
                        <View style={styles.knob} />
                      </View>
                    ) : (
                      <ChevronRight size={t.chevron} color={ink.accent} strokeWidth={2.4} />
                    )}
                  </Pressable>
                </Fragment>
              ))}
            </View>
          </Fragment>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    backgroundColor: t.headerBg,
  },
  title: {
    flex: 1,
    marginLeft: t.titleGap,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: '#1B1C1C',
  },
  bell: { marginLeft: t.headerIconGap },

  content: { paddingBottom: 32 },

  profile: {
    marginTop: t.profileTop,
    marginHorizontal: t.padX,
    flexDirection: 'row',
    backgroundColor: t.card,
    borderRadius: t.profileRadius,
    padding: t.profilePad,
  },
  avatar: {
    width: t.avatar,
    height: t.avatar,
    borderRadius: t.avatar / 2,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.avatarGap,
  },
  profileCol: { flex: 1 },
  name: { fontFamily: font.appHeading, fontSize: t.nameSize, color: '#4D463D' },
  badgeRow: { marginTop: t.badgeTop, flexDirection: 'row', alignItems: 'center' },
  badge: {
    marginLeft: t.badgeGap,
    fontFamily: font.appSemi,
    fontSize: t.badgeSize,
    color: status.active,
  },
  email: {
    marginTop: t.emailTop,
    fontFamily: font.appBody,
    fontSize: t.emailSize,
    color: '#4D463D',
  },
  edit: {
    marginTop: t.editTop,
    width: t.editW,
    height: t.editH,
    borderRadius: t.editRadius,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: { fontFamily: font.appSemi, fontSize: t.editSize, color: ink.onBrand },

  section: {
    marginTop: t.sectionTop,
    marginHorizontal: t.padX,
    marginBottom: t.sectionGap,
    fontFamily: font.appHeading,
    fontSize: t.sectionSize,
    color: '#4D463D',
  },
  sectionFirst: { marginTop: t.sectionTopFirst },
  card: {
    marginHorizontal: t.padX,
    backgroundColor: t.card,
    borderRadius: t.cardRadius,
    paddingHorizontal: t.cardPadX,
  },
  row: { minHeight: t.rowH, flexDirection: 'row', alignItems: 'center' },
  chip: {
    width: t.chip,
    height: t.chip,
    borderRadius: t.chip / 2,
    backgroundColor: t.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.chipGap,
  },
  rowCol: { flex: 1, paddingVertical: 8 },
  rowTitle: { fontFamily: font.appHeading, fontSize: t.rowTitleSize, color: '#4D463D' },
  rowSub: {
    marginTop: t.rowSubTop,
    fontFamily: font.appBody,
    fontSize: t.rowSubSize,
    lineHeight: t.rowSubLine,
    color: '#6B6B6B',
  },
  rule: { height: 1, backgroundColor: '#EFEFEF', marginLeft: t.chip + t.chipGap },

  toggle: {
    width: t.toggleW,
    height: t.toggleH,
    borderRadius: t.toggleH / 2,
    backgroundColor: colors.brand,
    padding: t.togglePad,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  knob: {
    width: t.toggleKnob,
    height: t.toggleKnob,
    borderRadius: t.toggleKnob / 2,
    backgroundColor: '#FFFFFF',
  },
});
