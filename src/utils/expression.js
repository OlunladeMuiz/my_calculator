const OP_CHARS = new Set(['+', '-', '*', '/']);

export function normalizeOperatorChar(char) {
  if (char === '×') return '*';
  if (char === '÷') return '/';
  if (char === '−') return '-';
  return char;
}

export function isOperatorChar(char) {
  return OP_CHARS.has(char);
}

export function getLastNonSpaceChar(str) {
  for (let i = str.length - 1; i >= 0; i -= 1) {
    const c = str[i];
    if (c !== ' ') return c;
  }
  return null;
}

export function canAppendDot(expression) {
  // Disallow multiple dots in the current number segment.
  // Scan backwards until an operator or paren boundary.
  for (let i = expression.length - 1; i >= 0; i -= 1) {
    const c = expression[i];
    if (c === '.') return false;
    if (c === '(' || c === ')' || isOperatorChar(c) || c === ' ') return true;
  }
  return true;
}

export function sanitizeExpressionForEngine(expression) {
  // Keep engine-facing expression simple: only ASCII ops.
  return String(expression)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-');
}
