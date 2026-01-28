import test from 'node:test';
import assert from 'node:assert/strict';

import { tokenize } from '../../src/engine/tokenizer.js';

test('tokenize: numbers and operators', () => {
  assert.deepEqual(tokenize('12+3.4'), [
    { type: 'number', value: '12' },
    { type: 'operator', value: '+' },
    { type: 'number', value: '3.4' },
  ]);
});

test('tokenize: unicode operators normalize', () => {
  assert.deepEqual(tokenize('7×8÷2−3'), [
    { type: 'number', value: '7' },
    { type: 'operator', value: '*' },
    { type: 'number', value: '8' },
    { type: 'operator', value: '/' },
    { type: 'number', value: '2' },
    { type: 'operator', value: '-' },
    { type: 'number', value: '3' },
  ]);
});

test('tokenize: parentheses', () => {
  assert.deepEqual(tokenize('(1+2)*3'), [
    { type: 'paren', value: '(' },
    { type: 'number', value: '1' },
    { type: 'operator', value: '+' },
    { type: 'number', value: '2' },
    { type: 'paren', value: ')' },
    { type: 'operator', value: '*' },
    { type: 'number', value: '3' },
  ]);
});
