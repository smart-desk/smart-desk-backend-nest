import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address.entity';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressService {
    constructor(@InjectRepository(Address) private addressRepository: Repository<Address>) {}

    async findByUserId(userId: string): Promise<Address> {
        return this.addressRepository.findOne({ userId });
    }

    async createOrUpdate(userId: string, body: CreateAddressDto): Promise<Address> {
        return this.addressRepository.save({ userId, ...body });
    }
}
