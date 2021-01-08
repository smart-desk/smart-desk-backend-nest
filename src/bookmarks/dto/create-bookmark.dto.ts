import { IsDefined, IsUUID } from 'class-validator';

export class CreateBookmarkDto {
    @IsUUID()
    @IsDefined()
    advertId: string;
}
