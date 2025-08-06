# ER Wait Times - Harbor Medical Center - Product Requirements Document

A comprehensive emergency room wait time tracking system designed specifically for Harbor-UCLA Medical Center that provides real-time wait times, acuity-based assessments, and multilingual support to help patients make informed decisions about emergency care.

**Experience Qualities**:
1. **Medically Authoritative & Trustworthy** - Information must feel clinically accurate and current since people are making critical healthcare decisions
2. **Immediately Scannable & Clear** - Users in medical distress need instant access to critical information with minimal cognitive load
3. **Universally Accessible** - Must work perfectly on all devices with full bilingual support and emergency-focused UX

**Complexity Level**: Complex Application (advanced functionality, comprehensive care guidance)
- Real-time wait time data with acuity-based triage information
- Interactive symptom assessment with AI-powered recommendations
- Bilingual translation system (English/Spanish)
- Alternative care option navigation and cost transparency
- Educational resources and emergency preparation guidance

## Essential Features

### Real-Time Wait Time Dashboard
- **Functionality**: Displays current wait times for Harbor-UCLA Medical Center across all 5 acuity levels (Level 1-5) with queue counts and estimated wait times
- **Purpose**: Helps patients understand current emergency department capacity and expected wait times based on their condition severity
- **Trigger**: User visits the site or manually refreshes data
- **Progression**: Load page → Display live wait times by acuity level → Show 24-hour trend analysis → Allow manual refresh
- **Success criteria**: Wait times display within 2 seconds, data updates every minute, historical patterns visible

### Bilingual Translation System
- **Functionality**: Complete English/Spanish translation with instant language switching for all content, including medical terminology
- **Purpose**: Ensures equal access to emergency information for Spanish-speaking community
- **Trigger**: User clicks language toggle button
- **Progression**: Click language button → Instant content translation → All UI elements update → Preferences remembered
- **Success criteria**: Translation completes in <100ms, medical accuracy maintained, cultural adaptation included

### Interactive Symptom Assessment Tool
- **Functionality**: Multi-step symptom checker that predicts acuity level (1-5) and provides personalized care recommendations
- **Purpose**: Helps users understand appropriate level of care needed and expected costs
- **Trigger**: User selects symptoms from categorized list
- **Progression**: Select insurance → Choose symptoms → Get acuity prediction → Receive care recommendations → View cost estimates
- **Success criteria**: 85%+ clinical accuracy, clear reasoning provided, insurance-specific cost estimates

### Alternative Care Navigation
- **Functionality**: Comprehensive information about urgent care centers, telehealth services, and primary care options with location-based sorting
- **Purpose**: Guides users to most appropriate and cost-effective care option based on their needs
- **Trigger**: User explores care options or receives non-emergency recommendation
- **Progression**: View care options → Filter by location/insurance → Compare costs and wait times → Access contact information
- **Success criteria**: Location sorting within 5 miles accuracy, current operating hours, integrated contact options

### Emergency Department Education
- **Functionality**: Detailed process explanation, preparation guidance, and educational video resources specific to Harbor-UCLA
- **Purpose**: Reduces anxiety and improves patient experience by setting clear expectations
- **Trigger**: User navigates to preparation section or views detailed facility information
- **Progression**: Learn ER process → Understand what to bring → Watch educational video → Access facility details
- **Success criteria**: Clear 7-step process explanation, actionable preparation checklist, video engagement >60%

## Edge Case Handling

- **No Symptom Match**: Provide general guidance and encourage professional consultation
- **High Acuity Symptoms Selected**: Immediate 911 recommendation with emergency contact integration
- **Insurance Not Supported**: Show general cost ranges with clear disclaimers
- **Location Services Denied**: Manual zip code entry for urgent care sorting
- **Extremely High Wait Times**: Clear warnings with alternative care suggestions and peak time guidance
- **Non-English Speakers**: Complete Spanish translation with cultural adaptation
- **Mobile Device Limitations**: Touch-optimized interface with large buttons for emergency situations
- **Network Connectivity Issues**: Cached data with clear staleness indicators
- **Assessment Tool Uncertainty**: Conservative recommendations erring on side of caution

