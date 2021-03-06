import { IsString, Length } from 'class-validator';

export class PhoneVerifyCheckDto {
    @IsString()
    requestId: string;

    @IsString()
    @Length(4, 4)
    code: string;
}
