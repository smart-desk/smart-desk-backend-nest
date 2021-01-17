import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesEnum } from '../app/app.roles';
import { UserStatus } from './user-status.enum';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    async createUser(user: CreateUserDto): Promise<User> {
        const userEntity = this.userRepository.create(user);
        return this.userRepository.save(userEntity);
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findOne(id: string): Promise<User> {
        return this.userRepository.findOne({ id });
    }

    async findByEmail(email: string): Promise<User> {
        return this.userRepository.createQueryBuilder('user').where('user.email = :email', { email }).getOne();
    }

    async updateUserRoles(id: string, roles: RolesEnum[]): Promise<User> {
        const user = await this.findOneOrThrowException(id);
        user.roles = roles;
        const updatedUser = await this.userRepository.preload({ id, ...user });
        return await this.userRepository.save(updatedUser);
    }

    async updateUser(id: string, data: UpdateUserDto): Promise<User> {
        await this.findOneOrThrowException(id);
        const updatedUser = await this.userRepository.preload({ id, ...data });
        return await this.userRepository.save(updatedUser);
    }

    async isUserBlocked(id: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ id });
        return user.status === UserStatus.BLOCKED;
    }

    async blockUser(id: string): Promise<User> {
        const user = await this.findOneOrThrowException(id);
        user.status = UserStatus.BLOCKED;
        user.roles = [RolesEnum.USER];
        const updatedUser = await this.userRepository.preload({ id, ...user });
        return await this.userRepository.save(updatedUser);
    }

    private async findOneOrThrowException(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
}
