# AgenticAI Mobile App

React Native app built with Expo SDK 54.

## Setup

1. **Install dependencies**:
   ```bash
   cd mobile
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

3. **Start the app**:
   ```bash
   npx expo start
   ```

## Test on Device

1. Install the **Expo Go** app from the App Store (iOS) or Play Store (Android).
2. Scan the QR code shown in your terminal after running `npx expo start`.

### Login Credentials (Demo)

*   **Alice**: `alice@agenticai.dev` / `Demo@1234`
*   **Bob**: `bob@agenticai.dev` / `Demo@1234`
*   **Demo**: `demo@agenticai.dev` / `Demo@1234`

## Backend

The app is configured to connect to the live Render backend:
`https://agenticai-backend-xao9.onrender.com`

## Features

- **Auth**: Secure JWT storage using `expo-secure-store`.
- **Marketplace**: Browse and search for AI agents.
- **Invocations**: Test agents directly from your phone.
- **Staking**: Secure the network and earn protocol rewards.
- **Governance**: Vote on DAO proposals.
- **Notifications**: Real-time push notifications for protocol events.

## Build for Stores

To create production builds, use EAS:
```bash
eas build --platform ios
eas build --platform android
```
