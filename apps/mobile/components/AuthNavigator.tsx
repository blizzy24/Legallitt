import AccountDataBoundary from "./AccountDataBoundary";
import { Stack } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSession } from "../context/session";
import routes from "../lib/auth-routes.json";
import { colors } from "../constants/theme";
// Explicit registry protects the advocate workspace. Court paths containing
// /advocate/ are CLIENT selection screens. A test checks the registry against files.
export default function AuthNavigator() {
  const { ready, isLoggedIn, role, registrationRole, sessionError, retrySession } = useSession();
  if (!ready) return <ActivityIndicator accessibilityLabel="Loading" />;
  if (sessionError)
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 24, gap: 16 }}>
        <Text accessibilityRole="alert">{sessionError}</Text>
        <Pressable accessibilityRole="button" onPress={retrySession}>
          <Text>Retry</Text>
        </Pressable>
      </View>
    );
  return (
    <Stack
      initialRouteName="index"
      screenLayout={({route, children}) => <AccountDataBoundary name={route.name} params={route.params}>{children}</AccountDataBoundary>}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.screenBg },
      }}
    >
      {[...routes.public]
        .sort((a, b) => (a === "index" ? -1 : b === "index" ? 1 : 0))
        .map((name) => (
          <Stack.Screen key={name} name={name} />
        ))}
      <Stack.Protected guard={isLoggedIn}>
        {routes.authenticated.map((name) => (
          <Stack.Screen key={name} name={name} />
        ))}
      </Stack.Protected>
      <Stack.Protected guard={(isLoggedIn && role === "user") || (!isLoggedIn && registrationRole === "user")}>
        {routes.clientTabs.map((name) => (
          <Stack.Screen key={name} name={name} />
        ))}
      </Stack.Protected>
      <Stack.Protected guard={isLoggedIn && role === "lawyer"}>
        {routes.advocate.map((name) => (
          <Stack.Screen key={name} name={name} />
        ))}
      </Stack.Protected>
    </Stack>
  );
}
