import { ThemeProvider } from "../hooks/useTheme";
import { UserProvider } from "../hooks/useUser";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
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
  );
}
