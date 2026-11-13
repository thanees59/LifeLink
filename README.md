# LifeLink

LifeLink is an offline React Native app for managing blood donors and donation records. It is designed to support donor registration, search and filtering by blood group and district, profile management, and donation history through a local SQLite database. Donor and donation information will be stored on the device. The app does not use public APIs or online databases.

## Current milestone

The app now includes local SQLite setup, fictional starter records, donor registration with validation, a database-backed donor registry, donor details, editing, deletion, donor search and blood group filtering, and donation entry/history.

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

Open the project with Expo Go or an Android emulator. On startup, the app creates its SQLite tables and inserts fictional sample records when the tables are empty. SQLite is configured for native Expo targets; web database support needs additional Metro and hosting configuration.

## Project structure

```text
assets/                 App images and icons
src/
  components/           Reusable donor, search, filter, and placeholder UI
  database/              SQLite initialization, tables, and read queries
  navigation/            React Navigation stack
  screens/               Dashboard and six app screens
  utils/                 Shared validation helpers
App.js                   Expo app entry point
```

## Planned development milestones

1. Runnable scaffold and navigation.
2. SQLite tables and fictional sample records. (Implemented.)
3. Donor registration, details, editing, deletion, and validation. (Implemented.)
4. Donor search/filters and donation history entry. (Implemented.)
5. Database-backed dashboard, settings, and offline workflow checks. (Implemented.)

All demonstration donor information should be fictional. Availability is an administrative status; medical donation eligibility must be assessed by qualified healthcare professionals.
