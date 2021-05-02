import { Exclude } from 'class-transformer';
import { User } from '../../users/entities/user.entity';

export class Userable {
    @Exclude()
    user: User;
}
