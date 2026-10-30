import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWishForm, hasErrors, LIMITS } from '../client/src/services/validation.js';

test('Wishes validation: tên tối đa 80 ký tự, lời chúc tối đa 500 ký tự', () => {
  assert.equal(LIMITS.name.max, 80);
  assert.equal(LIMITS.wishMessage.max, 500);

  const errors = validateWishForm({
    name: 'a'.repeat(81),
    message: 'b'.repeat(501)
  });

  assert.equal(hasErrors(errors), true);
  assert.match(errors.name, /80 ký tự/);
  assert.match(errors.message, /500 ký tự/);
});

test('Wishes validation: hợp lệ khi đúng giới hạn', () => {
  const errors = validateWishForm({
    name: 'Khách quý',
    message: 'Chúc mừng đám cưới hai bạn trăm năm hạnh phúc!'
  });

  assert.equal(hasErrors(errors), false);
  assert.equal(errors.name, null);
  assert.equal(errors.message, null);
});
