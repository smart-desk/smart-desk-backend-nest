import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { Product } from './entities/product.entity';
import { GetProductsDto, GetProductsResponseDto } from './dto/get-products.dto';
import { FieldsService } from '../fields/fields.service';
import { getMessageFromValidationErrors } from '../../utils/validation';
import { DynamicFieldsService } from '../dynamic-fields/dynamic-fields.service';
import { FieldType } from '../dynamic-fields/dynamic-fields.module';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus } from './models/product-status.enum';
import { MailService } from '../mail/mail.service';
import { SortingType } from './models/sorting';
import { NotificationTypes } from '../users/models/notification-types.enum';

interface FieldDataDtoInstance {
    type: FieldType;
    dto: any; // todo not any
}

@Injectable()
export class ProductsService {
    constructor(
        @InjectRepository(Product) private productRepository: Repository<Product>,
        private fieldsService: FieldsService,
        private dynamicFieldsService: DynamicFieldsService,
        private mailService: MailService
    ) {}

    async getAll(options: GetProductsDto): Promise<GetProductsResponseDto> {
        return this.getProducts(options);
    }

    async getForCategory(categoryId: string, options: GetProductsDto): Promise<GetProductsResponseDto> {
        return this.getProducts(options, categoryId);
    }

    async getById(id: string, loadFieldData = true): Promise<Product> {
        const product = await this.findOneOrThrowException(id);
        return loadFieldData ? this.loadFieldDataForProduct(product) : product;
    }

    async getRecommendedById(id: string): Promise<GetProductsResponseDto> {
        const product = await this.findOneOrThrowException(id);
        const options = new GetProductsDto();
        options.limit = 11;

        const recommended = await this.getForCategory(product.category_id, options);
        recommended.products = recommended.products.filter(a => a.id !== product.id);
        recommended.totalCount -= 1;
        recommended.limit -= 1;

        return recommended;
    }

    async create(userId: string, productDto: CreateProductDto): Promise<Product> {
        // todo (future) check that model belongs to category
        // todo (future) check that field belongs to model
        // todo (future) check that fieldId is unique for this product
        const validDtos: Array<FieldDataDtoInstance> = [];
        for (const fieldDataObject of productDto.fields) {
            if (!isUUID(fieldDataObject.fieldId)) {
                throw new BadRequestException('fieldId must be an UUID');
            }

            const field = await this.fieldsService.getById(fieldDataObject.fieldId);
            const service = this.dynamicFieldsService.getService(field.type);
            if (!service) {
                continue;
            }

            const errors = await service.validateBeforeCreate(fieldDataObject);
            if (errors.length) {
                throw new BadRequestException(getMessageFromValidationErrors(errors));
            }

            validDtos.push({
                type: field.type,
                dto: fieldDataObject,
            });
        }

        const a = new Product();
        a.status = ProductStatus.PENDING;
        a.category_id = productDto.category_id;
        a.model_id = productDto.model_id;
        a.title = productDto.title;
        a.preferContact = productDto.preferContact;
        a.userId = userId;

        const product = this.productRepository.create(a);
        const productResult = await this.productRepository.save(product);

        for (const fieldData of validDtos) {
            const service = this.dynamicFieldsService.getService(fieldData.type);
            if (!service) {
                continue;
            }
            fieldData.dto.productId = productResult.id;
            await service.validateAndCreate(fieldData.dto);
        }

        return this.getById(productResult.id);
    }

    async update(id: string, productDto: UpdateProductDto): Promise<Product> {
        await this.findOneOrThrowException(id);

        const validDtos: Array<FieldDataDtoInstance> = [];
        for (const fieldDataObject of productDto.fields) {
            if (!isUUID(fieldDataObject.fieldId)) {
                throw new BadRequestException('fieldId must be an UUID');
            }

            const field = await this.fieldsService.getById(fieldDataObject.fieldId);
            const service = this.dynamicFieldsService.getService(field.type);
            if (!service) {
                continue;
            }

            const errors = fieldDataObject.id
                ? await service.validateBeforeUpdate(fieldDataObject)
                : await service.validateBeforeCreate(fieldDataObject);

            if (errors.length) {
                throw new BadRequestException(getMessageFromValidationErrors(errors));
            }

            validDtos.push({
                type: field.type,
                dto: fieldDataObject,
            });
        }

        const status = ProductStatus.PENDING;
        const updatedProduct = await this.productRepository.preload({ id, ...productDto, status });
        const productResult = await this.productRepository.save(updatedProduct);

        for (const fieldData of validDtos) {
            const service = this.dynamicFieldsService.getService(fieldData.type);
            if (!service) {
                continue;
            }

            if (fieldData.dto.id) {
                await service.validateAndUpdate(fieldData.dto);
            } else {
                fieldData.dto.product_id = id;
                await service.validateAndCreate(fieldData.dto);
            }
        }

        return this.getById(productResult.id);
    }

    async countView(id: string): Promise<Product> {
        const product = await this.findOneOrThrowException(id);
        product.views = product.views += 1;
        const updatedProduct = await this.productRepository.preload({ id, ...product });
        return await this.productRepository.save(updatedProduct);
    }

    async block(id: string): Promise<Product> {
        const product = await this.findOneOrThrowException(id);
        product.status = ProductStatus.BLOCKED;
        const updatedProduct = await this.productRepository.preload({ id, ...product });
        const resultBlockedProduct = await this.productRepository.save(updatedProduct);
        // todo send prepared html templates
        await this.mailService.sendMessageToUser(
            product.userId,
            `Объявление "${product.title}" было заблокировано администратором`,
            `Ваше объявление было заблокировано, пройдите по <a href="${process.env.HOST}/products/${product.id}/edit">ссылке</a> чтобы исправить.<br />Ваша команда Smart Desk`,
            NotificationTypes.PRODUCT_BLOCKED
        );
        return resultBlockedProduct;
    }

