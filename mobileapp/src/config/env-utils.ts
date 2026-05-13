export function readEnvValue(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseBooleanLikeValue(value: string | undefined) {
  const normalizedValue = readEnvValue(value);

  if (!normalizedValue) {
    return undefined;
  }

  const normalized = normalizedValue
    .replace(/^(['"])(.*)\1$/, "$2")
    .toLowerCase();
  const parsedJson = (() => {
    try {
      return JSON.parse(normalized);
    } catch {
      return undefined;
    }
  })();

  if (typeof parsedJson === "boolean") {
    return parsedJson;
  }

  if (normalized === "1" || normalized === "yes" || normalized === "on") {
    return true;
  }

  if (normalized === "0" || normalized === "no" || normalized === "off") {
    return false;
  }

  return undefined;
}
