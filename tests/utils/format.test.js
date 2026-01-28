import test from 'node:test';
import assert from 'node:assert/strict';

import { formatNumberWithCommas } from '../../src/utils/format.js';

test('format: adds commas to integer', () => {
  assert.equal(formatNumberWithCommas('0'), '0');
  assert.equal(formatNumberWithCommas('12'), '12');
  assert.equal(formatNumberWithCommas('1234'), '1,234');
  assert.equal(formatNumberWithCommas('123456789'), '123,456,789');
});

test('format: preserves decimals', () => {
  assert.equal(formatNumberWithCommas('1234.5'), '1,234.5');
  assert.equal(formatNumberWithCommas('1234.50'), '1,234.50');
  assert.equal(formatNumberWithCommas('.5'), '0.5');
});

test('format: preserves sign', () => {
  assert.equal(formatNumberWithCommas('-1234567.89'), '-1,234,567.89');
});

test('format: leaves non-numeric strings unchanged', () => {
  assert.equal(formatNumberWithCommas('Error: division by zero'), 'Error: division by zero');
});