    async publish(id: string): Promise<Product> {
        const product = await this.findOneOrThrowException(id);
        product.status = ProductStatus.ACTIVE;
        const updatedProduct = await this.productRepository.preload({ id, ...product });
        const resultPublishedProduct = await this.productRepository.save(updatedProduct);
        // todo send prepared html templates
        await this.mailService.sendMessageToUser(
            product.userId,
            `Объявление "${product.title}" было опубликовано`,
            `Ваше объявление было опубликовано, пройдите по <a href="${process.env.HOST}/products/${product.id}">ссылке</a> чтобы посмотреть.<br />Ваша команда Smart Desk`,
            NotificationTypes.PRODUCT_PUBLISHED
        );
        return resultPublishedProduct;
    }

    async complete(id: string): Promise<Product> {
        const product = await this.findOneOrThrowException(id);
        product.status = ProductStatus.COMPLETED;
        const updatedProduct = await this.productRepository.preload({ id, ...product });
        return await this.productRepository.save(updatedProduct);
    }

    async delete(id: string): Promise<Product> {
        const product = await this.findOneOrThrowException(id);
        return this.productRepository.remove(product);
    }

    async getProductOwner(id: string): Promise<string> {
        const product = await this.getById(id);
        return product.userId;
    }

    async loadFieldDataForProduct(product: Product): Promise<Product> {
        product.fields = await this.fieldsService.getByModelId(product.model_id);

        // todo sequential loading is not effective, replace with parallel
        for (const field of product.fields) {
            const service = this.dynamicFieldsService.getService(field.type);
            if (!service) {
                continue;
            }
            const repository = service.getRepository();
            if (repository) {
                field.data = await repository.findOne({
                    where: {
                        fieldId: field.id,
                        productId: product.id,
                    },
                });
            }
        }

        return product;
    }

    private async findOneOrThrowException(id: string): Promise<Product> {
        const product = await this.productRepository.findOne({ id });
        if (!product) {
            throw new NotFoundException(`Product ${id} not found`);
        }
        return product;
    }

    private async getProducts(options: GetProductsDto, categoryId?: string): Promise<GetProductsResponseDto> {
        const where = this.getWhereClause(options, categoryId);
        const queryBuilder = this.productRepository.createQueryBuilder('product');
        queryBuilder.where(where);
        queryBuilder.orderBy({ promotion_timestamp: SortingType.DESC });

        if (options.filters) {
            let filteredIds = await this.getFilteredIds(options);
            queryBuilder.andWhereInIds(filteredIds);
        }

        if (options.sorting) {
            let orderedIds = await this.getOrderedIds(where, options);
            queryBuilder.andWhereInIds(orderedIds);
            queryBuilder.orderBy('array_position(:ids, product.id)');
            queryBuilder.setParameter('ids', orderedIds);
        }

        const [products, totalCount] = await queryBuilder
            .skip((options.page - 1) * options.limit)
            .take(options.limit)
            .getManyAndCount();

        const productsWithData = await Promise.all(products.map(product => this.loadFieldDataForProduct(product)));
        const productResponse = new GetProductsResponseDto();

        productResponse.totalCount = totalCount;
        productResponse.products = productsWithData;
        productResponse.page = options.page;
        productResponse.limit = options.limit;

        return productResponse;
    }

    private getWhereClause(options: GetProductsDto, categoryId?: string): any {
        const where: any = {
            status: options.status || ProductStatus.ACTIVE,
        };

        if (categoryId) {
            where.category_id = categoryId;
        }

        if (options.user) {
            where.userId = options.user;
        }

        if (options.search) {
            where.title = Raw(title => `LOWER(${title} COLLATE "en_US") ILIKE :phrase`, {
                phrase: `%${options.search.toLocaleLowerCase()}%`,
            });
        }

        return where;
    }

    // todo add tests for filtering
    private async getFilteredIds(options: GetProductsDto): Promise<string[]> {
        const { filters } = options;
        if (typeof filters !== 'object') {
            throw new BadRequestException('Invalid filters format');
        }

        let productIds: string[];
        for (let [fieldId, params] of Object.entries(filters)) {
            const field = await this.fieldsService.getById(fieldId);
            const service = this.dynamicFieldsService.getService(field.type);
            if (!service) {
                continue;
            }

            const filteredProductIds = await service.getProductIdsByFilter(fieldId, params);
            if (!filteredProductIds) {
                continue;
            }
            productIds = productIds ? productIds.filter(id => filteredProductIds.includes(id)) : filteredProductIds;
        }
        return productIds;
    }

    // todo this is very bad implementation
    private async getOrderedIds(where: any, options: GetProductsDto): Promise<string[]> {
        const { sorting } = options;
        if (typeof sorting !== 'object') {
            throw new BadRequestException('Invalid sorting format');
        }

        const products = await this.productRepository.createQueryBuilder('product').where(where).select('product.id').getMany();
        const productIds = products.map(product => product.id);

        const fieldId = Object.keys(sorting)[0];
        const field = await this.fieldsService.getById(fieldId);
        const service = this.dynamicFieldsService.getService(field.type);
        if (!service) {
            return productIds;
        }
        return await service.getSortedProductIds(field.id, productIds, sorting[field.id]);
    }
}
