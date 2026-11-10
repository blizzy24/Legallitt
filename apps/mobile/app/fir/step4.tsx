import {designSubstitutions as copy} from '../../copy/substitutions';
import {useState} from 'react';
import {FIR_OPTIONAL_ID_NOTICE} from '@legalitt/shared';
import {useFir} from '../../context/fir';
import {backend} from '../../lib/auth';
import {uploadEvidence,openDocument} from '../../features/fir/shared';
import {IntakeBoundary,IntakeStatus} from '../../features/fir/IntakeBoundary';
import { previewNotice } from '../../components/PreviewNotice';
import { router, type Href } from 'expo-router';
import {
  ArrowRight,
  Camera,
  CircleCheck,
  Eye,
  FileText,
  FileUp,
  FolderOpen,
  ImagePlus,
  Images,
  Lock,
  MessageSquare,
  Plus,
  Scale,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import FirShell from '../../components/FirShell';
import { shrinkToFit } from '../../constants/textFit';
import { colors, firStep4 as t, font, ink } from '../../constants/theme';
import { EVIDENCE_SECTIONS } from '../../data/fir';

// FIR step 4 — Documents & Evidence (design/45).
//
// The header reads "Fir Draft" here while every other FIR screen titles itself after
// the step ("Incident Details", "Review & Submit", …). Rendered as drawn — see the
// summary note; it is a one-word change if the client wants it consistent.
//
// design/45 also drops the "N% Completed" label that design/42 puts to the right of
// "STEP n OF 5". FirShell keeps it, because four of the five steps carry it and the
// bar would otherwise be unlabelled.

const SECTION_ICONS: LucideIcon[] = [FileText, Camera, MessageSquare, FolderOpen];

function FirStep4Screen() {
 const m=useFir(),[uploading,setUploading]=useState<number|null>(null),docs=m.record?.documents??[];
 const group=(kind:string)=>kind==='id_proof'||kind==='fir_primary'?1:kind==='fir_scene'?2:kind==='fir_communications'?3:4;
 const upload=(category:number,kind:string)=>{setUploading(category);void m.action(()=>uploadEvidence(m.record!.id,kind)).finally(()=>setUploading(null));};
 const bytes=docs.reduce((n,d)=>n+Number(d.size_bytes??0),0);
 return <FirShell step={4} title="Fir Draft"><IntakeStatus/><Text style={styles.heading}>Documents &amp; Evidence</Text><Text style={styles.subtitle}>Upload supporting materials, receipts or media records for your request.</Text>
 {EVIDENCE_SECTIONS.map((item,i)=>{const files=docs.filter(d=>group(d.kind)===item.n),kind=['fir_primary','fir_scene','fir_communications','supporting_document'][i];return <Section key={item.n} icon={SECTION_ICONS[i]} section={{...item,state:files.length+ (files.length===1?' File':' Files')}} first={i===0}>
  {item.n===1&&<><Text style={styles.perPage}>{FIR_OPTIONAL_ID_NOTICE}</Text><Text style={styles.perPage}>{copy[45].identity}</Text><Pressable accessibilityRole="button" disabled={m.busy||!m.record} onPress={()=>upload(1,'id_proof')} style={styles.attach}><FileUp size={t.attachIcon} color={colors.textPrimary}/><Text style={styles.attachLabel}>Upload ID Proof (Optional)</Text></Pressable></>}
  {files.map(d=><FileRow key={d.id} icon={d.mime_type==='application/pdf'?FileText:Images} name={d.filename} meta={[Math.ceil(Number(d.size_bytes??0)/1024)+' KB',d.page_count!=null?d.page_count+' pages':null,d.kind==='id_proof'?'Identity evidence':null].filter(Boolean).join(' · ')} onView={()=>void m.action(()=>openDocument(d.id))} onRemove={()=>void m.action(()=>backend.deleteDocument(d.id))} disabled={m.busy}/>)}
  {!files.length&&<Text style={styles.perPage}>No files attached in this category.</Text>}
  {uploading===item.n&&<Text role="status" style={styles.perPage}>Choosing or uploading a file…</Text>}
  <Pressable accessibilityRole="button" disabled={m.busy||!m.record} onPress={()=>upload(item.n,kind)} style={item.n===2?styles.drop:styles.attach}><FileUp size={t.attachIcon} color={colors.textPrimary}/><Text style={styles.attachLabel}>{item.n===2?'Tap to Add Photo or Incident Media':item.n===4?'Attach Additional Documentation':'Upload Document'}</Text></Pressable>
  <Text style={styles.perPage}>{copy[45].media}</Text>
 </Section>;})}
 <Text style={styles.perPage}>{copy[45].overage}</Text>
 <Pressable accessibilityRole="button" onPress={()=>previewNotice('Custom categories are not available yet. Use Ancillary / Other Records.')} style={styles.slot}><Plus size={t.slotIcon} color={colors.textPrimary}/><Text style={styles.slotLabel}>Add Custom Category Slot</Text></Pressable>
 <View style={styles.custody}><View style={styles.custodyRow}><Scale size={t.custodyIcon} color={t.custodyStateColour}/><Text style={styles.custodyLabel}>{copy[45].summary}</Text></View><View style={styles.stats}><View style={styles.stat}><Text style={styles.statValue}>{docs.length}</Text><Text style={styles.statLabel}>Files attached</Text></View><View style={styles.stat}><Text style={styles.statValue}>{(bytes/1024/1024).toFixed(2)} MB</Text><Text style={styles.statLabel}>Total size</Text></View></View></View>
 {m.error&&<Text role="alert" style={styles.perPage}>{m.error}</Text>}<Pressable accessibilityRole="button" disabled={m.busy} onPress={()=>void m.next(4)} style={({pressed})=>[styles.button,pressed&&styles.pressed]}><Text style={styles.buttonLabel}>Continue Draft</Text><ArrowRight size={t.buttonIcon} color={ink.onBrand} style={styles.buttonIcon}/></Pressable>
 </FirShell>;
}

function Section({
  icon: Icon,
  section,
  first,
  children,
}: {
  icon: LucideIcon;
  section: (typeof EVIDENCE_SECTIONS)[number];
  first: boolean;
  children: ReactNode;
}) {
  return (
    <View style={[styles.card, first && styles.firstCard]}>
      <View style={styles.head}>
        <View style={styles.headIcon}>
          <Icon size={t.headIconGlyph} color={colors.textPrimary} />
        </View>
        <View style={styles.headText}>
          <Text style={styles.headTitle} {...shrinkToFit(0.8)}>
            {section.n}. {section.title}
          </Text>
          <Text style={styles.headDesc}>{section.description}</Text>
        </View>
        {/* design/45 pills "Required" and "1 File" but leaves "0 / 5 Attached" and
            "Optional" as bare text. Rendered as drawn. */}
        <View style={section.pill ? styles.statePill : styles.statePlain}>
          <Text style={styles.stateText}>{section.state}</Text>
        </View>
      </View>
      {children}
    </View>
  );
}

function FileRow({
  icon: Icon,
  name,
  meta,
  chip,
  tick,
  onView, onRemove, disabled,
}: {
  icon: LucideIcon;
  name: string;
  meta: string;
  chip?: string;
  tick?: boolean; onView():void; onRemove():void; disabled:boolean;
}) {
  return (
    <View style={styles.file}>
      <View style={styles.fileIcon}>
        <Icon size={t.fileIconGlyph} color={colors.textBody} />
      </View>
      <View style={styles.fileText}>
        <View style={styles.fileNameRow}>
          {/* design/45 clips this name behind the VERIFIED chip. Shown in full and
              allowed to shrink instead. */}
          <Text style={styles.fileName} {...shrinkToFit(0.7)}>
            {name}
          </Text>
          {chip && (
            <View style={styles.fileChip}>
              <Text style={styles.fileChipText}>{chip}</Text>
            </View>
          )}
          {tick && <CircleCheck size={t.fileTickSize} color={colors.textBody} style={styles.fileTick} />}
        </View>
        <Text style={styles.fileMeta} {...shrinkToFit(0.8)}>
          {meta}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={'View '+name}
        onPress={onView} disabled={disabled}
        style={styles.fileAction}
      >
        <Eye size={t.fileActionIcon} color={colors.textPrimary} />
      </Pressable>
      <Pressable onPress={onRemove} disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={'Remove '+name}
        style={[styles.fileAction, styles.fileActionLast]}
      >
        <Trash2 size={t.fileActionIcon} color={colors.danger} />
      </Pressable>
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
  headText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.headIconGap,
  },
  headTitle: {
    fontFamily: font.appHeading,
    fontSize: t.headTitleSize,
    color: colors.textPrimary,
  },
  headDesc: {
    marginTop: t.headDescGap,
    fontFamily: font.appBody,
    fontSize: t.headDescSize,
    lineHeight: t.headDescLineHeight,
    color: colors.textBody,
  },
  statePill: {
    marginLeft: t.headStateGap,
    width: t.stateWidth,
    minHeight: t.stateChipHeight,
    borderRadius: t.stateChipRadius,
    paddingHorizontal: t.stateChipPadX,
    paddingVertical: 3,
    backgroundColor: t.stateBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statePlain: {
    marginLeft: t.headStateGap,
    width: t.stateWidth,
    alignItems: 'center',
  },
  stateText: {
    fontFamily: font.appSemi,
    fontSize: t.stateSize,
    lineHeight: t.stateLineHeight,
    textAlign: 'center',
    color: colors.textBody,
  },
  file: {
    marginTop: t.fileGap,
    borderRadius: t.fileRadius,
    backgroundColor: t.fileBg,
    padding: t.filePad,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    width: t.fileIcon,
    height: t.fileIcon,
    borderRadius: t.fileIconRadius,
    backgroundColor: t.fileIconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileText: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.fileIconGap,
  },
  fileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // design/45 runs the file name under the VERIFIED chip because the row cannot
    // hold both at 390pt. Wrapping keeps the whole name and drops the chip to the
    // next line instead of clipping it — see the note on the name itself.
    flexWrap: 'wrap',
  },
  fileName: {
    flexShrink: 1,
    fontFamily: font.appSemi,
    fontSize: t.fileNameSize,
    color: colors.textPrimary,
  },
  fileChip: {
    marginLeft: t.fileChipGap,
    height: t.fileChipHeight,
    borderRadius: t.fileChipRadius,
    paddingHorizontal: t.fileChipPadX,
    backgroundColor: t.fileChipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileChipText: {
    fontFamily: font.appSemi,
    fontSize: t.fileChipSize,
    letterSpacing: t.fileChipSpacing,
    color: colors.textBody,
  },
  fileTick: {
    marginLeft: t.fileChipGap,
  },
  fileMeta: {
    marginTop: t.fileMetaGap,
    fontFamily: font.appBody,
    fontSize: t.fileMetaSize,
    color: colors.textBody,
  },
  fileAction: {
    marginLeft: t.fileActionGap,
    width: t.fileAction,
    height: t.fileAction,
    borderRadius: t.fileActionRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileActionLast: {
    marginLeft: 6,
  },
  drop: {
    marginTop: t.dropGap,
    minHeight: t.dropHeight,
    borderRadius: t.dropRadius,
    backgroundColor: t.dropBg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: t.dropBorder,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.cardPad,
    paddingVertical: t.cardPad,
  },
  dropCircle: {
    width: t.dropCircle,
    height: t.dropCircle,
    borderRadius: t.dropCircle / 2,
    backgroundColor: t.dropCircleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropTitle: {
    marginTop: t.dropTitleGap,
    fontFamily: font.appHeading,
    fontSize: t.dropTitleSize,
    color: colors.textPrimary,
  },
  dropHint: {
    marginTop: t.dropHintGap,
    fontFamily: font.appBody,
    fontSize: t.dropHintSize,
    color: colors.textBody,
  },
  attach: {
    marginTop: t.attachGap,
    minHeight: t.attachHeight,
    borderRadius: t.attachRadius,
    backgroundColor: t.attachBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.cardPad,
  },
  attachLabel: {
    marginLeft: t.attachIconGap,
    fontFamily: font.appSemi,
    fontSize: t.attachSize,
    color: colors.textPrimary,
  },
  perPage: {
    marginTop: t.noteGap,
    fontFamily: font.appBody,
    fontSize: t.noteSize,
    lineHeight: t.noteLineHeight,
    color: t.noteColour,
  },
  slot: {
    marginTop: t.slotGap,
    alignSelf: 'center',
    minHeight: t.slotHeight,
    borderRadius: t.slotRadius,
    paddingHorizontal: t.slotPadX,
    backgroundColor: t.slotBg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotLabel: {
    marginLeft: t.slotIconGap,
    fontFamily: font.appSemi,
    fontSize: t.slotSize,
    color: colors.textPrimary,
  },
  custody: {
    marginTop: t.custodyGap,
    borderRadius: t.custodyRadius,
    backgroundColor: t.custodyBg,
    padding: t.custodyPad,
  },
  custodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  custodyLabel: {
    flex: 1,
    minWidth: 0,
    marginLeft: t.custodyIconGap,
    fontFamily: font.appSemi,
    fontSize: t.custodyLabelSize,
    letterSpacing: t.custodyLabelSpacing,
    color: colors.textBody,
  },
  custodyState: {
    marginLeft: 8,
    fontFamily: font.appHeading,
    fontSize: t.custodyStateSize,
    color: t.custodyStateColour,
  },
  stats: {
    marginTop: t.statGap,
    flexDirection: 'row',
    gap: t.statColGap,
  },
  stat: {
    flex: 1,
    minWidth: 0,
    minHeight: t.statHeight,
    borderRadius: t.statRadius,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  statValue: {
    fontFamily: font.appHeading,
    fontSize: t.statValueSize,
    color: colors.textPrimary,
  },
  statLabel: {
    marginTop: t.statLabelGap,
    fontFamily: font.appBody,
    fontSize: t.statLabelSize,
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
  footer: {
    marginTop: t.footerGap,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    marginLeft: t.footerIconGap,
    fontFamily: font.appBody,
    fontSize: t.footerSize,
    color: colors.textBody,
  },
});
export default function LiveFirScreen() { return <IntakeBoundary step={4} title="Documents & Evidence"><FirStep4Screen/></IntakeBoundary>; }
