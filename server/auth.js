import { randomBytes,createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { publicUser } from './db.js';
export const token=()=>randomBytes(32).toString('hex');
export const hashToken=v=>createHash('sha256').update(v).digest('hex');
export const cookies=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(p=>p.trim().split('=')).filter(p=>p.length===2));
export const cookieOptions = {httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/'};
export function session(db,res,user,remember=false){const raw=token();const duration=remember?30*86400000:86400000;db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hashToken(raw),user.id,Date.now()+duration);res.cookie('astra_session',raw,{...cookieOptions,maxAge:duration});return publicUser(user);}
export function identify(db,req){const raw=cookies(req).astra_session;if(!raw)return null;return db.prepare('SELECT users.* FROM users JOIN sessions ON users.id=sessions.userId WHERE sessions.id=? AND sessions.expiresAt>? AND users.status=?').get(hashToken(raw),Date.now(),'ACTIVE')||null;}
export const hashPassword = value=>bcrypt.hash(value,12);
export const verifyPassword = (value,hash)=>hash?bcrypt.compare(value,hash):Promise.resolve(false);
