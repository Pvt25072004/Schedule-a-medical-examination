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

const regions = {
  "Miền Bắc": ["Hà Nội", "Hải Phòng", "Bắc Ninh", "Quảng Ninh", "Hải Dương", "Hưng Yên", "Vĩnh Phúc", "Thái Nguyên", "Bắc Giang", "Phú Thọ", "Hà Nam", "Nam Định", "Thái Bình", "Ninh Bình", "Hòa Bình", "Sơn La", "Điện Biên", "Lai Châu", "Lào Cai", "Yên Bái", "Tuyên Quang", "Hà Giang", "Cao Bằng", "Bắc Kạn", "Lạng Sơn"],
  "Miền Trung": ["Thanh Hóa", "Nghệ An", "Hà Tĩnh", "Quảng Bình", "Quảng Trị", "Thừa Thiên Huế", "Đà Nẵng", "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên", "Khánh Hòa", "Ninh Thuận", "Bình Thuận", "Kon Tum", "Gia Lai", "Đắk Lắk", "Đắk Nông", "Lâm Đồng"],
  "Miền Nam": ["Hồ Chí Minh", "TP. Hồ Chí Minh", "Đồng Nai", "Bình Dương", "Bà Rịa - Vũng Tàu", "Tây Ninh", "Bình Phước", "Long An", "Tiền Giang", "Bến Tre", "Đồng Tháp", "Vĩnh Long", "Trà Vinh", "Cần Thơ", "Hậu Giang", "Sóc Trăng", "Kiên Giang", "An Giang", "Bạc Liêu", "Cà Mau"]
};

async function run() {
  await dataSource.initialize();
  const cities = await dataSource.query('SELECT id, name FROM cities');
  
  for (const city of cities) {
    let area = null;
    for (const [r, list] of Object.entries(regions)) {
      if (list.includes(city.name) || list.some(c => city.name.includes(c) || c.includes(city.name))) {
        area = r;
        break;
      }
    }
    if (area) {
      await dataSource.query('UPDATE cities SET area = ? WHERE id = ?', [area, city.id]);
      console.log(`Updated ${city.name} -> ${area}`);
    } else {
      console.log(`No area found for ${city.name}`);
    }
  }

  await dataSource.destroy();
}
run();
