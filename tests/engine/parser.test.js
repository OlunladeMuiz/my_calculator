import test from 'node:test';
import assert from 'node:assert/strict';

import { tokenize } from '../../src/engine/tokenizer.js';
import { parse } from '../../src/engine/parser.js';

test('parse: precedence (1+2*3)', () => {
  const ast = parse(tokenize('1+2*3'));
  assert.equal(ast.type, 'BinaryExpression');
  assert.equal(ast.operator, '+');
  assert.equal(ast.right.type, 'BinaryExpression');
  assert.equal(ast.right.operator, '*');
});

test('parse: unary minus (-3+2)', () => {
  const ast = parse(tokenize('-3+2'));
  assert.equal(ast.type, 'BinaryExpression');
  assert.equal(ast.operator, '+');
  assert.equal(ast.left.type, 'UnaryExpression');
});

test('parse: parentheses (12+4*(6-2))', () => {
  const ast = parse(tokenize('12+4*(6-2)'));
  assert.equal(ast.type, 'BinaryExpression');
});
