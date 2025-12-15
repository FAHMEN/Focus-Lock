# Focus Lock: Discipline OS

## Overview
A strict, offline Android/iOS app designed to help users overcome compulsive behaviors and increase deep focus through behavior tracking and forced replacement actions.

## Current State
**Version:** 1.0.0
**Status:** Complete MVP

## Key Features
1. **Relapse Tracker** - Single "I Slipped" button that logs timestamps locally
2. **Focus Session Lock** - Configurable timer with screen wake lock and exit prevention
3. **Replacement Action System** - Forces user to complete one action before logging (Physical Movement 60s, Writing 90s, Breathing 120s)
4. **Risk Window Alerts** - Detects time-of-day patterns and shows warnings during high-risk periods
5. **Settings Lock Mode** - Settings locked after first setup, unlocked by achieving streak threshold

## Technical Architecture

### Frontend (Expo/React Native)
- **Navigation**: Stack-only navigation (no tabs) using React Navigation 7
- **State**: Local state with AsyncStorage persistence
- **Styling**: Monochrome design (black/white/gray only), no animations

### Data Storage
All data stored locally using AsyncStorage:
- `focus_lock_relapse_logs` - Array of relapse log entries
- `focus_lock_settings` - User settings (focus duration, unlock threshold)
- `focus_lock_focus_sessions` - Completed focus session records

### Screens
1. **HomeScreen** - Dashboard with stats and action buttons
2. **FocusSessionScreen** - Full-screen timer with exit prevention
3. **ReplacementActionScreen** - Action selector and timer
4. **PatternsScreen** - Daily/weekly patterns and risk windows
5. **SettingsScreen** - Configuration with streak-based lock

## Design Principles
- No bright colors, no animations, no gamification
- Boring but strict interface
- No undo - actions are final
- No onboarding or tutorials
- 100% offline operation

## Project Structure
```
client/
├── App.tsx                 # Root component
├── components/             # Reusable UI components
├── constants/theme.ts      # Design tokens
├── hooks/                  # Custom hooks
├── lib/storage.ts          # AsyncStorage utilities
├── navigation/             # Navigation configuration
└── screens/                # Screen components
server/
├── index.ts               # Express server
└── routes.ts              # API routes (minimal for this app)
```

## Recent Changes
- 2024-12-15: Initial MVP complete
  - Implemented all 5 core screens
  - Added AsyncStorage persistence
  - Created pattern detection algorithms
  - Implemented settings lock mechanism
