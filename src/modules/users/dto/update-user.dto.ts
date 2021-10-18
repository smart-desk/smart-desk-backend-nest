import { IsArray, IsEnum, IsOptional, IsPhoneNumber, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { ApiHideProperty } from '@nestjs/swagger';
import { NotificationTypes } from '../models/notification-types.enum';

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
    avatar?: string;

    @IsOptional()
    @MaxLength(255)
    @IsPhoneNumber('ZZ')
    phone?: string;

    // todo check that it's removed
    @ApiHideProperty()
    isPhoneVerified: boolean;

    @IsOptional()
    @IsArray()
    @IsEnum(NotificationTypes, { each: true })
    emailNotifications?: NotificationTypes[];
}
