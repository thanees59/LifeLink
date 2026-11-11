import { getDatabase } from './database';

export async function getDonors() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM donors ORDER BY name COLLATE NOCASE');
}

export async function getDonorById(id) {
  const db = await getDatabase();
  return db.getFirstAsync('SELECT * FROM donors WHERE id = ?', id);
}

export async function getDonorCount() {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT COUNT(*) AS count FROM donors');
  return row.count;
}

export async function createDonor(donor) {
  const db = await getDatabase();
  return db.runAsync(
    'INSERT INTO donors (name, phone, blood_group, district, availability) VALUES (?, ?, ?, ?, ?)',
    donor.name.trim(), donor.phone.trim(), donor.blood_group, donor.district.trim(), donor.availability,
  );
}

export async function updateDonor(id, donor) {
  const db = await getDatabase();
  return db.runAsync(
    'UPDATE donors SET name = ?, phone = ?, blood_group = ?, district = ?, availability = ? WHERE id = ?',
    donor.name.trim(), donor.phone.trim(), donor.blood_group, donor.district.trim(), donor.availability, id,
  );
}

export async function deleteDonor(id) {
  const db = await getDatabase();
  return db.runAsync('DELETE FROM donors WHERE id = ?', id);
}
