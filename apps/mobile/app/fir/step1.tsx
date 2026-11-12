import {INDIA_JURISDICTIONS,JURISDICTION_RETRIEVED_AT} from '@legalitt/shared';
import type {CountryCode} from 'libphonenumber-js';
import { useFocusEffect } from 'expo-router';
import { Landmark, Lock, ShieldCheck } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import CountryCodePicker from '../../components/CountryCodePicker';
import FirShell from '../../components/FirShell';
import LabelledField from '../../components/LabelledField';
import PoliceStationPicker from '../../components/PoliceStationPicker';
import { colors, firLanding as l, firStep as s, font, ink } from '../../constants/theme';
import { useFir, type FirForm } from '../../context/fir';
import { INCIDENT_TYPES, incidentLabel } from '../../data/fir';
import {IntakeBoundary,IntakeError,IntakeStatus} from '../../features/fir/IntakeBoundary';
import {JurisdictionPicker} from '../../features/fir/JurisdictionPicker';
import {firErrorStep} from '../../features/fir/intake/draft';
import LeaveDraftModal from '../../features/fir/intake/LeaveDraftModal';
import PlaceOfIncidentCard from '../../features/fir/intake/PlaceOfIncidentCard';
import {ContinueButton,InlineError} from '../../features/fir/intake/ui';

