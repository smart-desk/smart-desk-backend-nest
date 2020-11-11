import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFieldDataBaseDto {
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
