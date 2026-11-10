import {designSubstitutions as copy} from '../../copy/substitutions';
import {IntakeBoundary,IntakeStatus,IntakeError} from '../../features/fir/IntakeBoundary';
import { previewNotice } from '../../components/PreviewNotice';
import { router } from 'expo-router';
import { ArrowRight, Calendar, ChevronsUpDown, Clock, List, MapPin, Mic, ShieldCheck, SquarePen } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import FirShell from '../../components/FirShell';
import { shrinkToOneLine } from '../../constants/textFit';
import { colors, firStep2 as t, font, ink } from '../../constants/theme';
import { useFir } from '../../context/fir';


// Step 2 — Incident Details (design/43), populated from saved intake.
function FirStep2Screen() {
  const { form, updateIncident, updateJurisdiction,next,back,busy,flush } = useFir();
  const { incident } = form;
  const narrative = incident.description;

  return (
    <FirShell step={2} title="Incident Details" showHelp>
      <IntakeStatus/>
      <Text style={styles.heading}>Tell Us What Happened</Text>
      <Text style={styles.subtitle}>Provide the incident details as accurately as possible for statutory assessment.</Text>

      <Card icon={MapPin} title="Date, Time & Location">
        <View style={styles.row}>
          <View style={styles.col}>
            <Label text="Incident Date" required />
            <Field label="Incident Date" icon={Calendar} value={incident.date} placeholder="DD/MM/YYYY" onChangeText={(v) => updateIncident({ date: v })} />
          </View>
          <View style={styles.col}>
            <Label text="Incident Time" required />
            <Field label="Incident Time" icon={Clock} value={incident.time} placeholder="HH:MM" onChangeText={(v) => updateIncident({ time: v })} />
          </View>
        </View>

        <Label text="Incident Location" required style={styles.labelSpaced} />
        <Field
          label="Incident Location"
          icon={MapPin}
          value={incident.location}
          placeholder="e.g., Sector 18 Market, Near Metro Gate 2, Noida"
          onChangeText={(v) => updateIncident({ location: v })}
        />

        <Label text="Competent Police Station" required style={styles.labelSpaced} />
        <Field label="Competent Police Station" icon={ShieldCheck} value={form.jurisdiction.policeStation} placeholder="Enter police station name" onChangeText={policeStation=>updateJurisdiction({policeStation})}/>
        <Text style={styles.note}>Pre-filled from basic details jurisdiction. You can edit if different.</Text>
        <IntakeError field="date"/><IntakeError field="time"/><IntakeError field="location"/><IntakeError field="policeStation"/>
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
          onBlur={()=>void flush()}
          style={[styles.area, { height: t.areaHeight }]}
        />
        <View style={styles.counterRow}>
          <Text style={styles.counter}>
            {narrative.length} / {t.maxChars.toLocaleString('en-IN')} characters
          </Text>
          <Pressable onPress={() => previewNotice("Dictate statement")} accessibilityRole="button" style={styles.dictate}>
            <Mic size={t.dictateIcon} color={ink.accent} />
            <Text style={styles.dictateText}>Dictate statement</Text>
          </Pressable>
        </View>
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
          onChangeText={additional=>updateIncident({additional})}
          onBlur={()=>void flush()}
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

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => void next(2)}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>{copy[43].next}</Text>
        <ArrowRight size={t.buttonIcon} color={ink.onBrand} />
      </Pressable>

      <Pressable accessibilityRole="button" onPress={() => void back()} style={styles.back}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
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
}: {
  icon: typeof MapPin;
  value: string;
  placeholder: string;
  label:string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Icon size={t.fieldIcon} color={ink.accent} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
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
    marginTop: t.labelGap,
  },
  field: {
    marginTop: t.fieldGap,
    height: t.fieldHeight,
    borderRadius: t.fieldRadius,
    backgroundColor: t.fieldBg,
    borderWidth: 1,
    borderColor: t.fieldBorder,
    paddingHorizontal: t.fieldPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.fieldIconGap,
  },
  fieldInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.fieldTextSize,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  select: {
    marginTop: t.fieldGap,
    height: t.selectHeight,
    borderRadius: t.fieldRadius,
    backgroundColor: t.selectBg,
    borderWidth: 1,
    borderColor: t.selectBorder,
    paddingHorizontal: t.fieldPadX,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.fieldIconGap,
  },
  selectText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.fieldTextSize,
    color: colors.textPrimary,
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
