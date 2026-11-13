import {useCallback,useState} from 'react';
import {Text,View} from 'react-native';
import {useFocusEffect} from 'expo-router';
import {supportHours,supportCallbackPromise,type SupportPolicyView} from '@legalitt/shared';
import {backend} from '../../lib/auth';
import {Notice,s} from './ui';

export function SupportHoursNotice(){
 const [row,setRow]=useState<SupportPolicyView>(),[error,setError]=useState('');
 const load=useCallback(async()=>{try{const v=await backend.request<SupportPolicyView>('/support/settings');setRow(v);setError('');}catch(e){setError(e instanceof Error?e.message:'Support hours could not be loaded.');}},[]);
 useFocusEffect(useCallback(()=>{void load();},[load]));
 return <View style={{gap:6}}>{error?<Notice tone="error" action={{label:'Retry',onPress:()=>void load()}}>{error}</Notice>:!row?<Text style={s.muted}>Loading support hours…</Text>:<><Text style={s.muted}>{supportHours(row.config)}</Text><Text style={s.body}>{supportCallbackPromise(row.config)}</Text></>}</View>;
}
