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
    FILE = 'file',
}

export const roles = new RolesBuilder();

roles
    // Viewer
    .grant(RolesEnum.VIEWER)
    .read([ResourceEnum.ADVERT, ResourceEnum.CATEGORY, ResourceEnum.PROFILE]) // todo hidden profile fields
    // User
    .grant(RolesEnum.USER)
    .extend(RolesEnum.VIEWER)
    .createOwn(ResourceEnum.ADVERT)
    .updateOwn(ResourceEnum.ADVERT)
    .deleteOwn(ResourceEnum.ADVERT)
    .updateOwn(ResourceEnum.PROFILE)
    .createOwn(ResourceEnum.FILE)
    // Admin
    .grant(RolesEnum.ADMIN)
    .create([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.SECTION,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.PROFILE,
        ResourceEnum.FILE,
    ])
    .read([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.SECTION,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.PROFILE,
        ResourceEnum.FILE,
    ])
    .update([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.SECTION,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.PROFILE,
        ResourceEnum.FILE,
    ])
    .delete([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.SECTION,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.PROFILE,
        ResourceEnum.FILE,
    ]);
