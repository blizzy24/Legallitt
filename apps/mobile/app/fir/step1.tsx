import {INDIA_JURISDICTIONS,JURISDICTION_RETRIEVED_AT} from '@legalitt/shared';
import type {CountryCode} from 'libphonenumber-js';
import {JurisdictionPicker} from '../../features/fir/JurisdictionPicker';
import {IntakeBoundary,IntakeStatus,IntakeError} from '../../features/fir/IntakeBoundary';
import { router } from 'expo-router';
import { ArrowRight, ChevronDown, Landmark, ShieldCheck } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import FirShell from '../../components/FirShell';
import LabelledField from '../../components/LabelledField';
import { colors, firStep as s, font, ink } from '../../constants/theme';
import { useFir } from '../../context/fir';
import { INCIDENT_TYPES, incidentLabel } from '../../data/fir';
import CountryCodePicker from '../../components/CountryCodePicker';

// Step 1 — Quick Submission (design/42), backed by the saved case.
//
// design/42 draws 16pt side margins, but designs 43 and 44 both draw 20 and 20 is
// the app-wide margin, so FirShell uses 20 for all five steps. This screen is the
// one that pays for it: its cards are 8pt narrower than its own file draws them.
function FirStep1Screen() {
  const { form, updateContact, updateJurisdiction, updateIncident,next,busy,flush } = useFir();
  const { contact, jurisdiction, incident } = form;
  const state=INDIA_JURISDICTIONS.find(s=>s.code===jurisdiction.state_code);

  return (
    <FirShell step={1} title="Quick Submission">
      <IntakeStatus/>
      <View style={[styles.card, styles.firstCard]}>
        <LabelledField
          label="Full Name"
          required
          placeholder="Enter your full name"
          value={contact.fullName}
          onChangeText={(t) => updateContact({ fullName: t })}
          autoComplete="name"
          onBlur={()=>void flush()}
          style={styles.firstGroup}
        />
        <LabelledField label="Mobile Number" required>
          <View style={styles.mobileRow}>
            <CountryCodePicker value={(contact.country_code??'IN') as CountryCode} onChange={(country_code,dial_code)=>updateContact({country_code,dial_code})} style={styles.prefix} textStyle={styles.prefixText} chevronSize={s.prefixIcon} chevronColor={colors.textBody} />
            <TextInput
              value={contact.mobile}
              onChangeText={(t) => updateContact({ mobile: t })}
              placeholder="98765 43210"
              placeholderTextColor={s.placeholder}
              accessibilityLabel="Mobile Number"
              keyboardType="phone-pad"
              style={styles.mobileInput}
            />
          </View>
        </LabelledField>
        <LabelledField
          label="Email Address"
          placeholder="Enter your email address"
          value={contact.email}
          onChangeText={(t) => updateContact({ email: t })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <IntakeError field="fullName"/><IntakeError field="mobile"/><IntakeError field="email"/>
      </View>

      <View style={styles.card}>
        <LabelledField label="Incident Type" required style={styles.firstGroup}>
          <JurisdictionPicker label="Incident Type" value={incidentLabel(incident.type)} options={INCIDENT_TYPES.map(t=>({code:t.id,name:t.label}))} onChange={type=>updateIncident({type})}/>
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
      </View>

      <View style={styles.card}>
        <View style={styles.headingRow}>
          <Landmark size={s.headingIcon} color={ink.accent} />
          <Text style={styles.heading}>Jurisdiction Details</Text>
        </View>
        <LabelledField label="State" required style={styles.afterHeading}>
          <JurisdictionPicker label="State" value={jurisdiction.state} options={INDIA_JURISDICTIONS} onChange={code=>{const selected=INDIA_JURISDICTIONS.find(s=>s.code===code)!;updateJurisdiction({state:selected.name,state_code:code,district:'',district_code:'',policeStation:'',source_retrieved_at:JURISDICTION_RETRIEVED_AT});}}/>
        </LabelledField>
        <LabelledField label="District" required>
          <JurisdictionPicker label="District" value={jurisdiction.district} disabled={!state} options={state?.districts??[]} onChange={code=>updateJurisdiction({district:state!.districts.find(d=>d.code===code)!.name,district_code:code,policeStation:'',source_retrieved_at:JURISDICTION_RETRIEVED_AT})}/>
        </LabelledField>
        <LabelledField label="Police Station" required placeholder="Enter police station name" value={jurisdiction.policeStation} onChangeText={policeStation=>updateJurisdiction({policeStation})} onBlur={()=>void flush()}/>
        <IntakeError field="type"/><IntakeError field="state"/><IntakeError field="district"/><IntakeError field="policeStation"/>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => void next(1)}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>Continue</Text>
        <ArrowRight size={s.buttonIcon} color={ink.onBrand} />
      </Pressable>

      <View style={styles.footer}>
        <View style={styles.footerIcon}>
          <ShieldCheck size={s.headingIcon} color={ink.accent} />
        </View>
        <Text style={styles.footerText}>
          Your details are encrypted and shared only with authorized legal drafting counsel.
        </Text>
      </View>
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
  select: {
    height: s.fieldHeight,
    borderRadius: s.fieldRadius,
    backgroundColor: s.fieldBg,
    paddingHorizontal: s.fieldPadX,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: s.selectSize,
    color: s.fieldText,
  },
  selectPlaceholder: {
    color: s.placeholder,
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
  button: {
    marginTop: s.buttonGap,
    height: s.buttonHeight,
    borderRadius: s.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.buttonIconGap,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: font.appSemi,
    fontSize: s.buttonSize,
    color: ink.onBrand,
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
});
export default function LiveFirScreen() { return <IntakeBoundary step={1} title="Quick Submission"><FirStep1Screen/></IntakeBoundary>; }
