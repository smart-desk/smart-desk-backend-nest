import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RequestWithUserPayload } from '../auth/jwt.strategy';
import { ResourceEnum, RolesEnum } from '../app/app.roles';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetProductsDto, GetProductsResponseDto } from './dto/get-products.dto';
import { BlockedUserGuard } from '../../guards/blocked-user.guard';
import { ProductStatus } from './models/product-status.enum';
import { User } from '../users/entities/user.entity';
import { StripeService } from '../stripe/stripe.service';
import { AdService } from '../ad/ad.service';
import { PromotionType } from '../promo/entities/promotion-type.enum';
import { OptionalJwtAuthGuard } from '../../guards/optional-jwt-auth.guard';

@Controller('products')
@ApiTags('Products')
export class ProductsController {
    constructor(private productsService: ProductsService, private stripeService: StripeService, private adService: AdService) {}

    @Get()
    @ApiBearerAuth('access-token')
    async getAll(@Query() options: GetProductsDto): Promise<GetProductsResponseDto> {
        return this.productsService.getAll(options);
    }

    @Get('/blocked')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.PRODUCT,
        action: 'read',
    })
    async getBlocked(@Req() req: RequestWithUserPayload, @Query() options: GetProductsDto): Promise<GetProductsResponseDto> {
        if (!this.isAdmin(req.user)) {
            options.user = req.user.id;
        }
        options.status = ProductStatus.BLOCKED;
        return this.productsService.getAll(options);
    }

    @Get('/pending')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.PRODUCT,
        action: 'read',
    })
    async getPending(@Req() req: RequestWithUserPayload, @Query() options: GetProductsDto): Promise<GetProductsResponseDto> {
        if (!this.isAdmin(req.user)) {
            options.user = req.user.id;
        }
        options.status = ProductStatus.PENDING;
        return this.productsService.getAll(options);
    }

    @Get('/completed')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.PRODUCT,
        action: 'read',
    })
    async getCompleted(@Req() req: RequestWithUserPayload, @Query() options: GetProductsDto): Promise<GetProductsResponseDto> {
        if (!this.isAdmin(req.user)) {
            options.user = req.user.id;
        }
        options.status = ProductStatus.COMPLETED;
        return this.productsService.getAll(options);
    }

    @Get('/my')
    @UseGuards(JwtAuthGuard, ACGuard)
    @ApiBearerAuth('access-token')
    @UseRoles({
        resource: ResourceEnum.PRODUCT,
        action: 'read',
    })
    getMy(@Req() req: RequestWithUserPayload, @Query() options: GetProductsDto): Promise<GetProductsResponseDto> {
        options.user = req.user.id;
        return this.productsService.getAll(options);
    }

    @Get('/category/:categoryId')
    @ApiBearerAuth('access-token')
    async getForCategory(
        @Param('categoryId', ParseUUIDPipe) categoryId: string,
        @Query() options: GetProductsDto
    ): Promise<GetProductsResponseDto> {
        return this.productsService.getForCategory(categoryId, options);
    }

    @Get(':id')
    @UseGuards(OptionalJwtAuthGuard)
    // todo add tests
    async getById(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<Product> {
        const isAdminOrOwner = await this.isAdminOrOwner(id, req.user);
        const product = await this.productsService.getById(id);
        if (isAdminOrOwner) {
            return product;
        }

        if (product.status === ProductStatus.PENDING || product.status === ProductStatus.BLOCKED) {
            throw new NotFoundException();
        }

        return product;
    }

    @Get(':id/recommended')
    @ApiBearerAuth('access-token')
    async getRecommended(@Param('id', ParseUUIDPipe) id: string): Promise<GetProductsResponseDto> {
        return this.productsService.getRecommendedById(id);
    }

    @Post()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.PRODUCT,
        action: 'create',
    })
    createProduct(@Body() body: CreateProductDto, @Req() req: RequestWithUserPayload): Promise<Product> {
        return this.productsService.create(req.user.id, body);
    }

    @Patch(':id')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.PRODUCT,
        action: 'update',
    })
    async updateProduct(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: UpdateProductDto,
        @Req() req: RequestWithUserPayload
    ): Promise<Product> {
        const isAdminOrOwner = await this.isAdminOrOwner(id, req.user);
        if (!isAdminOrOwner) throw new ForbiddenException();
        return this.productsService.update(id, body);
    }

    @Post(':id/view')
    @HttpCode(HttpStatus.OK)
    async countView(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
        return this.productsService.countView(id);
    }

    @Patch(':id/block')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.PRODUCT,
        action: 'update',
    })
    async blockProduct(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<Product> {
        const isAdmin = await this.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException();
        return this.productsService.block(id);
    }

    @Patch(':id/publish')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.PRODUCT,
        action: 'update',
    })
    async publishProduct(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<Product> {
        const isAdmin = await this.isAdmin(req.user);
        if (!isAdmin) throw new ForbiddenException();
        return this.productsService.publish(id);
    }

    @Patch(':id/complete')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.PRODUCT,
        action: 'update',
    })
    async completeProduct(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<Product> {
        const isAdminOrOwner = await this.isAdminOrOwner(id, req.user);
        if (!isAdminOrOwner) throw new ForbiddenException();
        return this.productsService.complete(id);
    }

    @Delete(':id')
    @ApiBearerAuth('access-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.PRODUCT,
        action: 'delete',
    })
    async deleteProduct(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<Product> {
        const isAdminOrOwner = await this.isAdminOrOwner(id, req.user);
        if (!isAdminOrOwner) throw new ForbiddenException();
        return await this.productsService.delete(id);
    }

    @Post(':id/lift')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.PRODUCT,
        action: 'update',
    })
    @HttpCode(HttpStatus.OK)
    async liftProduct(@Param('id', ParseUUIDPipe) id: string, @Req() req: RequestWithUserPayload): Promise<{ id: string }> {
        const isOwner = await this.isOwner(id, req.user);
        if (!isOwner) throw new ForbiddenException();

        const adConfig = await this.adService.getAdConfig();
        if (!adConfig || !adConfig.liftRate) throw new BadRequestException('No configuration for this action');

        const product = await this.productsService.getById(id, false);
        if (product.status !== ProductStatus.ACTIVE) throw new BadRequestException('Product must be published');

        return this.stripeService.createPaymentSession({
            payment_method_types: ['card'],
            payment_intent_data: {
                metadata: {
                    product: product.id,
                    type: PromotionType.LIFTING,
                },
            },
            line_items: [
                {
                    price_data: {
                        currency: 'rub', // todo site currency
                        product_data: {
                            name: `Поднятие "${product.title}"`,
                        },
                        unit_amount: Number.parseFloat(adConfig.liftRate.toString()) * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.HOST}/profile`, // todo correct url
            cancel_url: `${process.env.HOST}/profile`, // todo correct url
        });
    }

    private async isAdminOrOwner(productId: string, user: User): Promise<boolean> {
        const isOwner = await this.isOwner(productId, user);
        const isAdmin = this.isAdmin(user);
        return isOwner || isAdmin;
    }

    private async isOwner(productId: string, user: User): Promise<boolean> {
        if (!user) {
            return false;
        }
        const owner = await this.productsService.getProductOwner(productId);
        return owner === user.id;
    }

    private isAdmin(user: User): boolean {
        return user.roles && user.roles.some(role => role === RolesEnum.ADMIN);
    }
}
