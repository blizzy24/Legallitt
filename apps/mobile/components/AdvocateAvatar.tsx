import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { advocatePhoto } from '../data/advocates';

/** Preserve the supplied transparent portrait; unknown advocates retain their fallback. */
export function AdvocateAvatar({ name, style, children }: {
  name: string; style?: StyleProp<ViewStyle>; children?: ReactNode;
}) {
  const source = advocatePhoto(name);
  if (!source) return <View style={style}>{children}</View>;
  const layout = StyleSheet.flatten(style) ?? {};
  return <View style={[layout, { backgroundColor: 'transparent', borderRadius: 0, borderWidth: 0, overflow: 'visible' }]}>
    <Image source={source} accessibilityLabel={name} resizeMode="contain"
      style={{ width: '100%', height: '100%' }} />
  </View>;
}
