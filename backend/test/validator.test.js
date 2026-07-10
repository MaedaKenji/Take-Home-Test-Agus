'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { validateMedicine, validateOrder } = require('../src/middleware/validator');

async function requestValidation(middleware, payload) {
  const app = express();
  app.use(express.json());
  app.post('/validate', middleware, (req, res) => res.status(201).json({ success: true }));

  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });

  try {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return { status: response.status, body: await response.json() };
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

test('validateMedicine accepts a complete medicine payload', async () => {
  const response = await requestValidation(validateMedicine, {
    name: 'Paracetamol',
    code: 'PCM-500',
    unit: 'tablet',
    stock: 100,
    minStock: 10,
  });

  assert.equal(response.status, 201);
  assert.deepEqual(response.body, { success: true });
});

test('validateOrder rejects invalid dates and item quantities', async () => {
  const response = await requestValidation(validateOrder, {
    polyclinic: 'Poli Umum',
    orderDate: 'not-a-date',
    items: [{ medicineId: 'not-a-uuid', quantityRequested: 0 }],
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.success, false);
  assert.equal(response.body.message, 'Validasi gagal');
  assert.deepEqual(
    response.body.errors.map((error) => error.field).sort(),
    ['items[0].medicineId', 'items[0].quantityRequested', 'orderDate'].sort(),
  );
});
