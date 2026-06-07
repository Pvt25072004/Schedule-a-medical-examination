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
  const hospitals = await dataSource.query(`
    SELECT h.name as hospital, c.name as city, c.area as area 
    FROM hospitals h 
    LEFT JOIN cities c ON h.cityId = c.id
  `);
  console.log(hospitals);
  await dataSource.destroy();
}
run();
