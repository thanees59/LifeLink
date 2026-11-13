import * as Crypto from 'expo-crypto';
import { getDatabase } from './database';

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(salt, password) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

export async function getAdminCredential() {
  const db = await getDatabase();
  return db.getFirstAsync('SELECT salt, password_hash FROM app_admin_auth WHERE id = 1');
}

export async function createAdminCredential(password) {
  const db = await getDatabase();
  const existing = await db.getFirstAsync('SELECT id FROM app_admin_auth WHERE id = 1');
  if (existing) throw new Error('An administrator is already configured.');
  const salt = bytesToHex(await Crypto.getRandomBytesAsync(16));
  const passwordHash = await hashPassword(salt, password);
  await db.runAsync('INSERT INTO app_admin_auth (id, salt, password_hash) VALUES (1, ?, ?)', salt, passwordHash);
}

export async function verifyAdminCredential(password) {
  const credential = await getAdminCredential();
  if (!credential) return false;
  const expected = credential.password_hash;
  const actual = await hashPassword(credential.salt, password);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0;
}
