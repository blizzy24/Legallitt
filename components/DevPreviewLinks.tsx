import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DEV_PREVIEW_TOGGLES } from '../constants/dev';
import { colors, font } from '../constants/theme';

// DEVELOPMENT ONLY — hidden by DEV_PREVIEW_TOGGLES in constants/dev.ts.
//
// Grouped "Preview state" links to screens no designed navigation reaches yet,
// so they can be walked on a device. Same look as every other preview link in
// the app (underlined muted text, centred); it adds only a group heading. These
// are not product UI and must not ship.

export type DevPreviewGroup = { label: string; links: { label: string; href: string }[] };

export default function DevPreviewLinks({ groups }: { groups: DevPreviewGroup[] }) {
  if (!DEV_PREVIEW_TOGGLES) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Preview states (development only)</Text>
      {groups.map((g) => (
        <View key={g.label} style={styles.group}>
          <Text style={styles.groupLabel}>{g.label}</Text>
          {g.links.map((l) => (
            <Pressable
              key={l.href}
              accessibilityRole="button"
              onPress={() => router.push(l.href as Href)}
              style={styles.devLink}
            >
              <Text style={styles.devLinkText}>Preview state: {l.label}</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 22, alignItems: 'center' },
  title: { fontFamily: font.appSemi, fontSize: 12, color: colors.textMuted },
  group: { marginTop: 14, alignItems: 'center' },
  groupLabel: { fontFamily: font.appSemi, fontSize: 11, letterSpacing: 0.6, color: colors.textMuted },
  devLink: { marginTop: 8, alignItems: 'center' },
  devLinkText: {
    fontFamily: font.appBody,
    fontSize: 12,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
