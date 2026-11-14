import * as Crypto from 'expo-crypto';
import { getDatabase } from './database';
import { requireAdministrator } from '../auth/session';
import { BLOOD_GROUPS } from '../utils/validation';
import { getDonorEligibilityErrors } from '../utils/donorEligibility';

const normalizePhoneDigits = (value) => {
  const digits = String(value ?? '').replace(/[^\d]/g, '');
  if (digits.length === 11 && digits.startsWith('94')) return `0${digits.slice(2)}`;
  if (digits.length === 9) return `0${digits}`;
  return digits;
};

async function findMatchingDonorProfile(db, values) {
  const name = String(values.name ?? '').trim().toLocaleLowerCase();
  const phone = normalizePhoneDigits(values.phone);
  if (!name || !phone) return null;
  const profiles = await db.getAllAsync(`
    SELECT donors.id, donors.name, donors.phone, app_donor_auth.phone AS account_phone
    FROM donors LEFT JOIN app_donor_auth ON app_donor_auth.donor_id = donors.id
  `);
  return profiles.find((profile) => profile.name.trim().toLocaleLowerCase() === name
    && [profile.phone, profile.account_phone].some((storedPhone) => normalizePhoneDigits(storedPhone) === phone)) ?? null;
}

async function hasDonationHistory(db, donorId) {
  if (donorId == null) return false;
  const row = await db.getFirstAsync('SELECT COUNT(*) AS count FROM donations WHERE donor_id = ?', donorId);
  return Number(row?.count ?? 0) > 0;
}

/** Frontend pre-check; createDonorSignup repeats these checks inside its insert transaction. */
export async function validateDonorSignupEligibility(values) {
  const db = await getDatabase();
  const profile = await findMatchingDonorProfile(db, values);
  const previousDonations = await hasDonationHistory(db, profile?.id);
  return getDonorEligibilityErrors(values, { hasPreviousDonations: previousDonations });
}

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

export async function getDonorCredentialUsername(donorId) {
  requireAdministrator();
  const db = await getDatabase();
  const row = await db.getFirstAsync('SELECT username FROM app_donor_auth WHERE donor_id = ?', donorId);
  return row?.username ?? '';
}

export async function saveDonorCredential(donorId, username, password) {
  requireAdministrator();
  const cleanUsername = username.trim();
  if (!cleanUsername || password.length < 8) throw new Error('Enter a username and a password with at least 8 characters.');
  const db = await getDatabase();
  const salt = bytesToHex(await Crypto.getRandomBytesAsync(16));
  const passwordHash = await hashPassword(salt, password);
  await db.runAsync(
    `INSERT INTO app_donor_auth (donor_id, username, salt, password_hash) VALUES (?, ?, ?, ?)
     ON CONFLICT(donor_id) DO UPDATE SET username = excluded.username, salt = excluded.salt, password_hash = excluded.password_hash`,
    donorId, cleanUsername, salt, passwordHash,
  );
}

export async function verifyDonorCredential(username, password) {
  if (!username?.trim() || !password) return null;
  const db = await getDatabase();
  const credential = await db.getFirstAsync(
    'SELECT donor_id, salt, password_hash FROM app_donor_auth WHERE username = ? COLLATE NOCASE',
    username.trim(),
  );
  if (!credential) return null;
  const actual = await hashPassword(credential.salt, password);
  if (actual.length !== credential.password_hash.length) return null;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual.charCodeAt(index) ^ credential.password_hash.charCodeAt(index);
  return difference === 0 ? credential.donor_id : null;
}

