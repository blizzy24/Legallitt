import AccountDataBoundary from '../../components/AccountDataBoundary';
import { Tabs } from 'expo-router';

import { useSession } from '../../context/session';

import TabBar from '../../components/TabBar';
import { colors } from '../../constants/theme';

export default function TabsLayout() {
  const { isLoggedIn } = useSession();
  return (
    <Tabs
      screenLayout={({route, children}) => <AccountDataBoundary name={route.name} params={route.params}>{children}</AccountDataBoundary>}
      tabBar={() => <TabBar />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.screenBg },
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="services" />
      <Tabs.Protected guard={isLoggedIn}>
        <Tabs.Screen name="cases" />
        <Tabs.Screen name="messages" />
        <Tabs.Screen name="profile" />
      </Tabs.Protected>
    </Tabs>
  );
}
