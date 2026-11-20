const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const { db } = require('./db');
const { fail, email, required, id } = require('./utils');

const COOKIE = 'crmlocar_session';
const maxAge = 12 * 60 * 60 * 1000;
const hashToken = value => crypto.createHash('sha256').update(value).digest('hex');
const secureCookie = process.env.NODE_ENV === 'production';
const cookieOptions = { httpOnly:true, secure:secureCookie, sameSite:'strict', path:'/', maxAge };

function verifyOrigin(req,res,next) {
  if (['GET','HEAD','OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  const allowed = process.env.APP_ORIGIN;
  if (process.env.NODE_ENV === 'production' && !allowed) return next(new Error('APP_ORIGIN precisa ser definido em produção.'));
  // Navegadores enviam Origin em requests mutáveis; use APP_ORIGIN como referência confiável.
  if (origin) {
    const expected = allowed ? new URL(allowed).origin : `${req.protocol}://${req.get('host')}`;
    if (origin !== expected) return res.status(403).json({error:'Origem da solicitação não permitida.'});
  } else if (req.headers['sec-fetch-site'] === 'cross-site') {
    return res.status(403).json({error:'Solicitação bloqueada pela política de origem.'});
  }
  next();
}
async function requireAuth(req,res,next) {
  try {
    const token = req.cookies?.[COOKIE];
    if (!token || !/^[0-9a-f]{64}$/.test(token)) return res.status(401).json({error:'Faça login para continuar.'});
    const [rows] = await db().query(`
      SELECT u.id,u.company_id,u.full_name,u.email,u.role,u.is_active,u.must_change_password,
             s.csrf_token,s.expires_at,c.trade_name,c.legal_name,c.plan,c.status AS company_status,
             c.subscription_status,c.expires_at AS company_expires_at
      FROM auth_sessions s JOIN users u ON u.id=s.user_id
      LEFT JOIN companies c ON c.id=u.company_id
      WHERE s.token_hash=? AND s.expires_at>NOW() LIMIT 1`,[hashToken(token)]);
    const me = rows[0];
    if (!me || !me.is_active) return res.status(401).json({error:'Sessão expirada ou acesso desativado.'});
    if (me.role !== 'superadmin' && (me.company_status !== 'active' || me.subscription_status === 'suspended' || (me.company_expires_at && me.company_expires_at < new Date().toISOString().slice(0,10)))) {
      return res.status(403).json({error:'Acesso desta empresa suspenso ou plano expirado. Contate o administrador do Crmlocar.'});
    }
    req.user = me;
    req.sessionHash = hashToken(token);
    if (!['GET','HEAD','OPTIONS'].includes(req.method) && req.get('X-CSRF-Token') !== me.csrf_token) {
      return res.status(403).json({error:'Proteção de sessão: atualize a página e tente novamente.'});
    }
    if (me.must_change_password && !['/auth/me','/auth/change-password','/auth/logout'].includes(req.path)) {
      return res.status(403).json({error:'É necessário alterar sua senha antes de continuar.',code:'PASSWORD_CHANGE_REQUIRED'});
    }
    next();
  } catch(e) { next(e); }
}
function requireSuperadmin(req,res,next) {
  if (req.user.role !== 'superadmin') return res.status(403).json({error:'Acesso restrito ao administrador da plataforma.'});
  next();
}
async function requireCompany(req,res,next) {
  try {
    if (req.user.role === 'superadmin') {
      const companyId = req.get('X-Company-Id');
      if (!companyId) return res.status(400).json({error:'Selecione uma empresa para administrar.'});
      req.companyId = id(companyId);
      const [rows] = await db().query('SELECT id,trade_name,legal_name,status FROM companies WHERE id=?',[req.companyId]);
      if (!rows.length) fail(404,'Empresa não encontrada.');
      req.company = rows[0];
    } else {
      req.companyId = req.user.company_id;
      if (!req.companyId) fail(403,'Usuário não está vinculado a uma empresa.');
    }
    next();
  } catch(e) { next(e); }
}
const requireRoles = (...roles) => (req,res,next) => {
  if (req.user.role === 'superadmin' || roles.includes(req.user.role)) return next();
  return res.status(403).json({error:'Sua função não permite executar esta operação.'});
};
function formatUser(row) {
  return {
    id:row.id, companyId:row.company_id, name:row.full_name,email:row.email,role:row.role,
    mustChangePassword:!!row.must_change_password,
    company:row.company_id ? {id:row.company_id,name:row.trade_name,legalName:row.legal_name,plan:row.plan,status:row.company_status} : null
  };
}
async function login(req,res) {
  const userEmail = email(req.body?.email);
  const password = required(req.body?.password,'Senha',300);
  const [rows] = await db().query('SELECT * FROM users WHERE email=? LIMIT 1',[userEmail]);
  const u = rows[0];
  // Tempo e mensagem similares para credenciais inexistentes ou inválidas.
  const valid = await bcrypt.compare(password, u?.password_hash || '$2a$12$h3hFEOKDo9T8mFK/oJUV9OvB93J2LbRR0G4BjMR2wOWdgzYr4cBxi');
  if (!u || !valid || !u.is_active) return res.status(401).json({error:'E-mail ou senha incorretos.'});
  if (u.company_id) {
    const [companies] = await db().query('SELECT status,subscription_status,expires_at FROM companies WHERE id=?',[u.company_id]);
    const c = companies[0];
    if (!c || c.status !== 'active' || c.subscription_status === 'suspended' || (c.expires_at && c.expires_at < new Date().toISOString().slice(0,10))) return res.status(403).json({error:'Acesso da empresa suspenso ou plano expirado.'});
  }
  const token = crypto.randomBytes(32).toString('hex');
  const csrf = crypto.randomBytes(32).toString('hex');
  await db().query('INSERT INTO auth_sessions (token_hash,user_id,csrf_token,expires_at) VALUES (?,?,?,DATE_ADD(NOW(), INTERVAL 12 HOUR))',[hashToken(token),u.id,csrf]);
  await db().query('UPDATE users SET last_login_at=NOW() WHERE id=?',[u.id]);
  res.cookie(COOKIE,token,cookieOptions);
  return res.json({ok:true});
}
async function logout(req,res) {
  await db().query('DELETE FROM auth_sessions WHERE token_hash=?',[req.sessionHash]);
  res.clearCookie(COOKIE,{path:'/',sameSite:'strict',secure:secureCookie});
  res.json({ok:true});
}
async function changePassword(req,res) {
  const current = required(req.body?.currentPassword,'Senha atual',300);
  const next = required(req.body?.newPassword,'Nova senha',300);
  if (next.length < 12 || next.length > 100 || !/[a-zA-Z]/.test(next) || !/\d/.test(next)) fail(400,'Use uma senha de 12 a 100 caracteres, contendo letras e números.');
  const [rows] = await db().query('SELECT password_hash FROM users WHERE id=?',[req.user.id]);
  if (!await bcrypt.compare(current,rows[0].password_hash)) fail(400,'Senha atual incorreta.');
  await db().query('UPDATE users SET password_hash=?,must_change_password=0 WHERE id=?',[await bcrypt.hash(next,12),req.user.id]);
  await db().query('DELETE FROM auth_sessions WHERE user_id=?',[req.user.id]);
  res.clearCookie(COOKIE,{path:'/',sameSite:'strict',secure:secureCookie});
  res.json({ok:true,message:'Senha alterada. Entre novamente com a nova senha.'});
}
module.exports={ verifyOrigin,requireAuth,requireSuperadmin,requireCompany,requireRoles,formatUser,login,logout,changePassword };
