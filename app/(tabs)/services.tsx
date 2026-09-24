import { router } from 'expo-router';
import { ChevronLeft, ListFilter, Search } from 'lucide-react-native';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ServiceTile from '../../components/ServiceTile';
import { serviceIcon } from '../../components/serviceIcons';
import { colors, font, homeControlShadow, services, tabs } from '../../constants/theme';
import { allServices } from '../../data/services';

const SERVICES = allServices();

// Rows of two, so screen readers follow the visual order. Tiles get an explicit width
// rather than flex: on web a tile's text sets a minimum width that beats an even flex
// split, which would stretch a lone last card past half the grid.
const ROWS = Array.from({ length: Math.ceil(SERVICES.length / 2) }, (_, r) =>
  SERVICES.slice(r * 2, r * 2 + 2)
);

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tileWidth = (width - services.padX * 2 - services.gridGap) / 2;

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/home');
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
        contentContainerStyle={[
          styles.grid,
          // Clear the floating tab bar now that this screen lives inside the tabs.
          { paddingBottom: services.gridBottom + tabs.bottom + tabs.labelled.height + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {ROWS.map((row) => (
          <View key={row[0].id} style={styles.gridRow}>
            {row.map((s) => (
              <ServiceTile
                key={s.id}
                icon={serviceIcon(s.icon)}
                title={s.shortTitle}
                description={s.description}
                onPress={s.id === 'legal-notice' ? () => router.push('/legal-notice') : undefined}
                style={{ width: tileWidth }}
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
});
