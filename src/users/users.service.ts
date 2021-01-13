import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

    async createUser(user: CreateUserDto): Promise<User> {
        const userEntity = this.userRepository.create(user);
        return this.userRepository.save(userEntity);
    }

    async fineAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async fineOne(id: string): Promise<User> {
        return this.userRepository.findOne({ id });
    }

    async findByEmail(email: string): Promise<User> {
        return this.userRepository.createQueryBuilder('user').where('user.email = :email', { email }).getOne();
    }

    async updateUser(id: string, data: UpdateUserDto): Promise<User> {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const updatedUser = await this.userRepository.preload({ id, ...data });
        return await this.userRepository.save(updatedUser);
    }
}
