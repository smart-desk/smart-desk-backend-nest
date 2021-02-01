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
    BOOKMARK = 'bookmark',
    ADDRESS = 'address',
}

export const roles = new RolesBuilder();

roles
    // Viewer
    .grant(RolesEnum.VIEWER)
    .read([ResourceEnum.ADVERT, ResourceEnum.CATEGORY, ResourceEnum.USER]) // todo hidden profile fields
    // User
    .grant(RolesEnum.USER)
    .extend(RolesEnum.VIEWER)
    .read([ResourceEnum.BOOKMARK, ResourceEnum.ADDRESS])
    .create([ResourceEnum.ADVERT, ResourceEnum.FILE, ResourceEnum.BOOKMARK, ResourceEnum.ADDRESS])
    .update([ResourceEnum.ADVERT, ResourceEnum.USER, ResourceEnum.BOOKMARK, ResourceEnum.ADDRESS])
    .delete([ResourceEnum.ADVERT, ResourceEnum.BOOKMARK, ResourceEnum.ADDRESS])
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
        ResourceEnum.BOOKMARK,
        ResourceEnum.ADDRESS,
    ])
    .read([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.SECTION,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.USER,
        ResourceEnum.FILE,
        ResourceEnum.BOOKMARK,
        ResourceEnum.ADDRESS,
    ])
    .update([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.SECTION,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.USER,
        ResourceEnum.FILE,
        ResourceEnum.BOOKMARK,
        ResourceEnum.ADDRESS,
    ])
    .delete([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.SECTION,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.USER,
        ResourceEnum.FILE,
        ResourceEnum.BOOKMARK,
        ResourceEnum.ADDRESS,
    ]);
