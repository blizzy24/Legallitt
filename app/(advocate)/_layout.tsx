import { Tabs } from 'expo-router';

import AdvocateTabBar from '../../components/AdvocateTabBar';
import { colors } from '../../constants/theme';

// The ADVOCATE app. A sibling of (tabs), with its own Tabs navigator and its own tab
// bar — the two groups share no navigator and no bar instance.
export default function AdvocateLayout() {
  return (
    <Tabs
      tabBar={() => <AdvocateTabBar />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.screenBg },
      }}
    >
      <Tabs.Screen name="dashboard" />
      <Tabs.Screen name="matters" />
      <Tabs.Screen name="clients" />
      <Tabs.Screen name="earnings" />
    </Tabs>
  );
}
