// Step 3 editors (flow C5). design/44 draws the Edit / + Add buttons but no
// sheet, so these are built from the step's own field style (LabelledField) and
// listed in the §9.2 register: complainant, accused and witness sheets.
import type {Answer, FirPerson} from '@legalitt/shared';
import {Trash2} from 'lucide-react-native';
import {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

import LabelledField from '../../../components/LabelledField';
import {firStep as s, firStep3 as t, font} from '../../../constants/theme';
import {CheckRow, ChoicePills, ContinueButton, InlineError, Sheet, intakeStyles} from './ui';

export const GENDERS = ['Male', 'Female', 'Other'] as const;
const text = (a: Answer<string | number> | null | undefined) => a?.status === 'provided' ? String(a.value) : '';
const provided = (value: string) => ({status: 'provided' as const, value: value.trim()});
export const validPhone = (v: string) => /^[+\d ()-]+$/.test(v) && v.replace(/\D/g, '').length >= 7 && v.replace(/\D/g, '').length <= 15;

type Props = {person: FirPerson; isNew: boolean; onClose: () => void; onSave: (p: FirPerson) => void; onRemove?: () => void};

/** Complainant: the six details the FIR proforma needs, all required (flow C5 [DECIDE]). */
export function ComplainantSheet({person, onClose, onSave}: Props) {
  const pd = person.personal_details;
  const [name, setName] = useState(person.name), [father, setFather] = useState(text(pd?.father_name));
  const [age, setAge] = useState(text(pd?.age)), [gender, setGender] = useState(text(pd?.gender));
  const [occupation, setOccupation] = useState(text(pd?.occupation)), [address, setAddress] = useState(person.residence || text(pd?.present_address));
  const [tried, setTried] = useState(false);
  const problems: Record<string, string> = {};
  if (!name.trim()) problems.name = 'Enter your full name.';
  if (!father.trim()) problems.father = 'Enter your father’s or husband’s name.';
  if (!/^\d{1,3}$/.test(age.trim()) || Number(age) > 130) problems.age = 'Enter your age in whole years.';
  if (!gender) problems.gender = 'Choose your gender.';
  if (!occupation.trim()) problems.occupation = 'Enter your occupation.';
  if (!address.trim()) problems.address = 'Enter your address.';
  const show = (k: string) => (tried ? problems[k] : undefined);
  const save = () => {
    setTried(true);
    if (Object.keys(problems).length) return;
    onSave({
      ...person, name: name.trim(), residence: address.trim(),
      personal_details: {father_name: provided(father), age: {status: 'provided', value: Number(age)}, gender: provided(gender), occupation: provided(occupation), present_address: provided(address)},
    });
  };
  return (
    <Sheet visible title="Complainant Details" subtitle="These details appear on your FIR draft. All are required." onClose={onClose}
      footer={<ContinueButton label="Save Details" onPress={save} />}>
      <LabelledField label="Full Name" required value={name} onChangeText={setName} placeholder="Enter your full name" autoComplete="name" />
      <InlineError text={show('name')} />
      <LabelledField label="Father’s / Husband’s Name" required value={father} onChangeText={setFather} placeholder="Enter father’s or husband’s name" />
      <InlineError text={show('father')} />
      <LabelledField label="Age" required value={age} onChangeText={v => setAge(v.replace(/\D/g, '').slice(0, 3))} placeholder="Years" keyboardType="number-pad" maxLength={3} />
      <InlineError text={show('age')} />
      <LabelledField label="Gender" required><ChoicePills label="Gender" options={GENDERS} value={gender} onChange={setGender} /></LabelledField>
      <InlineError text={show('gender')} />
      <LabelledField label="Occupation" required value={occupation} onChangeText={setOccupation} placeholder="e.g., Teacher, Business, Student" />
      <InlineError text={show('occupation')} />
      <LabelledField label="Address" required>
        <TextInput multiline value={address} onChangeText={setAddress} placeholder="House / flat, street, area, city, PIN" placeholderTextColor={s.placeholder} accessibilityLabel="Address" style={intakeStyles.textArea} />
      </LabelledField>
      <InlineError text={show('address')} />
    </Sheet>
  );
}

/** Accused / opposite party: name or Unknown, phone, alias, address, primary (flow C5). */
export function AccusedSheet({person, isNew, onClose, onSave, onRemove}: Props) {
  const [unknown, setUnknown] = useState(!!person.unknown), [name, setName] = useState(person.name);
  const [phone, setPhone] = useState(person.phone ?? ''), [alias, setAlias] = useState(person.alias ?? '');
  const [address, setAddress] = useState(person.residence ?? ''), [primary, setPrimary] = useState(!!person.primary);
  const [tried, setTried] = useState(false);
  const problems: Record<string, string> = {};
  if (!unknown && !name.trim()) problems.name = 'Enter the person’s name, or tick Unknown if you don’t know it.';
  if (phone.trim() && !validPhone(phone.trim())) problems.phone = 'Enter a valid phone number, or leave it empty.';
  const show = (k: string) => (tried ? problems[k] : undefined);
  const save = () => {
    setTried(true);
    if (Object.keys(problems).length) return;
    onSave({...person, kind: 'accused', unknown, name: unknown ? '' : name.trim(), phone: phone.trim(), alias: alias.trim(), residence: address.trim(), primary});
  };
  return (
    <Sheet visible title={isNew ? 'Add Accused / Opposite Party' : 'Edit Accused / Opposite Party'} subtitle="Add what you know. If you don’t know who it was, tick Unknown." onClose={onClose}
      footer={<>
        <ContinueButton label={isNew ? 'Add Person' : 'Save Details'} onPress={save} />
        {onRemove ? <RemoveLink label="Remove this person" onPress={onRemove} /> : null}
      </>}>
      <LabelledField label="Name" required={!unknown} value={unknown ? '' : name} onChangeText={setName} editable={!unknown} placeholder={unknown ? 'Unknown' : 'Enter the person’s name'} />
      <CheckRow label="Unknown — I don’t know who it was" checked={unknown} onToggle={() => setUnknown(v => !v)} />
      <InlineError text={show('name')} />
      <LabelledField label="Phone" value={phone} onChangeText={setPhone} placeholder="+91 98765 43210" keyboardType="phone-pad" />
      <InlineError text={show('phone')} />
      <LabelledField label="Alias / Description" value={alias} onChangeText={setAlias} placeholder="e.g., Claimed to be from the bank’s branch office" />
      <LabelledField label="Address">
        <TextInput multiline value={address} onChangeText={setAddress} placeholder="Where they live or work, if known" placeholderTextColor={s.placeholder} accessibilityLabel="Address" style={intakeStyles.textArea} />
      </LabelledField>
      <CheckRow label="Primary accused" checked={primary} onToggle={() => setPrimary(v => !v)} />
    </Sheet>
  );
}

/** Witness: name, relation, phone, note and Key Witness (flow C5). */
export function WitnessSheet({person, isNew, onClose, onSave, onRemove}: Props) {
  const [name, setName] = useState(person.name), [relation, setRelation] = useState(person.role ?? '');
  const [phone, setPhone] = useState(person.phone ?? ''), [note, setNote] = useState(person.details ?? ''), [key, setKey] = useState(!!person.key);
  const [tried, setTried] = useState(false);
  const problems: Record<string, string> = {};
  if (!name.trim()) problems.name = 'Enter the witness’s name.';
  if (!relation.trim()) problems.relation = 'Enter how they’re related to the incident, e.g., Eyewitness / Colleague.';
  if (phone.trim() && !validPhone(phone.trim())) problems.phone = 'Enter a valid phone number, or leave it empty.';
  const show = (k: string) => (tried ? problems[k] : undefined);
  const save = () => {
    setTried(true);
    if (Object.keys(problems).length) return;
    onSave({...person, kind: 'witness', name: name.trim(), role: relation.trim(), phone: phone.trim(), details: note.trim(), key});
  };
  return (
    <Sheet visible title={isNew ? 'Add Witness' : 'Edit Witness'} subtitle="Someone who saw the incident or was present just after it." onClose={onClose}
      footer={<>
        <ContinueButton label={isNew ? 'Add Witness' : 'Save Details'} onPress={save} />
        {onRemove ? <RemoveLink label="Remove this witness" onPress={onRemove} /> : null}
      </>}>
      <LabelledField label="Name" required value={name} onChangeText={setName} placeholder="Enter the witness’s name" />
      <InlineError text={show('name')} />
      <LabelledField label="Relation" required value={relation} onChangeText={setRelation} placeholder="e.g., Eyewitness / Colleague" />
      <InlineError text={show('relation')} />
      <LabelledField label="Phone" value={phone} onChangeText={setPhone} placeholder="+91 98111 22334" keyboardType="phone-pad" />
      <InlineError text={show('phone')} />
      <LabelledField label="Statement Note">
        <TextInput multiline value={note} onChangeText={setNote} placeholder="e.g., Present during call" placeholderTextColor={s.placeholder} accessibilityLabel="Statement note" style={intakeStyles.textArea} />
      </LabelledField>
      <CheckRow label="Key Witness" checked={key} onToggle={() => setKey(v => !v)} />
    </Sheet>
  );
}

function RemoveLink({label, onPress}: {label: string; onPress: () => void}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.remove} hitSlop={6}>
      <Trash2 size={t.actionIcon} color={t.removeColour} />
      <Text style={styles.removeText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  remove: {alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8},
  removeText: {fontFamily: font.appSemi, fontSize: 14, color: t.removeColour},
});
