import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AdvertsViews1616191566797 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'adverts',
            new TableColumn({
                name: 'views',
                type: 'integer',
                default: 0,
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('adverts', 'views');
    }
}
