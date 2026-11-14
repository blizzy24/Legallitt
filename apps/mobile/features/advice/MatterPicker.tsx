import {Pressable,Text,View} from 'react-native';
import {MessageSquare,Users,Scale,ShoppingCart,Briefcase,Shield,Home,Building,UserRound,Calendar} from 'lucide-react-native';
import type {AdviceIntake} from '@legalitt/shared';
import {s} from '../court/ui';
const matters:[AdviceIntake['category'],string,typeof Scale][]=[
 ['General Consultation','Connect with an advocate for personalized legal guidance on your matter and get clarity on the next steps.',MessageSquare],
 ['Family Law','Matters related to divorce, child custody, marriage, maintenance, restitution of conjugal rights, and other matrimonial and family-related legal issues.',Users],
 ['Criminal Law','Matters related to bail, trials, criminal appeals, Prevention of Corruption Act (PC Act) matters, and other criminal legal proceedings.',Scale],
 ['Consumer Dispute','Consumer Complaint/Appeal before Different Forums, deficiency in Service and other Consumer related matter.',ShoppingCart],
 ['Service Matter','Appointment and recruitment, promotions, transfer, suspension, termination, salary, pension and other service dispute.',Briefcase],
 ['Cyber Crime','Online fraud, UPI fraud, Cybercrime Complaint, Data theft and privacy Breaches etc.',Shield],
 ['Property Law','Matters Related to property, ownership, agreements & other property disputes.',Home],
 ['Corporate Law','Mergers and acquisitions, NCLT, NCLAT, SEBI, SAT, IPR and other Corporate matters.',Building],
 ['Labour Law','Employer-employee dispute, EPF, Industrial dispute, Salary & Wages dispute and other labour dispute.',UserRound],
 ['Arbitration','Arbitration case, arbitration appeal, appointment of arbitrator and other arbitration matter.',Calendar],
];
export function MatterPicker({value,onChange}:{value:AdviceIntake['category'];onChange(value:AdviceIntake['category']):void}){return <><Text style={s.title}>Select Your Legal Matter</Text><Text style={s.body}>Select the legal category that best suits your needs.</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:12}}>{matters.map(([label,description,Icon])=><Pressable key={label} accessibilityRole="radio" accessibilityLabel={label} accessibilityState={{checked:value===label}} onPress={()=>onChange(label)} style={{width:'48%',borderWidth:1,borderColor:value===label?'#AC9778':'#EAE6E0',backgroundColor:'white',borderRadius:18,padding:12,gap:10,boxShadow:'0 2px 8px #00000012'}}><View style={{flexDirection:'row',alignItems:'center',gap:8}}><View style={{borderRadius:24,padding:8,backgroundColor:'#E5EEFF'}}><Icon size={22} color="#719CE2"/></View><Text style={[s.label,{flex:1,fontSize:14,color:'#234E44'}]}>{label}</Text></View><Text style={[s.muted,{fontSize:11,lineHeight:16,color:'#234E44'}]}>{description}</Text></Pressable>)}</View></>;}
