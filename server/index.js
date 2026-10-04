import express from 'express';
import { resolve } from 'node:path';
import { createApp } from './app.js';
const app=createApp();
if(process.env.NODE_ENV==='production'){
 app.use(express.static(resolve('dist'),{index:false}));
 app.get('/{*path}',(_,res)=>res.sendFile(resolve('dist/index.html')));
}else{
 const {createServer}=await import('vite');
 const vite=await createServer({server:{middlewareMode:true},appType:'spa'});
 app.use(vite.middlewares);
}
const port=Number(process.env.PORT||3000);
app.listen(port,'0.0.0.0',()=>console.log(`AstraLab is running on http://localhost:${port}`));
