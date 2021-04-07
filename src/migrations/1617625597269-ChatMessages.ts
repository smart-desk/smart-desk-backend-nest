import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class ChatMessages1617625597269 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'chat_messages',
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
                        name: 'chat_id',
                        type: 'uuid',
                    },
                    {
                        name: 'user_id',
                        type: 'uuid',
                    },
                    {
                        name: 'content',
                        type: 'varchar',
                        length: '1000',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            })
        );

        await queryRunner.createForeignKey(
            'chat_messages',
            new TableForeignKey({
                columnNames: ['chat_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'chats',
                onDelete: 'CASCADE',
            })
        );

        await queryRunner.createForeignKey(
            'chat_messages',
            new TableForeignKey({
                columnNames: ['user_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'users',
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('chat_messages');
    }
}
