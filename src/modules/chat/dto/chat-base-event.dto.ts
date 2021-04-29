import { IsNotEmpty, IsUUID } from 'class-validator';
import { Userable } from './userable';

export class ChatBaseEventDto extends Userable {
    @IsUUID()
    @IsNotEmpty()
    chatId: string;
}
