# ER Wait Times Website - Product Requirements Document

A real-time emergency room wait time tracking system that provides patients with current wait times at nearby hospitals to help them make informed decisions about where to seek emergency care.

**Experience Qualities**:
1. **Urgent & Reliable** - Information must feel trustworthy and current since people are making critical healthcare decisions
2. **Clear & Scannable** - Users in medical distress need to quickly find the information they need
3. **Accessible & Fast** - Must work well on all devices, especially mobile, with fast load times

**Complexity Level**: Light Application (multiple features with basic state)
- Real-time data display with location services and filtering capabilities

## Essential Features

### Hospital Wait Time Display
- **Functionality**: Shows current wait times for emergency rooms with hospital names, locations, and estimated wait durations
- **Purpose**: Helps patients choose the most appropriate ER based on current capacity
- **Trigger**: User visits the site or refreshes data
- **Progression**: Load page → Display current location (if permitted) → Show nearby hospitals with wait times → Allow manual refresh
- **Success criteria**: Wait times display within 3 seconds, data is current (updated within last hour)

### Location Services
- **Functionality**: Detects user location to show nearby hospitals first, with manual location entry as fallback
- **Purpose**: Prioritizes most relevant hospitals for the user's immediate needs
- **Trigger**: Page load prompts for location permission
- **Progression**: Request location → Sort hospitals by distance → Display closest first → Allow location change
- **Success criteria**: Location detection works on 90% of modern browsers, graceful fallback for denied permissions

### Hospital Search & Filter
- **Functionality**: Search hospitals by name or filter by distance, wait time, or specialties
- **Purpose**: Helps users find specific hospitals or narrow down options
- **Trigger**: User types in search box or selects filter options
- **Progression**: Enter search term → Filter results in real-time → Clear filters to reset
- **Success criteria**: Search responds instantly, filters work independently and in combination

### Data Refresh
- **Functionality**: Manual refresh button and automatic periodic updates of wait time data
- **Purpose**: Ensures users have the most current information for time-sensitive decisions
- **Trigger**: User clicks refresh or automatic timer (every 5 minutes)
- **Progression**: Click refresh → Show loading state → Update all wait times → Confirm update time
- **Success criteria**: Manual refresh completes in under 2 seconds, auto-refresh doesn't interrupt user interactions

## Edge Case Handling

- **No Location Permission**: Show all hospitals with manual location entry option
- **Data Unavailable**: Display "Data temporarily unavailable" with last update time
- **Network Issues**: Show cached data with clear indication it may be outdated
- **No Nearby Hospitals**: Expand search radius or show closest available options
- **Extremely High Wait Times**: Add visual warnings and suggest alternatives like urgent care

## Design Direction

The design should feel professional and medical-grade - trustworthy, clean, and focused on clarity over aesthetics, similar to hospital information systems that prioritize function and readability.

## Color Selection

Complementary (opposite colors) - Using calming healthcare blues with strategic red accents for urgency indicators to create trust while highlighting critical information.

- **Primary Color**: Deep Medical Blue (oklch(0.4 0.15 220)) - Communicates trust, professionalism, and healthcare reliability
- **Secondary Colors**: Light Clinical Blue (oklch(0.95 0.02 220)) for backgrounds, Neutral Gray (oklch(0.5 0 0)) for supporting text
- **Accent Color**: Urgent Red (oklch(0.55 0.22 15)) - For high wait times and critical alerts
- **Foreground/Background Pairings**: 
  - Background (Light Clinical Blue): Dark Text (oklch(0.15 0 0)) - Ratio 8.2:1 ✓
  - Primary (Deep Medical Blue): White Text (oklch(1 0 0)) - Ratio 6.8:1 ✓  
  - Accent (Urgent Red): White Text (oklch(1 0 0)) - Ratio 4.9:1 ✓
  - Card (White): Dark Text (oklch(0.15 0 0)) - Ratio 12.8:1 ✓

## Font Selection

Clean, highly legible sans-serif fonts that prioritize readability for users who may be stressed or viewing on mobile devices - Inter for its excellent readability at all sizes.

- **Typographic Hierarchy**: 
  - H1 (Page Title): Inter Bold/32px/tight letter spacing
  - H2 (Hospital Names): Inter Semibold/24px/normal spacing
  - H3 (Wait Times): Inter Bold/20px/normal spacing  
  - Body (Details): Inter Regular/16px/relaxed line height
  - Small (Last Updated): Inter Regular/14px/muted color

## Animations

Minimal and purposeful animations that communicate data freshness and provide reassuring feedback without causing distraction during emergency situations.

- **Purposeful Meaning**: Subtle loading states and refresh animations communicate that data is being updated
- **Hierarchy of Movement**: Wait time updates get gentle highlight animations, location detection shows progress, critical alerts pulse softly

## Component Selection

- **Components**: Card for hospital listings, Button for refresh/search actions, Badge for wait time indicators, Alert for system messages, Input for search, Select for filters
- **Customizations**: Custom wait time indicator component with color-coded severity levels, geolocation component for distance calculations  
- **States**: Cards have hover states showing more details, buttons show loading states during data fetches, inputs have clear validation states
- **Icon Selection**: MapPin for location, Clock for wait times, Search for filters, RefreshCw for updates, AlertTriangle for warnings
- **Spacing**: Consistent 16px grid system with generous padding around critical information
- **Mobile**: Single column layout with touch-friendly 48px minimum touch targets, collapsible filters, sticky refresh button