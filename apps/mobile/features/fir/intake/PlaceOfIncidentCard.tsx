// Step 1 "Place of Incident" card (F0b-step1-v2, flow C3).
import {INDIA_JURISDICTIONS, type FirIntake} from '@legalitt/shared';
import {LocateFixed, MapPin} from 'lucide-react-native';
import {useState} from 'react';
import {Platform, Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

import {colors, firStep as s, font, ink} from '../../../constants/theme';
import {JurisdictionPicker} from '../JurisdictionPicker';
import {InlineError, intakeStyles} from './ui';

type Place = NonNullable<FirIntake['place']>;
type Geo = {getCurrentPosition(ok: (p: {coords: {latitude: number; longitude: number}}) => void, fail: () => void, o?: object): void};

// No city list exists; the LGD district names (with their state) stand in, and
// any other city can be typed.
const CITY_OPTIONS = INDIA_JURISDICTIONS
  .flatMap(st => st.districts.map(d => ({code: `${st.code}:${d.code}`, name: d.name, hint: st.name})))
  .sort((a, b) => a.name.localeCompare(b.name));

const geolocation = (): Geo | null =>
  Platform.OS === 'web' ? ((globalThis as {navigator?: {geolocation?: Geo}}).navigator?.geolocation ?? null) : null;

export default function PlaceOfIncidentCard({place, errors, onChange, onCityDistrict, onBlur}: {
  place: Place;
  errors: Record<string, string>;
  onChange: (patch: Partial<Place>) => void;
  /** A listed city was picked: lets Step 1 fill an empty State / District with it. */
  onCityDistrict: (stateCode: string, districtCode: string) => void;
  onBlur: () => void;
}) {
  const [locating, setLocating] = useState(false), [geoError, setGeoError] = useState('');
  const geo = geolocation();
  const locate = () => {
    if (!geo) return;
    setLocating(true); setGeoError('');
    geo.getCurrentPosition(
      p => { setLocating(false); onChange({lat: Number(p.coords.latitude.toFixed(5)), lng: Number(p.coords.longitude.toFixed(5))}); },
      () => { setLocating(false); setGeoError('Couldn’t get your location. Please type the address.'); },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 60000},
    );
  };
  const located = place.lat != null && place.lng != null;
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <View style={styles.headIcon}><MapPin size={17} color={ink.accent} /></View>
        <View style={styles.headText}>
          <Text style={styles.title}>Place of Incident</Text>
          <Text style={styles.subtitle}>Where did the incident take place?</Text>
        </View>
      </View>

      <Text style={[styles.label, styles.firstLabel]}>Address / Place<Text style={styles.star}>*</Text></Text>
      <TextInput
        multiline
        value={place.address}
        onChangeText={address => onChange({address})}
        onBlur={onBlur}
        placeholder="Enter the location where the incident occurred (Building, Street, Landmark)"
        placeholderTextColor={s.placeholder}
        accessibilityLabel="Address or place of the incident"
        style={[intakeStyles.textArea, styles.address, !!errors.placeAddress && styles.invalid]}
      />
      <InlineError text={errors.placeAddress} />

      {geo ? (
        <Pressable accessibilityRole="button" disabled={locating} onPress={locate} style={styles.locate} hitSlop={6}>
          <LocateFixed size={16} color={ink.accent} />
          <Text style={styles.locateText}>{locating ? 'Getting your location…' : 'Use current location'}</Text>
        </Pressable>
      ) : null}
      <InlineError text={geoError} />
      {located ? (
        <View style={styles.located}>
          <Text style={intakeStyles.muted}>
            Current location attached ({place.lat}, {place.lng}). Also type the building, street and landmark above so your advocate can read it.
          </Text>
          <Pressable accessibilityRole="button" onPress={() => onChange({lat: undefined, lng: undefined})} hitSlop={6}>
            <Text style={styles.remove}>Remove location</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>City<Text style={styles.star}>*</Text></Text>
          <JurisdictionPicker
            label="City"
            value={place.city}
            placeholder="Select city"
            options={CITY_OPTIONS}
            invalid={!!errors.placeCity}
            allowCustom
            onCustom={city => onChange({city})}
            onChange={code => {
              const option = CITY_OPTIONS.find(o => o.code === code);
              if (!option) return;
              onChange({city: option.name});
              const [stateCode, districtCode] = code.split(':');
              onCityDistrict(stateCode!, districtCode!);
            }}
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>PIN Code</Text>
          <View style={[styles.pin, !!errors.placePin && styles.invalid]}>
            <TextInput
              value={place.pin}
              onChangeText={pin => onChange({pin: pin.replace(/\D/g, '').slice(0, 6)})}
              onBlur={onBlur}
              placeholder="6 digits"
              placeholderTextColor={s.placeholder}
              accessibilityLabel="PIN Code"
              keyboardType="number-pad"
              maxLength={6}
              style={styles.pinInput}
            />
            <View style={styles.pinGlyph}><Text style={styles.pinGlyphText}>123</Text></View>
          </View>
        </View>
      </View>
      <InlineError text={errors.placeCity} />
      <InlineError text={errors.placePin} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {marginTop: s.cardGap, borderRadius: s.cardRadius, backgroundColor: colors.card, padding: s.cardPad},
  head: {flexDirection: 'row', alignItems: 'flex-start'},
  headIcon: {width: 28, height: 28, borderRadius: 8, backgroundColor: s.fieldBg, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2},
  headText: {flex: 1, minWidth: 0},
  title: {fontFamily: font.appHeading, fontSize: 18, color: colors.textPrimary},
  subtitle: {marginTop: 4, fontFamily: font.appBody, fontSize: 13, color: colors.textPrimary},
  label: {marginTop: s.labelGap + 8, marginBottom: 8, fontFamily: font.appSemi, fontSize: s.labelSize, color: s.label},
  firstLabel: {marginTop: 18},
  star: {color: s.starColour},
  address: {minHeight: 62},
  invalid: {borderWidth: 1, borderColor: '#B3261E'},
  locate: {marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start'},
  locateText: {fontFamily: font.appSemi, fontSize: 13.5, color: ink.accent, textDecorationLine: 'underline'},
  located: {marginTop: 8, gap: 6},
  remove: {fontFamily: font.appSemi, fontSize: 12.5, color: ink.accent},
  row: {flexDirection: 'row', gap: 12},
  col: {flex: 1, minWidth: 0},
  pin: {height: s.fieldHeight, borderRadius: s.fieldRadius, backgroundColor: s.fieldBg, paddingLeft: 14, paddingRight: 10, flexDirection: 'row', alignItems: 'center'},
  pinInput: {flex: 1, minWidth: 0, fontFamily: font.appBody, fontSize: s.fieldTextSize, color: s.fieldText, outlineWidth: 0},
  pinGlyph: {borderWidth: 1.2, borderColor: colors.textBody, borderRadius: 3, paddingHorizontal: 2},
  pinGlyphText: {fontFamily: font.appSemi, fontSize: 8, color: colors.textBody},
});
