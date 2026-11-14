import {Text,View} from 'react-native';
import {router} from 'expo-router';
import {Button,Card,Chip,Link,Row,SummaryRow,s} from './ui';
import type {CourtModel} from './model';

export function CourtAdvocateCard({model:m}:{model:CourtModel}){
 const v=m.view!,a=v.case.advocate,p=a?.profile;
 if(!v.case.advocate_id)return null;
 const initials=a?.full_name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('');
 return <Card title="Your advocate"><View style={{flexDirection:'row',gap:16,alignItems:'center'}}>{initials&&<View style={{width:64,height:64,borderRadius:32,backgroundColor:'#F5E8D8',alignItems:'center',justifyContent:'center'}}><Text style={s.heading}>{initials}</Text></View>}<View style={{flex:1,gap:8}}>{p?.verification==='approved'&&<Chip>Verified Advocate</Chip>}<Text style={s.heading}>{a?.full_name||'Assigned advocate'}</Text>{p?.bio&&<Text style={s.body}>{p.bio}</Text>}</View></View><Row>{p?.years_experience!=null&&<Chip>{p.years_experience} {p.years_experience===1?'year':'years'} experience</Chip>}{p?.courts.map(court=><Chip key={court}>{court}</Chip>)}{p?.city&&<Chip>{[p.city,p.state].filter(Boolean).join(', ')}</Chip>}</Row><Button secondary onPress={()=>router.push(`/advocates/${v.case.advocate_id}` as never)}>View Full Profile</Button></Card>;
}
export function CourtAdvocateDecision({model:m,onAccept}:{model:CourtModel;onAccept():void}){
 const v=m.view!,d=v.data,remaining=Math.max(0,v.policy.free_changes-d.changes.filter(x=>x.kind==='free').length),go=(step:string)=>void m.go(step);
 return <><View style={s.notice}><Text style={s.heading}>Ready to decide?</Text><Text style={s.body}>Review your advocate and talk through in-app chat. Then choose how to continue with your case.</Text></View><CourtAdvocateCard model={m}/>
 <Card title="Your conversation"><Text style={s.body}>Talk to your advocate again before making your final decision.</Text><Text style={s.muted}>Phone numbers are never shared. Calls are unavailable.</Text><Button secondary onPress={()=>go('chat')}>View Chat</Button></Card>
 <Card title="Your case"><Chip>{m.tier==='urgent'?'Urgent service':'Standard service'}</Chip><SummaryRow label="Case type" value={m.form.case_type}/><SummaryRow label="Case" value={m.form.title}/><SummaryRow label="Court" value={m.form.high_court||[m.form.district,m.form.state].filter(Boolean).join(', ')}/><SummaryRow label="Request ID" value={v.case.reference}/></Card>
 <Text style={s.heading}>What do you want to do?</Text><Text style={s.body}>Choose one option below to move forward.</Text><Card><Button disabled={m.busy} onPress={onAccept}>Accept Advocate</Button><Text style={s.muted}>Continue with this advocate for your case.</Text><View style={{height:1,backgroundColor:'#E8E1D8',marginVertical:10}}/><Button secondary onPress={()=>go('change')}>Request New Advocate</Button><Text style={s.muted}>Ask Legalitt to assign another advocate. {remaining} free {remaining===1?'change':'changes'} remaining.</Text><View style={{height:1,backgroundColor:'#E8E1D8',marginVertical:10}}/><Link onPress={()=>go('cancel')}>Cancel Request</Link><Text style={s.muted}>Cancel your court representation request.</Text></Card>
 <View style={s.notice}><Text style={s.heading}>Before you choose</Text><Text style={s.body}>Make sure you are comfortable continuing with this advocate. You can chat again before deciding.</Text></View></>;
}
