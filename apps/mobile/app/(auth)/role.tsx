import { router, useLocalSearchParams } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import PrimaryButton from '../../components/PrimaryButton';
import { LawyerGlyph, UserGlyph } from '../../components/RoleGlyphs';
import { useSession } from '../../context/session';
import { colors, font, ink, role, space, verify } from '../../constants/theme';

type Role = 'user' | 'lawyer';

export default function RoleScreen() {
  const insets = useSafeAreaInsets();
  const {next}=useLocalSearchParams<{next?:string}>();
  const { setRegistrationRole } = useSession();
  const [selected, setSelected] = useState<Role | null>(null);

  const onNext = () => {
    if (!selected) return;
    setRegistrationRole(selected);
    // Client-only guest home (11/144); advocates have no guest design.
    router.replace(next === 'signup' ? '/(auth)/signup' : next === 'login' ? '/(auth)/login' : selected === 'user' ? '/(tabs)/home' : '/(auth)/login');
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingBottom: Math.max(insets.bottom, verify.bottom) },
      ]}
    >
      {/* Weighted spacers keep the design's proportions and centre the block on any height. */}
      <View style={styles.spaceAbove} />

      <RoleCard
        id="user"
        title="User"
        subtitle="Get Legal Services"
        glyph={<UserGlyph />}
        selected={selected === 'user'}
        onPress={() => setSelected('user')}
      />
      <RoleCard
        id="lawyer"
        title="Lawyer"
        subtitle="Offer Legal Services"
        glyph={<LawyerGlyph />}
        selected={selected === 'lawyer'}
        onPress={() => setSelected('lawyer')}
        style={styles.secondCard}
      />

      <Text style={styles.heading}>Choose Your Role</Text>
      <Text
        style={styles.subline}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={role.sublineMinScale}
      >
        You Have To Choose Your Role What is Your Profession
      </Text>

      <View style={styles.spaceBelow} />

      <PrimaryButton label="Next" onPress={onNext} />
    </View>
  );
}

type CardProps = {
  id: Role;
  title: string;
  subtitle: string;
  glyph: ReactNode;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

function RoleCard({ id, title, subtitle, glyph, selected, onPress, style }: CardProps) {
  const gradientId = `role-border-${id}`;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const inset = role.cardBorderSelected / 2;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      onPress={onPress}
      onLayout={onLayout}
      style={[styles.card, style]}
    >
      {/* Border is layered over the card edge so its thickness never shifts the layout. The
          selected stroke is sized from layout and inset by half its width, so no edge can
          fall outside the Svg bounds (percentage sizing clipped it on Android). */}
      {selected ? (
        size.width > 0 && (
          <Svg width={size.width} height={size.height} style={styles.overlay}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.brand} />
                <Stop offset="1" stopColor={colors.brandDark} />
              </LinearGradient>
            </Defs>
            <Rect
              x={inset}
              y={inset}
              width={size.width - role.cardBorderSelected}
              height={size.height - role.cardBorderSelected}
              rx={role.cardRadius - inset}
              fill="none"
              stroke={`url(#${gradientId})`}
              strokeWidth={role.cardBorderSelected}
            />
          </Svg>
        )
      ) : (
        <View style={[styles.overlay, styles.cardBorder]} />
      )}

      <View style={styles.avatar}>{glyph}</View>

      <View style={styles.cardText}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
      </View>

      <View style={[styles.ring, selected && styles.ringSelected]}>
        {selected && (
          <Check size={role.tickSize} strokeWidth={role.tickStroke} color={ink.onBrand} />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.screenBg,
    paddingHorizontal: space.screenX,
  },
  card: {
    height: role.cardHeight,
    borderRadius: role.cardRadius,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: role.cardPadX,
  },
  secondCard: {
    marginTop: role.cardGap,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    pointerEvents: 'none',
  },
  cardBorder: {
    borderRadius: role.cardRadius,
    borderWidth: role.cardBorder,
    borderColor: colors.border,
  },
  avatar: {
    width: role.avatarSize,
    height: role.avatarSize,
    borderRadius: role.avatarSize / 2,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    marginLeft: role.textGap,
  },
  cardTitle: {
    fontFamily: font.authHeading,
    fontSize: role.titleSize,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    marginTop: role.subtitleGap,
    fontFamily: font.authBody,
    fontSize: role.subtitleSize,
    color: colors.textPrimary,
  },
  ring: {
    width: role.ringSize,
    height: role.ringSize,
    borderRadius: role.ringSize / 2,
    borderWidth: role.ringBorder,
    borderColor: ink.hint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringSelected: {
    borderColor: colors.brand,
    backgroundColor: colors.brand,
  },
  heading: {
    marginTop: role.headingGap,
    fontFamily: font.authHeading,
    fontSize: role.headingSize,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subline: {
    marginTop: role.sublineGap,
    fontFamily: font.authBody,
    fontSize: role.sublineSize,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  spaceAbove: {
    flex: role.spaceAbove,
  },
  spaceBelow: {
    flex: role.spaceBelow,
  },
});
