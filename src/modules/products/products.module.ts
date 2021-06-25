import { forwardRef, Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { FieldsModule } from '../fields/fields.module';
import { DynamicFieldsModule } from '../dynamic-fields/dynamic-fields.module';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Product]),
        FieldsModule,
        DynamicFieldsModule,
        forwardRef(() => UsersModule),
        forwardRef(() => MailModule),
    ],
    providers: [ProductsService],
    controllers: [ProductsController],
    exports: [ProductsService],
})
export class ProductsModule {}
