import {router} from 'expo-router';
import {FileText} from 'lucide-react-native';
import {Button,Empty,Screen} from '../features/account/ui';

export default function TermsScreen(){
 return <Screen title="Terms & Conditions" fallback="/home"><Empty icon={FileText} title="Being finalised" body="Legalitt’s Terms & Conditions are being finalised. Contact Legalitt Support for questions before submitting your request." action={<Button title="Contact Support" onPress={()=>router.push('/support')}/>}/></Screen>;
}
