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
