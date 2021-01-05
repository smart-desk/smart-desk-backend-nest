import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { IsImageUrl } from '../../utils/validation';

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

    @IsOptional()
    @MaxLength(1000)
    @IsString()
    @IsUrl()
    @IsImageUrl()
    avatar: string;
}