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
    CHAT = 'chat',
}

export const roles = new RolesBuilder();

roles
    // Viewer
    .grant(RolesEnum.VIEWER)
    .read([ResourceEnum.ADVERT, ResourceEnum.CATEGORY, ResourceEnum.USER])
    // User
    .grant(RolesEnum.USER)
    .extend(RolesEnum.VIEWER)
    .read([ResourceEnum.BOOKMARK, ResourceEnum.ADDRESS, ResourceEnum.CHAT])
    .create([ResourceEnum.ADVERT, ResourceEnum.FILE, ResourceEnum.BOOKMARK, ResourceEnum.ADDRESS, ResourceEnum.CHAT])
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
        ResourceEnum.CHAT,
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
        ResourceEnum.CHAT,
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
        ResourceEnum.CHAT,
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
        ResourceEnum.CHAT,
    ]);
