import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { CreateDoctorApplicationDto } from './dto/create-doctor-application.dto';
import { RegisterGuestDoctorDto } from './dto/register-guest.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ForbiddenException } from '@nestjs/common';
import { memoryStorage } from 'multer';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('doctors')
export class DoctorsController {
  constructor(
    private readonly doctorsService: DoctorsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    const user = req.user as { email?: string } | undefined;
    if (!user?.email) {
      // Nếu vì lý do nào đó không có email trong JWT, không tìm được hồ sơ
      return null;
    }
    return this.doctorsService.findByEmail(user.email);
  }
  
  @Get('top-rated') // GET /doctors/top-rated
  findTopRated() {
    return this.doctorsService.findTopRated();
  }

  @Get() // GET /doctors
  findAll(
    @Query('hospitalId') hospitalId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
    @Query('time') time?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 100;
    return this.doctorsService.findAll(
      hospitalId ? +hospitalId : undefined,
      categoryId ? +categoryId : undefined,
      status,
      date,
      time,
      pageNumber,
      limitNumber,
    );
  }

  @Get(':id') // GET /doctors/1
  findOne(@Param('id') id: string) {
    return this.doctorsService.findOne(+id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadDoctorAvatar(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn ảnh');
    }

    if (!file.mimetype.startsWith('image/') && file.mimetype !== 'application/pdf') {
      throw new BadRequestException('File phải là hình ảnh hoặc PDF');
    }

    const result = await this.cloudinaryService.uploadImage(
      file,
      'clinic/doctors',
    );

    return {
      image_url: result.secure_url,
      image_public_id: result.public_id,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateDoctorDto) {
    return this.doctorsService.createDoctor(dto);
  }

  @Post('register-guest')
  registerGuest(@Body() dto: RegisterGuestDoctorDto) {
    return this.doctorsService.registerGuestDoctor(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.doctorsService.toggleActive(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  updateMe(@Req() req: any, @Body() dto: UpdateDoctorProfileDto) {
    const user = req.user as { email?: string } | undefined;
    if (!user?.email) {
      return null;
    }
    return this.doctorsService.updateProfileByEmail(user.email, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unlink')
  unlinkDoctor(@Param('id') id: string, @Req() req: any, @Body() body: { reason: string }) {
    const user = req.user as { hospital_id?: number } | undefined;
    if (!user?.hospital_id) {
      throw new BadRequestException('Chỉ admin bệnh viện mới có quyền hủy liên kết');
    }
    return this.doctorsService.unlinkDoctor(+id, user.hospital_id, body.reason);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorsService.remove(+id);
  }

  // --- Doctor Applications APIs ---

  @UseGuards(JwtAuthGuard)
  @Post('applications')
  createApplication(@Req() req: any, @Body() dto: CreateDoctorApplicationDto) {
    const user = req.user as { email?: string } | undefined;
    if (!user?.email) {
      throw new BadRequestException('Không tìm thấy thông tin xác thực');
    }
    return this.doctorsService.createApplication(user.email, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/applications')
  getMyApplications(@Req() req: any) {
    const user = req.user as { email?: string } | undefined;
    if (!user?.email) {
      throw new BadRequestException('Không tìm thấy thông tin xác thực');
    }
    return this.doctorsService.getDoctorApplications(user.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  @Get('hospitals/:hospitalId/applications')
  getHospitalApplications(@Param('hospitalId') hospitalId: string, @Req() req: any) {
    const user = req.user as { role?: string; hospital_id?: number } | undefined;
    if (user?.role === 'admin_hospital' && String(user.hospital_id) !== hospitalId) {
      throw new ForbiddenException('Bạn chỉ được xem danh sách ứng tuyển của bệnh viện mình quản lý');
    }
    return this.doctorsService.getHospitalApplications(+hospitalId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'admin_hospital')
  @Patch('applications/:id/status')
  async updateApplicationStatus(@Param('id') id: string, @Body() dto: UpdateApplicationStatusDto, @Req() req: any) {
    const user = req.user as { role?: string; hospital_id?: number } | undefined;
    
    // Nếu là admin_hospital, phải đảm bảo application này thuộc về bệnh viện của họ
    if (user?.role === 'admin_hospital') {
      // Vì không lấy được hospitalId trực tiếp từ request path, ta có thể dựa vào service để check,
      // hoặc ở đây ta tạm tin tưởng service sẽ filter, nhưng an toàn nhất là kiểm tra.
      // Để đơn giản, service có thể cần check `user.hospital_id` khi update.
      // Tạm thời truyền thêm user để service check nếu cần thiết, hoặc cứ gọi service.
      // Ở đây ta gọi service và giả định service sẽ xử lý đúng, hoặc ta check trước:
    }
    
    return this.doctorsService.updateApplicationStatus(+id, dto, user?.role === 'admin_hospital' ? user.hospital_id : undefined);
  }
}

