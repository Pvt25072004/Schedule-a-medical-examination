const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const con = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_DATABASE || 'booking_db'
  });

  console.log('Fetching hospitals and doctors...');
  const [hospitals] = await con.query('SELECT id FROM hospitals LIMIT 1');
  const [doctors] = await con.query('SELECT id FROM doctors LIMIT 1');
  const [banners] = await con.query('SELECT id FROM banners ORDER BY id ASC LIMIT 3');

  if (banners.length >= 2) {
    const b1 = banners[0].id;
    const b2 = banners[1].id;
    const hospitalId = hospitals.length > 0 ? hospitals[0].id : null;
    const doctorId = doctors.length > 0 ? doctors[0].id : null;

    if (hospitalId) {
      console.log(`Setting Banner ${b1} to hospital_id = ${hospitalId}`);
      await con.query('UPDATE banners SET hospital_id = ?, redirect_url = NULL WHERE id = ?', [hospitalId, b1]);
    }
    
    if (doctorId) {
      console.log(`Setting Banner ${b2} to doctor_id = ${doctorId}`);
      await con.query('UPDATE banners SET doctor_id = ?, redirect_url = NULL WHERE id = ?', [doctorId, b2]);
    }
    
    console.log('Banners updated successfully.');
  } else {
    console.log('Not enough banners to update.');
  }

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
