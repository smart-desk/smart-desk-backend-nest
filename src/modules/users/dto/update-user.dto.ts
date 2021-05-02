import { IsOptional, IsPhoneNumber, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';
import { IsImageUrl } from '../../../utils/validation';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MaxLength(255)
    @MinLength(1)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    @MinLength(1)
    lastName?: string;

    @IsOptional()
    @MaxLength(1000)
    @IsString()
    @IsUrl()
    @IsImageUrl()
    avatar?: string;

    @IsOptional()
    @MaxLength(255)
    @IsPhoneNumber('ZZ')
    phone?: string;

    @ApiHideProperty()
    isPhoneVerified: boolean;
}
