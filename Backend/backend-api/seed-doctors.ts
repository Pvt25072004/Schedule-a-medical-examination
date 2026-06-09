import 'reflect-metadata';
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';

dotenv.config({ path: '.env' });

const doctorsData = [
  { full_name: 'Nguyễn Quang Tuấn', email: 'tuan.nguyen@doctor.com', password: '123456', address: '33 xô viết nghệ tĩnh, hải châu', phone: '0901112223' },
  { full_name: 'Nguyễn Cẩm Lệ', email: 'le.nguyen@doctor.com', password: '123456', address: '33 xô viết nghệ tĩnh, hải châu', phone: '0901112224' },
  { full_name: 'Trần Văn Xương', email: 'xuong.tran@doctor.com', password: '123456', address: '33 xô viết nghệ tĩnh, hải châu', phone: '0901112225' },
];

async function seed() {
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    charset: 'utf8mb4',
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to database...');
    
    for (const doc of doctorsData) {
      const rows = await connection.query(`SELECT id FROM user WHERE email = ?`, [doc.email]);
      let userId;

      if (rows && rows.length > 0) {
         userId = rows[0].id;
         console.log(`User ${doc.email} already exists (ID: ${userId}).`);
      } else {
         const passwordHash = await bcrypt.hash(doc.password, 10);
         const insertUserResult = await connection.query(
           `INSERT INTO user (full_name, email, phone, password_hash, address, role, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, 'doctor', NOW(), NOW())`,
           [doc.full_name, doc.email, doc.phone, passwordHash, doc.address]
         );
         userId = insertUserResult.insertId;
         console.log(`Created new user ${doc.email} (ID: ${userId}).`);
      }

      const docRows = await connection.query(`SELECT id FROM doctors WHERE user_id = ?`, [userId]);
      if (!docRows || docRows.length === 0) {
        await connection.query(
          `INSERT INTO doctors (user_id, verification_status, consultation_fee, rating, review_count, created_at, updated_at) 
           VALUES (?, 'active', 200000, 5.0, 0, NOW(), NOW())`,
          [userId]
        );
        console.log(`Created doctor profile for: ${doc.full_name}`);
      } else {
        console.log(`Doctor profile for ${doc.email} already exists.`);
      }
    }

    console.log(`Seed completed.`);
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await connection.close();
    console.log('Database connection closed.');
  }
}

seed();
