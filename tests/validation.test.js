import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateText,
  validateWishForm,
  validateRsvpForm,
  hasErrors
} from '../client/src/services/validation.js';

test('validateText: không cho phép rỗng khi min = 1', () => {
  const errEmpty = validateText('', { min: 1, max: 100, fieldName: 'Tên' });
  assert.equal(errEmpty, 'Tên không được để trống.');

  const errWhitespace = validateText('   ', { min: 1, max: 100, fieldName: 'Tên' });
  assert.equal(errWhitespace, 'Tên không được để trống.');
});

test('validateText: vượt quá giới hạn ký tự', () => {
  const longText = 'a'.repeat(501);
  const err = validateText(longText, { min: 1, max: 500, fieldName: 'Lời chúc' });
  assert.match(err, /Lời chúc tối đa 500 ký tự/);
});

test('validateWishForm: kiểm tra hợp lệ và lỗi', () => {
  const valid = validateWishForm({ name: 'Nguyễn Văn A', message: 'Chúc mừng hai bạn!' });
  assert.equal(hasErrors(valid), false);

  const invalid = validateWishForm({ name: '', message: '' });
  assert.equal(hasErrors(invalid), true);
  assert.ok(invalid.name);
  assert.ok(invalid.message);
});

test('validateRsvpForm: kiểm tra số lượng khách', () => {
  const valid = validateRsvpForm({ name: 'Trần B', guestsCount: 2 });
  assert.equal(hasErrors(valid), false);

  const invalidCount = validateRsvpForm({ name: 'Trần B', guestsCount: 99 });
  assert.equal(hasErrors(invalidCount), true);
  assert.match(invalidCount.guestsCount, /từ 1 đến 10/);
});
