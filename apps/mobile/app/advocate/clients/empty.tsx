import { previewNotice } from '../../../components/PreviewNotice';
import { router } from 'expo-router';
import {
  ArrowRight,
  BookOpen,
  Inbox,
  Lock,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  UsersRound,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { shrinkToFit } from '../../../constants/textFit';
import { advClientsAlt as t, colors, font, ink } from '../../../constants/theme';

// Advocate clients — empty state (design/158).
//
// ─────────────────────────────────────────────────────────────────────────────
// REPORTED — DESIGNS 151, 158 AND 159 ARE THREE TREATMENTS OF ONE SCREEN.
//
//   design/151 (list)    a logo mark, a bell and an avatar; "Clients" with a
//                        subtitle and an add-client button; a plain search field
//   design/158 (empty)   NO logo, NO bell; "Clients" with a FILTER button and an
//                        avatar; a "0 ACTIVE MATTERS" pill and a "Chamber Ledger
//                        v2.4" version label; a search field with a LOCK icon
//   design/159 (search)  a back chevron, "Search Clients", a filter button and an
//                        avatar; a search field with a CLEAR button
//
// The empty state is not the list with its rows removed — it is a different header,
// different chrome and a product-version label that appears nowhere else in the app.
// "Chamber Ledger v2.4" in particular reads like a different product's naming. One
// of the three has to win; built as drawn so the difference is visible side by side.
//
// Reached from the clients list behind DEV_PREVIEW_TOGGLES, since nothing in the
// prototype can empty the list.
// ─────────────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Inbox,
    title: 'Incoming Requests',
    body: 'Accept client representation briefs or advisory consultation requests.',
  },
  {
    icon: ShieldCheck,
    title: 'Direct Engagement',
    body: 'Clients appear here from the cases assigned to you.',
  },
  {
    icon: BookOpen,
    title: 'Client Ledger',
    body: 'Case proceedings, filings, hearing notices & invoices cleanly linked.',
  },
];

export default function AdvocateClientsEmptyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + t.headerTop }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Text style={styles.title}>Clients</Text>
          <Pressable onPress={() => previewNotice("Filter")} accessibilityRole="button" accessibilityLabel="Filter" style={styles.iconBtn}>
            <SlidersHorizontal size={t.iconBtnGlyph} color={colors.brandDark} />
          </Pressable>
          <View style={styles.avatar}>
            <UserRound size={t.iconBtnGlyph} color={ink.onBrand} />
          </View>
        </View>

        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText} {...shrinkToFit(0.8)}>
              0 ACTIVE MATTERS
            </Text>
          </View>
          {/* A product-version label that appears nowhere else — see the note above. */}
          <Text style={styles.ver} {...shrinkToFit(0.8)}>
            Chamber Ledger v2.4
          </Text>
        </View>

        <View style={styles.search}>
          <Lock size={t.searchIcon} color={colors.textBody} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients, dossiers, or CNRs..."
            placeholderTextColor={colors.textMuted}
            editable={false}
          />
          <Search size={t.searchIcon} color={colors.textBody} />
        </View>

        <View style={styles.art}>
          <UsersRound size={t.artGlyph} color={colors.brand} />
        </View>

        <Text style={styles.emptyTitle}>No Clients Yet</Text>
        <Text style={styles.emptyBody}>
          Clients connected to your legal matters and dockets will appear here.
        </Text>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.feature}>
              <View style={styles.featureIcon}>
                <f.icon size={t.featureIconGlyph} color={colors.brandDark} />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle} {...shrinkToFit(0.8)}>
                  {f.title}
                </Text>
                <Text style={styles.featureBody}>{f.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/advocate/notifications')}
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        >
          <Text style={styles.buttonLabel}>View Requests</Text>
          <ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace('/(advocate)/dashboard')}
          style={({ pressed }) => [styles.alt, pressed && styles.pressed]}
        >
          <Text style={styles.altLabel}>Go to Dashboard</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { paddingHorizontal: t.padX, paddingBottom: 130 },

  topRow: { flexDirection: 'row', alignItems: 'center' },
  title: { flex: 1, minWidth: 0, fontFamily: font.appHeading, fontSize: t.titleSize, color: colors.textPrimary },
  iconBtn: {
    width: t.iconBtn,
    height: t.iconBtn,
    borderRadius: t.iconBtnRadius,
    backgroundColor: t.iconBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    marginLeft: t.iconBtnGap,
    width: t.iconBtn,
    height: t.iconBtn,
    borderRadius: t.iconBtn / 2,
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  pillRow: { marginTop: t.pillGap, flexDirection: 'row', alignItems: 'center' },
  pill: {
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  pillDot: {
    width: t.pillDot,
    height: t.pillDot,
    borderRadius: t.pillDot / 2,
    marginRight: t.pillDotGap,
    backgroundColor: colors.brand,
  },
  pillText: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    letterSpacing: t.pillSpacing,
    color: colors.textBody,
  },
  ver: { marginLeft: 'auto', paddingLeft: 10, fontFamily: font.appBody, fontSize: t.verSize, color: t.verColour },

  search: {
    marginTop: t.searchGap,
    minHeight: t.searchHeight,
    borderRadius: t.searchRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: t.searchBorder,
    paddingHorizontal: t.searchPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    marginHorizontal: t.searchIconGap,
    flex: 1,
    minWidth: 0,
    padding: 0,
    fontFamily: font.appBody,
    fontSize: t.searchSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },

  art: {
    marginTop: t.artGap,
    alignSelf: 'center',
    width: t.art,
    height: t.art,
    borderRadius: t.artRadius,
    backgroundColor: t.artBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: t.emptyTitleGap,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.emptyTitleSize,
    color: colors.textPrimary,
  },
  emptyBody: {
    marginTop: t.emptyBodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.emptyBodySize,
    lineHeight: t.emptyBodyLineHeight,
    color: colors.textBody,
  },

  features: { marginTop: t.featureGap },
  feature: {
    marginTop: t.featureRowGap,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: '#EFEAE2',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: t.featureIcon,
    height: t.featureIcon,
    borderRadius: t.featureIconRadius,
    backgroundColor: t.featureIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { flex: 1, minWidth: 0, marginLeft: t.featureIconGap },
  featureTitle: { fontFamily: font.appHeading, fontSize: t.featureTitleSize, color: colors.textPrimary },
  featureBody: {
    marginTop: t.featureBodyGap,
    fontFamily: font.appBody,
    fontSize: t.featureBodySize,
    lineHeight: t.featureBodyLineHeight,
    color: colors.textBody,
  },

  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: t.buttonBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.85 },
  buttonLabel: { fontFamily: font.appSemi, fontSize: t.buttonSize, color: ink.onBrand },
  buttonIcon: { marginLeft: t.buttonIconGap },
  alt: {
    marginTop: t.altGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    borderWidth: 1,
    borderColor: t.altBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  altLabel: { fontFamily: font.appBody, fontSize: t.buttonSize, color: colors.brandDark },
});
