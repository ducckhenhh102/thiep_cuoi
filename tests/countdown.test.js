import test from 'node:test';
import assert from 'node:assert/strict';

test('Countdown calculation: tính toán số ngày giờ phút giây chính xác', () => {
  const now = new Date('2027-01-14T09:00:00+07:00');
  const target = new Date('2027-01-15T09:00:00+07:00');
  const diff = target - now;

  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);

  assert.equal(days, 1);
  assert.equal(hours, 0);
});

test('Countdown: ngày trong quá khứ trả về <= 0', () => {
  const now = new Date('2027-01-16T09:00:00+07:00');
  const target = new Date('2027-01-15T09:00:00+07:00');
  const diff = target - now;

  assert.ok(diff <= 0);
});
