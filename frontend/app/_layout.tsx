import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="add-transaction" />
      <Stack.Screen name="accounts" />
      <Stack.Screen name="reports" />
    </Stack>
  );
}