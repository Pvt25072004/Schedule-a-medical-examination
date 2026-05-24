import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSocialCommentDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
