let activeRole = null;

export function setActiveRole(role) {
  if (role !== 'admin' && role !== 'general') throw new Error('Invalid LifeLink role.');
  activeRole = role;
}

export function clearActiveRole() {
  activeRole = null;
}

export function getActiveRole() {
  return activeRole;
}

export function isAdministrator() {
  return activeRole === 'admin';
}

export function requireAdministrator() {
  if (!isAdministrator()) throw new Error('Administrator access is required for this action.');
}
