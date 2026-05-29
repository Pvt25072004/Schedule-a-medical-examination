const mysql = require('mysql2/promise');

async function seedSchedules() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'booking_db'
  });

  try {
    console.log('Đang tạo lịch làm việc giả lập cho Bác sĩ 1 và 2...');
    
    const today = new Date();
    
    // Tạo lịch cho 30 ngày tới
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Cho Doctor 1, Hospital 1
      await connection.execute(
        `INSERT IGNORE INTO schedules (doctor_id, hospital_id, work_date, start_time, end_time, is_available)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [1, 1, dateStr, '07:00:00', '17:00:00', true]
      );
      
      // Cho Doctor 2, Hospital 1
      await connection.execute(
        `INSERT IGNORE INTO schedules (doctor_id, hospital_id, work_date, start_time, end_time, is_available)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [2, 1, dateStr, '07:00:00', '17:00:00', true]
      );
    }

    console.log('✅ Đã tạo lịch làm việc (07:00 - 17:00) trong 30 ngày tới cho Bác sĩ 1 và 2 thành công!');
    
  } catch (err) {
    console.error('Lỗi:', err);
  } finally {
    await connection.end();
  }
}

seedSchedules();
