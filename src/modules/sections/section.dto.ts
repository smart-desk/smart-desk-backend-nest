import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { SectionType } from './section.entity';

export class SectionCreateDto {
    @IsNotEmpty()
    @IsEnum(SectionType)
    type: SectionType;

    @IsNotEmpty()
    @IsUUID()
    model_id: string;
}
