// Converts tokens into an AST with correct precedence and unary minus.

const PRECEDENCE = {
  NEGATE: 3,
  '*': 2,
  '/': 2,
  '+': 1,
  '-': 1,
};

const RIGHT_ASSOC = new Set(['NEGATE']);

function isOperatorToken(token) {
  return token?.type === 'operator';
}

function isUnaryMinus(tokens, index) {
  const token = tokens[index];
  if (!isOperatorToken(token) || token.value !== '-') return false;
  const prev = tokens[index - 1];
  if (!prev) return true;
  if (prev.type === 'operator') return true;
  if (prev.type === 'paren' && prev.value === '(') return true;
  return false;
}

function toRpn(tokens) {
  const output = [];
  const stack = [];

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.type === 'number') {
      output.push(token);
      continue;
    }

    if (token.type === 'paren') {
      if (token.value === '(') {
        stack.push(token);
        continue;
      }
      // token.value === ')'
      while (stack.length > 0 && stack[stack.length - 1].type !== 'paren') {
        output.push(stack.pop());
      }
      if (stack.length === 0) {
        const err = new Error('Mismatched parentheses');
        err.code = 'MISMATCHED_PARENS';
        throw err;
      }
      stack.pop(); // pop '('
      continue;
    }

    if (token.type === 'operator') {
      const op = isUnaryMinus(tokens, i) ? 'NEGATE' : token.value;
      const opToken = { type: 'operator', value: op };

      while (stack.length > 0) {
        const top = stack[stack.length - 1];
        if (top.type === 'paren') break;
        const topOp = top.value;
        const pTop = PRECEDENCE[topOp];
        const pOp = PRECEDENCE[op];
        if (pTop === undefined || pOp === undefined) break;

        const shouldPop = RIGHT_ASSOC.has(op) ? pTop > pOp : pTop >= pOp;
        if (!shouldPop) break;
        output.push(stack.pop());
      }

      stack.push(opToken);
      continue;
    }

    const err = new Error('Unknown token');
    err.code = 'UNKNOWN_TOKEN';
    throw err;
  }

  while (stack.length > 0) {
    const t = stack.pop();
    if (t.type === 'paren') {
      const err = new Error('Mismatched parentheses');
      err.code = 'MISMATCHED_PARENS';
      throw err;
    }
    output.push(t);
  }

  return output;
}

function rpnToAst(rpn) {
  const stack = [];
  for (const token of rpn) {
    if (token.type === 'number') {
      stack.push({ type: 'NumberLiteral', value: token.value });
      continue;
    }
    if (token.type === 'operator') {
      if (token.value === 'NEGATE') {
        const arg = stack.pop();
        if (!arg) {
          const err = new Error('Malformed expression');
          err.code = 'MALFORMED_EXPRESSION';
          throw err;
        }
        stack.push({ type: 'UnaryExpression', operator: '-', argument: arg });
        continue;
      }

      const right = stack.pop();
      const left = stack.pop();
      if (!left || !right) {
        const err = new Error('Malformed expression');
        err.code = 'MALFORMED_EXPRESSION';
        throw err;
      }
      stack.push({
        type: 'BinaryExpression',
        operator: token.value,
        left,
        right,
      });
      continue;
    }

    const err = new Error('Unknown token in RPN');
    err.code = 'UNKNOWN_TOKEN';
    throw err;
  }

  if (stack.length !== 1) {
    const err = new Error('Malformed expression');
    err.code = 'MALFORMED_EXPRESSION';
    throw err;
  }

  return stack[0];
}

export function parse(tokens) {
  if (!Array.isArray(tokens)) {
    throw new TypeError('parse expects tokens array');
  }
  if (tokens.length === 0) {
    const err = new Error('Empty expression');
    err.code = 'EMPTY_EXPRESSION';
    throw err;
  }
  const rpn = toRpn(tokens);
  return rpnToAst(rpn);
}
