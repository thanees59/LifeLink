import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'lifelink.db';
let databasePromise;

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
  `);

  const donorColumns = await db.getAllAsync('PRAGMA table_info(donors)');
  if (!donorColumns.some((column) => column.name === 'contact_consent')) {
    await db.execAsync('ALTER TABLE donors ADD COLUMN contact_consent INTEGER NOT NULL DEFAULT 0 CHECK (contact_consent IN (0, 1))');
  }
  if (!donorColumns.some((column) => column.name === 'contact_consent_updated_at')) {
    await db.execAsync('ALTER TABLE donors ADD COLUMN contact_consent_updated_at TEXT');
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
  if (!databasePromise) {
    databasePromise = initializeDatabase().catch((error) => {
      databasePromise = null;
      throw error;
    });
  }
  return databasePromise;
}
