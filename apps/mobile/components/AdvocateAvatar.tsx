import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { advocatePhoto } from '../data/advocates';

/** Preserve the supplied transparent portrait; unknown advocates retain their fallback.
 * `source` is the case's own portrait; without one, fixture names are looked up. */
export function AdvocateAvatar({ name, source: portrait, style, children }: {
  name: string; source?: ImageSourcePropType; style?: StyleProp<ViewStyle>; children?: ReactNode;
}) {
  const source = portrait ?? advocatePhoto(name);
  if (!source) return <View style={style}>{children}</View>;
  const layout = StyleSheet.flatten(style) ?? {};
  return <View style={[layout, { backgroundColor: 'transparent', borderRadius: 0, borderWidth: 0, overflow: 'visible' }]}>
    <Image source={source} accessibilityLabel={name} resizeMode="contain"
      style={{ width: '100%', height: '100%' }} />
  </View>;
}
