import { IsEmail, IsNotEmpty, IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class CreateHospitalRegistrationDto {
  @IsEmail()
  @IsNotEmpty()
  admin_email: string;

  @IsOptional()
  @IsString()
  admin_name?: string;

  @IsOptional()
  @IsString()
  admin_phone?: string;

  @IsOptional()
  @IsString()
  admin_role?: string;
}

export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  admin_email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class SubmitHospitalRegistrationDto {
  @IsEmail()
  @IsNotEmpty()
  admin_email: string;

  @IsOptional() @IsString() admin_name?: string;
  @IsOptional() @IsString() admin_phone?: string;
  @IsOptional() @IsString() admin_role?: string;

  @IsOptional() @IsString() hospital_name?: string;
  @IsOptional() @IsString() hospital_type?: string;
  @IsOptional() @IsString() business_license_number?: string;
  @IsOptional() @IsString() scale?: string;
  @IsOptional() @IsNumber() founded_year?: number;
  @IsOptional() @IsString() logo_url?: string;

  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() province?: string;
  @IsOptional() @IsString() district?: string;
  @IsOptional() @IsString() ward?: string;
  @IsOptional() @IsString() address_proof_url?: string;
  @IsOptional() @IsString() hotline?: string;
  @IsOptional() @IsString() contact_email?: string;
  @IsOptional() @IsString() open_hours?: string;

  @IsOptional() @IsString() operating_license_url?: string;
  @IsOptional() @IsString() business_license_url?: string;
  @IsOptional() @IsString() quality_certificate_url?: string;
  @IsOptional() @IsString() health_department_doc_url?: string;

  @IsOptional() @IsNumber() doctor_count?: number;
  @IsOptional() @IsString() main_specialty?: string;
  @IsOptional() @IsString() key_doctors_list?: string;

  @IsOptional() @IsNumber() platform_fee?: number;
  @IsOptional() @IsNumber() commission_rate?: number;
  @IsOptional() @IsBoolean() accepts_online_payment?: boolean;
  @IsOptional() @IsString() payment_methods?: string;
  @IsOptional() @IsString() cancellation_policy?: string;
  @IsOptional() @IsString() refund_time?: string;
}
