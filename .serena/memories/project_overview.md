# Revy - Project Overview

## Purpose
Mobile app for vehicle management - maintenance, odometer logs, fuel logs, with a freemium model.

## Tech Stack
- React Native + Expo SDK 54 + Expo Router v4
- TypeScript
- Supabase (auth, database, storage)
- DM Sans font family
- @expo/vector-icons (Ionicons primarily)
- react-native-reanimated for animations
- AsyncStorage for local persistence

## Key Patterns
- Dark mode only (Colors.dark.*)
- Primary color: Guards Red #DC2626
- Background: #0A0A0A, Surface: #141414, SurfaceElevated: #1C1C1C
- BorderRadius: 8-16px range
- Font: DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold
- All labels in Portuguese (pt-BR)
- Contexts: AuthContext, FeaturesContext
- Hooks pattern: useVehicles, useMaintenances, useOdometer, useFuel, useUserPlan, useFeatures

## Folder Structure
- app/ - Expo Router pages (file-based routing)
- components/ - Reusable UI components
- contexts/ - React contexts (Auth, Features)
- hooks/ - Custom hooks
- constants/ - Theme, feature constants
- types/ - TypeScript types
- lib/ - Supabase client
- utils/ - Utility functions

## Commands
- `npm start` / `expo start` - Start dev server
- `npm run lint` / `expo lint` - Lint code

## Feature Gating
- useFeatures() hook calls get_user_features RPC
- FeaturesContext wraps the app in root layout
- FeatureGate component for visual gating
- Plans: free (1 vehicle), premium (5 vehicles), fleet (15 vehicles)
