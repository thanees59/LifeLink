import { getDatabase } from './database';
import { requireAdministrator } from '../auth/session';

export async function getDonations() {
  const db = await getDatabase();
  return db.getAllAsync(`
    SELECT donations.*, donors.name AS donor_name, donors.blood_group
    FROM donations
    INNER JOIN donors ON donors.id = donations.donor_id
    ORDER BY donation_date DESC, donations.id DESC
  `);
}

export async function getDonationsForDonor(donorId) {
  const db = await getDatabase();
  return db.getAllAsync(
    'SELECT * FROM donations WHERE donor_id = ? ORDER BY donation_date DESC, id DESC',
    donorId,
  );
}

export async function getDonationById(id) {
  const db = await getDatabase();
  return db.getFirstAsync('SELECT * FROM donations WHERE id = ?', id);
}

export async function createDonation(donation) {
  requireAdministrator();
  const db = await getDatabase();
  return db.runAsync(
    'INSERT INTO donations (donor_id, donation_date, location, notes) VALUES (?, ?, ?, ?)',
    donation.donor_id, donation.donation_date, donation.location.trim(), donation.notes?.trim() || null,
  );
}

export async function updateDonation(id, donation) {
  requireAdministrator();
  const db = await getDatabase();
  return db.runAsync(
    'UPDATE donations SET donor_id = ?, donation_date = ?, location = ?, notes = ? WHERE id = ?',
    donation.donor_id, donation.donation_date, donation.location.trim(), donation.notes?.trim() || null, id,
  );
}

export async function deleteDonation(id) {
  requireAdministrator();
  const db = await getDatabase();
  return db.runAsync('DELETE FROM donations WHERE id = ?', id);
}

export async function getDonationCount() {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT COUNT(*) AS count FROM donations');
  return row.count;
}
