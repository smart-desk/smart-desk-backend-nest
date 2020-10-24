import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUser1602952762671 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'users',
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
          name: 'firstName',
          type: 'varchar',
          length: '255',
        },
        {
          name: 'lastName',
          type: 'varchar',
          length: '255',
        },
        {
          name: 'email',
          type: 'varchar',
          length: '255',
        },
      ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
