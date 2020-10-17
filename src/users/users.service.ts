import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { createQueryBuilder, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {
  }

  async createUser(user: UserDto): Promise<User> {
    return this.userRepository.create(user)
  }

  async fineOne(id: string): Promise<User> {
    return this.userRepository.findOne(id)
  }

  async findByEmail(email: string) {
    return this.userRepository.createQueryBuilder('user')
      .where('user.email = :email', { email })
      .getOne();
  }

}
