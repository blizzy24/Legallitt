import {Text,View} from 'react-native';
import {Check} from 'lucide-react-native';
import {COURT_STAGES,noticeDate} from '@legalitt/shared';
import {Card,s} from './ui';
import type {CourtModel} from './model';
export function CourtTimeline({model:m}:{model:CourtModel}){
 const v=m.view!,d=v.data;
 return <Card title="Case progress"><Text style={s.muted}>Stage {v.stage.index+1} of {COURT_STAGES.length}</Text>{COURT_STAGES.map((stage,i)=>{
 const done=i<v.stage.index||d.phase==='completed',current=i===v.stage.index&&d.phase!=='completed';
 const event=(v.case.events??[]).find(e=>e.type===({draft:'court_submit',verification:'court_verify',assignment:'court_assign',discussion:'court_advocate_decision',decision:'court_client_accept',documents:'court_documents_received',preparation:'court_preparation',filed:'court_filing',hearings:'court_hearing',completed:'court_completion_confirm'}[stage.key]));
 return <View key={stage.key} style={{flexDirection:'row',gap:14,minHeight:72}}><View style={{alignItems:'center'}}><View style={{width:24,height:24,borderRadius:14,borderWidth:2,borderColor:done?'#209B6C':'#8C7658',backgroundColor:done?'#209B6C':'white',alignItems:'center',justifyContent:'center'}}>{done&&<Check size={16} color="white"/>}{current&&<View style={{width:10,height:10,borderRadius:6,backgroundColor:'#8C7658'}}/>}</View>{i<COURT_STAGES.length-1&&<View style={{width:1,flex:1,backgroundColor:'#D8D0C5'}}/>}</View><View style={{flex:1,paddingBottom:15}}><Text style={s.label}>{stage.label}</Text><Text style={s.muted}>{done?'Completed':current?'In progress':'Pending'}</Text>{done&&event&&<Text style={s.muted}>{noticeDate(event.created_at)}</Text>}</View></View>;
 })}</Card>;
}
