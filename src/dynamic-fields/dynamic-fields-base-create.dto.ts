import { IsNotEmpty, IsUUID } from 'class-validator';
import { Exclude } from 'class-transformer';

export class DynamicFieldsBaseCreateDto {
    // it's not exposed because value for this property is generated on backend side after creating Advert instance
    @Exclude()
    advert_id: string;

    @IsUUID()
    @IsNotEmpty()
    field_id: string;
}
