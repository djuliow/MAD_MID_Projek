import { ThemeProvider } from "../hooks/useTheme";
import { UserProvider } from "../hooks/useUser";
import { Stack } from "expo-router";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// Replace with your actual Convex deployment URL
const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || "";
console.log("Connecting to Convex at:", convexUrl);
const convex = new ConvexReactClient(convexUrl);

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <UserProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false}}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="tabs" />
            <Stack.Screen name="book-detail/[id]" options={{ presentation: 'modal' }} />
          </Stack>
        </ThemeProvider>
      </UserProvider>
    </ConvexProvider>
  );
}
