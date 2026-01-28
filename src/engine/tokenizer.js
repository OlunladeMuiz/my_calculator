import { normalizeOperatorChar } from '../utils/expression.js';

/**
 * Token types:
 * - number: { type: 'number', value: '12.34' }
 * - operator: { type: 'operator', value: '+|-|*|/' }
 * - paren: { type: 'paren', value: '('|')' }
 */
export function tokenize(expression) {
  const input = String(expression);
  const tokens = [];
  let i = 0;

  const pushNumber = (numStr) => {
    if (numStr === '.' || numStr === '' || numStr === '+.' || numStr === '-.') {
      throw new Error('Malformed number');
    }
    tokens.push({ type: 'number', value: numStr });
  };

  while (i < input.length) {
    const raw = input[i];
    const c = normalizeOperatorChar(raw);

    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      i += 1;
      continue;
    }

    if (c === '(' || c === ')') {
      tokens.push({ type: 'paren', value: c });
      i += 1;
      continue;
    }

    if (c === '+' || c === '-' || c === '*' || c === '/') {
      tokens.push({ type: 'operator', value: c });
      i += 1;
      continue;
    }

    if ((c >= '0' && c <= '9') || c === '.') {
      let num = '';
      let dotSeen = false;
      while (i < input.length) {
        const nextRaw = input[i];
        const next = normalizeOperatorChar(nextRaw);
        if (next >= '0' && next <= '9') {
          num += next;
          i += 1;
          continue;
        }
        if (next === '.') {
          if (dotSeen) break;
          dotSeen = true;
          num += '.';
          i += 1;
          continue;
        }
        break;
      }
      pushNumber(num);
      continue;
    }

    const err = new Error(`Unexpected character: ${raw}`);
    err.code = 'UNEXPECTED_CHAR';
    throw err;
  }

  return tokens;
}
