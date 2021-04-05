import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class ChatTables1617625221138 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'chats',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isUnique: true,
                        generationStrategy: 'uuid',
                        default: `uuid_generate_v4()`,
                    },
                    {
                        name: 'advert_id',
                        type: 'uuid',
                    },
                    {
                        name: 'user_1',
                        type: 'uuid',
                    },
                    {
                        name: 'user_2',
                        type: 'uuid',
                    },
                ],
            })
        );

        await queryRunner.createForeignKey(
            'chats',
            new TableForeignKey({
                columnNames: ['advert_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'adverts',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'chats',
            new TableForeignKey({
                columnNames: ['user_1'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'chats',
            new TableForeignKey({
                columnNames: ['user_2'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
                onDelete: 'CASCADE',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('chats');
    }
}
