# LifeLink

LifeLink is an offline React Native app for managing blood donors and donation records. It is designed to support donor registration, search and filtering by blood group and district, profile management, and donation history through a local SQLite database. Donor and donation information will be stored on the device. The app does not use public APIs or online databases.

## Current milestone

This first milestone is the runnable project outline: Expo setup, navigation, seven screen placeholders, and reusable UI components. SQLite and donor/donation workflows are planned for the next development steps.

## Run the app

1. Install Node.js (LTS).
2. Install project dependencies:

   ```bash
   npm install
   npx expo install react-native-screens react-native-safe-area-context
   ```

3. Start Expo:

   ```bash
   npx expo start
   ```

To run in a web browser, install the web dependencies and start the web target:

   ```bash
   npx expo install react-dom react-native-web
   npx expo start --web
   ```

Open the project with Expo Go or an Android emulator. The first launch requires the JavaScript dependencies to be installed; app data features are being added in later milestones.

## Project structure

```text
assets/                 App images and icons
src/
  components/           Reusable donor, search, filter, and placeholder UI
  database/              SQLite setup and table queries (next milestone)
  navigation/            React Navigation stack
  screens/               Dashboard and six app screens
  utils/                 Shared validation helpers
App.js                   Expo app entry point
```

## Planned development milestones

1. Runnable scaffold and navigation.
2. SQLite tables and fictional sample records.
3. Donor registration, details, editing, deletion, and validation.
4. Donor search/filters and donation history entry.
5. Database-backed dashboard, settings, and offline workflow checks.

All demonstration donor information should be fictional. Availability is an administrative status; medical donation eligibility must be assessed by qualified healthcare professionals.
