import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Hospital } from './hospitals/entities/hospital.entity';
import { Fanpage } from './fanpages/entities/fanpage.entity';
import { Post } from './posts/entities/post.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const hospitalRepo = app.get<Repository<Hospital>>(getRepositoryToken(Hospital));
  const fanpageRepo = app.get<Repository<Fanpage>>(getRepositoryToken(Fanpage));
  const postRepo = app.get<Repository<Post>>(getRepositoryToken(Post));

  console.log('Seeding data...');

  const hospitalsData = [
    {
      name: 'Bệnh viện Chợ Rẫy',
      address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5',
      city: 'TP. Hồ Chí Minh',
      phone: '02838554137',
      email: 'bvchoray@hcm.vnn.vn',
      followers: 125000,
      avatar: 'https://cdn.bookingcare.vn/fo/2023/11/02/134537-benh-vien-cho-ray.jpg',
    },
    {
      name: 'Bệnh viện Bạch Mai',
      address: '78 Đường Giải Phóng, Phương Mai, Đống Đa',
      city: 'Hà Nội',
      phone: '02438693731',
      email: 'bachmai@hn.vnn.vn',
      followers: 180000,
      avatar: 'https://cdn.bookingcare.vn/fo/2023/11/02/135607-benh-vien-bach-mai.jpg',
    },
    {
      name: 'Bệnh viện Nhi đồng 1',
      address: '341 Sư Vạn Hạnh, Phường 10, Quận 10',
      city: 'TP. Hồ Chí Minh',
      phone: '02839271119',
      email: 'nhidong1@nhidong.org.vn',
      followers: 95000,
      avatar: 'https://cdn.bookingcare.vn/fo/2023/11/02/135634-benh-vien-nhi-dong-1.jpg',
    },
    {
      name: 'Bệnh viện Đại học Y Dược',
      address: '215 Hồng Bàng, Phường 11, Quận 5',
      city: 'TP. Hồ Chí Minh',
      phone: '02838554269',
      email: 'bvdhyd@umc.edu.vn',
      followers: 72000,
      avatar: 'https://cdn.bookingcare.vn/fo/2023/11/02/135706-benh-vien-dai-hoc-y-duoc.jpg',
    },
    {
      name: 'Bệnh viện Thống Nhất',
      address: '1 Lý Thường Kiệt, Phường 7, Tân Bình',
      city: 'TP. Hồ Chí Minh',
      phone: '02838690277',
      email: 'thongnhat@vnn.vn',
      followers: 68000,
      avatar: 'https://cdn.bookingcare.vn/fo/2023/11/02/135728-benh-vien-thong-nhat.jpg',
    }
  ];

  for (const hData of hospitalsData) {
    // 1. Check if hospital exists
    let hospital = await hospitalRepo.findOne({ where: { name: hData.name } });
    if (!hospital) {
      hospital = hospitalRepo.create({
        name: hData.name,
        address: hData.address,
        city: hData.city,
        phone: hData.phone,
        email: hData.email,
        is_active: true,
      });
      await hospitalRepo.save(hospital);
      console.log(`Created hospital: ${hospital.name}`);
    }

    // 2. Check if fanpage exists
    let fanpage = await fanpageRepo.findOne({ where: { hospital_id: hospital.id } });
    if (!fanpage) {
      fanpage = fanpageRepo.create({
        hospital_id: hospital.id,
        description: `Fanpage chính thức của ${hospital.name}`,
        avatar_url: hData.avatar,
        cover_image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop',
        follower_count: hData.followers,
      });
      await fanpageRepo.save(fanpage);
      console.log(`Created fanpage for: ${hospital.name}`);

      // 3. Create dummy posts for this fanpage
      if (hospital.name === 'Bệnh viện Chợ Rẫy') {
        const post = postRepo.create({
          fanpage_id: fanpage.id,
          title: 'Thông báo triển khai kỹ thuật mới',
          content: '🚨 Thông báo: Khoa Tim mạch đã triển khai thành công kỹ thuật can thiệp mạch vành qua đường quay mới nhất. Kỹ thuật này giúp giảm biến chứng và thời gian hồi phục cho bệnh nhân.\n\n#TimMạch #YHọc #ChợRẫy',
          image_url: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2000&auto=format&fit=crop',
          likes_count: 345,
        });
        await postRepo.save(post);
        console.log('Created post for Chợ Rẫy');
      }
    }
  }

  console.log('Seeding completed!');
  await app.close();
}

bootstrap().catch(console.error);
