import test from 'node:test';
import assert from 'node:assert/strict';

import { evaluateExpression } from '../../src/engine/evaluator.js';

test('evaluate: multi-step with parentheses', () => {
  assert.equal(evaluateExpression('12+4*(6-2)').toString(), '28');
});

test('evaluate: exact decimal add (0.1+0.2)', () => {
  assert.equal(evaluateExpression('0.1+0.2').toString(), '0.3');
});

test('evaluate: division by zero throws', () => {
  assert.throws(() => evaluateExpression('1/0'), /Division by zero/);
});

test('evaluate: unary minus inside parens', () => {
  assert.equal(evaluateExpression('(-3)+2').toString(), '-1');
});
