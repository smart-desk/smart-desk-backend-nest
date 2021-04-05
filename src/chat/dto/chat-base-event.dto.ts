import { User } from '../../users/entities/user.entity';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { Exclude } from 'class-transformer';

export class ChatBaseEventDto {
    @Exclude()
    user: User;

    @IsUUID()
    @IsNotEmpty()
    chatId: string;
}
