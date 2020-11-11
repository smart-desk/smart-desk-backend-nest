import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { isUUID, validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { Advert } from './entities/advert.entity';
import { AdvertsGetDto, AdvertsGetResponseDto, UpdateAdvertDto } from './dto/advert.dto';
import { SectionsService } from '../sections/sections.service';
import { CreateFieldDataDtoTypes, FieldDataEntities, FieldDataEntity, UpdateFieldDataDtoTypes } from './constants';
import { CreateAdvertDto } from './dto/advert.dto';
import { FieldsService } from '../fields/fields.service';
import { FieldType } from '../fields/constants';
import { getMessageFromValidationErrors } from '../utils/validation';
import { CreateFieldDataBaseDto, UpdateFieldDataBaseDto } from './dto/field-data-base.dto';

interface FieldDataDtoInstance {
    type: FieldType;
    instance: CreateFieldDataBaseDto | UpdateFieldDataBaseDto;
}

@Injectable()
export class AdvertsService {
    constructor(
        @InjectRepository(Advert) private advertRepository: Repository<Advert>,
        private sectionsService: SectionsService,
        private fieldsService: FieldsService,
        private connection: Connection
    ) {}

    async getAll(options: AdvertsGetDto): Promise<AdvertsGetResponseDto> {
        const skipped = (options.page - 1) * options.limit;

        const query = await this.advertRepository
            .createQueryBuilder('')
            .andWhere(options.category_id ? 'advert.category_id = :category_id' : '1=1', { category_id: options.category_id })
            .andWhere(options.search ? 'LOWER(title COLLATE "en_US") LIKE :search' : '1=1', {
                search: `%${options.search.toLocaleLowerCase()}%`,
            });

        const adverts = await query.orderBy('created_at', 'DESC').offset(skipped).limit(options.limit).getMany();
        const totalCount = await query.getCount();
        const resolvedAdverts = await Promise.all(adverts.map(advert => this.loadFieldDataForAdvert(advert)));

        const response = new AdvertsGetResponseDto();
        response.adverts = resolvedAdverts;
        response.page = options.page;
        response.limit = options.limit;
        response.totalCount = totalCount;

        return response;
    }

    async getById(id: string): Promise<Advert> {
        const advert = await this.findOneOrThrowException(id);
        return this.loadFieldDataForAdvert(advert);
    }

    async create(advertDto: CreateAdvertDto): Promise<Advert> {
        // todo (future) check that model belongs to category
        // todo (future) check that field belongs to model
        // todo (future) check that field_id is unique for this advert
        const validDtos: Array<FieldDataDtoInstance> = [];
        for (const fieldDataObject of advertDto.fields) {
            const fieldDataInstance = await this.convertFieldDataDtoToClass(fieldDataObject);

            if (fieldDataInstance) {
                await this.validateFieldDataOrThrowException(fieldDataInstance.instance);
                validDtos.push(fieldDataInstance);
            }
        }

        const advert = this.advertRepository.create(advertDto);
        const advertResult = await this.advertRepository.save(advert);

        for (const fieldData of validDtos) {
            (fieldData.instance as CreateFieldDataBaseDto).advert_id = advertResult.id;
            await this.saveFieldData(fieldData);
        }

        return this.getById(advertResult.id);
    }

    async update(id: string, advertDto: UpdateAdvertDto): Promise<Advert> {
        await this.findOneOrThrowException(id);

        const validDtos: Array<FieldDataDtoInstance> = [];
        for (const fieldDataObject of advertDto.fields) {
            const fieldDataInstance = await this.convertFieldDataDtoToClass(fieldDataObject, true);

            if (fieldDataInstance) {
                await this.validateFieldDataOrThrowException(fieldDataInstance.instance);
                validDtos.push(fieldDataInstance);
            }
        }

        const updatedAdvert = await this.advertRepository.preload({ id, ...advertDto });
        const advertResult = await this.advertRepository.save(updatedAdvert);

        for (const fieldData of validDtos) {
            await this.saveFieldData(fieldData, true);
        }

        return this.getById(advertResult.id);
    }

    async delete(id: string): Promise<Advert> {
        const advert = await this.findOneOrThrowException(id);
        return this.advertRepository.remove(advert);
    }

    private async findOneOrThrowException(id: string): Promise<Advert> {
        const advert = await this.advertRepository.findOne({ id });
        if (!advert) {
            throw new NotFoundException(`Advert ${id} not found`);
        }
        return advert;
    }

    private async loadFieldDataForAdvert(advert: Advert): Promise<Advert> {
        advert.sections = await this.sectionsService.getByModelId(advert.model_id);

        // todo sequential loading is not effective, replace with parallel
        for (const section of advert.sections) {
            for (const field of section.fields) {
                if (FieldDataEntities.get(field.type)) {
                    field.data = await this.connection.manager.findOne(FieldDataEntities.get(field.type), { field_id: field.id });
                }
            }
        }

        return advert;
    }

    private async convertFieldDataDtoToClass(
        fieldDataDto: Partial<CreateFieldDataBaseDto | UpdateFieldDataBaseDto>,
        updateOperation?: boolean
    ): Promise<FieldDataDtoInstance | undefined> {
        // additional validation here since dto validation goes after converting
        if (!isUUID(fieldDataDto.field_id)) {
            throw new BadRequestException('field_id must be an UUID');
        }

        const field = await this.fieldsService.getById(fieldDataDto.field_id);

        const dataType = updateOperation ? UpdateFieldDataDtoTypes.get(field.type) : CreateFieldDataDtoTypes.get(field.type);
        if (dataType) {
            return {
                type: field.type,
                instance: plainToClass(dataType as any, { ...fieldDataDto }),
            };
        }
    }

    private async validateFieldDataOrThrowException(fieldData: CreateFieldDataBaseDto | UpdateFieldDataBaseDto): Promise<boolean> {
        const validationErrors = await validate(fieldData);
        if (validationErrors.length) {
            throw new BadRequestException(getMessageFromValidationErrors(validationErrors));
        }
        return true;
    }

    private async saveFieldData(fieldData: FieldDataDtoInstance, updateOperation?: boolean): Promise<FieldDataEntity> {
        const targetEntity = FieldDataEntities.get(fieldData.type);

        const fieldDataEntity = updateOperation
            ? await this.connection.manager.preload(targetEntity, fieldData.instance)
            : await this.connection.manager.create(targetEntity, fieldData.instance);

        return this.connection.manager.save(fieldDataEntity);
    }
}
