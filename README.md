# LifeLink

LifeLink is an offline React Native app for managing blood donors and donation records. It is designed to support donor registration, search and filtering by blood group and district, profile management, and donation history through a local SQLite database. Donor and donation information will be stored on the device. The app does not use public APIs or online databases.

## Current milestone

The app now includes local SQLite setup, fictional starter records, donor registration with validation, a database-backed donor registry, donor details, editing, deletion, donor search and blood group filtering, donation entry/history with edit and delete, CSV export, local administrator/general-user roles, and donor contact consent controls.

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

Open the project with Expo Go or an Android emulator. On startup, the app creates its SQLite tables and inserts fictional sample records when the tables are empty. Web SQLite support is configured for local development; a production web host must also send the cross-origin headers required by SQLite.

## Project structure

```text
assets/                 App images and icons
src/
  auth/                  Local role session and access checks
  components/           Reusable donor, search, filter, and placeholder UI
  database/              SQLite initialization, tables, and read queries
  navigation/            React Navigation stack
  screens/               Dashboard and six app screens
  utils/                 Shared validation helpers
App.jsx                  Expo app entry point
```

## Local roles and contact privacy

On first launch, create an administrator password for this device. Administrators can manage donor and donation records and export CSV data. General users can search and view registry and donation history, but cannot change or export records. Phone numbers are shown only to administrators and only when donor consent has been recorded; existing records default to no recorded consent after the database migration. Roles and accounts are local to this device and do not sync. The password is stored as a salted hash, but the SQLite database is not encrypted, so this is a basic access gate rather than protection from someone with technical access to the device.

## Planned development milestones

1. Runnable scaffold and navigation.
2. SQLite tables and fictional sample records. (Implemented.)
3. Donor registration, details, editing, deletion, and validation. (Implemented.)
4. Donor search/filters and donation history entry. (Implemented.)
5. Database-backed dashboard, settings, and offline workflow checks. (Implemented.)
6. Donation record editing/deletion and donor-specific history. (Implemented.)
7. Searchable history, CSV backup export, and final workflow polish. (Implemented.)
8. Local administrator/general-user access and consent-gated contact details. (Implemented.)

The app uses an offline role session. It does not provide administrator access from another device or remote synchronization.

All demonstration donor information should be fictional. Availability is an administrative status; medical donation eligibility must be assessed by qualified healthcare professionals.
