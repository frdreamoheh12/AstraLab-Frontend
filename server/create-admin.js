import { randomUUID } from 'node:crypto';
import { openDatabase } from './db.js';
import { hashPassword } from './auth.js';
const {ADMIN_USERNAME:username,ADMIN_EMAIL:email,ADMIN_PASSWORD:password}=process.env;
if(!username||!email||!password||password.length<12){console.error('Set ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) in the server environment.');process.exit(1);}
const db=openDatabase();const now=new Date().toISOString();
try{db.prepare('INSERT INTO users (id,username,email,passwordHash,role,status,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?)').run(randomUUID(),username,email.toLowerCase(),await hashPassword(password),'ADMIN','ACTIVE',now,now);console.log('Administrator created. Sign in with the configured account.');}catch{console.error('An account already uses that username or email. No permissions were changed.');process.exitCode=1;}
db.close();
