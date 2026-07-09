'use strict';
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, Category } = require('../models');

const USERS = [
  { username: 'agus', password: 'agus123', role: 'admin', displayName: 'Agus Fuad' },
];

const DEFAULT_CATEGORIES = [
  'Analgesik', 'Antibiotik', 'Antasida', 'Antidiabetes', 'Antihipertensi',
  'Antilipid', 'Antihistamin', 'Kortikosteroid', 'Diuretik', 'Psikotropika',
  'Bronkodilator', 'Cairan Infus', 'Vitamin', 'Lainnya',
];

async function seedUsers() {
  console.log('🌱 Seeding users...');
  for (const u of USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const [user, created] = await User.findOrCreate({
      where: { username: u.username },
      defaults: { username: u.username, passwordHash, role: u.role, displayName: u.displayName },
    });
    console.log(`${created ? '✅ Created' : '⏭️  Exists'}: user "${user.username}" (${user.role})`);
  }
}

async function seedCategories() {
  console.log('🌱 Seeding categories...');
  for (const name of DEFAULT_CATEGORIES) {
    const [, created] = await Category.findOrCreate({ where: { name }, defaults: { name } });
    if (created) console.log(`✅ Category: ${name}`);
  }
  console.log('✅ Categories seeded.');
}

async function run() {
  try {
    await seedUsers();
    await seedCategories();
    console.log('🎉 Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder error:', err.message);
    process.exit(1);
  }
}

run();
