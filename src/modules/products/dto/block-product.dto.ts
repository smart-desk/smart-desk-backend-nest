import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class BlockProductDto {
    @IsString()
    @MaxLength(1000)
    @IsNotEmpty()
    reason: string;
}
