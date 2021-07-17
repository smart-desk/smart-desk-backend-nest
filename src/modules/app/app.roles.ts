import { RolesBuilder } from 'nest-access-control';

export enum RolesEnum {
    VIEWER = 'viewer',
    ADMIN = 'admin',
    USER = 'user',
}

export enum ResourceEnum {
    PRODUCT = 'product',
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
    PROMO_SET = 'promo_set',
}

export const roles = new RolesBuilder();

roles
    // Viewer
    .grant(RolesEnum.VIEWER)
    .read([ResourceEnum.PRODUCT, ResourceEnum.CATEGORY, ResourceEnum.USER])
    // User
    .grant(RolesEnum.USER)
    .extend(RolesEnum.VIEWER)
    .read([ResourceEnum.BOOKMARK, ResourceEnum.ADDRESS, ResourceEnum.CHAT, ResourceEnum.AD_CAMPAIGN, ResourceEnum.AD_CONFIG])
    .create([
        ResourceEnum.PRODUCT,
        ResourceEnum.FILE,
        ResourceEnum.BOOKMARK,
        ResourceEnum.ADDRESS,
        ResourceEnum.CHAT,
        ResourceEnum.AD_CAMPAIGN,
    ])
    .update([ResourceEnum.PRODUCT, ResourceEnum.USER, ResourceEnum.BOOKMARK, ResourceEnum.ADDRESS, ResourceEnum.AD_CAMPAIGN])
    .delete([ResourceEnum.PRODUCT, ResourceEnum.BOOKMARK, ResourceEnum.ADDRESS, ResourceEnum.AD_CAMPAIGN])
    // Admin
    .grant(RolesEnum.ADMIN)
    .create([
        ResourceEnum.PRODUCT,
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
        ResourceEnum.PROMO_SET,
    ])
    .read([
        ResourceEnum.PRODUCT,
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
        ResourceEnum.PROMO_SET,
    ])
    .update([
        ResourceEnum.PRODUCT,
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
        ResourceEnum.PROMO_SET,
    ])
    .delete([
        ResourceEnum.PRODUCT,
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
        ResourceEnum.PROMO_SET,
    ]);
