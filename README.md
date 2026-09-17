# 🌿 Active Aging — Community for Life After 55

> **"Meet. Move. Live."**  
> A senior-centric mobile application designed to foster meaningful friendships, active lifestyles, and local community engagement for older adults aged 55+.

---

## 📖 Overview

As individuals transition into retirement or experience changes in family dynamics, social isolation and loneliness become significant health risks. **Active Aging** provides a warm, accessible, and community-driven mobile platform where seniors can:

1. **Discover & Join Local Activities:** Morning walks, yoga sessions, music circles, book clubs, gardening meetups, and board game clubs in their neighborhood.
2. **Engage with Niche Communities:** Connect with like-minded peers in topic-based interest groups with group discussions and real-time chat.
3. **Build Real-World Friendships:** Discover neighborhood seniors who share common hobbies through a strictly platonic, anti-dating friendship directory.
4. **Stay Informed & Healthy:** Access daily wisdom quotes, tailored local wellness tips, and neighborhood health camp bulletins.

---

## ✨ Key Features

### 🔐 1. Accessible Authentication & Senior Onboarding
* **Phone Number + OTP Verification:** Fast 6-digit OTP verification with automatic countdown timer and senior-readable digit inputs.
* **Senior Profile Creation:** Name, age validation ($55+$), gender, city/neighborhood selection, and bio.
* **Multi-Interest Selector:** Intuitive hobby picker requiring a minimum of 3 interests to tailor the feed.
* **Native Photo Picker (`expo-image-picker`):** Seamless camera selfie capture and photo gallery selection with native permissions.

### 🏠 2. Dynamic Home Screen Feed
* **Daily Thought (Quote of the Day):** Uplifting morning inspirations.
* **Jaipur Weather & Wellness Tips:** Daily health reminders tailored to local weather.
* **Upcoming Joined Activities:** One-tap access to the senior's next scheduled event.
* **Popular Activities Carousel:** Horizontal quick-browse of trending community meetups.
* **Local Notice Board:** Community bulletin for free health check-up camps, member spotlights, and weather alerts.

### 🚶‍♂️ 3. Activities Hub & Native Calendar Sync
* **Category Filtering:** Filter by *Walking, Yoga, Music, Games, Reading, Gardening, and Art*.
* **Strict Layout Architecture:** Guaranteed zero-overlap chip layout with auto-scroll to top on filter switches.
* **Activity Details Screen:** Hero banner, organizer details, participant avatar directory, and capacity counters.
* **Native Calendar Sync (`expo-calendar`):** Adds events directly into Apple Calendar (iOS) or Google Calendar (Android) with a **30-minute reminder alarm**.
* **Group Chat Shortcut:** Jump directly into the activity's parent community chat.

### 👥 4. Communities & Real-Time Group Chat
* **Topic-Based Communities:** Join and leave interest groups with real-time member counters.
* **Community Details & Rules:** View group guidelines, active member lists, and recent discussion previews.
* **Senior-Friendly Group Chat:** Large-font chat bubbles, clear sender identification, timestamps, quick emoji reactions, and voice note accessibility controls.

### 🤝 5. People & Friendship Directory (Anti-Dating UX)
* **Platonic Friendship Cards:** Senior cards showing photo, age, neighborhood, and shared mutual interests count.
* **Zero Swiping / Dating Mechanics:** Dignified, community-oriented design strictly focused on companionship.
* **"Say Hello" Action:** Initiates friendly conversation starters without awkward barrier steps.

### 👤 6. Comprehensive Profile & Interactive Editor
* **Profile Overview:** View joined communities, upcoming activities, past activity records, and active interests.
* **Interactive Edit Profile Modal:** Full-screen editor allowing seniors to update their name, age, neighborhood, bio, photo, and add/remove hobby tags with local storage persistence.

### 🛡️ 7. Production Hardening & Crash Prevention
* **Global Error Boundary (`ErrorBoundary.tsx`):** Catches any runtime JavaScript exceptions gracefully, displaying a warm senior-friendly recovery screen with a *"Restart Application"* button.
* **App Store & Google Play Ready:** Full metadata, bundle identifiers (`com.activeaging.app`), and Apple privacy justification strings configured.

---

## 🎨 Senior-Centric Design System & Accessibility

