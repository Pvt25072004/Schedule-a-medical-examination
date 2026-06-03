import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) { }

  async findAll() {
    return this.cityRepository.find({
      order: { area: 'ASC', name: 'ASC' }
    });
  }

  async seedCities() {
    const count = await this.cityRepository.count();
    if (count > 0) {
      return { message: 'Cities already seeded', count };
    }

    const citiesData = [
      // Miền Bắc
      { name: 'Hà Nội', code: 'HN', area: 'Miền Bắc' },
      { name: 'Hải Phòng', code: 'HP', area: 'Miền Bắc' },
      { name: 'Bắc Ninh', code: 'BN', area: 'Miền Bắc' },
      { name: 'Quảng Ninh', code: 'QN', area: 'Miền Bắc' },
      { name: 'Hải Dương', code: 'HD', area: 'Miền Bắc' },
      { name: 'Hưng Yên', code: 'HY', area: 'Miền Bắc' },
      { name: 'Vĩnh Phúc', code: 'VP', area: 'Miền Bắc' },
      { name: 'Thái Nguyên', code: 'TN', area: 'Miền Bắc' },
      { name: 'Bắc Giang', code: 'BG', area: 'Miền Bắc' },
      { name: 'Phú Thọ', code: 'PT', area: 'Miền Bắc' },
      { name: 'Hà Nam', code: 'HNA', area: 'Miền Bắc' },
      { name: 'Nam Định', code: 'ND', area: 'Miền Bắc' },
      { name: 'Thái Bình', code: 'TB', area: 'Miền Bắc' },
      { name: 'Ninh Bình', code: 'NB', area: 'Miền Bắc' },
      { name: 'Hòa Bình', code: 'HB', area: 'Miền Bắc' },
      { name: 'Sơn La', code: 'SL', area: 'Miền Bắc' },
      { name: 'Điện Biên', code: 'DB', area: 'Miền Bắc' },
      { name: 'Lai Châu', code: 'LC', area: 'Miền Bắc' },
      { name: 'Lào Cai', code: 'LCA', area: 'Miền Bắc' },
      { name: 'Yên Bái', code: 'YB', area: 'Miền Bắc' },
      { name: 'Tuyên Quang', code: 'TQ', area: 'Miền Bắc' },
      { name: 'Hà Giang', code: 'HG', area: 'Miền Bắc' },
      { name: 'Cao Bằng', code: 'CB', area: 'Miền Bắc' },
      { name: 'Bắc Kạn', code: 'BK', area: 'Miền Bắc' },
      { name: 'Lạng Sơn', code: 'LS', area: 'Miền Bắc' },

      // Miền Trung
      { name: 'Thanh Hóa', code: 'TH', area: 'Miền Trung' },
      { name: 'Nghệ An', code: 'NA', area: 'Miền Trung' },
      { name: 'Hà Tĩnh', code: 'HT', area: 'Miền Trung' },
      { name: 'Quảng Bình', code: 'QB', area: 'Miền Trung' },
      { name: 'Quảng Trị', code: 'QT', area: 'Miền Trung' },
      { name: 'Thừa Thiên Huế', code: 'TTH', area: 'Miền Trung' },
      { name: 'Đà Nẵng', code: 'DN', area: 'Miền Trung' },
      { name: 'Quảng Nam', code: 'QNA', area: 'Miền Trung' },
      { name: 'Quảng Ngãi', code: 'QNG', area: 'Miền Trung' },
      { name: 'Bình Định', code: 'BDI', area: 'Miền Trung' },
      { name: 'Phú Yên', code: 'PY', area: 'Miền Trung' },
      { name: 'Khánh Hòa', code: 'KH', area: 'Miền Trung' },
      { name: 'Ninh Thuận', code: 'NT', area: 'Miền Trung' },
      { name: 'Bình Thuận', code: 'BTH', area: 'Miền Trung' },
      { name: 'Kon Tum', code: 'KT', area: 'Miền Trung' },
      { name: 'Gia Lai', code: 'GL', area: 'Miền Trung' },
      { name: 'Đắk Lắk', code: 'DL', area: 'Miền Trung' },
      { name: 'Đắk Nông', code: 'DNO', area: 'Miền Trung' },
      { name: 'Lâm Đồng', code: 'LD', area: 'Miền Trung' },

      // Miền Nam
      { name: 'TP. Hồ Chí Minh', code: 'HCM', area: 'Miền Nam' },
      { name: 'Đồng Nai', code: 'DNA', area: 'Miền Nam' },
      { name: 'Bình Dương', code: 'BD', area: 'Miền Nam' },
      { name: 'Bà Rịa - Vũng Tàu', code: 'BRVT', area: 'Miền Nam' },
      { name: 'Tây Ninh', code: 'TNI', area: 'Miền Nam' },
      { name: 'Bình Phước', code: 'BP', area: 'Miền Nam' },
      { name: 'Long An', code: 'LA', area: 'Miền Nam' },
      { name: 'Tiền Giang', code: 'TG', area: 'Miền Nam' },
      { name: 'Bến Tre', code: 'BTR', area: 'Miền Nam' },
      { name: 'Đồng Tháp', code: 'DT', area: 'Miền Nam' },
      { name: 'Vĩnh Long', code: 'VL', area: 'Miền Nam' },
      { name: 'Trà Vinh', code: 'TV', area: 'Miền Nam' },
      { name: 'Cần Thơ', code: 'CT', area: 'Miền Nam' },
      { name: 'Hậu Giang', code: 'HGI', area: 'Miền Nam' },
      { name: 'Sóc Trăng', code: 'ST', area: 'Miền Nam' },
      { name: 'Kiên Giang', code: 'KG', area: 'Miền Nam' },
      { name: 'An Giang', code: 'AG', area: 'Miền Nam' },
      { name: 'Bạc Liêu', code: 'BL', area: 'Miền Nam' },
      { name: 'Cà Mau', code: 'CM', area: 'Miền Nam' },
    ];

    const entities = this.cityRepository.create(citiesData);
    await this.cityRepository.save(entities);

    return { message: 'Seeded successfully', count: citiesData.length };
  }
}
