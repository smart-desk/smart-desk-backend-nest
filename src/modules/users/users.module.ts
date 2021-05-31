import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { AdvertsModule } from '../adverts/adverts.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AdvertsModule), MailModule],
    providers: [UsersService],
    exports: [UsersService],
    controllers: [UsersController],
})
export class UsersModule {}
