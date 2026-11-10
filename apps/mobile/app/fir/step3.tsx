import type {FirPerson} from '@legalitt/shared';
import {useFir} from '../../context/fir';
import LabelledField from '../../components/LabelledField';
import {IntakeBoundary,IntakeStatus,IntakeError} from '../../features/fir/IntakeBoundary';
import { previewNotice } from '../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import {
  ArrowRight, BadgeCheck, ChevronDown, ChevronRight, Eye, Gavel, IdCard, Phone,
  SquarePen, Trash2, UserPlus, UserRoundCheck, UserRoundX, UsersRound,
} from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import FirShell from '../../components/FirShell';
import { colors, firStep3 as t, font, ink } from '../../constants/theme';

function FirStep3Screen() {
 const m=useFir(),[editing,setEditing]=useState<string|null>(null);
 const complainant=m.form.people.find(p=>p.kind==='complainant');
 const accused=m.form.people.filter(p=>p.kind==='accused'),witnesses=m.form.people.filter(p=>p.kind==='witness');
 const add=(kind:'accused'|'witness')=>setEditing(m.addPerson(kind));
 const editor=(p:FirPerson)=>editing===p.id?<View style={styles.panel}>
  {p.kind==='accused'&&<Pressable accessibilityRole="checkbox" accessibilityState={{checked:!!p.unknown}} onPress={()=>m.updatePerson(p.id!,{unknown:!p.unknown})}><Text style={styles.lineText}>{p.unknown?'☑':'☐'} Identity unknown</Text></Pressable>}
  <LabelledField label={p.kind==='complainant'?'Complainant name':p.kind==='witness'?'Witness name':'Accused name'} required={!p.unknown} value={p.name} onChangeText={name=>m.updatePerson(p.id!,{name})}/>
  <LabelledField label="Contact number" required={p.kind==='complainant'} value={p.phone??''} keyboardType="phone-pad" onChangeText={phone=>m.updatePerson(p.id!,{phone})}/>
  {p.kind==='complainant'&&<LabelledField label="Registered residence" value={p.residence??''} onChangeText={residence=>m.updatePerson(p.id!,{residence})}/>}
  {p.kind==='accused'&&<><LabelledField label="Alias / identifying information" value={p.alias??''} onChangeText={alias=>m.updatePerson(p.id!,{alias})}/><Pressable accessibilityRole="checkbox" accessibilityState={{checked:!!p.primary}} onPress={()=>m.update({people:m.form.people.map(person=>person.kind==='accused'?{...person,primary:person.id===p.id?!p.primary:false}:person)})}><Text style={styles.lineText}>{p.primary?'☑':'☐'} Primary accused</Text></Pressable></>}
  {p.kind==='witness'&&<><LabelledField label="Witness role / relationship" value={p.role??''} onChangeText={role=>m.updatePerson(p.id!,{role})}/><LabelledField label="When present" value={p.presence??''} onChangeText={presence=>m.updatePerson(p.id!,{presence})}/></>}
  {p.kind!=='complainant'&&<LabelledField label={p.kind==='witness'?'Statement note':'Other known details'} value={p.details} multiline onChangeText={details=>m.updatePerson(p.id!,{details})}/>}
  <IntakeError field={p.id!}/><Pressable accessibilityRole="button" onPress={()=>void m.flush().then(ok=>{if(ok)setEditing(null);})} style={styles.action}><Text style={styles.actionText}>Done</Text></Pressable>
  {p.kind==='witness'&&<Pressable accessibilityRole="button" onPress={()=>{m.removePerson(p.id!);setEditing(null);}}><Text style={styles.removeText}>Remove witness</Text></Pressable>}
 </View>:null;
 return <FirShell step={3} title="People Involved" showHelp><IntakeStatus/>
  <View style={[styles.card,styles.firstCard]}><View style={styles.headRow}><View style={styles.headIcon}><UserRoundCheck size={t.headIconGlyph} color={ink.accent}/></View><Text style={styles.headTitle}>Complainant</Text><View style={styles.primaryChip}><View style={styles.primaryDot}/><Text style={styles.primaryChipText}>Primary (You)</Text></View>{complainant&&<Pressable accessibilityRole="button" accessibilityLabel="Edit complainant" onPress={()=>setEditing(complainant.id!)} style={styles.edit}><SquarePen size={t.editIcon} color={ink.accent}/><Text style={styles.editText}>Edit</Text></Pressable>}</View>
  {complainant?<>{editing!==complainant.id&&<View style={styles.panel}>{complainant.name&&<View style={styles.panelRow}><Text style={styles.rowLabel}>Full Name</Text><Text style={styles.rowValue}>{complainant.name}</Text></View>}{complainant.phone&&<View style={[styles.panelRow,styles.panelRowSpaced]}><Text style={styles.rowLabel}>Contact</Text><Text style={styles.rowValue}>{complainant.phone}</Text></View>}{complainant.residence&&<><Text style={[styles.rowLabel,styles.panelRowSpaced]}>Registered Residence</Text><Text style={styles.address}>{complainant.residence}</Text></>}{!complainant.name&&!complainant.phone&&<Text style={styles.lineText}>Enter your contact details or edit the complainant.</Text>}</View>}{editor(complainant)}</>:<Text style={styles.lineText}>No complainant entered. Add your contact details in Quick Submission.</Text>}
  <IntakeError field="complainant"/><View style={styles.footRow}><Gavel size={t.footIcon} color={colors.textBody}/><Text style={styles.footText}>Statutory Complainant / Informant under BNSS § 173</Text></View></View>
  <SectionHeading title="Accused / Opposite Party" count={accused.length} description="Add individuals or unknown suspects involved in the incident."/>
  {!accused.length&&<Text style={styles.lineText}>No accused or suspects added.</Text>}
  {accused.map(a=><View key={a.id} style={styles.sectionCard}><View style={styles.headRow}><View style={styles.headIcon}><UserRoundX size={t.headIconGlyph} color={ink.accent}/></View><View style={styles.headText}><Text style={styles.name}>{a.name|| (a.unknown?'Unknown suspect':'Accused — details incomplete')}</Text>{a.primary&&<View style={styles.tag}><Text style={styles.tagText}>Primary Accused</Text></View>}</View><ChevronDown size={t.nameChevron} color={colors.textBody}/></View>
   {editing!==a.id&&(a.phone||a.alias||a.details)&&<View style={styles.panel}>{a.phone&&<View style={styles.lineRow}><Phone size={t.lineIcon} color={colors.textBody}/><Text style={styles.lineText}>{a.phone}</Text></View>}{a.alias&&<View style={styles.lineRow}><IdCard size={t.lineIcon} color={colors.textBody}/><Text style={styles.lineText}>{a.alias}</Text></View>}{a.details&&<Text style={styles.lineText}>{a.details}</Text>}</View>}{editor(a)}<View style={styles.actions}><Pressable accessibilityRole="button" accessibilityLabel={'Remove accused '+(a.name||'unknown suspect')} onPress={()=>m.removePerson(a.id!)} style={styles.action}><Trash2 size={t.actionIcon} color={colors.danger}/><Text style={styles.removeText}>Remove</Text></Pressable><Pressable accessibilityRole="button" onPress={()=>setEditing(a.id!)} style={styles.action}><SquarePen size={t.actionIcon} color={colors.textPrimary}/><Text style={styles.actionText}>Edit Details</Text></Pressable></View></View>)}
  <AddButton icon={UserPlus} label="+ Add Accused / Opposite Party" onPress={()=>add('accused')}/>
  <SectionHeading title="Witnesses" count={witnesses.length} description="Persons present during or immediately after the incident."/>
  {!witnesses.length&&<Text style={styles.lineText}>No witnesses added.</Text>}
  {witnesses.map(w=><View key={w.id} style={styles.sectionCard}><View style={styles.headRow}><View style={styles.headIcon}><Eye size={t.headIconGlyph} color={ink.accent}/></View><View style={styles.headText}><Text style={styles.name}>{w.name||'Witness — details incomplete'}</Text>{w.role&&<Text style={styles.lineText}>{w.role}</Text>}</View><ChevronRight size={t.nameChevron} color={colors.textBody}/></View>{editing!==w.id&&(w.phone||w.presence||w.details)&&<View style={styles.panel}>{w.phone&&<Text style={styles.lineText}>{w.phone}</Text>}{w.presence&&<Text style={styles.lineText}>{w.presence}</Text>}{w.details&&<Text style={styles.lineText}>{w.details}</Text>}</View>}{editor(w)}<View style={styles.actions}><Pressable accessibilityRole="button" onPress={()=>setEditing(w.id!)} style={styles.action}><SquarePen size={t.actionIcon} color={colors.textPrimary}/><Text style={styles.actionText}>Edit Statement Note</Text></Pressable></View></View>)}
  <AddButton icon={UsersRound} label="+ Add Witness" onPress={()=>add('witness')}/>
  <Pressable accessibilityRole="button" disabled={m.busy} onPress={()=>void m.next(3)} style={({pressed})=>[styles.button,pressed&&styles.pressed]}><Text style={styles.buttonText}>Continue to Evidence &amp; Documents</Text><ArrowRight size={t.buttonIcon} color={ink.onBrand}/></Pressable>
 </FirShell>;
}

