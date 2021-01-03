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
    USER = 'user',
    FILE = 'file',
}

export const roles = new RolesBuilder();

roles
    // Viewer
    .grant(RolesEnum.VIEWER)
    .read([ResourceEnum.ADVERT, ResourceEnum.CATEGORY, ResourceEnum.USER]) // todo hidden profile fields
    // User
    .grant(RolesEnum.USER)
    .extend(RolesEnum.VIEWER)
    .create([ResourceEnum.ADVERT, ResourceEnum.FILE])
    .update([ResourceEnum.ADVERT, ResourceEnum.USER])
    .delete(ResourceEnum.ADVERT)
    // Admin
    .grant(RolesEnum.ADMIN)
    .create([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.SECTION,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.USER,
        ResourceEnum.FILE,
    ])
    .read([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.SECTION,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.USER,
        ResourceEnum.FILE,
    ])
    .update([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.SECTION,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.USER,
        ResourceEnum.FILE,
    ])
    .delete([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.SECTION,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.USER,
        ResourceEnum.FILE,
    ]);
