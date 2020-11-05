import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AdvertChange1604614329140 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'adverts',
            'id',
            new TableColumn({
                name: 'id',
                type: 'uuid',
                isPrimary: true,
                isUnique: true,
                isGenerated: true,
                generationStrategy: 'uuid',
                default: `uuid_generate_v4()`,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'adverts',
            'id',
            new TableColumn({
                name: 'id',
                type: 'uuid',
                isPrimary: true,
                isUnique: true,
                isGenerated: true,
                generationStrategy: 'uuid',
                default: `uuid_generate_v4()`,
            })
        );
    }
}
