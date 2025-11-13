// Đây là file để validate body của /verify-reset
export class VerifyResetDto {
  email: string;
  otp: string;
  newPassword: string;
}
