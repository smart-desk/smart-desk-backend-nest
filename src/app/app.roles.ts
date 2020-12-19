import { RolesBuilder } from 'nest-access-control';

export enum RolesEnum {
    VIEWER = 'viewer',
    ADMIN = 'admin',
    USER = 'user',
}

export enum ResourceEnum {
    ADVERT = 'advert',
    MODEL = 'model',
    SECTION = 'section',
    FIELD = 'field',
    CATEGORY = 'category',
    PROFILE = 'profile',
}

export const roles = new RolesBuilder();

roles
    // Viewer
    .grant(RolesEnum.VIEWER)
    .read(ResourceEnum.ADVERT)
    .read(ResourceEnum.CATEGORY)
    .read(ResourceEnum.PROFILE) // todo remove hidden fields
    // User
    .grant(RolesEnum.USER)
    .extend(RolesEnum.VIEWER)
    .createOwn(ResourceEnum.ADVERT)
    .updateOwn(ResourceEnum.ADVERT)
    .deleteOwn(ResourceEnum.ADVERT)
    .updateOwn(ResourceEnum.PROFILE)
    // Admin
    .grant(RolesEnum.ADMIN)
    .create(ResourceEnum.ADVERT)
    .read(ResourceEnum.ADVERT)
    .update(ResourceEnum.ADVERT)
    .delete(ResourceEnum.ADVERT)
    .create(ResourceEnum.MODEL)
    .read(ResourceEnum.MODEL)
    .update(ResourceEnum.MODEL)
    .delete(ResourceEnum.MODEL)
    .create(ResourceEnum.SECTION)
    .read(ResourceEnum.SECTION)
    .update(ResourceEnum.SECTION)
    .delete(ResourceEnum.SECTION)
    .create(ResourceEnum.FIELD)
    .read(ResourceEnum.FIELD)
    .update(ResourceEnum.FIELD)
    .delete(ResourceEnum.FIELD)
    .create(ResourceEnum.CATEGORY)
    .read(ResourceEnum.CATEGORY)
    .update(ResourceEnum.CATEGORY)
    .delete(ResourceEnum.CATEGORY)
    .create(ResourceEnum.PROFILE)
    .read(ResourceEnum.PROFILE)
    .update(ResourceEnum.PROFILE)
    .delete(ResourceEnum.PROFILE);
