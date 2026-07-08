const { Medicine } = require('./src/models');
const { Op } = require('sequelize');

async function test() {
  try {
    const sequelize = Medicine.sequelize;
    
    console.log('--- Testing status=Tersedia ---');
    const tersedia = await Medicine.findAll({
      where: {
        stock: { [Op.gt]: sequelize.col('min_stock') }
      },
      limit: 1
    });
    console.log('Tersedia count/success:', tersedia.length);

    console.log('--- Testing status=Rendah ---');
    const rendah = await Medicine.findAll({
      where: {
        stock: {
          [Op.and]: [
            { [Op.gt]: 0 },
            { [Op.lte]: sequelize.col('min_stock') }
          ]
        }
      },
      limit: 1
    });
    console.log('Rendah count/success:', rendah.length);

  } catch (err) {
    console.error('Error during query:', err);
  } finally {
    process.exit();
  }
}

test();
