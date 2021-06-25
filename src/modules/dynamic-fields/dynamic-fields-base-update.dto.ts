import { IsNotEmpty, IsUUID } from 'class-validator';

export abstract class DynamicFieldsBaseUpdateDto {
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @IsUUID()
    @IsNotEmpty()
    fieldId: string;
}
