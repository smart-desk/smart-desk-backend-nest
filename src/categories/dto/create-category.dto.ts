import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCategoryDto {
    @IsUUID()
    modelId: string;

    @IsUUID()
    @IsOptional()
    parentId: string;

    @IsString()
    name: string;
}
