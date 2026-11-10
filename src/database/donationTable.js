import { getDatabase } from './database';

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

export async function getDonationCount() {
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT COUNT(*) AS count FROM donations');
  return row.count;
}
