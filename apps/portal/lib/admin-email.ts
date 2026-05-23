const DEFAULT_ADMIN_EMAILS = [
  "photospheremedia00@gmail.com",
];

function getConfiguredAdminEmails(): Set<string> {
  const fromEnv = (process.env.ADMIN_ALLOWED_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return new Set(
    [...DEFAULT_ADMIN_EMAILS, ...fromEnv].map((item) => item.trim().toLowerCase()),
  );
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getConfiguredAdminEmails().has(email.trim().toLowerCase());
}
