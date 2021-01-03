import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    @MinLength(1)
    firstName: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    @MinLength(1)
    lastName: string;
}
