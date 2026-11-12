import {useEffect,useState} from 'react';
import {Pressable,StyleSheet,Text,TextInput,View} from 'react-native';
import {Check,Plus,Search} from 'lucide-react-native';
import {colors,font} from '../../../constants/theme';
import {BNS_ACT,searchBns} from './bns';
import {Sheet,SheetButton,s} from './common';

type Section={act:string;section:string;description:string};
// A5 "+ Add Legal Section" (design/218 draws the button; the search list has no design).
export function LegalSectionSheet({visible,existing,onAdd,onClose}:{visible:boolean;existing:Section[];onAdd(section:Section):void;onClose():void}){
  const [query,setQuery]=useState(''),[number,setNumber]=useState(''),[offence,setOffence]=useState(''),[error,setError]=useState('');
  useEffect(()=>{if(visible){setQuery('');setNumber('');setOffence('');setError('');}},[visible]);
  const has=(section:string)=>existing.some(e=>e.act.trim().toUpperCase()===BNS_ACT&&e.section.trim().toLowerCase()===section.trim().toLowerCase());
  const results=searchBns(query);
  const addCustom=()=>{
    const sec=number.trim().replace(/^bns\s*/i,''),desc=offence.trim();
    if(!sec||!desc){setError('Enter the BNS section number and the offence.');return;}
    if(has(sec)){setError(`BNS ${sec} is already in this draft.`);return;}
    onAdd({act:BNS_ACT,section:sec,description:desc});
  };
  return <Sheet visible={visible} title="Add Legal Section" body="Bharatiya Nyaya Sanhita, 2023. Search by section number or offence." onClose={onClose}>
    <View style={st.search}><Search size={18} color={colors.textBody}/><TextInput accessibilityLabel="Search BNS sections" value={query} onChangeText={setQuery} placeholder="e.g. 308 or extortion" placeholderTextColor={colors.textMuted} style={st.searchInput} autoCorrect={false}/></View>
    {results.length?results.map(r=>{const added=has(r.section);return <Pressable key={r.section} accessibilityRole="button" accessibilityState={{disabled:added}} disabled={added}
      onPress={()=>onAdd({act:BNS_ACT,section:r.section,description:r.offence})} style={({pressed})=>[st.row,pressed&&{opacity:0.8}]}>
      <View style={st.rowText}><Text style={st.rowTitle}>BNS {r.section}</Text><Text style={st.rowSub}>{r.offence}</Text></View>
      {added?<View style={st.added}><Check size={14} color={colors.brandDark}/><Text style={st.addedText}>Added</Text></View>:<Plus size={18} color={colors.textPrimary}/>}
    </Pressable>;}):<Text style={s.hint}>No listed section matches “{query.trim()}”. Add it below.</Text>}
    <Text style={s.label}>Section not listed?</Text>
    <View style={st.customRow}>
      <TextInput accessibilityLabel="BNS section number" value={number} onChangeText={v=>{setNumber(v);setError('');}} placeholder="Section, e.g. 115(2)" placeholderTextColor={colors.textMuted} style={[s.input,st.number]} autoCorrect={false}/>
      <TextInput accessibilityLabel="Offence" value={offence} onChangeText={v=>{setOffence(v);setError('');}} placeholder="Offence" placeholderTextColor={colors.textMuted} style={[s.input,st.offence]}/>
    </View>
    {!!error&&<Text style={[s.error,{marginTop:8}]} accessibilityRole="alert">{error}</Text>}
    <SheetButton label="Add BNS Section" tone="neutral" onPress={addCustom}/>
    <SheetButton label="Done" onPress={onClose}/>
  </Sheet>;
}
const st=StyleSheet.create({
  search:{marginTop:14,minHeight:46,borderRadius:12,borderWidth:1,borderColor:'#E6E0D9',paddingHorizontal:12,flexDirection:'row',alignItems:'center',gap:8},
  searchInput:{flex:1,minWidth:0,paddingVertical:10,fontFamily:font.appBody,fontSize:14.5,color:colors.textPrimary,outlineWidth:0},
  row:{marginTop:8,borderRadius:12,backgroundColor:'#F7F4F1',paddingHorizontal:14,paddingVertical:11,flexDirection:'row',alignItems:'center'},
  rowText:{flex:1,minWidth:0,marginRight:10},
  rowTitle:{fontFamily:font.appHeading,fontSize:14.5,color:colors.textPrimary},
  rowSub:{marginTop:2,fontFamily:font.appBody,fontSize:13,color:colors.textBody},
  added:{flexDirection:'row',alignItems:'center',gap:4},
  addedText:{fontFamily:font.appSemi,fontSize:12.5,color:colors.brandDark},
  customRow:{flexDirection:'row',gap:10},
  number:{flex:2,minWidth:0},
  offence:{flex:3,minWidth:0},
});
