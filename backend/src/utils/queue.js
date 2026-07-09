'use strict';
const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis connection for BullMQ
const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
});

connection.on('connect', () => console.log('✅ Redis connected'));
connection.on('error', (err) => console.error('❌ Redis error:', err.message));

// Queue definitions
const orderQueue = new Queue('order-events', { connection });

// Worker — processes order events
const orderWorker = new Worker('order-events', async (job) => {
  const { event, orderId, from, to, timestamp } = job.data;
  // Log audit trail — can be extended to send email, webhook, etc.
  console.log(`[OrderEvent] ${timestamp} | Event: ${event} | Order: ${orderId} | ${from} → ${to}`);
}, { connection });

orderWorker.on('completed', (job) => {
  console.log(`[BullMQ] Job ${job.id} (${job.name}) completed`);
});

orderWorker.on('failed', (job, err) => {
  console.error(`[BullMQ] Job ${job?.id} failed:`, err.message);
});

module.exports = { orderQueue };
