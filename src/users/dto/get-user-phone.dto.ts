import { IsNotEmpty, IsUUID } from 'class-validator';

export class GetUserPhoneDto {
    @IsUUID()
    @IsNotEmpty()
    advert: string;
}
