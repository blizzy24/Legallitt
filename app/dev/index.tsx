import { router, type Href, Redirect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CourierHeader from '../../components/CourierHeader';
import { DEV_PREVIEW_TOGGLES } from '../../constants/dev';
import { devIndex as d, font } from '../../constants/theme';
import { DEV_ROUTES } from '../../data/devRoutes';

// DEVELOPMENT ONLY — every route, grouped by section, each tappable. Linked from
// the dev preview blocks on the client Home and the advocate Dashboard. Not a
// designed screen; hidden (renders nothing useful) when DEV_PREVIEW_TOGGLES is off.

export default function DevIndexScreen() {
  const insets = useSafeAreaInsets();
  // With the dev toggles off (client builds) this route is not a screen: go home.
  if (!DEV_PREVIEW_TOGGLES) return <Redirect href="/" />;
  return (
    <View style={styles.page}>
      <CourierHeader title={d.title} sub={`${DEV_ROUTES.reduce((n, g) => n + g.routes.length, 0)} ${d.routesSuffix}`} />
      <ScrollView contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + d.pad }]}>
        {DEV_ROUTES.map((g) => (
          <View key={g.section} style={styles.group}>
            <Text style={styles.section}>{g.section.toUpperCase()}</Text>
            {g.routes.map((r) => (
              <Pressable key={r.href} accessibilityRole="link" onPress={() => router.push(r.href as Href)} style={styles.row}>
                <Text style={styles.href}>{r.href}</Text>
                {r.design ? <Text style={styles.design}>{`${d.designPrefix}${r.design}`}</Text> : null}
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: d.bg },
  body: { padding: d.pad, gap: d.groupGap },
  group: { gap: d.rowGap },
  section: { fontFamily: font.appSemi, fontSize: d.sectionSize, letterSpacing: d.sectionSpacing, color: d.muted },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: d.rowGap, paddingVertical: d.rowPadY, borderBottomWidth: 1, borderBottomColor: d.rule },
  href: { flexShrink: 1, fontFamily: font.appBody, fontSize: d.hrefSize, color: d.ink },
  design: { fontFamily: font.appBody, fontSize: d.designSize, color: d.muted },
});
