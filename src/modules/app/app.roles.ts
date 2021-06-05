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
    AD_CAMPAIGN = 'ad_campaign',
}

export const roles = new RolesBuilder();

roles
    // Viewer
    .grant(RolesEnum.VIEWER)
    .read([ResourceEnum.ADVERT, ResourceEnum.CATEGORY, ResourceEnum.USER, ResourceEnum.AD_CONFIG])
    // User
    .grant(RolesEnum.USER)
    .extend(RolesEnum.VIEWER)
    .read([ResourceEnum.BOOKMARK, ResourceEnum.ADDRESS, ResourceEnum.CHAT, ResourceEnum.AD_CAMPAIGN])
    .create([
        ResourceEnum.ADVERT,
        ResourceEnum.FILE,
        ResourceEnum.BOOKMARK,
        ResourceEnum.ADDRESS,
        ResourceEnum.CHAT,
        ResourceEnum.AD_CAMPAIGN,
    ])
    .update([ResourceEnum.ADVERT, ResourceEnum.USER, ResourceEnum.BOOKMARK, ResourceEnum.ADDRESS, ResourceEnum.AD_CAMPAIGN])
    .delete([ResourceEnum.ADVERT, ResourceEnum.BOOKMARK, ResourceEnum.ADDRESS, ResourceEnum.AD_CAMPAIGN])
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
        ResourceEnum.AD_CAMPAIGN,
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
        ResourceEnum.AD_CAMPAIGN,
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
        ResourceEnum.AD_CAMPAIGN,
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
        ResourceEnum.AD_CAMPAIGN,
    ]);
