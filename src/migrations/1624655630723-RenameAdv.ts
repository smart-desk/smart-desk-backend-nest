import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAdv1624655630723 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('data_checkboxes', 'advert_id', 'product_id');
        await queryRunner.renameColumn('data_datepicker', 'advert_id', 'product_id');
        await queryRunner.renameColumn('data_input_texts', 'advert_id', 'product_id');
        await queryRunner.renameColumn('data_locations', 'advert_id', 'product_id');
        await queryRunner.renameColumn('data_photos', 'advert_id', 'product_id');
        await queryRunner.renameColumn('data_price', 'advert_id', 'product_id');
        await queryRunner.renameColumn('data_radios', 'advert_id', 'product_id');
        await queryRunner.renameColumn('data_textareas', 'advert_id', 'product_id');
        await queryRunner.renameColumn('bookmarks', 'advert_id', 'product_id');
        await queryRunner.renameColumn('chats', 'advert_id', 'product_id');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.renameColumn('data_checkboxes', 'product_id', 'advert_id');
        await queryRunner.renameColumn('data_datepicker', 'product_id', 'advert_id');
        await queryRunner.renameColumn('data_input_texts', 'product_id', 'advert_id');
        await queryRunner.renameColumn('data_locations', 'product_id', 'advert_id');
        await queryRunner.renameColumn('data_photos', 'product_id', 'advert_id');
        await queryRunner.renameColumn('data_price', 'product_id', 'advert_id');
        await queryRunner.renameColumn('data_radios', 'product_id', 'advert_id');
        await queryRunner.renameColumn('data_textareas', 'product_id', 'advert_id');
        await queryRunner.renameColumn('bookmarks', 'product_id', 'advert_id');
        await queryRunner.renameColumn('chats', 'product_id', 'advert_id');
    }
}
