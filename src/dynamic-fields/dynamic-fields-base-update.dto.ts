import { IsNotEmpty, IsUUID } from 'class-validator';

export abstract class DynamicFieldsBaseUpdateDto {
    @IsUUID()
    @IsNotEmpty()
    id: string;

    @IsUUID()
    @IsNotEmpty()
    field_id: string;
}
