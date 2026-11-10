import {designSubstitutions as copy} from '../../copy/substitutions';
import {incidentLabel} from '../../data/fir';
import {IntakeBoundary,IntakeStatus} from '../../features/fir/IntakeBoundary';
import {openDocument} from '../../features/fir/shared';
import { useFir } from '../../context/fir';
import { previewNotice } from '../../components/PreviewNotice';
import { router } from 'expo-router';
import {
  ArrowRight,
  AtSign,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Folder,
  Gavel,
  Lock,
  ShieldCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import FirShell from '../../components/FirShell';
import { shrinkToFit } from '../../constants/textFit';
import { colors, firStep5 as t, font, ink } from '../../constants/theme';

// FIR step 5 — Review & Submit (design/46).
//
// design/46 draws the header title left-aligned beside the back arrow, where steps
// 1–4 centre it. FirShell keeps it centred so the five steps read as one flow; the
// deviation is reported rather than forked into a shell prop for a single screen.

const TAG_STYLE = {
  PDF: { bg: t.pdfBg, text: t.pdfText },
  IMG: { bg: t.imgBg, text: t.imgText },
  DOC: { bg: t.docBg, text: t.docText },
};

function FirStep5Screen() {
 const m=useFir(),{form}=m,[expanded,setExpanded]=useState(false),docs=m.record?.documents??[];
 const phone=form.contact.mobile?form.contact.mobile.startsWith('+')?form.contact.mobile:[form.contact.dial_code??'+91',form.contact.mobile].join(' '):'';
 return <FirShell step={5} title="Review & Submit"><IntakeStatus/><Text style={styles.heading}>Review Your Request</Text><Text style={styles.subtitle}>{copy[46].review}</Text>
  <Card icon={UserRound} title="Basic Details" link="Edit" first><View style={styles.panel}>{!form.contact.fullName&&!phone?<Text style={styles.value}>No contact details entered. Use Edit to add them.</Text>:<><Field label="FULL NAME" value={form.contact.fullName}/><View style={styles.cols}><Field label="MOBILE NUMBER" value={phone}/><Field label="EMAIL ADDRESS" value={form.contact.email} wide/></View></>}</View></Card>
  <Card icon={Gavel} title="Incident Details" link="Edit"><View style={styles.panel}><Field label="INCIDENT TYPE" value={incidentLabel(form.incident.type)}/><View style={styles.cols}><Field label="DATE & TIME" value={[form.incident.date,form.incident.time].filter(Boolean).join(' · ')}/><Field label="LOCATION" value={form.incident.location} wide/></View><View style={styles.cols}><Field label="STATE / UT" value={form.jurisdiction.state}/><Field label="DISTRICT" value={form.jurisdiction.district} wide/></View><Field label="POLICE STATION" value={form.jurisdiction.policeStation}/>
   {form.incident.description?<><Text style={[styles.label,styles.summaryLabel]}>REPORTED OFFENSE SUMMARY</Text><Text style={styles.summary}>{expanded?form.incident.description:form.incident.description.slice(0,250)}</Text>{form.incident.description.length>250&&<Pressable accessibilityRole="button" accessibilityState={{expanded}} onPress={()=>setExpanded(v=>!v)} style={styles.more}><Text style={styles.moreText}>{expanded?'Show less':'Show more'}</Text>{expanded?<ChevronUp size={t.moreIcon}/>:<ChevronDown size={t.moreIcon}/>}</Pressable>}</>:<Text style={styles.value}>No narrative entered. Use Edit to describe the incident.</Text>}
   <Field label="ADDITIONAL INFORMATION" value={form.incident.additional}/></View></Card>
  <Card icon={UsersRound} title="People Involved" link="View / Edit"><View style={styles.panel}><View style={styles.labelRow}><Text style={styles.label}>REGISTERED ENTRIES</Text><View style={styles.countChip}><Text style={styles.countChipText}>{form.people.length} People Added</Text></View></View>{!form.people.length&&<Text style={styles.value}>No people entered. Use View / Edit to add the complainant and anyone involved.</Text>}{form.people.map((p,i)=><View key={p.id??i} style={{marginTop:12}}><View style={styles.pill}><View style={[styles.pillDot,{backgroundColor:p.kind==='accused'?colors.danger:colors.brandCheck}]}/><Text style={styles.pillText}>{p.kind==='complainant'?'Complainant':p.kind==='witness'?'Witness':'Accused'} · {p.name||(p.unknown?'Unknown suspect':'Details incomplete')}</Text></View>{p.primary&&<Text style={styles.note}>Primary accused</Text>}<Field label="CONTACT" value={p.phone??''}/><Field label="REGISTERED RESIDENCE" value={p.residence??''}/><Field label="ALIAS / IDENTIFYING INFORMATION" value={p.alias??''}/><Field label="ROLE / RELATIONSHIP" value={p.role??''}/><Field label="WHEN PRESENT" value={p.presence??''}/><Field label={p.kind==='witness'?'STATEMENT NOTE':'OTHER DETAILS'} value={p.details}/></View>)}</View></Card>
  <Card icon={Folder} title="Documents & Evidence" link="Manage"><View style={styles.panel}><View style={styles.labelRow}><Text style={styles.label}>ATTACHED DOCUMENTS</Text><Text style={styles.dossierText}>{docs.length} Files Attached</Text></View>{!docs.length&&<Text style={styles.value}>No documents uploaded. Use Manage to attach identity evidence and supporting files.</Text>}{docs.map(d=><Pressable accessibilityRole="button" accessibilityLabel={'View '+d.filename} key={d.id} onPress={()=>void m.action(()=>openDocument(d.id))} style={styles.file}><View style={[styles.tag,{backgroundColor:d.mime_type==='application/pdf'?t.pdfBg:t.imgBg}]}><Text style={styles.tagText}>{d.mime_type==='application/pdf'?'PDF':'IMG'}</Text></View><Text style={styles.fileName}>{d.filename}</Text><Text style={styles.fileSize}>{Math.ceil(Number(d.size_bytes??0)/1024)} KB</Text></Pressable>)}</View></Card>
  <View style={styles.privilege}><Text style={styles.privilegeBody}>{copy[46].declaration}</Text></View>
  {m.error&&<Text role="alert" style={styles.note}>{m.error}</Text>}{Object.keys(m.errors).length>0&&<Text role="alert" style={styles.note}>Review the highlighted fields before submitting.</Text>}
  <Pressable accessibilityRole="button" disabled={m.busy} onPress={()=>void m.submit()} style={({pressed})=>[styles.button,pressed&&styles.pressed]}><Text style={styles.buttonLabel}>{m.busy?'Saving…':'Proceed To Pay'}</Text><ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon}/></Pressable>
 </FirShell>;
}

