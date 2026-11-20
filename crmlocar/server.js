require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('node:path');
const { initDatabase,db } = require('./src/db');
const auth = require('./src/auth');
const {AppError} = require('./src/utils');
const { buildRouter } = require('./src/api');
const app = express();
if (process.env.TRUST_PROXY === '1') app.set('trust proxy',1);
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: { directives: {
    defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],
    imgSrc:["'self'",'data:'],connectSrc:["'self'"],fontSrc:["'self'",'https://fonts.gstatic.com'],
    objectSrc:["'none'"],frameAncestors:["'none'"],baseUri:["'self'"],formAction:["'self'"]
  } },
  crossOriginEmbedderPolicy:false
}));
app.use(express.json({limit:'80kb'}));
app.use(cookieParser());
app.use('/api',rateLimit({windowMs:15*60*1000,limit:400,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Muitas solicitações. Tente novamente mais tarde.'}}));
app.use('/api',auth.verifyOrigin);
app.use('/api',buildRouter());
app.use(express.static(path.join(__dirname,'public'),{index:false,maxAge:'1h'}));
app.get('/healthz',async(req,res)=>{
  try {await db().query('SELECT 1');res.json({status:'ok',database:'connected'});}catch(_){res.status(503).json({status:'error',database:'unavailable'});}
});
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.use((err,req,res,next)=>{
  if (res.headersSent) return next(err);
  const status = err.status || (err.code === 'ER_DUP_ENTRY'?409:500);
  if (status >= 500) console.error('[Crmlocar]',err.message,err.stack);
  const message = err.code === 'ER_DUP_ENTRY' ? 'Registro duplicado: confira e-mail, placa ou CNPJ.' :
    err.code === 'ER_ROW_IS_REFERENCED_2' ? 'Registro vinculado a outros dados e não pode ser excluído.' :
    status >= 500 ? 'Erro interno. Verifique os logs do servidor.' : err.message;
  res.status(status).json({error:message});
});
const port=Number(process.env.PORT||3000);
initDatabase().then(()=>app.listen(port,'0.0.0.0',()=>console.log(`Crmlocar iniciado na porta ${port}`))).catch(err=>{
  console.error('Falha ao iniciar Crmlocar:',err.message);
  process.exitCode=1;
  try { db().end().catch(()=>{}); } catch (_) {}
});
module.exports = app;
