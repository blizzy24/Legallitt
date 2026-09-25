import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cases as t, colors, font, ink, space, tabs } from '../../constants/theme';

// PROVISIONAL — no design exists for a messages list. This is a placeholder shell
// whose only job is to give /support-chat (design/35) an entry point; replace the
// whole screen once the client supplies the real inbox design.
export default function MessagesScreen() {
  const insets = useSafeAreaInsets();

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
        <Text style={styles.title}>Messages</Text>
        <Text style={styles.subtitle}>Your conversations with Legalitt.</Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/support-chat')}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>L</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Legalitt Support</Text>
            <Text style={styles.rowSub} numberOfLines={1}>
              Regarding: Legal Notice Service
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  content: {
    paddingHorizontal: space.screenX,
  },
  title: {
    fontFamily: font.appHeading,
    fontSize: t.titleSize,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: t.subtitleGap,
    fontFamily: font.appBody,
    fontSize: t.subtitleSize,
    color: colors.textBody,
  },
  row: {
    marginTop: t.sectionGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: t.hairline,
    borderColor: colors.border,
    padding: t.cardPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: font.appSemi,
    fontSize: 15,
    color: ink.onBrand,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontFamily: font.appHeading,
    fontSize: t.cardTitleSize,
    color: colors.textPrimary,
  },
  rowSub: {
    marginTop: 3,
    fontFamily: font.appBody,
    fontSize: t.subtitleSize,
    color: colors.textBody,
  },
});
