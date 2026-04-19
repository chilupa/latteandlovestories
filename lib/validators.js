const USERNAME_RE = /^[a-z0-9_]{3,30}$/;

export const RESERVED_USERNAMES = new Set([
  "api",
  "dashboard",
  "login",
  "_next",
  "admin",
  "settings",
]);

export function isValidUsername(value) {
  if (typeof value !== "string") return false;
  const u = value.trim().toLowerCase();
  if (!USERNAME_RE.test(u)) return false;
  if (RESERVED_USERNAMES.has(u)) return false;
  return true;
}

export function isValidHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return false;
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isValidOptionalUrl(value) {
  if (value == null || String(value).trim() === "") return true;
  return isValidHttpUrl(value);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidOptionalEmail(value) {
  if (value == null || String(value).trim() === "") return true;
  return EMAIL_RE.test(String(value).trim());
}
