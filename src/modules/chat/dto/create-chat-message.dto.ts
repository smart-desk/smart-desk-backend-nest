import { ChatBaseEventDto } from './chat-base-event.dto';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Exclude } from 'class-transformer';

export class CreateChatMessageDto extends ChatBaseEventDto {
    @Exclude()
    userId: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    content: string;
}
