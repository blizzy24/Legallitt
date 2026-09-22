import { Tabs } from 'expo-router';

import TabBar from '../../components/TabBar';
import { colors } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <TabBar />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.screenBg },
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="tab2" />
      <Tabs.Screen name="tab3" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
