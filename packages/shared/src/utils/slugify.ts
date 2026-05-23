export function slugify(value: string) {
  const trimmed = value.trim().toLowerCase();
  const sanitized = trimmed
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized.slice(0, 48) || "tenant";
}

export function withSuffix(base: string, suffix: string) {
  const joined = `${base}-${suffix}`.slice(0, 48);
  return joined.replace(/-+$/g, "");
}
