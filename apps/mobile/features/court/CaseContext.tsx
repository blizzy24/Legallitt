import {Text,View} from 'react-native';
import {noticeCalendarDate} from '@legalitt/shared';
import {Card,Chip,Row,Value,s} from './ui';
import type {CourtModel} from './model';

/** Read-only context from the case, shared by action screens. No contact numbers. */
export function CourtCaseContext({model:m,client=false}:{model:CourtModel;client?:boolean}){
 const v=m.view!,f=m.form;
 return <Card title={client?'Your case':'Case details'}><Row>{f.case_type&&<Chip>{f.case_type}</Chip>}<Chip>{v.case.service_code==='district_court'?'District Court':'High Court'}</Chip></Row>
 {!client&&f.full_name&&<View style={{flexDirection:'row',alignItems:'center',gap:12}}><View style={{width:42,height:42,borderRadius:21,backgroundColor:'#F8E6CF',alignItems:'center',justifyContent:'center'}}><Text style={s.label}>{f.full_name.split(/\s+/).slice(0,2).map(n=>n[0]).join('')}</Text></View><View><Text style={s.label}>{f.full_name}</Text><Text style={s.muted}>Client</Text></View></View>}
 <Value label="Matter" value={f.title}/><Row><View style={{flex:1}}><Value label="Court" value={f.high_court||[f.district,f.state].filter(Boolean).join(', ')}/></View><View style={{flex:1}}><Value label="Bench" value={f.bench}/><Value label="Case number" value={v.data.filing?.case_number||f.case_number}/></View></Row><Value label="Request ID" value={v.case.reference}/><Value label="First action due by" value={!v.data.accepted_at?noticeCalendarDate(v.data.deadline_at):undefined}/></Card>;
}
