import {router} from 'expo-router';
import {ChevronLeft, ArrowRight, Bell, CalendarDays, Check, CheckCircle2, Clock, FileText} from 'lucide-react-native';
import {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNotifications} from '../context/notifications';
import {notifications as t} from '../constants/tokens/notifications';
import {font} from '../constants/theme';
import {previewNotice} from '../components/PreviewNotice';
import {DATA_SOURCE} from '../lib/data-source';
import type {NotificationItem} from '../data/notifications';
const filters = ['All','Cases','Consultations','Payments'] as const;
export default function NotificationsScreen() {
  const feed = useNotifications(), insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<typeof filters[number]>('All');
  const rows = feed.items.filter(n => filter === 'All' || n.category === filter);
  return <View style={s.screen}>
    <View style={[s.header,{paddingTop:insets.top+t.headerTop}]}>
      <Pressable style={s.back} accessibilityLabel="Back" onPress={() => router.replace('/(tabs)/home')}><ChevronLeft size={t.backIcon} color={t.ink}/></Pressable>
      <Text style={s.title}>Notifications</Text>
      <Pressable style={s.inline} accessibilityRole="button" onPress={() => {void feed.readAll();}}><Check size={15} color={t.accent}/><Text style={s.action}>Mark all as read</Text></Pressable>
    </View>
    <ScrollView contentContainerStyle={[s.content,{paddingBottom:insets.bottom+30}]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
        {filters.map(value => <Pressable key={value} onPress={() => setFilter(value)} style={[s.filter,value===filter&&s.selected]} accessibilityRole="button" accessibilityState={{selected:value===filter}}><Text style={[s.filterText,value===filter&&s.selectedText]}>{value}</Text>{value==='All'&&feed.items.length>0&&<Text style={[s.filterCount,value===filter&&s.selectedText]}>{feed.items.length}</Text>}</Pressable>)}
      </ScrollView>
      {!!feed.error&&<Pressable accessibilityRole="button" onPress={feed.refresh}><Text accessibilityRole="alert" style={s.error}>Couldn’t load notifications. {feed.error} Tap to try again.</Text></Pressable>}
      {feed.loading&&<Text style={s.empty}>Loading notifications…</Text>}
      {!feed.loading&&!feed.error&&!rows.length&&<View style={s.emptyCard}><Bell size={22} color={t.accent}/><Text style={s.emptyTitle}>{filter==='All'?'No notifications yet':`No ${filter.toLowerCase()} notifications`}</Text><Text style={s.empty}>Updates about your cases, consultations and payments appear here as they happen.</Text></View>}
      {(['TODAY','YESTERDAY','EARLIER'] as const).map(group => {
        const items=rows.filter(n=>n.group===group), unread=items.filter(n=>n.unread).length;
        return items.length ? <View key={group}><View style={s.section}><Text style={s.sectionTitle}>{group}</Text><Text style={s.sectionMeta}>{unread ? `${unread} Unread` : 'All read'}</Text></View>
          {items.map(n=><NotificationCard key={n.id} row={n} onPress={()=>{void feed.open(n.id);}}/>)}</View> : null;
      })}
      {feed.more&&<Pressable onPress={feed.loadMore}><Text style={s.empty}>Load more</Text></Pressable>}
      <View style={s.preferences}><View style={s.preferenceIcon}><Bell size={15} color={t.accent}/></View><View style={{flex:1}}><Text style={s.preferenceTitle}>Notification Preferences</Text><Text style={s.preferenceBody}>{DATA_SOURCE==='api'?'Choose which in-app updates alert you':'Manage SMS & WhatsApp alerts'}</Text></View><Pressable style={s.configure} accessibilityRole="button" onPress={()=>DATA_SOURCE==='api'?router.push('/notification-preferences'):previewNotice('Notification Preferences')}><Text style={s.action}>Configure</Text></Pressable></View>
    </ScrollView>
  </View>;
}
function NotificationCard({row:n,onPress}:{row:NotificationItem;onPress:()=>void}) {
  const Icon=n.icon==='calendar'?CalendarDays:n.icon==='wallet'?CheckCircle2:n.icon==='request'?Clock:FileText;
  return <Pressable accessibilityRole="button" onPress={onPress} style={[s.card,n.unread&&s.unread]}>
    <View style={[s.icon,n.unread&&{backgroundColor:t.iconBg}]}><Icon size={t.glyph} color={n.icon==='wallet'?t.green:t.accent}/></View>
    <View style={s.cardText}><View style={s.cardTop}><Text style={s.cardTitle}>{n.title}{n.unread ? ' •' : ''}</Text><Text style={s.when}>{n.when}</Text></View>
      {!!n.body&&<Text style={s.body}>{n.body}</Text>}
      {(!!n.chip||!!n.action)&&<View style={s.cardFooter}>{!!n.chip&&<Text style={[s.chip,n.tone==='green'&&s.green,n.tone==='orange'&&s.orange]}>{n.chip}</Text>}{!!n.action&&<View style={s.inline}><Text style={s.action}>{n.action}</Text><ArrowRight size={12} color={t.accent}/></View>}</View>}
    </View>
  </Pressable>;
}
const s=StyleSheet.create({
 screen:{flex:1,backgroundColor:t.bg},header:{paddingHorizontal:t.pad,paddingBottom:t.headerBottom,flexDirection:'row',alignItems:'center',borderBottomWidth:1,borderBottomColor:t.border,gap:t.headerGap},back:{width:t.back,height:t.back,borderRadius:t.back/2,backgroundColor:'#fff',borderWidth:1,borderColor:t.border,alignItems:'center',justifyContent:'center'},title:{fontFamily:font.appHeading,fontSize:t.title,color:t.ink,flex:1},inline:{flexDirection:'row',alignItems:'center',gap:5},action:{fontFamily:font.appBody,fontSize:t.action,color:t.accent},content:{paddingHorizontal:t.pad},filters:{gap:t.filterGap,paddingTop:t.filterTop},filter:{height:t.filterHeight,paddingHorizontal:14,borderRadius:18,borderWidth:1,borderColor:t.border,backgroundColor:'#fff',flexDirection:'row',gap:6,alignItems:'center'},selected:{backgroundColor:t.active,borderColor:t.active},filterText:{fontFamily:font.appBody,fontSize:t.filterFont,color:t.muted},selectedText:{color:'#fff'},filterCount:{fontFamily:font.appSemi,fontSize:11,backgroundColor:'#FFFFFF33',paddingHorizontal:4,borderRadius:9},section:{marginTop:t.sectionGap,marginBottom:t.sectionBottom,flexDirection:'row',justifyContent:'space-between'},sectionTitle:{fontFamily:font.appSemi,fontSize:t.sectionFont,letterSpacing:.5,color:t.accent},sectionMeta:{fontFamily:font.appBody,fontSize:t.sectionFont,color:t.muted},card:{borderWidth:1,borderColor:t.border,borderRadius:t.cardRadius,padding:t.cardPad,flexDirection:'row',backgroundColor:'#fff',marginBottom:t.cardGap,boxShadow:'0px 1px 2px rgba(55,44,28,0.08)'},unread:{backgroundColor:t.unreadBg,borderColor:t.unreadBorder},icon:{width:t.icon,height:t.icon,borderRadius:t.icon/2,backgroundColor:t.bg,borderWidth:1,borderColor:t.border,alignItems:'center',justifyContent:'center'},cardText:{flex:1,marginLeft:t.iconGap},cardTop:{flexDirection:'row',alignItems:'flex-start',gap:5},cardTitle:{flex:1,fontFamily:font.appHeading,fontSize:t.rowTitle,color:t.ink},when:{fontFamily:font.appBody,fontSize:t.when,color:t.accent},body:{marginTop:t.bodyGap,fontFamily:font.appBody,fontSize:t.body,lineHeight:t.bodyLine,color:t.muted},cardFooter:{marginTop:t.footerGap,flexDirection:'row',flexWrap:'wrap',alignItems:'center',gap:8},chip:{fontFamily:font.appBody,fontSize:t.chipFont,color:t.muted,borderWidth:1,borderColor:t.border,borderRadius:t.chipRadius,paddingHorizontal:t.chipPadX,paddingVertical:t.chipPadY,backgroundColor:'#fff'},green:{color:t.green,backgroundColor:t.greenBg,borderColor:'#C9EFDD'},orange:{color:t.orange,backgroundColor:t.orangeBg,borderColor:'#F6DAB7'},preferences:{marginTop:t.preferencesTop,padding:t.preferencesPad,borderRadius:15,borderWidth:1,borderStyle:'dashed',borderColor:t.unreadBorder,flexDirection:'row',gap:10,alignItems:'center'},preferenceIcon:{backgroundColor:'#fff',width:27,height:27,borderRadius:14,borderWidth:1,borderColor:t.border,alignItems:'center',justifyContent:'center'},preferenceTitle:{fontFamily:font.appSemi,fontSize:12,color:t.ink},preferenceBody:{fontFamily:font.appBody,fontSize:11,color:t.muted,marginTop:3},configure:{paddingHorizontal:8,paddingVertical:5,borderRadius:8,borderWidth:1,borderColor:t.border,backgroundColor:'#fff'},emptyCard:{marginTop:24,alignItems:'center',padding:24,borderRadius:16,borderWidth:1,borderColor:t.border,backgroundColor:'#fff',gap:6},emptyTitle:{fontFamily:font.appHeading,fontSize:16,color:t.ink},empty:{paddingVertical:20,fontFamily:font.appBody,fontSize:13,color:t.muted},error:{paddingVertical:12,fontFamily:font.appBody,fontSize:13,color:'#A12B25'},
});
