import { MinLength } from 'class-validator';

export class ModelCreateDto {
    @MinLength(3)
    name: string;
}

export class ModelUpdateDto {
    @MinLength(3)
    name?: string;
}
