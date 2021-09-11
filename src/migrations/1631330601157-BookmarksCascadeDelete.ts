import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class BookmarksCascadeDelete1631330601157 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('bookmarks', 'FK_05c5b94a5fbfaec47b1632bf5b1');

        await queryRunner.createForeignKey(
            'bookmarks',
            new TableForeignKey({
                columnNames: ['product_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'products',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