export async function createDonorSignup(values) {
  const name = String(values.name ?? '').trim();
  const username = String(values.username ?? '').trim();
  const phone = String(values.phone ?? '').trim();
  const email = String(values.email ?? '').trim();
  const password = String(values.password ?? '');
  const district = String(values.district ?? '').trim();
  const profileImage = values.profile_image || null;
  const phoneDigits = String(values.phone ?? '').replace(/[^\d]/g, '');
  const dateOfBirth = String(values.date_of_birth ?? '').trim();
  const weight = Number(String(values.weight_kg ?? '').trim());
  const gender = String(values.gender ?? '').trim();
  const previousDonationDeclared = values.has_donated_before === 'yes' ? 1 : 0;
  if (name.length < 2 || username.length < 3 || !/^\d{9,12}$/.test(phoneDigits)
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !BLOOD_GROUPS.includes(values.blood_group)
    || district.length < 2 || password.length < 8 || !['yes', 'no'].includes(values.has_donated_before)
    || !['Female', 'Male', 'Other', 'Prefer not to say'].includes(gender)
    || (profileImage && (!/^data:image\/(jpeg|png|webp);base64,/.test(profileImage) || profileImage.length > 1500000))) {
    throw new Error('Check your registration details and try again.');
  }
  const db = await getDatabase();
  const salt = bytesToHex(await Crypto.getRandomBytesAsync(16));
  const passwordHash = await hashPassword(salt, password);
  let donorId;
  await db.withTransactionAsync(async () => {
    const existingAccount = await db.getFirstAsync('SELECT donor_id FROM app_donor_auth WHERE username = ? COLLATE NOCASE', username);
    const pendingAccount = await db.getFirstAsync('SELECT id FROM app_donor_signups WHERE username = ? COLLATE NOCASE', username);
    if (existingAccount || pendingAccount) throw new Error('That username is already registered.');

    const matchingProfile = await findMatchingDonorProfile(db, values);
    const previousDonations = await hasDonationHistory(db, matchingProfile?.id);
    const eligibilityErrors = getDonorEligibilityErrors(values, { hasPreviousDonations: previousDonations });
    if (eligibilityErrors.length) throw new Error(eligibilityErrors.join('\n'));

    if (matchingProfile) {
      const linked = await db.getFirstAsync('SELECT donor_id FROM app_donor_auth WHERE donor_id = ?', matchingProfile.id);
      if (linked) throw new Error('This donor profile already has an account. Contact the administrator for password recovery.');
      donorId = matchingProfile.id;
      await db.runAsync(`UPDATE donors SET profile_image = ?, date_of_birth = ?, weight_kg = ?, gender = ?,
        previous_donation_declared = ? WHERE id = ?`, profileImage, dateOfBirth, weight, gender, previousDonationDeclared, donorId);
    }

    if (donorId == null) {
      const profileResult = await db.runAsync(
        `INSERT INTO donors (name, phone, blood_group, district, availability, contact_consent, profile_image,
          date_of_birth, weight_kg, gender, previous_donation_declared) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)`,
        name, `WITHHELD_${Crypto.randomUUID()}`, values.blood_group, district, 'Available', profileImage,
        dateOfBirth, weight, gender, previousDonationDeclared,
      );
      donorId = profileResult.lastInsertRowId;
    }

    await db.runAsync(
      'INSERT INTO app_donor_auth (donor_id, username, phone, email, salt, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      donorId, username, phone, email.toLocaleLowerCase(), salt, passwordHash,
    );
  });
  return donorId;
}

export async function getPendingDonorSignups() {
  requireAdministrator();
  const db = await getDatabase();
  return db.getAllAsync('SELECT id, name, username, phone, email, created_at FROM app_donor_signups ORDER BY created_at, id');
}

export async function linkDonorSignup(signupId, donorId) {
  requireAdministrator();
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    const signup = await db.getFirstAsync('SELECT * FROM app_donor_signups WHERE id = ?', signupId);
    if (!signup) throw new Error('This donor sign-up request no longer exists.');
    const profile = await db.getFirstAsync('SELECT id FROM donors WHERE id = ?', donorId);
    if (!profile) throw new Error('Choose an existing donor profile.');
    const profileAccount = await db.getFirstAsync('SELECT donor_id FROM app_donor_auth WHERE donor_id = ?', donorId);
    if (profileAccount) throw new Error('This donor profile already has a sign-in account.');
    await db.runAsync(
      'INSERT INTO app_donor_auth (donor_id, username, phone, email, salt, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      donorId, signup.username, signup.phone, signup.email, signup.salt, signup.password_hash,
    );
    await db.runAsync('DELETE FROM app_donor_signups WHERE id = ?', signupId);
  });
}
