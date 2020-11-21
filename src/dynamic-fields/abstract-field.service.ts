import { Repository } from 'typeorm';

// todo abstract class for field entity
export abstract class AbstractFieldService {
    abstract getRepository(): Repository<any>;
}
