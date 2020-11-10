import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFieldDataBaseDto {
    advert_id: string;

    @IsUUID()
    @IsNotEmpty()
    field_id: string;

    value: any;
}
