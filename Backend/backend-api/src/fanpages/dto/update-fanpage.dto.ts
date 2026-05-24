import { PartialType } from '@nestjs/swagger';
import { CreateFanpageDto } from './create-fanpage.dto';

export class UpdateFanpageDto extends PartialType(CreateFanpageDto) {}
