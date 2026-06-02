const fetch = require('node-fetch'); // Yêu cầu Node 18+ (hoặc cài node-fetch nếu Node cũ)

// Hàm giả lập "Double Booking Attack" - gửi nhiều request cùng 1 lúc (tới cùng milisecond)
async function simulateDoubleBooking() {
  console.log('🚀 Bắt đầu giả lập tấn công Double Booking...');
  
  const API_URL = 'http://localhost:3000/api/v1/appointments';
  
  // Dữ liệu đặt lịch (giả định User 1 và User 2 cùng giành 1 slot của Bác sĩ 1 vào ngày 01/06/2026 lúc 10:00)
  const payload1 = {
    user_id: 1, // Bệnh nhân A
    doctor_id: 1, // Bác sĩ X
    hospital_id: 1, 
    appointment_date: "2026-06-01",
    appointment_time: "10:00",
    examination_type: "offline",
    symptoms: "Test Double Booking - Bệnh nhân 1"
  };

  const payload2 = {
    user_id: 2, // Bệnh nhân B
    doctor_id: 1, // Vẫn là Bác sĩ X
    hospital_id: 1,
    appointment_date: "2026-06-01",
    appointment_time: "10:00", // Cùng lúc 10:00
    examination_type: "offline",
    symptoms: "Test Double Booking - Bệnh nhân 2"
  };

  const options = (payload) => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  // Bắn 2 request CÙNG LÚC (Promise.all sẽ gửi đi song song ngay lập tức)
  const request1 = fetch(API_URL, options(payload1));
  const request2 = fetch(API_URL, options(payload2));

  console.log('⚡ Đang bắn 2 request đồng thời vào server...');
  
  const [response1, response2] = await Promise.all([request1, request2]);
  
  const data1 = await response1.json();
  const data2 = await response2.json();

  console.log('\n--- KẾT QUẢ ---');
  console.log('👉 Request 1 (User 1):', response1.status, data1);
  console.log('👉 Request 2 (User 2):', response2.status, data2);
  
  console.log('\n--- KẾT LUẬN ---');
  if (response1.status === 201 && response2.status !== 201) {
    console.log('✅ Hệ thống hoat động ĐÚNG: User 1 giành được slot, User 2 bị chặn (Báo lỗi trùng lịch).');
  } else if (response1.status !== 201 && response2.status === 201) {
    console.log('✅ Hệ thống hoat động ĐÚNG: User 2 giành được slot, User 1 bị chặn (Báo lỗi trùng lịch).');
  } else if (response1.status === 201 && response2.status === 201) {
    console.log('❌ HỆ THỐNG LỖI (RACE CONDITION): Cả 2 đều đặt thành công cùng 1 giờ!');
  } else {
    console.log('⚠️ Cả 2 đều thất bại. (Có thể do giờ này đã được ai đó đặt trước đó)');
  }
}

simulateDoubleBooking();
