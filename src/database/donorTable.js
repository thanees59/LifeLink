import { getDatabase } from './database';
import * as Crypto from 'expo-crypto';
import { getActiveRole, requireAdministrator } from '../auth/session';

const canViewContactDetails = () => (getActiveRole() === 'admin' ? 1 : 0);

export async function getDonors() {
  const db = await getDatabase();
  return db.getAllAsync(`
    SELECT id, name,
      CASE WHEN ? = 1 AND contact_consent = 1 THEN phone ELSE NULL END AS phone,
      blood_group, district, availability, contact_consent, contact_consent_updated_at, created_at
    FROM donors ORDER BY name COLLATE NOCASE
  `, canViewContactDetails());
}

export async function getDonorById(id) {
  const db = await getDatabase();
  return db.getFirstAsync(`
    SELECT id, name,
      CASE WHEN ? = 1 AND contact_consent = 1 THEN phone ELSE NULL END AS phone,
      blood_group, district, availability, contact_consent, contact_consent_updated_at, created_at
    FROM donors WHERE id = ?
  `, canViewContactDetails(), id);
}

export async function getDonorCount() {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT COUNT(*) AS count FROM donors');
  return row.count;
}

export async function createDonor(donor) {
  requireAdministrator();
  const db = await getDatabase();
  return db.runAsync(
    'INSERT INTO donors (name, phone, blood_group, district, availability, contact_consent, contact_consent_updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    donor.name.trim(), donor.contact_consent ? donor.phone.trim() : `WITHHELD_${Crypto.randomUUID()}`,
    donor.blood_group, donor.district.trim(), donor.availability, donor.contact_consent ? 1 : 0, donor.contact_consent ? new Date().toISOString() : null,
  );
}

export async function updateDonor(id, donor) {
  requireAdministrator();
  const db = await getDatabase();
  return db.runAsync(
    `UPDATE donors SET name = ?,
      phone = CASE WHEN ? = 1 THEN ? ELSE phone END,
      blood_group = ?, district = ?, availability = ?, contact_consent = ?,
      contact_consent_updated_at = CASE WHEN ? = 1 THEN CURRENT_TIMESTAMP ELSE NULL END
      WHERE id = ?`,
    donor.name.trim(), donor.contact_consent ? 1 : 0, donor.contact_consent ? donor.phone.trim() : '',
    donor.blood_group, donor.district.trim(), donor.availability, donor.contact_consent ? 1 : 0,
    donor.contact_consent ? 1 : 0, id,
  );
}

export async function deleteDonor(id) {
  requireAdministrator();
  const db = await getDatabase();
  return db.runAsync('DELETE FROM donors WHERE id = ?', id);
}
