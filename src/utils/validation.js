export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function validateDonor(values) {
  const errors = {};
  const name = values.name?.trim() ?? '';
  const phone = values.phone?.trim() ?? '';
  const district = values.district?.trim() ?? '';
  const digits = phone.replace(/[\s()-]/g, '').replace(/^\+/, '');

  if (name.length < 2) errors.name = 'Enter a name with at least 2 characters.';
  if (!/^\d{9,12}$/.test(digits)) errors.phone = 'Enter a valid phone number (9 to 12 digits).';
  if (!BLOOD_GROUPS.includes(values.blood_group)) errors.blood_group = 'Choose a blood group.';
  if (district.length < 2) errors.district = 'Enter a district.';

  return errors;
}
