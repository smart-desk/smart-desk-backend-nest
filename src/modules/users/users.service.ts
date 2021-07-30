import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesEnum } from '../app/app.roles';
import { UserStatus } from './models/user-status.enum';
import { NotificationTypes } from './models/notification-types.enum';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @Inject(forwardRef(() => MailService))
        private mailService: MailService
    ) {}

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

    async findByVkId(id: string): Promise<User> {
        return this.userRepository.createQueryBuilder('user').where('user.vk_id = :id', { id }).getOne();
    }

    async findByFacebookId(id: string): Promise<User> {
        return this.userRepository.createQueryBuilder('user').where('user.facebook_id = :id', { id }).getOne();
    }

    async updateUserRoles(id: string, roles: RolesEnum[]): Promise<User> {
        const user = await this.findOneOrThrowException(id);
        user.roles = roles;
        const updatedUser = await this.userRepository.preload({ id, ...user });
        return await this.userRepository.save(updatedUser);
    }

    async updateUser(id: string, data: UpdateUserDto): Promise<User> {
        const user = await this.findOneOrThrowException(id);

        if (data.phone && data.phone !== user.phone && user.isPhoneVerified) {
            data.isPhoneVerified = false;
        }

        const updatedUser = await this.userRepository.preload({ id, ...data });

        return await this.userRepository.save(updatedUser);
    }

    async isUserBlocked(id: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ id });
        return user.status === UserStatus.BLOCKED;
    }

    async blockUser(id: string, block: boolean): Promise<User> {
        const user = await this.findOneOrThrowException(id);

        if (block) {
            user.status = UserStatus.BLOCKED;
            user.roles = [RolesEnum.USER];
        } else {
            user.status = UserStatus.ACTIVE;
        }

        const updatedUser = await this.userRepository.preload({ id, ...user });
        const resultUpdatedUser = await this.userRepository.save(updatedUser);

        if (resultUpdatedUser.status === UserStatus.BLOCKED) {
            await this.mailService.sendMessageToUser(
                user.id,
                'Вы были заблокированы на сайте Smart Desk',
                'Вы были заблокированы на сайте Smart Desk',
                NotificationTypes.USER_BLOCKED
            );
        } else if (resultUpdatedUser.status === UserStatus.ACTIVE) {
            await this.mailService.sendMessageToUser(
                user.id,
                'Вы были разблокированы на сайте Smart Desk',
                'Вы были разблокированы на сайте Smart Desk',
                NotificationTypes.USER_UNBLOCKED
            );
        }
        return resultUpdatedUser;
    }

    async findOneOrThrowException(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ id });
        if (!user) {
            throw new NotFoundException(`User ${id} not found`);
        }
        return user;
    }
}
