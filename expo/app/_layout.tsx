import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { authService, onAuthStateChange } from "../lib/auth";
import { TimelineProvider } from "../context/TimelineContext";
import { SettingsProvider } from "../context/SettingsContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function useProtectedRoute(isAuthenticated: boolean, isReady: boolean) {
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === "login";

    console.log("Route check - Auth:", isAuthenticated, "Segment:", segments[0]);

    if (!isAuthenticated && !inAuthGroup) {
      // Kullanıcı giriş yapmamış ve login sayfasında değil
      console.log("🔒 Redirecting to login - not authenticated");
      router.replace("/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Kullanıcı giriş yapmış ama login sayfasında
      console.log("✅ Redirecting to home - already authenticated");
      router.replace("/");
    }
  }, [isAuthenticated, segments, router, isReady]);
}

function RootLayoutNav() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkAuth();
    
    // Listen for auth state changes
    const unsubscribe = onAuthStateChange(() => {
      console.log("Auth state changed, rechecking...");
      checkAuth();
    });
    
    return unsubscribe;
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      const user = await authService.getCurrentUser();
      console.log("Auth check:", isAuth ? `Authenticated as ${user?.username}` : "Not authenticated");
      setIsAuthenticated(isAuth);
    } catch (error) {
      console.error("Auth check error:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      setIsReady(true);
      SplashScreen.hideAsync();
    }
  };

  useProtectedRoute(isAuthenticated, isReady);

  if (isLoading || !isReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <SettingsProvider>
          <TimelineProvider>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#0f0f10" }}>
              <StatusBar style="light" />
              <RootLayoutNav />
            </GestureHandlerRootView>
          </TimelineProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
