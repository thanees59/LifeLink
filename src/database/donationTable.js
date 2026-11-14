import { getDatabase } from './database';
import { getActiveDonorId, getActiveRole, requireAdministrator } from '../auth/session';

export async function getDonations() {
  const db = await getDatabase();
  if (getActiveRole() === 'general') {
    return db.getAllAsync(`
      SELECT donations.*, donors.name AS donor_name, donors.blood_group
      FROM donations INNER JOIN donors ON donors.id = donations.donor_id
      WHERE donations.donor_id = ?
      ORDER BY donation_date DESC, donations.id DESC
    `, getActiveDonorId());
  }
  return db.getAllAsync(`
    SELECT donations.*, donors.name AS donor_name, donors.blood_group
    FROM donations
    INNER JOIN donors ON donors.id = donations.donor_id
    ORDER BY donation_date DESC, donations.id DESC
  `);
}

export async function getDonationsForDonor(donorId) {
  const db = await getDatabase();
  if (getActiveRole() === 'general') donorId = getActiveDonorId();
  return db.getAllAsync(
    'SELECT * FROM donations WHERE donor_id = ? ORDER BY donation_date DESC, id DESC',
    donorId,
  );
}

export async function getDonationById(id) {
  const db = await getDatabase();
  const donation = await db.getFirstAsync('SELECT * FROM donations WHERE id = ?', id);
  if (getActiveRole() === 'general' && donation?.donor_id !== getActiveDonorId()) return null;
  return donation;
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
  if (getActiveRole() === 'general') {
    const row = await db.getFirstAsync('SELECT COUNT(*) AS count FROM donations WHERE donor_id = ?', getActiveDonorId());
    return row.count;
  }
  const row = await db.getFirstAsync('SELECT COUNT(*) AS count FROM donations');
  return row.count;
}
