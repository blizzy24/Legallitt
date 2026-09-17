import { router } from 'expo-router';
import {
  Blend,
  ChevronLeft,
  FileText,
  House,
  Landmark,
  ListFilter,
  MessageSquare,
  PenLine,
  Search,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ServiceTile from '../components/ServiceTile';
import { colors, font, homeControlShadow, services } from '../constants/theme';

const SERVICES: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: FileText, title: 'Legal Notice', description: 'Prepare and send a professional legal notice' },
  { icon: House, title: 'Property Search', description: 'Get property records reviewed and obtain report' },
  { icon: PenLine, title: 'FIR Draft', description: 'Get assistance with preparing an FIR draft' },
  { icon: Blend, title: 'Court Marriage', description: 'Assistance with court marriage procedures' },
  { icon: ShieldCheck, title: 'Document Forensic', description: 'Examine authenticity and inconsistencies' },
  { icon: Landmark, title: 'High Court Rep.', description: 'Connect for High Court legal representation' },
  { icon: UserCheck, title: 'District Court Rep.', description: 'Advocates for District Court representation' },
  { icon: MessageSquare, title: 'Legal Advice', description: 'Guidance from a qualified advocate' },
];

const ROWS = [0, 2, 4, 6].map((i) => SERVICES.slice(i, i + 2));

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(insets.top + services.topInsetGap, services.top) },
        ]}
      >
        <View style={styles.headerRow}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={goBack} style={styles.circleButton}>
            <ChevronLeft size={services.backIcon} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>All Services</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Filter" style={styles.circleButton}>
            <ListFilter size={services.filterIcon} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.search}>
          <Search size={services.searchIcon} color={colors.textBody} />
          <TextInput
            placeholder="Search legal services"
            placeholderTextColor={colors.textBody}
            editable={false}
            style={styles.searchInput}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.grid, { paddingBottom: services.gridBottom + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {ROWS.map((row) => (
          <View key={row[0].title} style={styles.gridRow}>
            {row.map((s) => (
              <ServiceTile
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.appBg,
  },
  header: {
    paddingHorizontal: services.padX,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleButton: {
    width: services.headerButton,
    height: services.headerButton,
    borderRadius: services.headerButton / 2,
    backgroundColor: colors.card,
    borderWidth: services.border,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...homeControlShadow,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: services.titleSize,
    color: colors.textPrimary,
  },
  search: {
    marginTop: services.searchGap,
    height: services.searchHeight,
    borderRadius: services.searchRadius,
    backgroundColor: colors.card,
    borderWidth: services.border,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: services.searchPadX,
    ...homeControlShadow,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    marginLeft: services.searchTextGap,
    fontFamily: font.appBody,
    fontSize: services.placeholderSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  scroll: {
    flex: 1,
  },
  grid: {
    paddingTop: services.gridTop,
    paddingHorizontal: services.padX,
    gap: services.gridGap,
  },
  gridRow: {
    flexDirection: 'row',
    gap: services.gridGap,
  },
  gridItem: {
    flex: 1,
  },
});
