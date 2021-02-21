import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressService {
    constructor(@InjectRepository(Address) private addressRepository: Repository<Address>) {}

    async findByUserId(userId: string): Promise<Address> {
        return this.addressRepository.findOne({ userId });
    }

    async createOrUpdate(userId: string, body: CreateAddressDto): Promise<Address> {
        const address = await this.addressRepository.findOne({ userId });
        if (address) {
            return this.addressRepository.save({ id: address.id, userId, ...body });
        }
        return this.addressRepository.save({ userId, ...body });
    }
}
