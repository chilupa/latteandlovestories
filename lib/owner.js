export function isConfiguredOwnerAccess() {
  const id = process.env.ALLOWED_OWNER_ID?.trim();
  const email = process.env.ALLOWED_OWNER_EMAIL?.trim();
  return Boolean(id || email);
}

export function isAllowedOwner(user) {
  if (!user) return false;

  const ownerId = process.env.ALLOWED_OWNER_ID?.trim();
  if (ownerId && user.id === ownerId) return true;

  const ownerEmail = process.env.ALLOWED_OWNER_EMAIL?.trim?.();
  if (ownerEmail && user.email) {
    return user.email.toLowerCase() === ownerEmail.toLowerCase();
  }

  return false;
}
