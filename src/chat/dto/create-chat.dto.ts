import { IsNotEmpty, IsUUID } from 'class-validator';
import { Exclude } from 'class-transformer';
import { Userable } from './userable';

export class CreateChatDto extends Userable {
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @IsUUID()
    @IsNotEmpty()
    advertId: string;

    @Exclude()
    user1: string;

    @Exclude()
    user2: string;
}
