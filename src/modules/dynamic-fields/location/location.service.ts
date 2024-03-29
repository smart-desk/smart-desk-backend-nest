import { Injectable } from '@nestjs/common';
import { BaseFieldService } from '../base-field.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationEntity } from './location.entity';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationParamsDto } from './dto/location-params.dto';
import { LocationFilterDto } from './dto/location-filter.dto';

@Injectable()
export class LocationService extends BaseFieldService {
    constructor(@InjectRepository(LocationEntity) protected repository: Repository<LocationEntity>) {
        super(repository, LocationEntity, CreateLocationDto, UpdateLocationDto, LocationParamsDto);
    }

    async getProductIdsByFilter(fieldId: string, params: LocationFilterDto): Promise<string[]> {
        const result = await this.repository
            .createQueryBuilder()
            .where({
                fieldId,
            })
            .getMany();

        return result.filter(field => this.withinRadius(field, params)).map(r => r.productId);
    }

    private withinRadius(field: LocationEntity, params: LocationFilterDto): boolean {
        const R = 6371;
        const deg2rad = n => Math.tan(n * (Math.PI / 180));

        let dLat = deg2rad(params.lat - field.lat);
        let dLon = deg2rad(params.lng - field.lng);

        let a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(field.lat)) * Math.cos(deg2rad(params.lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        let c = 2 * Math.asin(Math.sqrt(a));
        let d = R * c;

        return d <= (params.radius || 9999999999);
    }
}
