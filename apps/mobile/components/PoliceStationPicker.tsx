import { firPoliceStations } from '@legalitt/shared';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, firStep as s, font, ink } from '../constants/theme';
import { JurisdictionPicker } from '../features/fir/JurisdictionPicker';

const TYPE_CODE = '__type__';

/**
 * Police Station on FIR Step 1 (flow C3): a dropdown filtered by the chosen
 * district, from the seeded list (MP: Indore and Bhopal), with "Type police
 * station name" always available. Districts without a list take typed text.
 */
export default function PoliceStationPicker({
  stateCode,
  districtCode,
  value,
  stationId,
  onChange,
  onBlur,
  invalid = false,
}: {
  stateCode?: string;
  districtCode?: string;
  /** The station name as saved. */
  value: string;
  /** Set when the name came from the seeded list. */
  stationId?: string;
  onChange: (station: { name: string; id?: string }) => void;
  onBlur?: () => void;
  invalid?: boolean;
}) {
  const stations = firPoliceStations(stateCode, districtCode);
  // Typed text is shown where there is no list, after "Type police station name",
  // or for a name saved as free text (no station id), e.g. edited on Step 2.
  const [typing, setTyping] = useState(false);
  if (!districtCode) {
    return <JurisdictionPicker label="Police Station" value="" options={[]} onChange={() => {}} disabled disabledHint="Choose a district first." invalid={invalid} />;
  }
  if (!stations.length || typing || (!!value && !stationId)) {
    return (
      <View>
        <TextInput
          value={value}
          onChangeText={(name) => onChange({ name })}
          onBlur={onBlur}
          placeholder="Type police station name"
          placeholderTextColor={s.placeholder}
          accessibilityLabel="Police Station"
          autoCapitalize="words"
          style={[styles.input, invalid && styles.invalid]}
        />
        {stations.length ? (
          <Pressable accessibilityRole="button" hitSlop={8} onPress={() => { setTyping(false); onChange({ name: '' }); }} style={styles.switch}>
            <Text style={styles.switchText}>Choose from the list instead</Text>
          </Pressable>
        ) : (
          <Text style={styles.note}>We don’t have a station list for this district yet, so type the station’s name.</Text>
        )}
      </View>
    );
  }
  return (
    <JurisdictionPicker
      label="Police Station"
      value={stationId ? value : ''}
      invalid={invalid}
      options={[...stations.map((st) => ({ code: st.id, name: st.name })), { code: TYPE_CODE, name: 'Type police station name' }]}
      onChange={(code) => {
        if (code === TYPE_CODE) { setTyping(true); onChange({ name: '' }); return; }
        const st = stations.find((x) => x.id === code);
        if (st) onChange({ name: st.name, id: st.id });
      }}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: s.fieldHeight,
    borderRadius: s.fieldRadius,
    backgroundColor: s.fieldBg,
    paddingHorizontal: s.fieldPadX,
    fontFamily: font.appBody,
    fontSize: s.fieldTextSize,
    color: s.fieldText,
    outlineWidth: 0,
  },
  invalid: { borderWidth: 1, borderColor: '#B3261E' },
  switch: { marginTop: 8, alignSelf: 'flex-start' },
  switchText: { fontFamily: font.appSemi, fontSize: 12.5, color: ink.accent },
  note: { marginTop: 8, fontFamily: font.appBody, fontSize: 12, lineHeight: 17, color: colors.textMuted },
});
