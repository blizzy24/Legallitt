import { router } from 'expo-router';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquareText,
  PhoneCall,
  Scale,
  Wallet,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../constants/textFit';
import { ADV_NOTIFICATIONS, type AdvNotification } from '../../data/advocateSide';
import { advNotifications as t, colors, font } from '../../constants/theme';

// Advocate notifications (design/150). Reached from the dashboard's bell.
//
// Lives outside the (advocate) tab group for the same reason as availability: the
// design draws no tab bar.
//
// REPORTED — NONE OF THE SIX ROWS HAS A DESIGNED DESTINATION. Every row draws a
// chevron, and no file in the batch shows where any of them leads — not the case
// request, not the payment, not the message, not the legal-notice request. They are
// inert. Six chevrons that go nowhere is six screens nobody has specified.
//
// "Mark all as read" works and clears every unread dot.
//
// Drawn as-is, with the file's errors intact: "New cases Request" (casing) and
// "Rahul sharma has request a constitution regarding of divorce metter", which
// should almost certainly read "has requested a consultation regarding a divorce
// matter" — four errors in one line, including "constitution" for "consultation".

const ICONS: Record<AdvNotification['icon'], typeof CalendarDays> = {
  calendar: CalendarDays,
  wallet: Wallet,
  message: MessageSquareText,
  document: FileText,
  consult: PhoneCall,
  case: Scale,
};

export default function AdvocateNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [read, setRead] = useState<string[]>([]);

  const sections: { key: 'today' | 'earlier'; label: string }[] = [
    { key: 'today', label: 'TODAY' },
    { key: 'earlier', label: 'EARLIER' },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + t.headerTop }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={10}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace('/(advocate)/dashboard')
          }
        >
          <ChevronLeft size={t.backIcon} color={colors.brandDark} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          Notification
        </Text>
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => setRead(ADV_NOTIFICATIONS.map((n) => n.id))}
        >
          <Text style={styles.action} {...shrinkToFit(0.8)}>
            Mark all as read
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((s) => (
          <View key={s.key}>
            <Text style={styles.section} {...shrinkToFit(0.8)}>
              {s.label}
            </Text>
            {ADV_NOTIFICATIONS.filter((n) => n.section === s.key).map((n) => {
              const Icon = ICONS[n.icon];
              const unread = n.unread && !read.includes(n.id);
              return (
                <View key={n.id} style={styles.row}>
                  <View style={styles.icon}>
                    <Icon size={t.iconGlyph} color={colors.brandDark} />
                  </View>

                  <View style={styles.rowText}>
                    <Text style={styles.rowTitle} {...shrinkToFit(0.75)}>
                      {n.title}
                    </Text>
                    <Text style={styles.rowBody}>{n.body}</Text>
                  </View>

                  <View style={styles.rowRight}>
                    <View style={styles.whenRow}>
                      <Text style={styles.when} {...shrinkToFit(0.8)}>
                        {n.when}
                      </Text>
                      {unread && <View style={styles.unreadDot} />}
                    </View>
                    <ChevronRight size={t.chevron} color={colors.brandDark} />
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: t.padX,
    paddingBottom: t.headerPadBottom,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.backGap,
    marginRight: 10,
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  action: { fontFamily: font.appBody, fontSize: t.actionSize, color: t.actionColour },

  content: { paddingHorizontal: t.padX },
  section: {
    marginTop: t.sectionGap,
    fontFamily: font.appSemi,
    fontSize: t.sectionSize,
    letterSpacing: t.sectionSpacing,
    color: t.sectionColour,
  },
  row: {
    marginTop: t.rowGap,
    borderRadius: t.rowRadius,
    backgroundColor: colors.card,
    padding: t.rowPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: t.icon,
    height: t.icon,
    borderRadius: t.iconRadius,
    backgroundColor: t.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, minWidth: 0, marginLeft: t.iconGap },
  rowTitle: { fontFamily: font.appHeading, fontSize: t.titleRowSize, color: colors.textPrimary },
  rowBody: {
    marginTop: t.bodyGap,
    fontFamily: font.appBody,
    fontSize: t.bodySize,
    lineHeight: t.bodyLineHeight,
    color: colors.textBody,
  },
  rowRight: { marginLeft: t.chevronGap, alignItems: 'flex-end' },
  whenRow: { flexDirection: 'row', alignItems: 'center' },
  when: { fontFamily: font.appBody, fontSize: t.whenSize, color: t.whenColour },
  unreadDot: {
    width: t.unreadDot,
    height: t.unreadDot,
    borderRadius: t.unreadDot / 2,
    marginLeft: t.unreadDotGap,
    backgroundColor: colors.brandDark,
  },
});
