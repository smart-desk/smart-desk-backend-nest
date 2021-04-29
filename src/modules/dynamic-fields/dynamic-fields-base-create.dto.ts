import { IsNotEmpty, IsUUID } from 'class-validator';

export abstract class DynamicFieldsBaseCreateDto {
    // it's not exposed because value for this property is generated on backend side after creating Advert instance
    advert_id: string;

    @IsUUID()
    @IsNotEmpty()
    field_id: string;
}
