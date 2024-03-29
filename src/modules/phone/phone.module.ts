import { forwardRef, Module } from '@nestjs/common';
import { PhoneController } from './phone.controller';
import { PhoneService } from './phone.service';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    controllers: [PhoneController],
    providers: [PhoneService],
    imports: [forwardRef(() => UsersModule), ConfigModule],
})
export class PhoneModule {}
