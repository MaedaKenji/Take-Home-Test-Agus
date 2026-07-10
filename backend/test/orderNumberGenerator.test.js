'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { Order } = require('../src/models');
const {
  generateOrderNumber,
  generateOrderNumberWithRetry,
} = require('../src/utils/orderNumberGenerator');

const orderNumberPattern = /^ORD-\d{8}-\d{4}$/;

test('generateOrderNumber uses today\'s prefix and increments the persisted order count', async () => {
  const originalCount = Order.count;
  const transaction = { id: 'transaction-1' };
  let options;

  Order.count = async (receivedOptions) => {
    options = receivedOptions;
    return 41;
  };

  try {
    const orderNumber = await generateOrderNumber(transaction);

    assert.match(orderNumber, orderNumberPattern);
    assert.match(orderNumber, /-0042$/);
    assert.equal(options.transaction, transaction);
    assert.ok(options.where.createdAt);
  } finally {
    Order.count = originalCount;
  }
});

test('generateOrderNumber pads retry attempts to four digits', async () => {
  const orderNumber = await generateOrderNumberWithRetry(undefined, 7);

  assert.match(orderNumber, orderNumberPattern);
  assert.match(orderNumber, /-0007$/);
});
