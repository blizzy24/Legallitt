import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';
import { ChevronDown } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { font, pickers as p } from '../constants/theme';

/** The region's name in English, or its ISO code where the platform has no Intl.DisplayNames. */
function regionName(code: string) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

/**
 * The standard country calling-code control: shows "+91" (India by default),
 * opens the full list (libphonenumber-js's metadata — every country and its
 * code, nothing typed by hand) in a bottom sheet. Selection is local state.
 */
export default function CountryCodePicker({
  initial = 'IN',
  value,
  onChange,
  style,
  textStyle,
  chevronSize,
  chevronColor,
}: {
  initial?: CountryCode;
  value?: CountryCode;
  onChange?: (country: CountryCode, dial: string) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  chevronSize: number;
  chevronColor: string;
}) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [localCode, setCode] = useState<CountryCode>(initial);
  const code=value??localCode;
  const [open, setOpen] = useState(false);
  const list = useMemo(
    () =>
      getCountries()
        .map((c) => ({ c, name: regionName(c), dial: getCountryCallingCode(c) }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );
  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={`${regionName(code)} +${getCountryCallingCode(code)}`} onPress={() => setOpen(true)} style={style}>
        <Text style={textStyle}>+{getCountryCallingCode(code)}</Text>
        <ChevronDown size={chevronSize} color={chevronColor} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable accessibilityRole="button" accessibilityLabel={p.a11yClose} style={styles.scrim} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { height: height * p.listShare, paddingBottom: insets.bottom }]}>
          <FlatList
            data={list}
            keyExtractor={(x) => x.c}
            initialScrollIndex={Math.max(0, list.findIndex((x) => x.c === code))}
            getItemLayout={(_, i) => ({ length: p.rowH, offset: p.rowH * i, index: i })}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                aria-selected={item.c === code}
                onPress={() => {
                  setCode(item.c);
                  onChange?.(item.c,'+'+item.dial);
                  setOpen(false);
                }}
                style={[styles.row, item.c === code && styles.rowOn]}
              >
                <Text style={[styles.name, item.c === code && styles.on]}>
                  {item.name}
                </Text>
                <Text style={[styles.dial, item.c === code && styles.on]}>+{item.dial}</Text>
              </Pressable>
            )}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: p.scrim },
  sheet: { backgroundColor: p.sheetBg, borderTopLeftRadius: p.radius, borderTopRightRadius: p.radius, paddingTop: p.padTop / 2 },
  row: { height: p.rowH, paddingHorizontal: p.padX, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: p.rule },
  rowOn: { backgroundColor: p.rule },
  name: { flexShrink: 1, fontFamily: font.appBody, fontSize: p.rowSize, color: p.ink },
  dial: { fontFamily: font.appSemi, fontSize: p.codeSize, color: p.muted },
  on: { color: p.ink, fontFamily: font.appSemi },
});
