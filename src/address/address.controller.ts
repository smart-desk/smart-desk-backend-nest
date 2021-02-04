import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ACGuard, UseRoles } from 'nest-access-control';
import { ResourceEnum } from '../app/app.roles';
import { Address } from './entities/address.entity';
import { RequestWithUserPayload } from '../auth/jwt.strategy';
import { CreateAddressDto } from './dto/create-address.dto';

@Controller('address')
@ApiTags('Address')
export class AddressController {
    constructor(private addressService: AddressService) {}

    @Get()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.ADDRESS,
        action: 'read',
    })
    getByUserId(@Req() req: RequestWithUserPayload): Promise<Address> {
        return this.addressService.findByUserId(req.user.id);
    }

    @Put()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, ACGuard)
    @UseRoles({
        resource: ResourceEnum.ADDRESS,
        action: 'update',
    })
    createOrUpdateAddress(@Req() req: RequestWithUserPayload, @Body() body: CreateAddressDto): Promise<Address> {
        return this.addressService.createOrUpdate(req.user.id, body);
    }
}
