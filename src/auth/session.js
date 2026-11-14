let activeRole = null;
let activeDonorId = null;

export function setActiveRole(role, donorId = null) {
  if (role !== 'admin' && role !== 'general') throw new Error('Invalid LifeLink role.');
  if (role === 'general' && (donorId == null || !Number.isInteger(Number(donorId)))) throw new Error('A donor account is required for general-user access.');
  activeRole = role;
  activeDonorId = role === 'general' ? Number(donorId) : null;
}

export function clearActiveRole() {
  activeRole = null;
  activeDonorId = null;
}

export function getActiveRole() {
  return activeRole;
}

export function getActiveDonorId() {
  return activeDonorId;
}

export function isAdministrator() {
  return activeRole === 'admin';
}

export function requireAdministrator() {
  if (!isAdministrator()) throw new Error('Administrator access is required for this action.');
}
