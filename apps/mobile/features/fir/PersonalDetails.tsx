import {Text,View} from 'react-native';
import {FIR_PERSONAL_LABELS,emptyFirPersonalDetails,answerText,type FirPersonalDetails} from '@legalitt/shared';
import {AnswerField} from './AnswerField';
import {s} from './shared';

export function FirPersonalFields({value,onChange}:{value?:FirPersonalDetails;onChange(value:FirPersonalDetails):void}){
 const current=value??emptyFirPersonalDetails();
 return <View><Text style={s.body}>These are the complainant’s facts. Complete each answer, or explicitly choose Unknown or Not applicable. No answer is assumed.</Text>
  {Object.entries(FIR_PERSONAL_LABELS).map(([key,label])=><AnswerField key={key} label={label} numeric={key==='age'} value={current[key as keyof FirPersonalDetails]} onChange={answer=>onChange({...current,[key]:answer} as FirPersonalDetails)}/>)}
 </View>;
}
export function FirPersonalSummary({value}:{value?:FirPersonalDetails}){
 return <View style={{gap:6,marginTop:12}}>{Object.entries(FIR_PERSONAL_LABELS).map(([key,label])=><Text key={key} style={s.body}>{label}: {answerText(value?.[key as keyof FirPersonalDetails])||'Not answered yet'}</Text>)}</View>;
}