* **High Contrast Color Palette:** Calming forest green (`#2D7D6F`), warm accents (`#E07A5F`), and clear dark slate text (`#1A2E2B`) complying with **WCAG AAA** contrast ratios.
* **Generous Touch Targets:** All interactive buttons and chips enforce a minimum height of **$48\text{px}$** (with $56\text{px}$ comfortable targets) for easy tapping.
* **Senior-Readable Typography:** Minimum body font size of **$18\text{px}$** with optimized line-heights ($1.5\times$) for effortless readability.
* **Zero Cognitive Overload:** Single-tap actions, prominent back navigation, and visual confirmation alerts on all critical state changes.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Expo SDK 57](https://expo.dev) + [React Native 0.86](https://reactnative.dev) |
| **Language** | TypeScript 5.9 (Strict mode, zero compilation errors) |
| **Routing** | [Expo Router v57](https://docs.expo.dev/router/introduction/) (File-based navigation) |
| **State Management** | React Context (`AuthContext`) + Local Component State |
| **Storage & Caching** | `@react-native-async-storage/async-storage` |
| **Native Device Plugins** | `expo-image-picker` (Camera/Gallery), `expo-calendar` (Calendar sync) |
| **Icons & Media** | `@expo/vector-icons` (Ionicons), `expo-image`, `expo-linear-gradient` |
| **Build & Distribution** | EAS Build (Expo Application Services) |

---

## 📁 Project Structure

```
active-aging-app/
├── app/                              # Expo Router file-based pages
│   ├── (auth)/                       # Authentication flow (Welcome, Login, Verify OTP)
│   ├── (onboarding)/                 # Onboarding flow (Profile Setup, Interests, Location)
│   ├── (tabs)/                       # 5 Core Bottom Tabs
│   │   ├── _layout.tsx               # Native Tab Bar Navigation
│   │   ├── index.tsx                 # Home Screen Feed
│   │   ├── activities.tsx            # Activities Catalog & Filters
│   │   ├── communities.tsx           # Communities Catalog
│   │   ├── people.tsx                # Friendship Directory
│   │   └── profile.tsx               # User Profile & Edit Modal
│   ├── activities/[id].tsx           # Activity Details & Calendar Sync
│   ├── communities/[id].tsx          # Community Overview & Rules
│   ├── communities/[id]/chat.tsx     # Real-Time Group Chat
│   ├── people/[id].tsx               # Member Profile View
│   ├── notifications.tsx             # Notification Center
│   ├── _layout.tsx                   # Root Layout + Global ErrorBoundary + AuthProvider
│   └── index.tsx                     # Animated Splash Screen & Auth Gateway
├── src/
│   ├── components/
│   │   ├── activity/                 # ActivityCard components
│   │   ├── community/                # CommunityCard components
│   │   ├── people/                   # PeopleCard components
│   │   └── ui/                       # Accessible Button, Input, Avatar, Tag, ErrorBoundary
│   ├── constants/                    # Colors, Typography, Spacing, Config
│   ├── context/                      # AuthContext provider
│   ├── data/                         # Typed mock datasets (Users, Activities, Communities)
│   ├── services/                     # Business logic services (Auth, Activity, Community, User)
│   ├── types/                        # TypeScript interfaces & domain models
│   └── utils/                        # Date formatting and field validation utilities
├── app.json                          # Expo configuration & App Store / Play Store metadata
├── eas.json                          # EAS Build profiles (APK & Store distribution)
├── package.json                      # Project dependencies & scripts
└── tsconfig.json                     # TypeScript strict configuration
```

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or newer recommended)
* [Expo Go](https://expo.dev/go) app installed on your iPhone (iOS) or Android device

### 1. Clone the Repository
```bash
git clone https://github.com/IshanAapan/Active-Aging-Mobile-App-v1.git
cd Active-Aging-Mobile-App-v1
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Start the Development Server
```bash
npx expo start -c --lan
```

### 4. Open the App
* **iOS (iPhone):** Open the default **Camera** app, scan the terminal QR code, and tap the banner to open in **Expo Go**.
* **Android:** Open **Expo Go** and scan the terminal QR code.
* **Mock Login:** Enter any mobile number and use the mock OTP **`123456`**.

---

## 📦 Building Standalone Android APK

To generate a standalone `.apk` installable file that can be distributed directly to testers:

```bash
npx eas-cli build -p android --profile preview
```

EAS Cloud will compile the native Android binary and provide a direct public download link and QR code.

---

## 🛣️ Production Release Roadmap

- [x] **Phase 1: Production Hardening & Native Features**
  - [x] Global `<ErrorBoundary>` crash prevention fallback
  - [x] Native Camera & Gallery Photo Picker (`expo-image-picker`)
  - [x] Native Apple & Google Calendar Event Sync (`expo-calendar`)
  - [x] Full-featured Profile & Interests editing modal
  - [x] Store bundle IDs and privacy justifications in `app.json`
- [ ] **Phase 2: Cloud Backend & SMS OTP**
  - [ ] Google Firebase / Supabase Integration
  - [ ] Real SMS OTP Authentication
  - [ ] Live WebSocket Cloud Chat
  - [ ] Cloud Storage for Profile Photos
- [ ] **Phase 3: Store Submission**
  - [ ] App Store Connect (iOS TestFlight & App Review)
  - [ ] Google Play Console (Android Internal Track & Production)

---

## 📄 License

This project is proprietary and developed for the **Active Aging Community Platform**. All rights reserved.
