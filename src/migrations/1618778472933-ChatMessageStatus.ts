import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ChatMessageStatus1618778472933 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            'chat_messages',
            new TableColumn({
                name: 'status',
                type: 'varchar',
                length: '100',
                default: "'unread'",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn('chat_messages', 'status');
    }
}
