import {Pressable,StyleSheet,Text,View} from 'react-native';
import {ArrowLeft} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors,font} from '../../constants/theme';
/** Current exports 61–67: circular back control, title and explanatory subtitle. */
export default function NoticeAdvocateHeader({title,subtitle,badge,onBack}:{title:string;subtitle:string;badge?:string;onBack():void}){
 const insets=useSafeAreaInsets();return <View style={[s.header,{paddingTop:insets.top+16}]}><Pressable accessibilityRole="button" accessibilityLabel="Back" onPress={onBack} style={s.back}><ArrowLeft size={23} color={colors.textPrimary}/></Pressable><View style={{flex:1,gap:3}}><Text style={s.title}>{title}</Text><Text style={s.subtitle}>{subtitle}</Text></View>{badge&&<Text style={s.badge}>{badge}</Text>}</View>;
}
const s=StyleSheet.create({header:{flexDirection:'row',alignItems:'center',gap:13,paddingHorizontal:20,paddingBottom:16,backgroundColor:'#FAF8F5',borderBottomWidth:1,borderColor:'#E6E0D8'},back:{width:42,height:42,borderRadius:21,borderWidth:1,borderColor:'#E6E0D8',backgroundColor:'#FFF',alignItems:'center',justifyContent:'center'},title:{fontFamily:font.appHeading,fontSize:19,color:colors.textPrimary},subtitle:{fontFamily:font.appBody,fontSize:12,lineHeight:17,color:colors.textBody},badge:{fontFamily:font.appSemi,fontSize:11,color:'#947F62',backgroundColor:'#F3EDE4',borderRadius:20,padding:9}});
