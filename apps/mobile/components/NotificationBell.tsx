import {router} from 'expo-router';
import {Bell} from 'lucide-react-native';
import {Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle} from 'react-native';
import {useNotifications} from '../context/notifications';
import {useSession} from '../context/session';
import {notifications as t} from '../constants/tokens/notifications';
import {font} from '../constants/theme';
export default function NotificationBell({size = 22, color = t.ink, style, advocate}: {size?: number; color?: string; style?: StyleProp<ViewStyle>; advocate?: boolean}) {
  const {unread} = useNotifications(), {user} = useSession();
  return <Pressable testID="notifications-bell" style={style} hitSlop={10} accessibilityRole="button"
    accessibilityLabel={`Notifications, ${unread} unread`} onPress={() => router.push(advocate || user?.role === 'advocate' ? '/advocate/notifications' : '/notifications')}>
    <View><Bell size={size} color={color}/>{unread > 0 && <View style={styles.badge}><Text testID="notifications-count" style={styles.count}>{unread > 99 ? '99+' : unread}</Text></View>}</View>
  </Pressable>;
}
const styles = StyleSheet.create({badge:{position:'absolute',top:-7,right:-8,minWidth:t.badge,height:t.badge,paddingHorizontal:3,borderRadius:8,backgroundColor:t.accent,alignItems:'center',justifyContent:'center'},count:{fontFamily:font.appSemi,fontSize:t.badgeFont,color:'#fff'}});
