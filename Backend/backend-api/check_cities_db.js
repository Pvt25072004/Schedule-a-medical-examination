const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config({ path: path.join('d:/study/Senior/Project/All/Schedule-a-medical-examination/Backend/backend-api/.env') });

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

async function run() {
  await dataSource.initialize();
  const cities = await dataSource.query('SELECT id, name, code, area FROM cities limit 10');
  console.log(cities);
  const areas = await dataSource.query('SELECT DISTINCT area FROM cities');
  console.log('Distinct areas:', areas);
  await dataSource.destroy();
}
run();
