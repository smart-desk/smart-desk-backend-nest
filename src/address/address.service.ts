import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './address.entity';

@Injectable()
export class AddressService {
    constructor(@InjectRepository(Address) private addressRepository: Repository<Address>) {}

    async findByUserId(userId: string): Promise<Address> {
        return this.addressRepository.findOne({ userId });
    }
}
