import { Body, Controller, ForbiddenException, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { BlockedUserGuard } from '../../guards/blocked-user.guard';
import { ResourceEnum, RolesEnum } from '../app/app.roles';
import { RequestWithUserPayload } from '../auth/jwt.strategy';
import { ProductsService } from '../products/products.service';
import { PayPromoDto } from './dto/pay-promo.dto';
import { User } from '../users/entities/user.entity';
import { PromoSetService } from './promo-set.service';
import { StripeService } from '../stripe/stripe.service';
import { PromotionType } from './entities/promotion-type.enum';

@Controller('promo')
export class PromoController {
    constructor(private productsService: ProductsService, private promoSetService: PromoSetService, private stripeService: StripeService) {}

    @Post()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard, BlockedUserGuard)
    @UseRoles({
        resource: ResourceEnum.PROMO,
        action: 'update',
    })
    @HttpCode(HttpStatus.OK)
    async payPromo(@Body() body: PayPromoDto, @Req() req: RequestWithUserPayload): Promise<{ id: string }> {
        const isAdminOrOwner = await this.isAdminOrOwner(body.productId, req.user);
        if (!isAdminOrOwner) throw new ForbiddenException();

        const product = await this.productsService.getById(body.productId, false);
        const promoSet = await this.promoSetService.getById(body.promoSetId);
        return this.stripeService.createPaymentSession({
            payment_method_types: ['card'],
            payment_intent_data: {
                metadata: {
                    product: product.id,
                    promoSet: promoSet.id,
                    type: PromotionType.PROMOTION,
                },
            },
            line_items: [
                {
                    price_data: {
                        currency: 'rub', // todo site currency
                        product_data: {
                            name: `Продвижение "${product.title}" по тарифу ${promoSet.name}`,
                        },
                        unit_amount: Number.parseFloat(promoSet.price.toString()) * 100,
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
        const owner = await this.productsService.getProductOwner(productId);
        return owner === user.id;
    }

    private isAdmin(user: User): boolean {
        return user.roles && user.roles.some(role => role === RolesEnum.ADMIN);
    }
}
