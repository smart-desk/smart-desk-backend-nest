import { Advert } from '../entities/advert.entity';
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, IsUUID, Max, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class InputTextCreateDto {
    @IsUUID()
    @IsNotEmpty()
    field_id: string;

    @IsString()
    @MaxLength(255)
    @IsNotEmpty()
    value: string;
}
