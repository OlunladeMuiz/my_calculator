export function absBigInt(value) {
  return value < 0n ? -value : value;
}

export function pow10(exp) {
  if (!Number.isInteger(exp) || exp < 0) {
    throw new Error(`pow10 expects a non-negative integer, got: ${exp}`);
  }
  let result = 1n;
  for (let i = 0; i < exp; i += 1) {
    result *= 10n;
  }
  return result;
}
