import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
export const creatorProfiles = [
 {username:'LivingCritz.js',avatar:'/assets/livingcritz.jpg'},
 {username:'FrDreamoHeh.jar',avatar:'/assets/frdreamoheh.jpg'},
 {username:'Solentz.dev',avatar:'/assets/solentz.jpg'}
];
export const defaultCategories = [
 ['Plugins','Puzzle','Extend what your server can do.'],['Resource Packs','Layers','Give your world a new perspective.'],['Server Configs','SlidersHorizontal','Thoughtfully configured server setups.'],['Tools','Wrench','A better development workflow.'],['Models','Box','Bring new dimensions to your projects.'],['GUIs','PanelsTopLeft','Interfaces made for your players.'],['Cosmetics','Sparkles','The details that make it yours.'],['Maps','Map','Worlds ready to be explored.'],['Items','Gem','Something new for your inventory.'],['Skript','Braces','Powerful ideas, less boilerplate.'],['Java','Code2','Built for developers.'],['Other','Orbit','More possibilities.']
];
export function openDatabase(path = process.env.DATABASE_PATH || 'data/astralab.sqlite') {
 if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});
 const db = new DatabaseSync(path);
 db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
 CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY,username TEXT NOT NULL COLLATE NOCASE UNIQUE,email TEXT NOT NULL COLLATE NOCASE UNIQUE,passwordHash TEXT,avatar TEXT,role TEXT NOT NULL DEFAULT 'USER' CHECK(role IN ('USER','FREE_DROPPER','PAID_DROPPER','ADMIN')),status TEXT NOT NULL DEFAULT 'ACTIVE',bio TEXT NOT NULL DEFAULT '',createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expiresAt INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY,name TEXT NOT NULL UNIQUE,description TEXT NOT NULL,icon TEXT NOT NULL,createdAt TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY,authorId TEXT NOT NULL REFERENCES users(id),title TEXT NOT NULL,description TEXT NOT NULL,categoryId TEXT NOT NULL REFERENCES categories(id),type TEXT NOT NULL CHECK(type IN ('FREE','PAID')),price INTEGER NOT NULL DEFAULT 0,status TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK(status IN ('DRAFT','PENDING_REVIEW','PUBLISHED','REJECTED','HIDDEN')),thumbnail TEXT,screenshots TEXT NOT NULL DEFAULT '[]',minecraftVersions TEXT NOT NULL DEFAULT '[]',features TEXT NOT NULL DEFAULT '',dependencies TEXT NOT NULL DEFAULT '',installation TEXT NOT NULL DEFAULT '',changelog TEXT NOT NULL DEFAULT '',rejectionReason TEXT,featured INTEGER NOT NULL DEFAULT 0,downloads INTEGER NOT NULL DEFAULT 0,sales INTEGER NOT NULL DEFAULT 0,createdAt TEXT NOT NULL,updatedAt TEXT NOT NULL,CHECK((type='FREE' AND price=0) OR (type='PAID' AND price>0)));
 CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY,productId TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,kind TEXT NOT NULL,originalName TEXT NOT NULL,storageName TEXT NOT NULL,mime TEXT NOT NULL,size INTEGER NOT NULL,createdAt TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY,buyerId TEXT NOT NULL REFERENCES users(id),productId TEXT NOT NULL REFERENCES products(id),sellerId TEXT NOT NULL REFERENCES users(id),amount INTEGER NOT NULL,status TEXT NOT NULL CHECK(status IN ('PENDING','PAID','FAILED','REFUNDED')),paymentId TEXT UNIQUE,providerOrderId TEXT UNIQUE,createdAt TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS purchases (userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,productId TEXT NOT NULL REFERENCES products(id),orderId TEXT NOT NULL REFERENCES orders(id),createdAt TEXT NOT NULL,PRIMARY KEY(userId,productId));
 CREATE TABLE IF NOT EXISTS downloads (id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,productId TEXT NOT NULL REFERENCES products(id),authorId TEXT NOT NULL REFERENCES users(id),createdAt TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,productId TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),content TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'PENDING_REVIEW',createdAt TEXT NOT NULL,UNIQUE(userId,productId));
 CREATE TABLE IF NOT EXISTS wishlist (userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,productId TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,PRIMARY KEY(userId,productId));
 CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,type TEXT NOT NULL,title TEXT NOT NULL,message TEXT NOT NULL,read INTEGER NOT NULL DEFAULT 0,createdAt TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS activityLogs (id TEXT PRIMARY KEY,adminId TEXT NOT NULL REFERENCES users(id),action TEXT NOT NULL,targetId TEXT,targetType TEXT,createdAt TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS passwordResets (tokenHash TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expiresAt INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS oauthAccounts (provider TEXT NOT NULL,providerId TEXT NOT NULL,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,PRIMARY KEY(provider,providerId));
 CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1),value TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS supportTickets (id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,subject TEXT NOT NULL,message TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'OPEN',createdAt TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS reports (id TEXT PRIMARY KEY,userId TEXT NOT NULL REFERENCES users(id),productId TEXT NOT NULL REFERENCES products(id),reason TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'OPEN',createdAt TEXT NOT NULL);
 CREATE INDEX IF NOT EXISTS products_status ON products(status,type,categoryId);
 CREATE INDEX IF NOT EXISTS products_author ON products(authorId);
 CREATE INDEX IF NOT EXISTS downloads_user ON downloads(userId,productId);
 CREATE INDEX IF NOT EXISTS orders_buyer ON orders(buyerId,status);
 CREATE INDEX IF NOT EXISTS notifications_user ON notifications(userId,read);
 `);
 const insert = db.prepare('INSERT OR IGNORE INTO categories VALUES (?,?,?,?,?)');
 if(!db.prepare('SELECT id FROM settings WHERE id=1').get())defaultCategories.forEach(([name,icon,description])=>insert.run(name.toLowerCase().replace(/ /g,'-'),name,description,icon,new Date().toISOString()));
 db.prepare('INSERT OR IGNORE INTO settings VALUES (1,?)').run(JSON.stringify({siteName:'AstraLab',siteDescription:'Build. Create. Upgrade.',logo:'/assets/astralab-logo.jpg',minimumPrice:100,maximumUploadSize:25,allowedExtensions:['.zip','.jar','.json','.yml','.yaml','.sk'],productModeration:true,automaticPublishing:false,maintenanceMode:false}));
 return db;
}
export const publicUser = u => u ? {id:u.id,username:u.username,email:u.email,avatar:u.avatar,role:u.role,status:u.status,bio:u.bio,createdAt:u.createdAt}:null;
export function settings(db){return JSON.parse(db.prepare('SELECT value FROM settings WHERE id=1').get().value);}
