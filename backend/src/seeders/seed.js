'use strict';
const { Medicine } = require('../models');

const MEDICINES_SEED = [
  { code: 'MED-001', name: 'Paracetamol 500mg', unit: 'Tablet', stock: 500, minStock: 50, category: 'Analgesik' },
  { code: 'MED-002', name: 'Amoxicillin 500mg', unit: 'Kapsul', stock: 200, minStock: 30, category: 'Antibiotik' },
  { code: 'MED-003', name: 'Omeprazole 20mg', unit: 'Kapsul', stock: 150, minStock: 20, category: 'Antasida' },
  { code: 'MED-004', name: 'Metformin 500mg', unit: 'Tablet', stock: 300, minStock: 40, category: 'Antidiabetes' },
  { code: 'MED-005', name: 'Amlodipine 5mg', unit: 'Tablet', stock: 25, minStock: 30, category: 'Antihipertensi' }, // low stock
  { code: 'MED-006', name: 'Simvastatin 20mg', unit: 'Tablet', stock: 180, minStock: 25, category: 'Antilipid' },
  { code: 'MED-007', name: 'Cetirizine 10mg', unit: 'Tablet', stock: 8, minStock: 20, category: 'Antihistamin' },  // low stock
  { code: 'MED-008', name: 'Dexamethasone 0.5mg', unit: 'Tablet', stock: 100, minStock: 15, category: 'Kortikosteroid' },
  { code: 'MED-009', name: 'Ibuprofen 400mg', unit: 'Tablet', stock: 250, minStock: 35, category: 'Analgesik' },
  { code: 'MED-010', name: 'Ciprofloxacin 500mg', unit: 'Tablet', stock: 12, minStock: 25, category: 'Antibiotik' }, // low stock
  { code: 'MED-011', name: 'Ranitidine 150mg', unit: 'Tablet', stock: 120, minStock: 20, category: 'Antasida' },
  { code: 'MED-012', name: 'Glibenclamide 5mg', unit: 'Tablet', stock: 90, minStock: 20, category: 'Antidiabetes' },
  { code: 'MED-013', name: 'Captopril 25mg', unit: 'Tablet', stock: 5, minStock: 30, category: 'Antihipertensi' },  // very low
  { code: 'MED-014', name: 'Vitamin C 500mg', unit: 'Tablet', stock: 400, minStock: 50, category: 'Vitamin' },
  { code: 'MED-015', name: 'Antasida DOEN', unit: 'Tablet', stock: 0, minStock: 20, category: 'Antasida' },        // empty
  { code: 'MED-016', name: 'Cotrimoxazole 480mg', unit: 'Tablet', stock: 75, minStock: 20, category: 'Antibiotik' },
  { code: 'MED-017', name: 'Furosemide 40mg', unit: 'Tablet', stock: 60, minStock: 15, category: 'Diuretik' },
  { code: 'MED-018', name: 'Diazepam 5mg', unit: 'Tablet', stock: 30, minStock: 10, category: 'Psikotropika' },
  { code: 'MED-019', name: 'Salbutamol Inhaler', unit: 'Inhaler', stock: 20, minStock: 10, category: 'Bronkodilator' },
  { code: 'MED-020', name: 'Normal Saline 0.9% 500ml', unit: 'Botol', stock: 50, minStock: 10, category: 'Cairan Infus' },
];

async function seed() {
  try {
    console.log('🌱 Starting seeder...');
    for (const med of MEDICINES_SEED) {
      await Medicine.findOrCreate({ where: { code: med.code }, defaults: med });
    }
    console.log(`✅ Seeded ${MEDICINES_SEED.length} medicines successfully.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder error:', err.message);
    process.exit(1);
  }
}

seed();
