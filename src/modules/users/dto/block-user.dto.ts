import { IsBoolean, IsDefined } from 'class-validator';

export class BlockUserDto {
    @IsDefined()
    @IsBoolean()
    value: boolean;
}
