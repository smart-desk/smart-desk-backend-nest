import { IsNotEmpty, IsUUID } from 'class-validator';

export abstract class DynamicFieldsBaseCreateDto {
    // it's not exposed because value for this property is generated on backend side after creating Product instance
    productId: string;

    @IsUUID()
    @IsNotEmpty()
    fieldId: string;
}
