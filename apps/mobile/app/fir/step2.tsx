import {firDateInFuture} from '@legalitt/shared';
import { ArrowRight, Calendar, Clock, List, MapPin, Mic, ShieldCheck, SquarePen } from 'lucide-react-native';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import DatePickerSheet, { formatDdMmYyyy } from '../../components/DatePickerSheet';
import FirShell from '../../components/FirShell';
import PoliceStationPicker from '../../components/PoliceStationPicker';
import { colors, firStep2 as t, font, ink } from '../../constants/theme';
import { useFir } from '../../context/fir';
import {designSubstitutions as copy} from '../../copy/substitutions';
import {IntakeBoundary,IntakeError,IntakeStatus} from '../../features/fir/IntakeBoundary';
import {speechRecognition} from '../../features/fir/flow';
import {firErrorStep} from '../../features/fir/intake/draft';
import {InlineError} from '../../features/fir/intake/ui';

type Recognizer = InstanceType<NonNullable<ReturnType<typeof speechRecognition>>>;

// Step 2 — Incident Details (design/43, flow C4). Location and police station
// start from Step 1; the police station uses Step 1's selector and stays editable.
// The button always reads "Continue to People Involved" (flow [DECIDE]), also when
// the step was opened from Review (Continue then returns there).
function FirStep2Screen() {
  const m = useFir();
  const { form, errors, updateIncident, updateJurisdiction, flush } = m;
  const { incident } = form;
  const narrative = incident.description;
  const [picking, setPicking] = useState(false), [dateNote, setDateNote] = useState('');
  const [continuing, setContinuing] = useState(false);

  // Pre-fill the location from Step 1's Place of Incident, once, if it is empty.
  useEffect(() => {
    const p = m.form.place;
    if (!m.form.incident.location.trim() && p?.address.trim()) updateIncident({ location: [p.address.trim(), p.city.trim(), p.pin.trim()].filter(Boolean).join(', ') });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dictate statement: browser speech-to-text where it exists, otherwise no button.
  const Speech = speechRecognition();
  const recognizer = useRef<Recognizer | null>(null);
  const [listening, setListening] = useState(false), [speechError, setSpeechError] = useState('');
  const textRef = useRef(narrative);
  textRef.current = narrative;
  useEffect(() => () => recognizer.current?.stop(), []);
  const toggleDictation = () => {
    if (!Speech) return;
    if (listening) { recognizer.current?.stop(); return; }
    setSpeechError('');
    try {
      const r = new Speech();
      r.lang = 'en-IN'; r.interimResults = false; r.continuous = true;
      r.onresult = (e) => {
        const last = e.results[e.results.length - 1];
        const said = last?.[0]?.transcript?.trim();
        if (!said) return;
        const current = textRef.current;
        updateIncident({ description: `${current}${current && !/\s$/.test(current) ? ' ' : ''}${said}`.slice(0, t.maxChars) });
      };
      r.onerror = () => setSpeechError('Dictation stopped. Allow microphone access, or type your statement instead.');
      r.onend = () => { setListening(false); void flush(); };
      recognizer.current = r;
      r.start();
      setListening(true);
    } catch {
      setListening(false);
      setSpeechError('Dictation couldn’t start here. Type your statement instead.');
    }
  };

  const pickDate = (d: Date) => {
    const value = formatDdMmYyyy(d);
    if (firDateInFuture(value)) { setDateNote('The incident date can’t be in the future. Choose today or an earlier date.'); return; }
    setDateNote('');
    updateIncident({ date: value });
  };
  const pickerValue = (() => {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(incident.date.replace(/\s/g, ''));
    return match ? new Date(+match[3]!, +match[2]! - 1, +match[1]!) : undefined;
  })();
  const cont = async () => { setContinuing(true); try { await m.next(2); } finally { setContinuing(false); } };

  return (
    <FirShell step={2} title="Incident Details" showHelp>
      <IntakeStatus step={2} />
      <Text style={styles.heading}>Tell Us What Happened</Text>
      <Text style={styles.subtitle}>Provide the incident details as accurately as possible for statutory assessment.</Text>

      <Card icon={MapPin} title="Date, Time & Location">
        <View style={styles.row}>
          <View style={styles.col}>
            <Label text="Incident Date" required />
            <Field label="Incident Date" icon={Calendar} onIcon={() => setPicking(true)} iconLabel="Choose the incident date" value={incident.date} placeholder="DD / MM / YYYY" invalid={!!errors.date} onChangeText={(v) => { setDateNote(''); updateIncident({ date: v }); }} onBlur={() => void flush()} />
          </View>
          <View style={styles.col}>
            <Label text="Incident Time" required />
            <Field label="Incident Time" icon={Clock} value={incident.time} placeholder="04:30 PM" invalid={!!errors.time} onChangeText={(v) => updateIncident({ time: v })} onBlur={() => void flush()} />
          </View>
        </View>
        <InlineError text={dateNote} />
        <IntakeError field="date" />
        <IntakeError field="time" />

        <Label text="Incident Location" required style={styles.labelSpaced} />
        <Field
          label="Incident Location"
          icon={MapPin}
          value={incident.location}
          placeholder="e.g., Sector 18 Market, Near Metro Gate 2, Noida"
          invalid={!!errors.location}
          onChangeText={(v) => updateIncident({ location: v })}
          onBlur={() => void flush()}
        />
        <IntakeError field="location" />

        <Label text="Competent Police Station" required style={styles.labelSpaced} />
        <PoliceStationPicker
          key={form.jurisdiction.district_code || 'none'}
          stateCode={form.jurisdiction.state_code}
          districtCode={form.jurisdiction.district_code}
          value={form.jurisdiction.policeStation}
          stationId={form.jurisdiction.police_station_id}
          invalid={!!errors.policeStation}
          onBlur={() => void flush()}
          onChange={({ name, id }) => updateJurisdiction({ policeStation: name, police_station_id: id })}
        />
        <Text style={styles.note}>Pre-filled from basic details jurisdiction. You can edit if different.</Text>
        <IntakeError field="policeStation" />
      </Card>

      <Card icon={SquarePen} title="What Happened?" required chip="Core Narrative">
        <Text style={styles.desc}>
          Include important facts such as what happened, when it happened, where it happened, and how it happened.
        </Text>
        <TextInput
          multiline
          textAlignVertical="top"
          value={narrative}
          onChangeText={(v) => updateIncident({ description: v.slice(0, t.maxChars) })}
          maxLength={t.maxChars}
          placeholder={'Describe what happened in your own words...\n(e.g., I received an unsolicited phone call pretending to be my bank manager on 18 Oct...)'}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="What happened"
          onBlur={() => void flush()}
          style={[styles.area, { height: t.areaHeight }, !!errors.description && styles.invalid]}
        />
        <View style={styles.counterRow}>
          <Text style={styles.counter}>
            {narrative.length.toLocaleString('en-IN')} / {t.maxChars.toLocaleString('en-IN')} characters
          </Text>
          {Speech ? (
            <Pressable onPress={toggleDictation} accessibilityRole="button" accessibilityState={{ selected: listening }} style={styles.dictate} hitSlop={6}>
              <Mic size={t.dictateIcon} color={listening ? '#B3261E' : ink.accent} />
              <Text style={[styles.dictateText, listening && styles.dictateOn]}>{listening ? 'Stop dictation' : 'Dictate statement'}</Text>
            </Pressable>
          ) : null}
        </View>
        {listening ? <Text role="status" style={styles.note}>Listening… speak clearly; your words are added to the statement.</Text> : null}
        <InlineError text={speechError} />
        <IntakeError field="description" />
      </Card>

      <Card icon={List} title="Additional Details" chip="Optional">
        <Text style={styles.desc}>Add any names of witnesses, vehicle numbers, transaction IDs, or specific demands made.</Text>
        <TextInput
          multiline
          textAlignVertical="top"
          placeholder={'e.g., UPI Transaction Ref: 4291880912, Caller spoke fluent Hindi and claimed to be from Noida branch...'}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Additional details"
          value={incident.additional}
          onChangeText={(additional) => updateIncident({ additional })}
          onBlur={() => void flush()}
          style={[styles.area, { height: t.areaSmallHeight }]}
        />
      </Card>

      <View style={styles.legal}>
        <ShieldCheck size={t.legalIcon} color={ink.accent} />
        <Text style={styles.legalText}>
          Your statement will be structured into formal statutory FIR paragraphs by your assigned legal drafting
          advocate under relevant Bharatiya Nyaya Sanhita (BNS) sections.
        </Text>
      </View>

      {Object.keys(errors).some((k) => firErrorStep(k) === 2) ? <InlineError text="Some details are missing or need fixing. They’re marked above." style={styles.summaryError} /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: continuing }}
        disabled={continuing}
        onPress={() => void cont()}
        style={({ pressed }) => [styles.button, (pressed || continuing) && styles.pressed]}
      >
        <Text style={styles.buttonText}>{continuing ? 'Saving…' : copy[43].next}</Text>
        <ArrowRight size={t.buttonIcon} color={ink.onBrand} />
      </Pressable>

      <Pressable accessibilityRole="button" onPress={() => void m.back()} style={styles.back} hitSlop={8}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <DatePickerSheet visible={picking} value={pickerValue} onPick={pickDate} onClose={() => setPicking(false)} />
    </FirShell>
  );
}

function Card({
  icon: Icon,
  title,
  chip,
  required = false,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  chip?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.headRow}>
        <View style={styles.headIcon}>
          <Icon size={t.headIconGlyph} color={ink.accent} />
        </View>
        <Text style={styles.headTitle}>
          {title}
          {required && <Text style={styles.star}> *</Text>}
        </Text>
        {chip && (
          <View style={styles.headChip}>
            <Text style={styles.headChipText}>{chip}</Text>
          </View>
        )}
      </View>
      <View style={styles.divider} />
      {children}
    </View>
  );
}

