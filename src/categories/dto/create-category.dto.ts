import { IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    modelId: string;

    @IsString()
    parentId: string;

    @IsString()
    name: string;
}
