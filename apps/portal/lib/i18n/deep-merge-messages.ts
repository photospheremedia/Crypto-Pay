/** Keep only keys present in `template`; nested objects follow the same shape. */
export function pickMessageStructure(
  template: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, templateValue] of Object.entries(template)) {
    const sourceValue = source[key];

    if (
      templateValue !== null &&
      typeof templateValue === "object" &&
      !Array.isArray(templateValue)
    ) {
      result[key] = pickMessageStructure(
        templateValue as Record<string, unknown>,
        sourceValue !== null &&
          typeof sourceValue === "object" &&
          !Array.isArray(sourceValue)
          ? (sourceValue as Record<string, unknown>)
          : {},
      );
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue;
    } else {
      result[key] = templateValue;
    }
  }

  return result;
}

/** Deep-merge message trees; later keys override earlier ones. */
export function deepMergeMessages(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...base };

  for (const [key, value] of Object.entries(override)) {
    const existing = result[key];
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      existing !== null &&
      typeof existing === "object" &&
      !Array.isArray(existing)
    ) {
      result[key] = deepMergeMessages(
        existing as Record<string, unknown>,
        value as Record<string, unknown>,
      );
    } else {
      result[key] = value;
    }
  }

  return result;
}
