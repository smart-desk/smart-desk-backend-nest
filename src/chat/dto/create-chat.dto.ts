import { IsNotEmpty, IsUUID } from 'class-validator';
import { Exclude } from 'class-transformer';

export class CreateChatDto {
    @IsUUID()
    @IsNotEmpty()
    advertId: string;

    @Exclude()
    user1: string;

    @Exclude()
    user2: string;
}
