import { RolesEnum } from '../../app/app.roles';
import { IsArray, IsDefined, IsEnum } from 'class-validator';

export class UpdateUserRolesDto {
    @IsDefined()
    @IsArray()
    @IsEnum(RolesEnum, { each: true })
    roles: RolesEnum[];
}
