'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const AppError = require('../src/utils/AppError');
const errorHandler = require('../src/middleware/errorHandler');

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test('errorHandler returns the status and message from AppError', () => {
  const response = createResponse();

  errorHandler(new AppError(404, 'Order tidak ditemukan'), {}, response, () => {});

  assert.equal(response.statusCode, 404);
  assert.deepEqual(response.body, { success: false, message: 'Order tidak ditemukan' });
});

test('errorHandler maps Sequelize validation errors to field errors', () => {
  const response = createResponse();
  const error = {
    name: 'SequelizeValidationError',
    errors: [{ path: 'stock', message: 'Stock must be positive' }],
  };

  errorHandler(error, {}, response, () => {});

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, {
    success: false,
    message: 'Validasi gagal',
    errors: [{ field: 'stock', message: 'Stock must be positive' }],
  });
});
