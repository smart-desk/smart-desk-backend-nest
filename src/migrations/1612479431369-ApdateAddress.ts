import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ApdateAddress1612479431369 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            'address',
            'radius',
            new TableColumn({
                name: 'radius',
                type: 'integer',
            })
        );

        await queryRunner.dropColumn('address', 'coords');

        await queryRunner.addColumn(
            'address',
            new TableColumn({
                name: 'lat',
                type: 'float',
            })
        );

        await queryRunner.addColumn(
            'address',
            new TableColumn({
                name: 'lng',
                type: 'float',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('address', 'lat');

        await queryRunner.dropColumn('address', 'lng');
    }
}