function SectionHeading({ title, count, description }: { title: string; count: number; description: string }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.countChip}>
          <Text style={styles.countChipText}>{count} Added</Text>
        </View>
      </View>
      <Text style={styles.sectionDesc}>{description}</Text>
    </View>
  );
}

function AddButton({ icon: Icon, label, onPress }: { icon: typeof UserPlus; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.add, pressed && styles.pressed]}>
      <Icon size={t.addIcon} color={colors.textPrimary} />
      <Text style={styles.addText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  firstCard: {
    marginTop: 0,
  },
  sectionCard: {
    marginTop: t.sectionCardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headText: {
    flex: 1,
    minWidth: 0,
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
    fontFamily: font.appHeading,
    fontSize: t.headTitleSize,
    color: colors.textPrimary,
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appHeading,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  primaryChip: {
    marginLeft: t.chipGap,
    height: t.chipHeight,
    borderRadius: t.chipRadius,
    paddingHorizontal: t.chipPadX,
    backgroundColor: t.primaryBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryDot: {
    width: t.chipDot,
    height: t.chipDot,
    borderRadius: t.chipDot / 2,
    backgroundColor: t.primaryDot,
    marginRight: t.chipDotGap,
  },
  primaryChipText: {
    fontFamily: font.appSemi,
    fontSize: t.chipSize,
    color: t.primaryText,
  },
  edit: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.editIconGap,
  },
  editText: {
    fontFamily: font.appSemi,
    fontSize: t.editSize,
    color: ink.accent,
  },
  panel: {
    marginTop: t.panelGap,
    borderRadius: t.panelRadius,
    backgroundColor: t.panelBg,
    padding: t.panelPad,
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelRowSpaced: {
    marginTop: t.rowGap,
  },
  rowLabel: {
    fontFamily: font.appBody,
    fontSize: t.rowLabelSize,
    color: colors.textBody,
  },
  rowValue: {
    fontFamily: font.appSemi,
    fontSize: t.rowValueSize,
    color: colors.textPrimary,
  },
  contactValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    marginTop: t.addressGap,
    fontFamily: font.appBody,
    fontSize: t.rowValueSize,
    lineHeight: t.addressLineHeight,
    color: colors.textPrimary,
  },
  footRow: {
    marginTop: t.footGap,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: t.footIconGap,
  },
  footText: {
    flex: 1,
    minWidth: 0,
    fontFamily: font.appBody,
    fontSize: t.footSize,
    lineHeight: t.footLineHeight,
    color: colors.textBody,
  },
  section: {
    marginTop: t.sectionGap,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: font.appHeading,
    fontSize: t.sectionSize,
    color: colors.textPrimary,
  },
  countChip: {
    marginLeft: t.chipGap,
    height: t.tagHeight,
    borderRadius: t.tagHeight / 2,
    paddingHorizontal: t.tagPadX,
    backgroundColor: colors.iconChipBg,
    justifyContent: 'center',
  },
  countChipText: {
    fontFamily: font.appSemi,
    fontSize: t.tagSize,
    color: ink.accent,
  },
  sectionDesc: {
    marginTop: t.sectionDescGap,
    fontFamily: font.appBody,
    fontSize: t.sectionDescSize,
    lineHeight: t.sectionDescLineHeight,
    color: colors.textBody,
  },
  tag: {
    marginTop: t.tagGap,
    alignSelf: 'flex-start',
    height: t.tagHeight,
    borderRadius: t.tagRadius,
    paddingHorizontal: t.tagPadX,
    backgroundColor: t.tagBg,
    justifyContent: 'center',
  },
  tagText: {
    fontFamily: font.appSemi,
    fontSize: t.tagSize,
    color: t.tagText,
  },
  roleRow: {
    marginTop: t.roleGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  keyTag: {
    height: t.tagHeight,
    borderRadius: t.tagRadius,
    paddingHorizontal: t.tagPadX,
    backgroundColor: colors.iconChipBg,
    justifyContent: 'center',
  },
  keyTagText: {
    fontFamily: font.appSemi,
    fontSize: t.tagSize,
    color: colors.textPrimary,
  },
  roleText: {
    marginLeft: 7,
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.roleSize,
    color: colors.textBody,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.lineIconGap,
  },
  lineRowSpaced: {
    marginTop: t.lineGap,
  },
  lineText: {
    flexShrink: 1,
    fontFamily: font.appBody,
    fontSize: t.lineSize,
    color: colors.textPrimary,
  },
  spacer: {
    flex: 1,
  },
  presence: {
    fontFamily: font.appBody,
    fontSize: t.footSize,
    color: colors.textBody,
  },
  actions: {
    marginTop: t.actionsGap,
    gap: t.actionSepGap * 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.actionIconGap,
  },
  actionText: {
    fontFamily: font.appSemi,
    fontSize: t.actionSize,
    color: colors.textPrimary,
  },
  removeText: {
    color: t.removeColour,
  },
  actionSep: {
    marginHorizontal: t.actionSepGap,
    fontFamily: font.appBody,
    fontSize: t.actionSize,
    color: colors.textMuted,
  },
  add: {
    marginTop: t.addGap,
    height: t.addHeight,
    borderRadius: t.addRadius,
    backgroundColor: t.addBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.addIconGap,
  },
  addText: {
    fontFamily: font.appSemi,
    fontSize: t.addSize,
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
});
export default function LiveFirScreen() { return <IntakeBoundary step={3} title="People Involved"><FirStep3Screen/></IntakeBoundary>; }
