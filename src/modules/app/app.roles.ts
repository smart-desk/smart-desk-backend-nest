import { RolesBuilder } from 'nest-access-control';

export enum RolesEnum {
    VIEWER = 'viewer',
    ADMIN = 'admin',
    USER = 'user',
}

export enum ResourceEnum {
    ADVERT = 'advert',
    MODEL = 'model',
    FIELD = 'field',
    CATEGORY = 'category',
    USER = 'user',
    FILE = 'file',
    BOOKMARK = 'bookmark',
    ADDRESS = 'address',
    CHAT = 'chat',
    AD_CONFIG = 'ad_config',
}

export const roles = new RolesBuilder();

roles
    // Viewer
    .grant(RolesEnum.VIEWER)
    .read([ResourceEnum.ADVERT, ResourceEnum.CATEGORY, ResourceEnum.USER, ResourceEnum.AD_CONFIG])
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
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.USER,
        ResourceEnum.FILE,
        ResourceEnum.BOOKMARK,
        ResourceEnum.ADDRESS,
        ResourceEnum.CHAT,
        ResourceEnum.AD_CONFIG,
    ])
    .read([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.USER,
        ResourceEnum.FILE,
        ResourceEnum.BOOKMARK,
        ResourceEnum.ADDRESS,
        ResourceEnum.CHAT,
        ResourceEnum.AD_CONFIG,
    ])
    .update([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.USER,
        ResourceEnum.FILE,
        ResourceEnum.BOOKMARK,
        ResourceEnum.ADDRESS,
        ResourceEnum.CHAT,
        ResourceEnum.AD_CONFIG,
    ])
    .delete([
        ResourceEnum.ADVERT,
        ResourceEnum.MODEL,
        ResourceEnum.FIELD,
        ResourceEnum.CATEGORY,
        ResourceEnum.USER,
        ResourceEnum.FILE,
        ResourceEnum.BOOKMARK,
        ResourceEnum.ADDRESS,
        ResourceEnum.CHAT,
        ResourceEnum.AD_CONFIG,
    ]);