## Design Direction

The design should feel like a trusted medical information system - authoritative, clean, and immediately scannable, similar to hospital digital displays that prioritize critical information accessibility. The interface must convey clinical competence while remaining approachable for patients in distress.

## Color Selection

Complementary (opposite colors) - Using authoritative medical blues with strategic red accents for urgency indicators to create trust while clearly highlighting critical information and emergency situations.

- **Primary Color**: Deep Medical Blue (oklch(0.4 0.15 220)) - Communicates clinical authority, healthcare professionalism, and institutional trust
- **Secondary Colors**: Clean Clinical Blue (oklch(0.95 0.02 220)) for backgrounds, Professional Gray (oklch(0.5 0 0)) for supporting information
- **Accent Color**: Medical Emergency Red (oklch(0.55 0.22 15)) - For Level 1-2 conditions, emergency alerts, and 911 calls
- **Success Color**: Healthcare Green (oklch(0.6 0.15 145)) - For Level 4-5 conditions and positive indicators
- **Warning Color**: Clinical Orange (oklch(0.7 0.15 45)) - For Level 2-3 conditions and important notices

**Foreground/Background Pairings**: 
- Background (Clean Clinical Blue): Dark Medical Text (oklch(0.15 0 0)) - Ratio 8.2:1 ✓
- Primary (Deep Medical Blue): White Text (oklch(1 0 0)) - Ratio 6.8:1 ✓  
- Accent (Medical Emergency Red): White Text (oklch(1 0 0)) - Ratio 4.9:1 ✓
- Card (White): Dark Medical Text (oklch(0.15 0 0)) - Ratio 12.8:1 ✓
- Success (Healthcare Green): White Text (oklch(1 0 0)) - Ratio 5.2:1 ✓

## Font Selection

Highly legible, medical-grade typography that maintains readability under stress and across all devices - Inter for its exceptional clarity and professional appearance in healthcare contexts.

- **Typographic Hierarchy**: 
  - H1 (Application Title): Inter Bold/28px/tight letter spacing for authority
  - H2 (Section Headers): Inter Semibold/24px/normal spacing for clear navigation
  - H3 (Facility Names): Inter Semibold/20px/normal spacing for quick identification
  - H4 (Acuity Levels): Inter Bold/18px/color-coded for medical clarity
  - Body (Medical Information): Inter Regular/16px/1.5 line height for readability
  - Small (Timestamps): Inter Regular/14px/muted color for secondary info
  - Critical (Emergency): Inter Bold/16px/red color for urgent information

## Animations

Minimal, purposeful motion that communicates data freshness and system responsiveness without causing distraction during medical emergencies.

- **Purposeful Meaning**: Subtle pulse animations for live data indicators, gentle transitions for acuity level changes, loading states for data refresh
- **Hierarchy of Movement**: Emergency Level 1-2 indicators have subtle attention-drawing animations, wait time updates show brief highlight effects, language switching has instant visual feedback
- **Emergency Appropriateness**: All animations can be disabled for users in high-stress situations, no distracting motion during critical decision-making

## Component Selection

- **Components**: Card for acuity level display and facility information, Button for emergency contacts and actions, Badge for wait time indicators and status, Alert for medical warnings and disclaimers, Tabs for navigation between Wait Times and Care Guide, Select for insurance and language options
- **Customizations**: Custom acuity level cards with medical color coding, specialized wait time display components, emergency contact buttons with phone integration, bilingual toggle with flag indicators
- **Component States**: Cards have hover states showing additional medical details, buttons show loading states during data fetches, emergency buttons have distinct styling for 911 calls, language toggle shows current selection clearly
- **Icon Selection**: Heart for cardiac care, FirstAid for emergency services, Phone for contact actions, MapPin for locations, Clock for wait times, AlertTriangle for warnings, Activity for vital signs, Brain for neurological care
- **Spacing System**: Consistent 16px grid with generous padding around critical medical information, touch-friendly 44px minimum targets for emergency situations
- **Mobile Adaptation**: Single column layout optimized for one-handed use, collapsible detailed information, sticky emergency contact buttons, simplified navigation for stress situations