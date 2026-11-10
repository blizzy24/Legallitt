import {router,useLocalSearchParams} from 'expo-router';
import {Text} from 'react-native';
import {DATA_SOURCE} from '../../lib/data-source';
import {reportRoute} from './router';
import {Button,Card,Screen,s} from './ui';

/** All legacy URLs use the same connected screens; no second fixture flow. */
export function ReportRouteScreen({name}:{name:string}){
 const params=useLocalSearchParams();
 if(DATA_SOURCE==='api')return reportRoute(name,params);
 return <Screen title="Service preview"><Card title="Open the connected app to continue"><Text style={s.body}>This preview cannot save requests, accept payments or deliver documents. Sign in to the connected app to use this service.</Text><Button secondary onPress={()=>router.navigate('/home')}>Back to Home</Button></Card></Screen>;
}