function Card({
  icon: Icon,
  title,
  link,
  first,
  children,
}: {
  icon: LucideIcon;
  title: string;
  link: string;
  first?: boolean;
  children: ReactNode;
}) {
  const m=useFir();
  return (
    <View style={[styles.card, first && styles.firstCard]}>
      <View style={styles.head}>
        <View style={styles.headIcon}>
          <Icon size={t.headIconGlyph} color={colors.textPrimary} />
        </View>
        <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
          {title}
        </Text>
        {/* Editing preserves the current case and returns to the relevant step. */}
        <Pressable onPress={() => void m.go(title==='Basic Details'?1:title==='Incident Details'?2:title==='People Involved'?3:4)} accessibilityRole="link" hitSlop={8}>
          <Text style={styles.link} {...shrinkToFit(0.8)}>
            {link}
          </Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

// The right-hand column carries the longer values (email, location), so it is given
// the larger share of the row rather than an even split.
function Field({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  if(!value.trim())return null;
  return (
    <View style={[styles.col, { flex: wide ? t.colWide : t.colNarrow }]}>
      <Text style={styles.label} {...shrinkToFit(0.8)}>
        {label}
      </Text>
      <Text style={styles.value} {...shrinkToFit(0.7)}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: t.headingTop,
    fontFamily: font.appHeading,
    fontSize: t.headingSize,
    lineHeight: t.headingLineHeight,
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: t.subtitleGap,
    fontFamily: font.appBody,
    fontSize: t.subtitleSize,
    lineHeight: t.subtitleLineHeight,
    color: colors.textBody,
  },
  card: {
    marginTop: t.cardGap,
    borderRadius: t.cardRadius,
    backgroundColor: colors.card,
    paddingHorizontal: t.cardPad,
    paddingTop: t.cardPadTop,
    paddingBottom: t.cardPadBottom,
  },
  firstCard: {
    marginTop: t.cardGap,
  },
  head: {
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
  },
  headTitle: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.headIconGap,
    fontFamily: font.appHeading,
    fontSize: t.headTitleSize,
    color: colors.textPrimary,
  },
  link: {
    marginLeft: 10,
    fontFamily: font.appBody,
    fontSize: t.linkSize,
    color: colors.textBody,
  },
  panel: {
    marginTop: t.panelGap,
    borderRadius: t.panelRadius,
    backgroundColor: t.panelBg,
    padding: t.panelPad,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.labelSize,
    letterSpacing: t.labelSpacing,
    color: colors.textBody,
  },
  name: {
    marginTop: t.valueGap,
    fontFamily: font.appSemi,
    fontSize: t.nameSize,
    color: colors.textPrimary,
  },
  value: {
    marginTop: t.valueGap,
    fontFamily: font.appSemi,
    fontSize: t.valueSize,
    color: colors.textPrimary,
  },
  kyc: {
    marginLeft: 8,
    minHeight: t.kycHeight,
    borderRadius: t.kycRadius,
    paddingHorizontal: t.kycPadX,
    backgroundColor: t.kycBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  kycText: {
    marginLeft: t.kycIconGap,
    fontFamily: font.appSemi,
    fontSize: t.kycSize,
    color: ink.onBrand,
  },
  cols: {
    marginTop: t.rowGap,
    flexDirection: 'row',
    gap: t.colGap,
  },
  colsFirst: {
    flexDirection: 'row',
    gap: t.colGap,
  },
  col: {
    minWidth: 0,
  },
  summaryLabel: {
    marginTop: t.rowGap,
  },
  summary: {
    marginTop: t.summaryGap,
    fontFamily: font.appBody,
    fontSize: t.summarySize,
    lineHeight: t.summaryLineHeight,
    color: colors.textPrimary,
  },
  more: {
    marginTop: t.moreGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreText: {
    fontFamily: font.appBody,
    fontSize: t.moreSize,
    color: colors.textBody,
  },
  moreIcon: {
    marginLeft: t.moreIconGap,
  },
  countChip: {
    marginLeft: 8,
    minHeight: t.countChipHeight,
    borderRadius: t.countChipRadius,
    paddingHorizontal: t.countChipPadX,
    backgroundColor: colors.brandCheck,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countChipText: {
    fontFamily: font.appSemi,
    fontSize: t.countChipSize,
    color: ink.onBrand,
  },
  pill: {
    marginTop: t.pillGap,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    minHeight: t.pillHeight,
    borderRadius: t.pillRadius,
    paddingHorizontal: t.pillPadX,
    backgroundColor: t.pillBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillDot: {
    width: t.pillDot,
    height: t.pillDot,
    borderRadius: t.pillDot / 2,
  },
  pillText: {
    flexShrink: 1,
    marginLeft: t.pillDotGap,
    fontFamily: font.appSemi,
    fontSize: t.pillSize,
    color: colors.textPrimary,
  },
  note: {
    marginTop: t.noteGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: colors.textBody,
  },
  dossier: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  dossierText: {
    marginLeft: t.dossierIconGap,
    fontFamily: font.appSemi,
    fontSize: t.dossierSize,
    color: colors.textPrimary,
  },
  file: {
    marginTop: t.fileGap,
    minHeight: t.fileHeight,
    borderRadius: t.fileRadius,
    backgroundColor: t.fileBg,
    paddingHorizontal: t.filePadX,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    width: t.tagWidth,
    minHeight: t.tagHeight,
    borderRadius: t.tagRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontFamily: font.appHeading,
    fontSize: t.tagSize,
    letterSpacing: t.tagSpacing,
  },
  fileName: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.tagGap,
    fontFamily: font.appSemi,
    fontSize: t.fileNameSize,
    color: colors.textPrimary,
  },
  fileSize: {
    marginLeft: 8,
    fontFamily: font.appBody,
    fontSize: t.fileSizeSize,
    color: colors.textBody,
  },
  valid: {
    marginTop: t.validGap,
    flexDirection: 'row',
    alignItems: 'center',
  },
  validText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.validIconGap,
    fontFamily: font.appBody,
    fontSize: t.validSize,
    color: colors.textBody,
  },
  privilege: {
    marginTop: t.privilegeGap,
    borderRadius: t.privilegeRadius,
    backgroundColor: t.privilegeBg,
    padding: t.privilegePad,
    alignItems: 'center',
  },
  privilegeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privilegeLabel: {
    marginLeft: t.privilegeIconGap,
    fontFamily: font.appSemi,
    fontSize: t.privilegeLabelSize,
    letterSpacing: t.privilegeLabelSpacing,
    color: t.privilegeLabelColour,
  },
  privilegeBody: {
    marginTop: t.privilegeBodyGap,
    textAlign: 'center',
    fontFamily: font.appBody,
    fontSize: t.privilegeBodySize,
    lineHeight: t.privilegeBodyLineHeight,
    color: colors.textBody,
  },
  button: {
    marginTop: t.buttonGap,
    minHeight: t.buttonHeight,
    borderRadius: t.buttonRadius,
    backgroundColor: colors.brand,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  buttonLabel: {
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: ink.onBrand,
  },
  buttonIcon: {
    marginLeft: t.buttonIconGap,
  },
});
export default function LiveFirScreen() { return <IntakeBoundary step={5} title="Review & Submit"><FirStep5Screen/></IntakeBoundary>; }
