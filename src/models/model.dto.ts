import { IsNotEmpty, MinLength } from 'class-validator';

export class ModelCreateDto {
    @MinLength(3)
    name: string;
}

export class ModelUpdateDto {
    @IsNotEmpty()
    id: string;

    @MinLength(3)
    name?: string;
}
