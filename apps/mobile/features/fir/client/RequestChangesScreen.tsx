// C12 Request Changes (design/client/fir-draft/F7-request-changes.png). Sections
// (one or more), what to change (up to 600 characters) and one optional PDF / JPG /
// PNG up to 10 MB go to the advocate; then C13. The upload area stays visible under
// an attached file, as drawn; choosing another file replaces it (the replaced
// upload is deleted). The draft's file name may wrap to two lines. Nothing secret
// travels in the URL: C13 reloads the saved review from the flow. Cancel & Return /
// Back ask "Discard your changes?" once anything is entered (the browser's own Back
// does not ask yet: left open). Left out: the drawn "Encrypted" badge
// (flow C12 [REMOVE]) and "drag & drop", which the app doesn't support.
import {useState} from 'react';
import {router,useLocalSearchParams} from 'expo-router';
import {ArrowRight,CheckCircle2,CloudUpload,FileText,Image as ImageIcon,Info,PencilLine,Trash2,X} from 'lucide-react-native';
import {Pressable,ScrollView,StyleSheet,Text,TextInput,View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {FIR_REVIEW_SECTIONS,type ApiDocument,type FirReviewSection} from '@legalitt/shared';
import ConfirmModal from '../../../components/ConfirmModal';
import FirResultHeader from '../../../components/FirResultHeader';
import Spinner from '../../../components/Spinner';
import {colors,font,ink} from '../../../constants/theme';
import {backend} from '../../../lib/auth';
import {backOr,firHref,firPdfName,formatSize,useFirFlow} from '../flow';
import {pickAndUploadChangeAttachment} from './api';
import {errorText,goHome,hashRef} from './format';
import {InlineError,LoadingState,StatePanel} from './ui';
import {firChanges as t,firInk} from './tokens';

const MAX=600;

export default function FirRequestChangesScreen(){
  const {caseId}=useLocalSearchParams<{caseId?:string}>();
  const insets=useSafeAreaInsets();
  const f=useFirFlow(caseId),flow=f.flow;
  const [sections,setSections]=useState<FirReviewSection[]>([]);
  const [comment,setComment]=useState('');
  const [attachment,setAttachment]=useState<ApiDocument|null>(null);
  const [uploading,setUploading]=useState(false),[removing,setRemoving]=useState(false),[fileError,setFileError]=useState('');
  const [touched,setTouched]=useState(false),[submitting,setSubmitting]=useState(false),[submitError,setSubmitError]=useState('');
  const [discarding,setDiscarding]=useState(false);

  const toReview=()=>caseId?backOr(firHref('ready',caseId)):goHome();
  const dirty=comment.trim().length>0||!!attachment;
  const leave=()=>{if(dirty&&!submitting)setDiscarding(true);else toReview();};
  const discard=async()=>{
    setDiscarding(false);
    // The uploaded file was never sent; remove it rather than leave it on the case.
    if(attachment)await backend.deleteDocument(attachment.id).catch(()=>undefined);
    toReview();
  };
  const header=<FirResultHeader title="Request Changes" align="left" avatar="dark" onBack={leave}/>;

  if(f.loading&&!flow)return <View style={styles.screen}>{header}<LoadingState label="Loading your FIR draft…"/></View>;
  if(!flow)return <View style={styles.screen}>{header}<ScrollView contentContainerStyle={styles.content}>
    <StatePanel tone="error" title="We couldn’t load your FIR draft" body={f.error||'Something went wrong loading your request.'}
      actions={[...(caseId?[{label:'Try again',onPress:f.reload,primary:true}]:[]),{label:'Back',onPress:toReview}]}/>
  </ScrollView></View>;
  const draft=flow.draft;
  if(!flow.stage.client.decision_due||!draft)return <View style={styles.screen}>{header}<ScrollView contentContainerStyle={styles.content}>
    <StatePanel title="This draft isn’t waiting for your review" body={`Request ${hashRef(flow.reference)} is ${flow.stage.client.status.toLowerCase()}. You can request changes when a draft is sent to you for review.`}
      actions={[{label:'Track Request',onPress:()=>router.replace(firHref('status',flow.case_id)),primary:true}]}/>
  </ScrollView></View>;

  const problems={sections:sections.length?'':'Pick at least one section.',comment:comment.trim()?'':'Describe the changes you need.'};
  const toggle=(code:FirReviewSection)=>setSections(list=>list.includes(code)?list.filter(c=>c!==code):[...list,code]);
  /** One file at most: a new upload replaces the attached one, which is deleted once the new one is in. */
  const attach=async()=>{
    setUploading(true);setFileError('');
    try{
      const doc=await pickAndUploadChangeAttachment(flow.case_id);
      if(doc){
        const previous=attachment;
        setAttachment(doc);
        // The replaced file was never sent; remove it rather than leave it on the case.
        if(previous)await backend.deleteDocument(previous.id).catch(()=>undefined);
      }
    }
    catch(e){setFileError(errorText(e,'The file couldn’t be uploaded. Try again.'));}
    finally{setUploading(false);}
  };
  const remove=async()=>{
    if(!attachment)return;
    setRemoving(true);setFileError('');
    try{await backend.deleteDocument(attachment.id);setAttachment(null);}
    catch(e){setFileError(errorText(e,'The file couldn’t be removed. Try again.'));}
    finally{setRemoving(false);}
  };
  const submit=async()=>{
    setTouched(true);setSubmitError('');
    if(problems.sections||problems.comment||submitting||uploading)return;
    setSubmitting(true);
    try{
      await backend.firClientChanges(flow.case_id,{draft_id:draft.draft_id,sections,comment:comment.trim(),attachment_document_id:attachment?.id??null});
      router.replace(firHref('changes-submitted',flow.case_id));
    }catch(e){setSubmitError(errorText(e,'Your change request wasn’t sent. Try again.'));}
    finally{setSubmitting(false);}
  };
  const image=attachment?.mime_type.startsWith('image/');
  const name=firPdfName(flow.reference,draft.version);

  return <View style={styles.screen}>
    {header}
    <ScrollView contentContainerStyle={[styles.content,{paddingBottom:insets.bottom+32}]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.eyebrowRow}><PencilLine size={t.eyebrowIcon} color={firInk.deep}/><Text style={styles.eyebrow}>DRAFT REVISION REQUEST</Text></View>
      <Text style={styles.title}>What Changes Are Needed?</Text>
      <Text style={styles.body}>Tell us what needs to be corrected or updated in your FIR draft. Please provide clear details so the relevant legal team can review and revise promptly.</Text>

      <View style={[styles.card,styles.fileCard]}>
        <View style={styles.fileTile}><FileText size={t.fileIcon} color={firInk.peachText}/></View>
        <View style={styles.fileText}>
          <Text style={styles.fileName} numberOfLines={2}>{name}</Text>
          <Text style={styles.fileId} numberOfLines={1}>ID: {hashRef(flow.reference)}</Text>
        </View>
        <View style={styles.badge}><Text style={styles.badgeText}>Awaiting Review</Text></View>
      </View>

      <View style={styles.sectionHead}>
        <Text style={styles.label}>Select Section <Text style={styles.required}>*</Text></Text>
        <Text style={styles.hintRight}>Tap to pick</Text>
      </View>
      <Text style={styles.hint}>Choose the part of the FIR draft that needs correction.</Text>
      <View style={styles.chips} accessibilityRole="list">
        {FIR_REVIEW_SECTIONS.map(s=>{const on=sections.includes(s.code);return <Pressable key={s.code} accessibilityRole="checkbox" accessibilityState={{checked:on}} onPress={()=>toggle(s.code)}
          style={({pressed})=>[styles.chip,on&&styles.chipOn,pressed&&styles.pressed]}>
          <Text style={[styles.chipText,on&&styles.chipTextOn]} numberOfLines={1}>{s.label}</Text>
          {on&&<CheckCircle2 size={t.chipIcon} color={ink.onBrand}/>}
        </Pressable>;})}
      </View>
      {touched&&!!problems.sections&&<Text accessibilityRole="alert" style={styles.fieldError}>{problems.sections}</Text>}

      <Text style={[styles.label,styles.labelGap]}>Describe Required Changes <Text style={styles.required}>*</Text></Text>
      <View style={[styles.card,styles.inputCard,touched&&!!problems.comment&&styles.inputInvalid]}>
        <TextInput accessibilityLabel="Describe required changes" value={comment} onChangeText={v=>setComment(v.slice(0,MAX))} maxLength={MAX} multiline
          placeholder="Describe the corrections or changes required in your FIR draft... (e.g. Please update the incident time from 4:30 PM to 6:15 PM and correct witness name spelling to Manoj Verma)"
          placeholderTextColor={colors.textMuted} style={styles.input} textAlignVertical="top"/>
        <View style={styles.inputFoot}>
          <Info size={13} color={colors.textMuted}/>
          <Text style={styles.inputHint}>Please be as specific as possible</Text>
          <Text style={styles.counter} accessibilityLabel={`${comment.length} of ${MAX} characters`}>{comment.length} / {MAX}</Text>
        </View>
      </View>
      {touched&&!!problems.comment&&<Text accessibilityRole="alert" style={styles.fieldError}>{problems.comment}</Text>}

      <Text style={[styles.label,styles.labelGap]}>Supporting Attachment (Optional)</Text>
      <Text style={styles.hint}>Upload any reference documents, photo evidence, or written notes if helpful.</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Choose file. PDF, JPG, PNG up to 10MB" accessibilityHint={attachment?`Replaces ${attachment.filename}`:undefined}
        accessibilityState={{busy:uploading,disabled:uploading||removing||submitting}} disabled={uploading||removing||submitting}
        onPress={()=>void attach()} style={({pressed})=>[styles.drop,pressed&&styles.pressed]}>
        <View style={styles.dropCircle}>{uploading?<Spinner/>:<CloudUpload size={t.dropIcon} color={colors.textBody}/>}</View>
        <Text style={styles.dropTitle}>{uploading?'Uploading…':'Choose file'}</Text>
        <Text style={styles.dropHint}>PDF, JPG, PNG up to 10MB</Text>
      </Pressable>
      {attachment&&<View style={[styles.card,styles.attachRow]}>
        <View style={[styles.rowTile,image?styles.rowTileImage:styles.rowTilePdf]}>{image?<ImageIcon size={t.rowIcon} color={firInk.green}/>:<FileText size={t.rowIcon} color={firInk.danger}/>}</View>
        <View style={styles.fileText}>
          <View style={styles.attachNameRow}><Text style={styles.fileName} numberOfLines={1}>{attachment.filename}</Text><CheckCircle2 size={14} color={firInk.green}/></View>
          <Text style={styles.fileId}>{[formatSize(attachment.size_bytes),'Uploaded'].filter(Boolean).join(' • ')}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${attachment.filename}`} accessibilityState={{disabled:removing||uploading}} disabled={removing||uploading} onPress={()=>void remove()} hitSlop={8} style={styles.remove}>
          {removing?<Spinner size={14}/>:<Trash2 size={15} color={firInk.danger}/>}
          <Text style={styles.removeText}>{removing?'Removing…':'Remove'}</Text>
        </Pressable>
      </View>}
      <InlineError style={styles.fileError} message={fileError}/>

      <InlineError style={styles.submitError} message={submitError} onRetry={()=>void submit()}/>
      <Pressable accessibilityRole="button" accessibilityState={{disabled:submitting||uploading,busy:submitting}} disabled={submitting||uploading} onPress={()=>void submit()}
        style={({pressed})=>[styles.submit,(submitting||uploading)&&styles.disabled,pressed&&styles.pressed]}>
        {submitting?<><Spinner size={18}/><Text style={[styles.submitText,styles.submitBusy]}>Sending…</Text></>
          :<><Text style={styles.submitText}>Submit Change Request</Text><ArrowRight size={t.buttonIcon} color={ink.onBrand}/></>}
      </Pressable>
      <Pressable accessibilityRole="button" disabled={submitting} onPress={leave} style={styles.cancel}><Text style={styles.cancelText}>Cancel &amp; Return</Text></Pressable>
    </ScrollView>

    <ConfirmModal visible={discarding} icon={X} tone="danger" title="Discard your changes?" body="What you entered won’t be sent to your advocate."
      confirmLabel="Discard" cancelLabel="Keep editing" onConfirm={()=>void discard()} onCancel={()=>setDiscarding(false)}/>
  </View>;
}

const styles=StyleSheet.create({
  screen:{flex:1,backgroundColor:firInk.bg},
  content:{paddingHorizontal:t.padX},
  pressed:{opacity:0.85},
  disabled:{opacity:0.6},
  eyebrowRow:{marginTop:t.eyebrowTop,flexDirection:'row',alignItems:'center',gap:6},
  eyebrow:{fontFamily:font.appSemi,fontSize:t.eyebrowSize,letterSpacing:t.eyebrowSpacing,color:firInk.deep},
  title:{marginTop:t.titleTop,fontFamily:font.appHeading,fontSize:t.titleSize,lineHeight:t.titleLine,color:colors.textPrimary},
  body:{marginTop:t.bodyTop,fontFamily:font.appBody,fontSize:t.bodySize,lineHeight:t.bodyLine,color:colors.textBody},
  card:{borderRadius:t.cardRadius,backgroundColor:colors.card,borderWidth:1,borderColor:firInk.border},
  fileCard:{marginTop:t.cardTop,padding:t.cardPad,flexDirection:'row',alignItems:'center'},
  fileTile:{width:t.fileTile,height:t.fileTile,borderRadius:t.fileTileRadius,backgroundColor:firInk.peach,alignItems:'center',justifyContent:'center'},
  fileText:{flex:1,minWidth:0,marginLeft:t.fileGap},
  fileName:{flexShrink:1,fontFamily:font.appSemi,fontSize:t.fileNameSize,color:colors.textPrimary},
  fileId:{marginTop:2,fontFamily:font.appBody,fontSize:t.fileIdSize,color:colors.textBody},
  badge:{marginLeft:8,height:t.badgeH,borderRadius:t.badgeRadius,paddingHorizontal:t.badgePadX,backgroundColor:firInk.amberBg,justifyContent:'center'},
  badgeText:{fontFamily:font.appSemi,fontSize:t.badgeSize,color:firInk.amberText},
  sectionHead:{marginTop:t.sectionTop,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  label:{fontFamily:font.appHeading,fontSize:t.labelSize,color:colors.textPrimary},
  labelGap:{marginTop:t.sectionTop},
  required:{color:firInk.danger},
  hintRight:{fontFamily:font.appBody,fontSize:t.hintSize,color:colors.textBody},
  hint:{marginTop:t.hintTop,fontFamily:font.appBody,fontSize:t.hintSize,lineHeight:17,color:colors.textBody},
  chips:{marginTop:t.chipsTop,flexDirection:'row',flexWrap:'wrap',gap:t.chipGap},
  chip:{flexBasis:'47%',flexGrow:1,minHeight:t.chipH,borderRadius:t.chipRadius,paddingHorizontal:t.chipPadX,backgroundColor:firInk.chip,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:6},
  chipOn:{backgroundColor:firInk.deep},
  chipText:{flexShrink:1,fontFamily:font.appSemi,fontSize:t.chipSize,color:firInk.deepText},
  chipTextOn:{color:ink.onBrand},
  fieldError:{marginTop:6,fontFamily:font.appBody,fontSize:t.errorSize,color:firInk.danger},
  inputCard:{marginTop:t.inputTop,padding:t.inputPad},
  inputInvalid:{borderColor:firInk.danger},
  input:{minHeight:t.inputMin,fontFamily:font.appBody,fontSize:t.inputSize,lineHeight:t.inputLine,color:colors.textPrimary,padding:0},
  inputFoot:{marginTop:10,flexDirection:'row',alignItems:'center',gap:6},
  inputHint:{flex:1,minWidth:0,fontFamily:font.appBody,fontSize:t.counterSize,color:colors.textMuted},
  counter:{fontFamily:font.appSemi,fontSize:t.counterSize,color:colors.textBody},
  drop:{marginTop:t.dropTop,borderRadius:t.dropRadius,backgroundColor:t.dropBg,padding:t.dropPad,alignItems:'center',gap:6},
  dropCircle:{width:t.dropCircle,height:t.dropCircle,borderRadius:t.dropCircle/2,backgroundColor:'#E7E3DF',alignItems:'center',justifyContent:'center'},
  dropTitle:{marginTop:4,fontFamily:font.appHeading,fontSize:t.dropTitleSize,color:colors.textPrimary},
  dropHint:{fontFamily:font.appBody,fontSize:t.dropHintSize,color:colors.textBody},
  attachRow:{marginTop:t.rowTop,padding:12,flexDirection:'row',alignItems:'center'},
  rowTile:{width:t.rowTile,height:t.rowTile,borderRadius:8,alignItems:'center',justifyContent:'center'},
  rowTileImage:{backgroundColor:firInk.greenSoft},
  rowTilePdf:{backgroundColor:firInk.dangerSoft},
  attachNameRow:{flexDirection:'row',alignItems:'center',gap:6},
  remove:{marginLeft:8,flexDirection:'row',alignItems:'center',gap:4},
  removeText:{fontFamily:font.appSemi,fontSize:t.removeSize,color:firInk.danger},
  fileError:{marginTop:10},
  submitError:{marginTop:t.submitTop},
  submit:{marginTop:t.submitTop,height:t.buttonH,borderRadius:t.buttonRadius,backgroundColor:firInk.deep,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10},
  submitText:{fontFamily:font.appHeading,fontSize:t.buttonSize,color:ink.onBrand},
  submitBusy:{marginLeft:2},
  cancel:{marginTop:t.cancelTop,alignSelf:'center',paddingVertical:6,paddingHorizontal:12},
  cancelText:{fontFamily:font.appSemi,fontSize:t.cancelSize,color:firInk.deepText},
});
