import { IsNotEmpty, IsUUID } from 'class-validator';
import { Userable } from './userable';

export class GetChatsDto extends Userable {
    @IsUUID()
    @IsNotEmpty()
    id: string;
}
