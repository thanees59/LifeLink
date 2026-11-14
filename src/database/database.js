import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'lifelink.db';
const DATABASE_PROMISE_KEY = '__lifelinkDatabasePromise__';
const DATABASE_LOCK_KEY = '__lifelinkDatabaseLock__';

const sampleDonors = [
  ['Amaya Perera', '0771234567', 'O+', 'Colombo', 'Available'],
  ['Nimal Fernando', '0712345678', 'A+', 'Gampaha', 'Available'],
  ['Kavindi Silva', '0763456789', 'B+', 'Kandy', 'Unavailable'],
  ['Ruwan Jayasinghe', '0754567890', 'AB+', 'Galle', 'Available'],
  ['Tharushi Wijesinghe', '0785678901', 'O-', 'Matara', 'Available'],
];

async function initializeDatabase() {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS donors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      blood_group TEXT NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
      district TEXT NOT NULL,
      availability TEXT NOT NULL DEFAULT 'Available' CHECK (availability IN ('Available', 'Unavailable')),
      contact_consent INTEGER NOT NULL DEFAULT 0 CHECK (contact_consent IN (0, 1)),
      contact_consent_updated_at TEXT,
      profile_image TEXT,
      date_of_birth TEXT,
      weight_kg REAL,
      gender TEXT,
      previous_donation_declared INTEGER NOT NULL DEFAULT 0 CHECK (previous_donation_declared IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      donor_id INTEGER NOT NULL,
      donation_date TEXT NOT NULL,
      location TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_donors_blood_group ON donors(blood_group);
    CREATE INDEX IF NOT EXISTS idx_donors_district ON donors(district);
    CREATE INDEX IF NOT EXISTS idx_donations_donor_date ON donations(donor_id, donation_date DESC);
    CREATE TABLE IF NOT EXISTS app_admin_auth (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS app_donor_auth (
      donor_id INTEGER PRIMARY KEY,
      username TEXT NOT NULL COLLATE NOCASE UNIQUE,
      phone TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS app_donor_signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL COLLATE NOCASE UNIQUE,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      salt TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const donorColumns = await db.getAllAsync('PRAGMA table_info(donors)');
  if (!donorColumns.some((column) => column.name === 'contact_consent')) {
    await db.execAsync('ALTER TABLE donors ADD COLUMN contact_consent INTEGER NOT NULL DEFAULT 0 CHECK (contact_consent IN (0, 1))');
  }
  if (!donorColumns.some((column) => column.name === 'contact_consent_updated_at')) {
    await db.execAsync('ALTER TABLE donors ADD COLUMN contact_consent_updated_at TEXT');
  }
  if (!donorColumns.some((column) => column.name === 'profile_image')) {
    await db.execAsync('ALTER TABLE donors ADD COLUMN profile_image TEXT');
  }
  if (!donorColumns.some((column) => column.name === 'date_of_birth')) {
    await db.execAsync('ALTER TABLE donors ADD COLUMN date_of_birth TEXT');
  }
  if (!donorColumns.some((column) => column.name === 'weight_kg')) {
    await db.execAsync('ALTER TABLE donors ADD COLUMN weight_kg REAL');
  }
  if (!donorColumns.some((column) => column.name === 'gender')) {
    await db.execAsync('ALTER TABLE donors ADD COLUMN gender TEXT');
  }
  if (!donorColumns.some((column) => column.name === 'previous_donation_declared')) {
    await db.execAsync('ALTER TABLE donors ADD COLUMN previous_donation_declared INTEGER NOT NULL DEFAULT 0 CHECK (previous_donation_declared IN (0, 1))');
  }
  const donorAuthColumns = await db.getAllAsync('PRAGMA table_info(app_donor_auth)');
  if (!donorAuthColumns.some((column) => column.name === 'phone')) {
    await db.execAsync("ALTER TABLE app_donor_auth ADD COLUMN phone TEXT NOT NULL DEFAULT ''");
  }
  if (!donorAuthColumns.some((column) => column.name === 'email')) {
    await db.execAsync("ALTER TABLE app_donor_auth ADD COLUMN email TEXT NOT NULL DEFAULT ''");
  }

  const existing = await db.getFirstAsync('SELECT COUNT(*) AS count FROM donors');
  if (existing.count === 0) {
    for (const donor of sampleDonors) {
      await db.runAsync(
        'INSERT INTO donors (name, phone, blood_group, district, availability) VALUES (?, ?, ?, ?, ?)',
        ...donor,
      );
    }
    await db.runAsync(
      'INSERT INTO donations (donor_id, donation_date, location, notes) VALUES (?, ?, ?, ?)',
      1, '2025-10-12', 'Colombo National Blood Centre', 'Fictional sample record',
    );
    await db.runAsync(
      'INSERT INTO donations (donor_id, donation_date, location, notes) VALUES (?, ?, ?, ?)',
      2, '2025-09-28', 'Gampaha District Hospital', 'Fictional sample record',
    );
  }
  return db;
}

/** Returns the initialized local database. Safe to call from multiple screens. */
export function getDatabase() {
  if (!globalThis[DATABASE_PROMISE_KEY]) {
    globalThis[DATABASE_PROMISE_KEY] = initializeDatabaseWithBrowserLock().catch((error) => {
      delete globalThis[DATABASE_PROMISE_KEY];
      throw error;
    });
  }
  return globalThis[DATABASE_PROMISE_KEY];
}

/**
 * The web SQLite VFS uses exclusive OPFS access handles. Keep one Web Lock for
 * the lifetime of this page so another LifeLink tab waits instead of opening
 * the same persistent database concurrently. Native platforms skip this lock.
 */
async function initializeDatabaseWithBrowserLock() {
  const locks = globalThis.navigator?.locks;
  if (!locks?.request) return initializeDatabase();

  let acquire;
  let release;
  let lockError;
  const acquired = new Promise((resolve) => { acquire = resolve; });
  const holdLock = new Promise((resolve) => { release = resolve; });
  const lockRequest = locks.request('lifelink-sqlite-opfs', { mode: 'exclusive' }, async () => {
    acquire();
    await holdLock;
  }).catch((error) => {
    lockError = error;
    acquire();
  });
  globalThis[DATABASE_LOCK_KEY] = { release, lockRequest };

  await acquired;
  if (lockError) {
    delete globalThis[DATABASE_LOCK_KEY];
    throw lockError;
  }
  try {
    return await initializeDatabase();
  } catch (error) {
    release();
    delete globalThis[DATABASE_LOCK_KEY];
    throw error;
  }
}
