import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFieldDataBaseDto {
    // it's not exposed because value for this property is generated on backend side after creating Advert instance
    advert_id: string;

    @IsUUID()
    @IsNotEmpty()
    field_id: string;
}

export class UpdateFieldDataBaseDto {
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @IsUUID()
    @IsNotEmpty()
    field_id: string;
}
