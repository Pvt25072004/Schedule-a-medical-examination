const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// 1. Đọc cấu hình từ file .env thủ công
function loadEnv() {
    const envPath = path.join(__dirname, '.env');
    if (!fs.existsSync(envPath)) {
        console.error('❌ Không tìm thấy file .env tại ' + envPath);
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const config = {};
    envContent.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            let key = match[1];
            let value = match[2] || '';
            // Bỏ dấu ngoặc kép nếu có
            if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                value = value.substring(1, value.length - 1);
            }
            if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
                value = value.substring(1, value.length - 1);
            }
            config[key] = value.trim();
        }
    });
    return config;
}

async function main() {
    const config = loadEnv();
    console.log('🔌 Đang kết nối tới CSDL MySQL...');
    
    const connection = await mysql.createConnection({
        host: config.DB_HOST || 'localhost',
        port: parseInt(config.DB_PORT || '3306', 10),
        user: config.DB_USERNAME || 'root',
        password: config.DB_PASSWORD || '123456',
        database: config.DB_DATABASE || 'booking_db'
    });

    try {
        console.log('🔒 Tắt ràng buộc khóa ngoại (Foreign Key Checks)...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

        // Xóa sạch dữ liệu cũ ở các bảng liên quan
        console.log('🧹 Đang dọn dẹp dữ liệu cũ...');
        await connection.query('TRUNCATE TABLE doctor_hospital;');
        await connection.query('TRUNCATE TABLE hospital_category;');
        await connection.query('TRUNCATE TABLE schedules;');
        await connection.query('TRUNCATE TABLE doctors;');
        await connection.query('TRUNCATE TABLE hospitals;');
        await connection.query('TRUNCATE TABLE categories;');

        // --- 1. CHÈN DANH MỤC CHUYÊN KHOA (CATEGORIES) ---
        console.log('🌱 Gieo hạt Chuyên khoa (Categories)...');
        const categoriesData = [
            ['Tim mạch', 'tim-mach'],
            ['Nhi khoa', 'nhi-khoa'],
            ['Da liễu', 'da-lieu'],
            ['Xương khớp', 'xuong-khop'],
            ['Mắt', 'mat'],
            ['Thần kinh', 'than-kinh'],
            ['Tai mũi họng', 'tai-mui-hong'],
            ['Nội khoa', 'noi-khoa']
        ];
        
        const catIdMap = {};
        for (const [name, slug] of categoriesData) {
            const [result] = await connection.query(
                'INSERT INTO categories (name, slug, is_active, created_at, updated_at) VALUES (?, ?, 1, NOW(), NOW())',
                [name, slug]
            );
            catIdMap[name] = result.insertId;
        }
        console.log(`✅ Đã gieo ${categoriesData.length} chuyên khoa.`);

        // --- 2. CHÈN BỆNH VIỆN (HOSPITALS) ---
        console.log('🌱 Gieo hạt Bệnh viện (Hospitals)...');
        const hospitalsData = [
            // Hà Nội (Khớp exact/fuzzy match với Mobile)
            { name: 'Bệnh viện Bạch Mai', address: '78 Giải Phóng, Phương Mai, Đống Đa', city: 'Hà Nội', phone: '02438693731', email: 'bachmai@example.com', catNames: ['Tim mạch', 'Nội khoa', 'Thần kinh', 'Tai mũi họng'] },
            { name: 'Bệnh viện Hữu nghị Việt Đức', address: '40 Tràng Thi, Hoàn Kiếm', city: 'Hà Nội', phone: '02438253531', email: 'vietduc@example.com', catNames: ['Xương khớp', 'Thần kinh', 'Nội khoa'] },
            { name: 'Bệnh viện Nhi Trung ương', address: '879 La Thành, Đống Đa', city: 'Hà Nội', phone: '02462738532', email: 'nhitw@example.com', catNames: ['Nhi khoa', 'Tai mũi họng'] },
            
            // Hồ Chí Minh
            { name: 'Bệnh viện Chợ Rẫy', address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5', city: 'Hồ Chí Minh', phone: '02838554137', email: 'choray@example.com', catNames: ['Tim mạch', 'Nội khoa', 'Thần kinh', 'Xương khớp'] },
            { name: 'Bệnh viện Đại học Y Dược TPHCM', address: '215 Hồng Bàng, Phường 11, Quận 5', city: 'Hồ Chí Minh', phone: '02838554026', email: 'ump@example.com', catNames: ['Da liễu', 'Mắt', 'Tai mũi họng', 'Tim mạch'] },
            { name: 'Bệnh viện Nhi đồng 1', address: '341 Sư Vạn Hạnh, Phường 10, Quận 10', city: 'Hồ Chí Minh', phone: '02839271119', email: 'nhidong1@example.com', catNames: ['Nhi khoa'] },
            
            // Đà Nẵng
            { name: 'Bệnh viện C Đà Nẵng', address: '74 Hải Phòng, Thạch Thang, Hải Châu', city: 'Đà Nẵng', phone: '02363821483', email: 'bvc@example.com', catNames: ['Tim mạch', 'Nội khoa', 'Mắt'] },
            { name: 'Bệnh viện Hoàn Mỹ Đà Nẵng', address: '291 Nguyễn Văn Linh, Thạc Gián, Thanh Khê', city: 'Đà Nẵng', phone: '02363650676', email: 'hoanmydn@example.com', catNames: ['Nội khoa', 'Xương khớp', 'Da liễu'] },

            // Cần Thơ
            { name: 'Bệnh viện Đa khoa Trung ương Cần Thơ', address: '315 Nguyễn Văn Linh, Ninh Kiều', city: 'Cần Thơ', phone: '02923820071', email: 'bvtwnct@example.com', catNames: ['Nội khoa', 'Xương khớp', 'Tai mũi họng'] }
        ];

        const hosIdMap = {};
        const hospitalList = [];
        for (const hos of hospitalsData) {
            const [result] = await connection.query(
                'INSERT INTO hospitals (name, address, city, phone, email, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())',
                [hos.name, hos.address, hos.city, hos.phone, hos.email]
            );
            const hospitalId = result.insertId;
            hosIdMap[hos.name] = hospitalId;
            hospitalList.push({ id: hospitalId, name: hos.name, city: hos.city, catNames: hos.catNames });

            // Liên kết hospital_category
            for (const catName of hos.catNames) {
                const catId = catIdMap[catName];
                if (catId) {
                    await connection.query(
                        'INSERT INTO hospital_category (hospital_id, category_id) VALUES (?, ?)',
                        [hospitalId, catId]
                    );
                }
            }
        }
        console.log(`✅ Đã gieo ${hospitalsData.length} bệnh viện và liên kết chuyên khoa.`);

        // --- 3. CHÈN BÁC SĨ (DOCTORS) ---
        console.log('🌱 Gieo hạt Bác sĩ (Doctors)...');
        const doctorsData = [
            // Chuyên khoa Tim mạch
            { name: 'PGS.TS Nguyễn Quang Tuấn', specialty: 'Tim mạch', email: 'tuan.nguyen@doctor.com', phone: '0903111222', catName: 'Tim mạch', hospitals: ['Bệnh viện Bạch Mai', 'Bệnh viện Chợ Rẫy'] },
            { name: 'ThS.BS Lê Hoài Nam', specialty: 'Tim mạch', email: 'nam.le@doctor.com', phone: '0903222333', catName: 'Tim mạch', hospitals: ['Bệnh viện Đại học Y Dược TPHCM', 'Bệnh viện C Đà Nẵng'] },
            
            // Chuyên khoa Nhi khoa
            { name: 'BSCKII Trần Thị Hằng', specialty: 'Nhi khoa', email: 'hang.tran@doctor.com', phone: '0903444555', catName: 'Nhi khoa', hospitals: ['Bệnh viện Nhi Trung ương', 'Bệnh viện Nhi đồng 1'] },
            { name: 'TS.BS Phạm Minh Triết', specialty: 'Nhi khoa', email: 'triet.pham@doctor.com', phone: '0903555666', catName: 'Nhi khoa', hospitals: ['Bệnh viện Nhi đồng 1'] },
            
            // Chuyên khoa Xương khớp
            { name: 'PGS.TS Ngô Văn Toàn', specialty: 'Xương khớp', email: 'toan.ngo@doctor.com', phone: '0903666777', catName: 'Xương khớp', hospitals: ['Bệnh viện Hữu nghị Việt Đức', 'Bệnh viện Hoàn Mỹ Đà Nẵng'] },
            { name: 'TS.BS Lê Phúc', specialty: 'Chấn thương chỉnh hình', email: 'phuc.le@doctor.com', phone: '0903777888', catName: 'Xương khớp', hospitals: ['Bệnh viện Chợ Rẫy', 'Bệnh viện Đa khoa Trung ương Cần Thơ'] },
            
            // Chuyên khoa Da liễu
            { name: 'BSCKI Nguyễn Thị Kim Liên', specialty: 'Da liễu', email: 'lien.nguyen@doctor.com', phone: '0903888999', catName: 'Da liễu', hospitals: ['Bệnh viện Đại học Y Dược TPHCM', 'Bệnh viện Hoàn Mỹ Đà Nẵng'] },
            
            // Chuyên khoa Thần kinh
            { name: 'PGS.TS Nguyễn Hữu Công', specialty: 'Thần kinh', email: 'cong.nguyen@doctor.com', phone: '0903999000', catName: 'Thần kinh', hospitals: ['Bệnh viện Bạch Mai', 'Bệnh viện Chợ Rẫy'] },

            // Chuyên khoa Nội khoa
            { name: 'TS.BS Huỳnh Thanh Kiều', specialty: 'Nội khoa', email: 'kieu.huynh@doctor.com', phone: '0903000111', catName: 'Nội khoa', hospitals: ['Bệnh viện Chợ Rẫy', 'Bệnh viện C Đà Nẵng', 'Bệnh viện Đa khoa Trung ương Cần Thơ'] }
        ];

        for (const doc of doctorsData) {
            const catId = catIdMap[doc.catName];
            const bcryptHash = '$2b$10$ESJmaIQy0bRIOD/SaOBvFen.5Ej2UEkVxKaFKT5fx8DDduJFlcZbm'; // Mật khẩu mặc định: 123456

            const [result] = await connection.query(
                'INSERT INTO doctors (name, specialty, is_active, email, phone, password_hash, category_id, description, created_at, updated_at) VALUES (?, ?, 1, ?, ?, ?, ?, ?, NOW(), NOW())',
                [doc.name, doc.specialty, doc.email, doc.phone, bcryptHash, catId || null, `Bác sĩ chuyên khoa ${doc.specialty} với nhiều năm kinh nghiệm.`]
            );
            const doctorId = result.insertId;

            // Chèn song song User Account tương ứng với bác sĩ này (Role: doctor)
            await connection.query(
                'INSERT INTO user (full_name, role, email, phone, password_hash, gender, is_welcome, is_active, created_at, updated_at) VALUES (?, "doctor", ?, ?, ?, "male", 1, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE role="doctor"',
                [doc.name, doc.email, doc.phone, bcryptHash]
            );

            // Liên kết doctor_hospital
            for (const hosName of doc.hospitals) {
                const hospitalId = hosIdMap[hosName];
                if (hospitalId) {
                    await connection.query(
                        'INSERT INTO doctor_hospital (doctor_id, hospital_id) VALUES (?, ?)',
                        [doctorId, hospitalId]
                    );
                }
            }
        }
        console.log(`✅ Đã gieo ${doctorsData.length} bác sĩ và liên kết làm việc tại bệnh viện.`);

        // --- 4. GIEO HẠT MỘT VÀI LỊCH TRỰC (SCHEDULES) CHO ĐỦ KHỚP ---
        // Backend của bạn có bảng `schedules` để giới hạn sức chứa!
        // Để tạo demo hoàn hảo, ta sẽ insert lịch trực cho tất cả bác sĩ hôm nay & 7 ngày tiếp theo!
        console.log('🌱 Đang tạo lịch làm việc (Schedules) tự động cho 7 ngày tới...');
        const [docs] = await connection.query('SELECT id FROM doctors');
        const [hosps] = await connection.query('SELECT id FROM hospitals');
        
        // Lấy ngày hôm nay đến 7 ngày sau
        const daysToInsert = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            daysToInsert.push(`${yyyy}-${mm}-${dd}`);
        }

        const shifts = [
            { start: '08:00', end: '11:30' },
            { start: '13:00', end: '16:30' }
        ];

        let scheduleCount = 0;
        for (const doctor of docs) {
            // Lấy bệnh viện mà bác sĩ này làm việc
            const [linkedHospitals] = await connection.query(
                'SELECT hospital_id FROM doctor_hospital WHERE doctor_id = ?',
                [doctor.id]
            );

            for (const day of daysToInsert) {
                for (const hos of linkedHospitals) {
                    for (const shift of shifts) {
                        await connection.query(
                            'INSERT INTO schedules (doctor_id, hospital_id, work_date, start_time, end_time, max_patients, is_available, created_at) VALUES (?, ?, ?, ?, ?, 10, 1, NOW())',
                            [doctor.id, hos.hospital_id, day, shift.start, shift.end]
                        );
                        scheduleCount++;
                    }
                }
            }
        }
        console.log(`✅ Đã tự động gieo ${scheduleCount} lịch ca trực (Schedules).`);

        console.log('🔓 Bật lại ràng buộc khóa ngoại...');
        await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

        console.log('\n🎉 HOÀN TẤT THẦN TỐC! Toàn bộ dữ liệu test chuẩn hóa 100% đã sẵn sàng.');
        console.log('👉 Bạn có thể mở Điện thoại lên, chọn Tỉnh/Thành (Hà Nội, HCM, Đà Nẵng) để xem Bệnh viện hiển thị khớp 100%!');

    } catch (error) {
        console.error('🔥 Lỗi khi chạy Script Gieo hạt:', error);
    } finally {
        await connection.end();
    }
}

main();