function Label({ text, required, style }: { text: string; required?: boolean; style?: object }) {
  return (
    <Text style={[styles.label, style]}>
      {text}
      {required && <Text style={styles.star}> *</Text>}
    </Text>
  );
}

function Field({
  icon: Icon,
  value,
  placeholder,
  label,
  onChangeText,
  onBlur,
  onIcon,
  iconLabel,
  invalid,
}: {
  icon: typeof MapPin;
  value: string;
  placeholder: string;
  label: string;
  onChangeText: (v: string) => void;
  onBlur?: () => void;
  /** Makes the icon a button (the date field opens the calendar). */
  onIcon?: () => void;
  iconLabel?: string;
  invalid?: boolean;
}) {
  return (
    <View style={[styles.field, invalid && styles.invalid]}>
      {onIcon ? (
        <Pressable accessibilityRole="button" accessibilityLabel={iconLabel} onPress={onIcon} hitSlop={8}>
          <Icon size={t.fieldIcon} color={ink.accent} />
        </Pressable>
      ) : (
        <Icon size={t.fieldIcon} color={ink.accent} />
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={label}
        style={styles.fieldInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: t.headingTop,
    textAlign: 'center',
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    lineHeight: t.headingLineHeight,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: t.subtitleGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.subtitleSize,
    lineHeight: t.subtitleLineHeight,
    color: colors.textBody,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headIcon: {
    width: t.headIcon,
    height: t.headIcon,
    borderRadius: t.headIconRadius,
    backgroundColor: colors.iconChipBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: t.headIconGap,
  },
  headTitle: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.headTitleSize,
    color: colors.textPrimary,
  },
  star: {
    color: '#C0392B',
  },
  headChip: {
    height: t.headChipHeight,
    borderRadius: t.headChipRadius,
    paddingHorizontal: t.headChipPadX,
    backgroundColor: colors.iconChipBg,
    justifyContent: 'center',
  },
  headChipText: {
    fontFamily: font.appSemi,
    fontSize: t.headChipSize,
    color: colors.textBody,
  },
  divider: {
    marginTop: t.dividerGap,
    height: 1,
    backgroundColor: t.dividerColour,
  },
  row: {
    flexDirection: 'row',
    gap: t.colGap,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    marginTop: t.labelGap,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    color: colors.textPrimary,
  },
  labelSpaced: {
    marginTop: t.labelGap + 4,
  },
  field: {
    marginTop: t.fieldGap + 4,
    height: t.fieldHeight + 4,
    borderRadius: t.fieldRadius,
    backgroundColor: t.fieldBg,
    borderWidth: 1,
    borderColor: t.fieldBorder,
    paddingHorizontal: t.fieldPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.fieldIconGap,
  },
  invalid: {
    borderColor: '#B3261E',
  },
  fieldInput: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
    fontFamily: font.appBody,
    fontSize: t.fieldTextSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  note: {
    marginTop: t.noteGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textMuted,
  },
  desc: {
    marginTop: t.descGap,
    fontFamily: font.appBody,
    fontSize: t.descSize,
    lineHeight: t.descLineHeight,
    color: colors.textPrimary,
  },
  area: {
    marginTop: t.areaGap,
    borderRadius: t.fieldRadius,
    backgroundColor: t.fieldBg,
    borderWidth: 1,
    borderColor: t.fieldBorder,
    padding: t.areaPad,
    fontFamily: font.appBody,
    fontSize: t.areaTextSize,
    lineHeight: t.areaLineHeight,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  counterRow: {
    marginTop: t.counterGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counter: {
    fontFamily: font.appBody,
    fontSize: t.counterSize,
    color: colors.textBody,
  },
  dictate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.dictateIconGap,
  },
  dictateText: {
    fontFamily: font.appSemi,
    fontSize: t.counterSize,
    color: ink.accent,
  },
  dictateOn: {
    color: '#B3261E',
  },
  legal: {
    marginTop: t.legalGap,
    borderRadius: t.legalRadius,
    backgroundColor: t.legalBg,
    padding: t.legalPad,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.legalIconGap,
  },
  legalText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.legalSize,
    lineHeight: t.legalLineHeight,
    color: colors.textPrimary,
  },
  summaryError: {
    marginTop: t.buttonGap,
  },
  button: {
    marginTop: t.buttonGap,
    height: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.buttonIconGap,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
  back: {
    marginTop: t.backGap,
    alignSelf: 'center',
  },
  backText: {
    fontFamily: font.appSemi,
    fontSize: t.backSize,
    color: colors.textPrimary,
  },
});
export default function LiveFirScreen() { return <IntakeBoundary step={2} title="Incident Details"><FirStep2Screen/></IntakeBoundary>; }
