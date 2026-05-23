import { PartialType } from '@nestjs/swagger';
import { CreateSocialPostDto } from './create-social-post.dto';

export class UpdateSocialPostDto extends PartialType(CreateSocialPostDto) {}
