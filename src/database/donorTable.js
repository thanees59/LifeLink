import { getDatabase } from './database';
import * as Crypto from 'expo-crypto';
import { getActiveDonorId, getActiveRole, requireAdministrator } from '../auth/session';

const canViewContactDetails = () => (getActiveRole() === 'admin' ? 1 : 0);

export async function getDonors() {
  const db = await getDatabase();
  if (getActiveRole() === 'general') {
    return db.getAllAsync(`
      SELECT id, name, NULL AS phone, blood_group, district, availability, contact_consent, contact_consent_updated_at, created_at,
        EXISTS (SELECT 1 FROM app_donor_auth WHERE donor_id = donors.id) AS has_login
      FROM donors WHERE id = ? ORDER BY name COLLATE NOCASE
    `, getActiveDonorId());
  }
  return db.getAllAsync(`
    SELECT id, name,
      CASE WHEN ? = 1 AND contact_consent = 1 THEN phone ELSE NULL END AS phone,
      blood_group, district, availability, contact_consent, contact_consent_updated_at, created_at,
      EXISTS (SELECT 1 FROM app_donor_auth WHERE donor_id = donors.id) AS has_login
    FROM donors ORDER BY name COLLATE NOCASE
  `, canViewContactDetails());
}

export async function getDonorById(id) {
  if (getActiveRole() === 'general' && Number(id) !== getActiveDonorId()) return null;
  const db = await getDatabase();
  if (getActiveRole() === 'general') {
    return db.getFirstAsync(`
      SELECT donors.id, donors.name, NULL AS phone, donors.blood_group, donors.district, donors.availability,
        donors.contact_consent, donors.contact_consent_updated_at, donors.profile_image, donors.date_of_birth,
        donors.weight_kg, donors.gender, donors.created_at,
        app_donor_auth.phone AS account_phone, app_donor_auth.email AS account_email
      FROM donors LEFT JOIN app_donor_auth ON app_donor_auth.donor_id = donors.id
      WHERE donors.id = ?
    `, id);
  }
  return db.getFirstAsync(`
    SELECT id, name,
      CASE WHEN ? = 1 AND contact_consent = 1 THEN phone ELSE NULL END AS phone,
      blood_group, district, availability, contact_consent, contact_consent_updated_at, profile_image,
      date_of_birth, weight_kg, gender, created_at
    FROM donors WHERE id = ?
  `, canViewContactDetails(), id);
}

export async function getDonorCount() {
  const db = await getDatabase();
  if (getActiveRole() === 'general') {
    const row = await db.getFirstAsync('SELECT COUNT(*) AS count FROM donors WHERE id = ?', getActiveDonorId());
    return row.count;
  }
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

export async function updateOwnProfileImage(profileImage) {
  const donorId = getActiveDonorId();
  if (getActiveRole() !== 'general' || donorId == null) throw new Error('Only a signed-in donor can update their profile picture.');
  if (profileImage && (!/^data:image\/(jpeg|png|webp);base64,/.test(profileImage) || profileImage.length > 1500000)) {
    throw new Error('Choose a supported image under about 1 MB.');
  }
  const db = await getDatabase();
  return db.runAsync('UPDATE donors SET profile_image = ? WHERE id = ?', profileImage || null, donorId);
}

export async function deleteDonor(id) {
  requireAdministrator();
  const db = await getDatabase();
  return db.runAsync('DELETE FROM donors WHERE id = ?', id);
}
