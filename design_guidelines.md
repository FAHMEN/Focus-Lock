# Focus Lock: Discipline OS - Design Guidelines

## Design Philosophy
This app is intentionally **anti-design**. Every decision must serve discipline, not delight. The interface should feel strict, clinical, and unavoidable—like a productivity lockbox, not a wellness app.

## Architecture Decisions

### Authentication
- **No authentication required**
- The app is single-user, local-only
- No profile or account system needed
- Data persists locally using AsyncStorage

### Navigation
- **Stack-Only Navigation**
- Linear, non-escapable flow during focus sessions
- Root screen: Home dashboard with 4 primary actions
- No tab bar (keeps UI minimal and prevents distraction)
- No drawer (reduces decision points)

### Screen Specifications

#### 1. Home Screen
- **Purpose**: Central command for all core actions
- **Header**: None (saves vertical space)
- **Layout**:
  - Top safe area inset: `insets.top + Spacing.xl`
  - Bottom safe area inset: `insets.bottom + Spacing.xl`
  - Scrollable: No (all actions fit on screen)
- **Components**:
  - Large "I Slipped" button (primary action, top third)
  - "Start Focus Session" button
  - "View Patterns" button (shows relapse data)
  - "Settings" button (locked if streak not met)
  - Current streak counter (text-only, no badges)
  - Today's relapse count (number only)

#### 2. Focus Session Screen
- **Purpose**: Lock user into focus mode
- **Header**: Minimal timer display only, no back button
- **Layout**:
  - Full screen, centered timer
  - Black background, white text
  - No safe area decoration (intentionally stark)
- **Components**:
  - Large countdown timer (MM:SS format)
  - Small "End Session" text at bottom (requires long press to exit)
- **Behavior**:
  - Screen stays awake (expo-keep-awake)
  - Back button disabled during session
  - Alert on attempted exit: "Breaking focus breaks discipline"

#### 3. Replacement Action Screen (Modal)
- **Purpose**: Force user to complete an action before logging urge
- **Header**: "Choose One Action" (text only, no close button)
- **Layout**:
  - Modal sheet, non-dismissible
  - Centered vertically
  - Bottom safe area: `insets.bottom + Spacing.xl`
- **Components**:
  - Three large tap targets:
    - "Physical Movement (60s)"
    - "Write Thoughts (90s)"
    - "Breathing Exercise (120s)"
  - Timer starts immediately on selection
  - Cannot exit until timer completes

#### 4. Patterns Screen
- **Purpose**: Show relapse data without judgment
- **Header**: Default header with "Patterns" title, back button
- **Layout**:
  - Scrollable view
  - Top inset: `Spacing.xl` (header present)
  - Bottom inset: `insets.bottom + Spacing.xl`
- **Components**:
  - Daily breakdown (last 7 days): Simple text list
  - Weekly breakdown (last 4 weeks): Text-based bar chart using ASCII characters
  - Risk window alert: "High risk: 8-10 PM based on history"
  - No graphs, no colors, just numbers and patterns

#### 5. Settings Screen
- **Purpose**: Configure session duration and streak threshold
- **Header**: Default header with "Settings" title, back button
- **Layout**:
  - Scrollable form
  - Top inset: `Spacing.xl`
  - Bottom inset: `insets.bottom + Spacing.xl`
- **Components**:
  - Focus session duration picker (15, 30, 45, 60, 90 minutes)
  - Settings unlock threshold (3, 5, 7, 14 day streak)
  - "Reset All Data" (nested under danger zone, double confirmation)
- **Lock Behavior**:
  - If current streak < threshold: Screen shows "Locked. Build a X-day streak to unlock settings" with current streak counter
  - No workarounds or bypasses

## Design System

### Color Palette
```
Primary Background: #FFFFFF (white)
Primary Text: #000000 (black)
Secondary Background: #F5F5F5 (off-white, for subtle separation)
Disabled/Locked: #CCCCCC (light gray)
Focus Mode: #000000 background, #FFFFFF text
Alert/Warning: #666666 (dark gray, no red/orange)
```

### Typography
- **Font Family**: System default (Roboto on Android)
- **Scale**:
  - Title: 20pt, bold, black
  - Body: 16pt, regular, black
  - Button Text: 18pt, medium, black
  - Timer (Focus Mode): 72pt, bold, white
  - Small Label: 14pt, regular, gray

### Layout
- **Spacing Scale**:
  - xs: 4px
  - sm: 8px
  - md: 16px
  - lg: 24px
  - xl: 32px
- **Touch Targets**: Minimum 56x56dp (Material Design standard)
- **Screen Padding**: 16px horizontal, dynamic vertical based on safe areas

### Components

#### Buttons
- **Primary ("I Slipped")**: 
  - Large rectangular button, full width minus 32px padding
  - Height: 80dp
  - Background: Black
  - Text: White, 18pt medium
  - No rounded corners, sharp edges
  - Press feedback: Slight opacity change to 0.8
  - No shadows
- **Secondary (Standard Actions)**:
  - Height: 56dp
  - Background: White
  - Border: 2px solid black
  - Text: Black, 16pt medium
  - Press feedback: Background changes to #F5F5F5
- **Destructive (Long Press)**:
  - Background: #666666
  - Text: White
  - Requires 2-second hold

#### Text Input
- Not used in core flow (minimizes friction)
- If needed for thought writing: Plain text area, no formatting, monospace font

#### Alerts
- System standard Android AlertDialog
- Title: Bold, 18pt
- Message: Regular, 16pt
- Buttons: Text only, no icons

### Interaction Design
- **No animations**: All transitions are instant (0ms duration)
- **No haptic feedback**: Reduces engagement signals
- **No sounds**: Silent operation only
- **No loading states**: Everything is instant (local-only)
- **No empty states**: Show "0" or "No data yet" in plain text

### Accessibility
- All buttons must have contentDescription for screen readers
- Minimum contrast ratio: 7:1 (black on white exceeds this)
- Touch targets: 56dp minimum
- No reliance on color (already monochrome)
- Timer announcements for screen reader users during focus sessions

## Critical Assets
**None required.** Use system icons exclusively:
- Feather icons from @expo/vector-icons for minimal iconography
- No custom graphics
- No illustrations
- No branding beyond app name in header

## Additional UX Rules
1. **No undo**: Actions are final (builds accountability)
2. **No onboarding**: App is self-evident, starts on Home
3. **No tutorials**: Discover through use
4. **No notifications**: User must open app intentionally (except risk window alerts if app is open)
5. **Data is forever**: Cannot delete individual logs (only full reset)