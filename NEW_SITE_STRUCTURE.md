# ER Wait Times - Exact Duplicate Creation Guide

## Overview
This is an exact duplicate of the ER Wait Times website with all functionality intact:

### Key Features:
1. **Bilingual Support** (English/Spanish)
2. **Wait Times Display** for Harbor-UCLA Medical Center
3. **Care Guide** with three main sections:
   - Care Recommendations (symptom checker with insurance cost estimates)
   - Care Options (urgent care, telehealth, primary care)
   - Prepare for Your Visit (comprehensive preparation guide)
4. **Acuity Level Assessment** (Levels 1-5 with detailed explanations)
5. **Real-time Data Display** with simulated wait times
6. **Interactive Components** with full navigation

### Technical Stack:
- React 19 with TypeScript
- Vite for build tooling
- Tailwind CSS v4 for styling
- shadcn/ui components
- Phosphor Icons
- Radix UI primitives
- GitHub Spark integration
- KV storage for data persistence

### File Structure Created:
```
/
├── index.html                 # Main HTML entry point
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind configuration
├── components.json           # shadcn/ui configuration
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── src/
    ├── App.tsx              # Main application component (4,975 lines)
    ├── main.tsx             # Application entry point
    ├── ErrorFallback.tsx    # Error boundary component
    ├── index.css            # Custom styles and theme
    ├── main.css             # Main CSS imports
    ├── vite-end.d.ts        # TypeScript declarations
    ├── lib/
    │   └── utils.ts         # Utility functions
    ├── components/ui/       # shadcn/ui components (43 components)
    ├── assets/images/       # Image assets
    └── styles/
        └── theme.css        # Theme and color definitions

### Assets Required:
- harbor-ucla-logo.svg (medical center logo)
- qr-code.png (informational QR code)

### Notable Implementation Details:

1. **Multi-language Support**: Complete Spanish translations for all UI text
2. **Insurance Cost Calculator**: Real cost estimates based on insurance type
3. **Location-based Sorting**: Proximity sorting for urgent care centers
4. **Symptom Assessment**: 5-level acuity system with care recommendations
5. **Real-time Updates**: Simulated live data with refresh capabilities
6. **Accessibility**: Proper focus management and keyboard navigation
7. **Responsive Design**: Mobile-first approach with breakpoint handling
```

All files have been created with exact functionality matching the original website.