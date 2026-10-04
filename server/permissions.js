export const permissionMap = Object.freeze({
 USER:['account:read','wishlist:write','review:write','download:free','download:owned'],
 FREE_DROPPER:['account:read','wishlist:write','review:write','download:free','download:owned','product:create','product:create_free','product:edit_own','analytics:own'],
 PAID_DROPPER:['account:read','wishlist:write','review:write','download:free','download:owned','product:create','product:create_free','product:create_paid','product:edit_own','analytics:own','sales:own','revenue:own'],
 ADMIN:['*']
});
export function can(user,permission){return Boolean(user?.status==='ACTIVE' && (permissionMap[user.role]?.includes('*') || permissionMap[user.role]?.includes(permission)));}
export class HttpError extends Error {constructor(status,message){super(message);this.status=status;}}
export function requirePermission(user,permission){if(!user)throw new HttpError(401,'Please sign in to continue.');if(!can(user,permission))throw new HttpError(403,'Access Denied');}
export function checkProductType(user,type){requirePermission(user,'product:create');requirePermission(user,type==='PAID'?'product:create_paid':'product:create_free');}
export function checkOwnership(user,product){requirePermission(user,'product:edit_own');if(user.role!=='ADMIN' && product.authorId!==user.id)throw new HttpError(403,'You can only manage your own products.');}