// Step 1 — Quick Submission (F0b-step1-v2, flow C3), backed by the saved request.
//
// The design's 16pt side margins give way to the app-wide 20 FirShell uses for all
// five steps. Removed per the flow: "Primary Evidentiary Site", "encrypted", and
// "256-BIT ENCRYPTED •" from the centred lock line (it now reads only
// "CONFIDENTIAL SUBMISSION").
function FirStep1Screen() {
  const m = useFir();
  const { form, errors, updateContact, updateJurisdiction, updateIncident, updatePlace, flush } = m;
  const { contact, jurisdiction, incident } = form;
  const place = form.place ?? { address: '', city: '', pin: '' };
  const state = INDIA_JURISDICTIONS.find((st) => st.code === jurisdiction.state_code);

  // What was on screen when this step was opened; Back compares against it.
  const formRef = useRef<FirForm>(form), baseline = useRef('');
  formRef.current = form;
  useFocusEffect(useCallback(() => { baseline.current = JSON.stringify(formRef.current); }, []));
  const [leaving, setLeaving] = useState(false), [leaveBusy, setLeaveBusy] = useState(false), [leaveError, setLeaveError] = useState('');
  const [continuing, setContinuing] = useState(false);

  const onBack = () => {
    if (baseline.current && JSON.stringify(formRef.current) !== baseline.current) { setLeaveError(''); setLeaving(true); }
    else void m.back();
  };
  const leave = async (discard: boolean) => {
    setLeaveBusy(true); setLeaveError('');
    if (discard && baseline.current) m.update(JSON.parse(baseline.current) as FirForm);
    const saved = await flush();
    setLeaveBusy(false);
    if (!saved) { setLeaveError('That couldn’t be saved. Check your connection and try again.'); return; }
    setLeaving(false);
    void m.back();
  };
  const cont = async () => { setContinuing(true); try { await m.next(1); } finally { setContinuing(false); } };

  const chooseState = (code: string) => {
    const selected = INDIA_JURISDICTIONS.find((st) => st.code === code);
    if (!selected) return;
    updateJurisdiction({ state: selected.name, state_code: code, district: '', district_code: '', policeStation: '', police_station_id: undefined, source_retrieved_at: JURISDICTION_RETRIEVED_AT });
  };
  const chooseDistrict = (code: string, within = state) => {
    const district = within?.districts.find((d) => d.code === code);
    if (!district) return;
    updateJurisdiction({ district: district.name, district_code: code, policeStation: '', police_station_id: undefined, source_retrieved_at: JURISDICTION_RETRIEVED_AT });
  };
  // A listed city fills State and District only while both are still empty.
  const cityDistrict = (stateCode: string, districtCode: string) => {
    if (m.form.jurisdiction.state_code) return;
    const st = INDIA_JURISDICTIONS.find((x) => x.code === stateCode), d = st?.districts.find((x) => x.code === districtCode);
    if (st && d) updateJurisdiction({ state: st.name, state_code: st.code, district: d.name, district_code: d.code, policeStation: '', police_station_id: undefined, source_retrieved_at: JURISDICTION_RETRIEVED_AT });
  };
  const hasErrors = Object.keys(errors).some((k) => firErrorStep(k) === 1);

  return (
    <FirShell step={1} title="Quick Submission" onBack={onBack}>
      <IntakeStatus step={1} />
      <View style={[styles.card, styles.firstCard]}>
        <LabelledField
          label="Full Name"
          required
          placeholder="Enter your full name"
          value={contact.fullName}
          onChangeText={(t) => updateContact({ fullName: t })}
          autoComplete="name"
          onBlur={() => void flush()}
          style={styles.firstGroup}
        />
        <IntakeError field="fullName" />
        <LabelledField label="Mobile Number" required>
          <View style={[styles.mobileRow, !!errors.mobile && styles.invalid]}>
            <CountryCodePicker value={(contact.country_code ?? 'IN') as CountryCode} onChange={(country_code, dial_code) => updateContact({ country_code, dial_code })} style={styles.prefix} textStyle={styles.prefixText} chevronSize={s.prefixIcon} chevronColor={colors.textBody} />
            <TextInput
              value={contact.mobile}
              onChangeText={(t) => updateContact({ mobile: t })}
              onBlur={() => void flush()}
              placeholder="98765 43210"
              placeholderTextColor={s.placeholder}
              accessibilityLabel="Mobile Number"
              keyboardType="phone-pad"
              autoComplete="tel"
              style={styles.mobileInput}
            />
          </View>
        </LabelledField>
        <IntakeError field="mobile" />
        <LabelledField
          label="Email Address"
          placeholder="Enter your email address"
          value={contact.email}
          onChangeText={(t) => updateContact({ email: t })}
          onBlur={() => void flush()}
          keyboardType="email-address"
          autoComplete="email"
          autoCapitalize="none"
        />
        <IntakeError field="email" />
      </View>

      <View style={styles.card}>
        <LabelledField label="Incident Type" required style={styles.firstGroup}>
          <JurisdictionPicker label="Incident Type" value={incidentLabel(incident.type)} invalid={!!errors.type} options={INCIDENT_TYPES.map((t) => ({ code: t.id, name: t.label }))} onChange={(type) => updateIncident({ type })} />
        </LabelledField>
        <View style={styles.options}>
          {INCIDENT_TYPES.map((t) => {
            const selected = incident.type === t.id;
            return (
              <Pressable
                key={t.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => updateIncident({ type: t.id })}
                style={[styles.option, selected && styles.optionSelected]}
              >
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <IntakeError field="type" />
      </View>

      <PlaceOfIncidentCard place={place} errors={errors} onChange={updatePlace} onCityDistrict={cityDistrict} onBlur={() => void flush()} />

      <View style={styles.card}>
        <View style={styles.headingRow}>
          <Landmark size={s.headingIcon} color={ink.accent} />
          <Text style={styles.heading}>Jurisdiction Details</Text>
        </View>
        <LabelledField label="State" required style={styles.afterHeading}>
          <JurisdictionPicker label="State" value={jurisdiction.state} invalid={!!errors.state} options={INDIA_JURISDICTIONS} onChange={chooseState} />
        </LabelledField>
        <IntakeError field="state" />
        <LabelledField label="District" required>
          <JurisdictionPicker label="District" value={jurisdiction.district} invalid={!!errors.district} disabled={!state} options={state?.districts ?? []} onChange={(code) => chooseDistrict(code)} />
        </LabelledField>
        <IntakeError field="district" />
        <LabelledField label="Police Station" required>
          <PoliceStationPicker
            key={jurisdiction.district_code || 'none'}
            stateCode={jurisdiction.state_code}
            districtCode={jurisdiction.district_code}
            value={jurisdiction.policeStation}
            stationId={jurisdiction.police_station_id}
            invalid={!!errors.policeStation}
            onBlur={() => void flush()}
            onChange={({ name, id }) => updateJurisdiction({ policeStation: name, police_station_id: id })}
          />
        </LabelledField>
        <IntakeError field="policeStation" />
      </View>

      {hasErrors ? <InlineError text="Some details are missing or need fixing. They’re marked above." style={styles.summaryError} /> : null}
      <ContinueButton label="Continue" busy={continuing} onPress={() => void cont()} style={styles.button} />

      <View style={styles.footer}>
        <View style={styles.footerIcon}>
          <ShieldCheck size={s.headingIcon} color={ink.accent} />
        </View>
        <Text style={styles.footerText}>Your details are shared only with your assigned advocate and Legalitt admin.</Text>
      </View>
      <View style={styles.lockLine}>
        <Lock size={l.footerIcon} color={colors.textMuted} />
        <Text style={styles.lockText}>CONFIDENTIAL SUBMISSION</Text>
      </View>

      <LeaveDraftModal visible={leaving} busy={leaveBusy} error={leaveError} onSave={() => void leave(false)} onDiscard={() => void leave(true)} onStay={() => setLeaving(false)} />
    </FirShell>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: s.cardGap,
    borderRadius: s.cardRadius,
    backgroundColor: colors.card,
    paddingHorizontal: s.cardPad,
    paddingBottom: s.cardPadBottom,
  },
  firstCard: {
    marginTop: 0,
  },
  firstGroup: {
    marginTop: s.cardPadTop,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: s.fieldHeight,
    borderRadius: s.fieldRadius,
    backgroundColor: s.fieldBg,
    overflow: 'hidden',
  },
  invalid: {
    borderWidth: 1,
    borderColor: '#B3261E',
  },
  prefix: {
    width: s.prefixWidth,
    backgroundColor: s.prefixBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  prefixText: {
    fontFamily: font.appBody,
    fontSize: s.prefixSize,
    color: s.fieldText,
  },
  mobileInput: {
    flex: 1,
    paddingHorizontal: s.fieldPadX,
    fontFamily: font.appBody,
    fontSize: s.fieldTextSize,
    color: s.fieldText,
    outlineWidth: 0,
  },
  options: {
    marginTop: s.optionGap,
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: s.optionColGap,
    rowGap: s.optionRowGap,
  },
  option: {
    height: s.optionHeight,
    borderRadius: s.optionRadius,
    paddingHorizontal: s.optionPadX,
    backgroundColor: s.fieldBg,
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: colors.brand,
  },
  optionText: {
    fontFamily: font.appSemi,
    fontSize: s.optionSize,
    color: s.fieldText,
  },
  optionTextSelected: {
    color: ink.onBrand,
  },
  headingRow: {
    marginTop: s.cardPadTop + 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: s.headingIconGap,
  },
  afterHeading: {
    marginTop: s.headingBottomGap,
  },
  heading: {
    fontFamily: font.appHeading,
    fontSize: s.headingSize,
    color: colors.textPrimary,
  },
  summaryError: {
    marginTop: s.buttonGap,
  },
  button: {
    marginTop: s.buttonGap,
  },
  footer: {
    marginTop: s.footerGap,
    borderRadius: s.footerRadius,
    backgroundColor: s.footerBg,
    padding: s.footerPad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    width: s.footerIcon,
    height: s.footerIcon,
    borderRadius: s.footerIcon / 2,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s.footerIconGap,
  },
  footerText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: s.footerSize,
    lineHeight: s.footerLineHeight,
    color: ink.accent,
  },
  lockLine: {
    marginTop: l.footerGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: l.footerIconGap,
  },
  lockText: {
    fontFamily: font.appSemi,
    fontSize: l.footerSize,
    letterSpacing: 1,
    color: colors.textMuted,
  },
});
export default function LiveFirScreen() { return <IntakeBoundary step={1} title="Quick Submission"><FirStep1Screen/></IntakeBoundary>; }
