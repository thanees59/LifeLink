export function calculateDonorAge(dateOfBirth, today = new Date()) {
  if (typeof dateOfBirth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) return null;
  const [year, month, day] = dateOfBirth.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;

  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (date > todayDate) return null;
  let age = todayDate.getFullYear() - year;
  if (todayDate.getMonth() < month - 1 || (todayDate.getMonth() === month - 1 && todayDate.getDate() < day)) age -= 1;
  return age;
}

export function getDonorEligibilityErrors(values, { hasPreviousDonations = false, today = new Date() } = {}) {
  const errors = [];
  const age = calculateDonorAge(values.date_of_birth, today);
  if (age == null) {
    errors.push('Enter a valid date of birth in YYYY-MM-DD format; it cannot be in the future.');
  } else if (age < 18) {
    errors.push('You must be at least 18 years old to register as a blood donor.');
  } else {
    const previousDonor = hasPreviousDonations || values.has_donated_before === 'yes';
    if (age > 60) errors.push('You do not meet the maximum age requirement for blood donation.');
    else if (!previousDonor && age > 55) errors.push('First-time donors must be 55 years old or below.');
  }

  const weight = typeof values.weight_kg === 'number' ? values.weight_kg : Number(String(values.weight_kg ?? '').trim());
  if (!String(values.weight_kg ?? '').trim() || !Number.isFinite(weight) || weight <= 0) {
    errors.push('Enter a valid weight in kilograms.');
  } else if (weight <= 50) {
    errors.push('Your weight must be above 50 kg to meet the basic donor registration requirements.');
  }

  return errors;
}
