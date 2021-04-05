import { ChatBaseEventDto } from './chat-base-event.dto';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ChatMessageDto extends ChatBaseEventDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    message: string;
}
