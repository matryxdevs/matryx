const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('./db');
const A = require('./auth');
const V = require('./utils');
const w = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const OK = (res,data) => res.json(data);
const adminRoles = A.requireRoles('company_admin');
const operations = A.requireRoles('company_admin','manager','operator');
const management = A.requireRoles('company_admin','manager');
const moneyRoles = A.requireRoles('company_admin','manager','finance');
const tenant = [A.requireAuth,A.requireCompany];
const q = (sql,params=[]) => db().query(sql,params);
const clean = x => V.object(x);
const b = (obj,key,validator) => obj[key] === undefined ? undefined : validator(obj[key]);
const validators = {
  str:(label,max=150)=>v=>V.required(v,label,max),
  opt:(label,max=190)=>v=>V.optional(v,label,max),
  mail:(label,nullable=false)=>v=>V.email(v,label,nullable),
  cash:(label,positive=false)=>v=>V.money(v,label,positive),
  uint:(label,nullable=false)=>v=>V.unsigned(v,label,nullable),
  d:(label,nullable=false)=>v=>V.date(v,label,nullable),
  e:(values,label)=>v=>V.oneOf(v,values,label),
  plate:()=>V.plate
};
const F = validators;

const configurations = {
  vehicles:{table:'vehicles',search:['plate','brand','model'],create:['plate','brand','model','daily_rate'],fields:{
    plate:F.plate(),brand:F.str('Marca',90),model:F.str('Modelo',120),model_year:F.uint('Ano',true),
    color:F.opt('Cor',60),category:F.opt('Categoria',70),fuel_type:F.opt('Combustível',30),
    daily_rate:F.cash('Diária'),odometer:F.uint('Quilometragem')
  }},
  customers:{table:'customers',search:['full_name','document','phone','email'],create:['full_name'],fields:{
    full_name:F.str('Nome',160),document:F.opt('Documento',20),email:F.mail('E-mail',true),
    phone:F.opt('Telefone',30),driver_license:F.opt('CNH',40),address:F.opt('Endereço',250),notes:F.opt('Observações',3000)
  }},
  leads:{table:'leads',search:['full_name','phone','email','interest'],create:['full_name'],fields:{
    full_name:F.str('Nome',160),phone:F.opt('Telefone',30),email:F.mail('E-mail',true),
    source:F.opt('Origem',80),interest:F.opt('Interesse',180),
    stage:F.e(['new','contacted','proposal','negotiation','won','lost'],'Etapa'),
    estimated_value:F.cash('Valor estimado'),notes:F.opt('Observações',3000)
  }}
};
function validatedFields(obj, conf, creation=false) {
  const parsed = {};
  for (const [key,validate] of Object.entries(conf.fields)) {
    if (obj[key] !== undefined) parsed[key]=validate(obj[key]);
    else if (creation && conf.create.includes(key)) V.fail(400,`${key} é obrigatório.`);
  }
  if (!Object.keys(parsed).length) V.fail(400,'Informe ao menos um campo válido.');
  return parsed;
}
async function audit(req,companyId,action,entity,id,details={}) {
  await q('INSERT INTO audit_logs (company_id,actor_user_id,action,entity_type,entity_id,details,ip_address) VALUES (?,?,?,?,?,?,?)',
    [companyId||null,req.user?.id||null,action,entity,id||null,JSON.stringify(details),String(req.ip||'').slice(0,45)]);
}
function insertSQL(table,fields,companyId) {
  const keys=Object.keys(fields);
  return {sql:`INSERT INTO ${table} (company_id,${keys.join(',')}) VALUES (?,${keys.map(()=>'?').join(',')})`,values:[companyId,...keys.map(k=>fields[k])]};
}
function updateSQL(table,fields,companyId,id) {
  const keys=Object.keys(fields);
  return {sql:`UPDATE ${table} SET ${keys.map(k=>`${k}=?`).join(',')} WHERE company_id=? AND id=?`,values:[...keys.map(k=>fields[k]),companyId,id]};
}
async function activeAdminGuard(companyId,currentRole,newRole,isActive) {
  if (currentRole !== 'company_admin' || (newRole === 'company_admin' && isActive)) return;
  const [[row]]=await q("SELECT COUNT(*) AS n FROM users WHERE company_id=? AND role='company_admin' AND is_active=1",[companyId]);
  if (row.n<=1) V.fail(409,'A empresa precisa manter pelo menos um administrador ativo.');
}
async function lockVehicle(conn,companyId,vehicleId) {
  const [rows]=await conn.query('SELECT * FROM vehicles WHERE company_id=? AND id=? FOR UPDATE',[companyId,vehicleId]);
  if (!rows.length) V.fail(404,'Veículo não encontrado nesta empresa.');
  return rows[0];
}
async function checkOverlap(conn,companyId,vehicleId,start,end,excludeId=0) {
  // Bloqueio de concorrência: o veículo deve ter sido bloqueado com SELECT ... FOR UPDATE.
  const [rows]=await conn.query(`SELECT id,code FROM rentals WHERE company_id=? AND vehicle_id=?
    AND status IN ('reserved','active') AND start_date < ? AND due_date > ? AND id<>? LIMIT 1 FOR UPDATE`,
    [companyId,vehicleId,end,start,excludeId]);
  if (rows.length) V.fail(409,`Veículo já reservado/alugado no período (contrato ${rows[0].code||rows[0].id}).`);
}
async function tx(fn) {
  const conn=await db().getConnection();
  try {await conn.beginTransaction();const result=await fn(conn);await conn.commit();return result;}
  catch(e){await conn.rollback();throw e;} finally{conn.release();}
}
function buildRouter() {
  const router=express.Router();
  const loginLimit=require('express-rate-limit')({windowMs:15*60*1000,limit:12,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'Muitas tentativas de login. Aguarde 15 minutos.'}});
  router.post('/auth/login',loginLimit,w(A.login));
  router.get('/auth/me',A.requireAuth,w(async(req,res)=>OK(res,{user:A.formatUser(req.user),csrfToken:req.user.csrf_token})));
  router.post('/auth/logout',A.requireAuth,w(A.logout));
  router.post('/auth/change-password',A.requireAuth,w(A.changePassword));

  // ADMINISTRADOR MASTER ----------------------------------------------------
  router.get('/admin/stats',A.requireAuth,A.requireSuperadmin,w(async(req,res)=>{
    const [[totals]] = await q(`SELECT
      (SELECT COUNT(*) FROM companies) AS companies,
      (SELECT COUNT(*) FROM companies WHERE status='active' AND subscription_status NOT IN ('suspended') AND (expires_at IS NULL OR expires_at >= CURDATE())) AS active_companies,
      (SELECT COUNT(*) FROM vehicles) AS vehicles,
      (SELECT COUNT(*) FROM users WHERE role<>'superadmin') AS users,
      (SELECT COUNT(*) FROM rentals WHERE status='active') AS active_rentals,
      (SELECT COALESCE(SUM(amount),0) FROM payments WHERE paid_at >= DATE_FORMAT(CURDATE(),'%Y-%m-01') AND paid_at<=CURDATE()) AS payments_month`);
    const [latest]=await q(`SELECT c.id,c.trade_name,c.plan,c.subscription_status,c.status,c.created_at,
      (SELECT COUNT(*) FROM vehicles WHERE company_id=c.id) AS vehicles,
      (SELECT COUNT(*) FROM rentals WHERE company_id=c.id AND status='active') AS active_rentals
      FROM companies c ORDER BY c.created_at DESC LIMIT 7`);
    OK(res,{totals,latest});
  }));
  router.get('/admin/companies',A.requireAuth,A.requireSuperadmin,w(async(req,res)=>{
    const [rows]=await q(`SELECT c.*,
      (SELECT COUNT(*) FROM vehicles WHERE company_id=c.id) AS vehicle_count,
      (SELECT COUNT(*) FROM customers WHERE company_id=c.id) AS customer_count,
      (SELECT COUNT(*) FROM rentals WHERE company_id=c.id AND status='active') AS active_rentals,
      (SELECT u.email FROM users u WHERE u.company_id=c.id AND u.role='company_admin' AND u.is_active=1 ORDER BY u.id LIMIT 1) AS admin_email
      FROM companies c ORDER BY c.id DESC LIMIT 500`);
    OK(res,{items:rows});
  }));
  router.post('/admin/companies',A.requireAuth,A.requireSuperadmin,w(async(req,res)=>{
    const x=clean(req.body);
    const company={
      legal_name:V.required(x.legal_name,'Razão social',180),trade_name:V.required(x.trade_name,'Nome fantasia',140),
      cnpj:V.optional(x.cnpj,'CNPJ',18),email:V.email(x.email,'E-mail da empresa',true),
      phone:V.optional(x.phone,'Telefone',30),city:V.optional(x.city,'Cidade',120),state:V.optional(x.state,'UF',2),
      plan:V.oneOf(x.plan||'start',['start','pro','enterprise'],'Plano'),
      subscription_status:V.oneOf(x.subscription_status||'trial',['trial','active','past_due','suspended'],'Situação do plano'),
      expires_at:V.date(x.expires_at,'Vencimento',true)
    };
    const adminName=V.required(x.admin_name,'Nome do administrador',150);
    const adminEmail=V.email(x.admin_email,'E-mail do administrador');
    const adminPassword=V.required(x.admin_password,'Senha inicial',100);
    if(adminPassword.length<12 || !/[a-zA-Z]/.test(adminPassword) || !/\d/.test(adminPassword)) V.fail(400,'Senha inicial: mínimo de 12 caracteres, incluindo letras e números.');
    const hashed=await bcrypt.hash(adminPassword,12);
    const result=await tx(async(conn)=>{
      const keys=Object.keys(company);
      const [ins]=await conn.query(`INSERT INTO companies (${keys.join(',')}) VALUES (${keys.map(()=>'?').join(',')})`,keys.map(k=>company[k]));
      await conn.query('INSERT INTO users (company_id,full_name,email,password_hash,role,must_change_password) VALUES (?,?,?,?,?,1)',[ins.insertId,adminName,adminEmail,hashed,'company_admin']);
      return ins.insertId;
    });
    await audit(req,result,'company.create','company',result,{company:company.trade_name,admin:adminEmail});
    OK(res,{ok:true,id:result});
  }));
  router.patch('/admin/companies/:id',A.requireAuth,A.requireSuperadmin,w(async(req,res)=>{
    const companyId=V.id(req.params.id),input=clean(req.body);
    const allowed={legal_name:F.str('Razão social',180),trade_name:F.str('Nome fantasia',140),
      cnpj:F.opt('CNPJ',18),email:F.mail('E-mail',true),phone:F.opt('Telefone',30),
      city:F.opt('Cidade',120),state:F.opt('UF',2),address:F.opt('Endereço',240),
      plan:F.e(['start','pro','enterprise'],'Plano'),subscription_status:F.e(['trial','active','past_due','suspended'],'Situação do plano'),
      expires_at:F.d('Vencimento',true),status:F.e(['active','suspended'],'Status')};
    const fields=validatedFields(input,{fields:allowed,create:[]});
    const keys=Object.keys(fields);
    const [result]=await q(`UPDATE companies SET ${keys.map(k=>`${k}=?`).join(',')} WHERE id=?`,[...keys.map(k=>fields[k]),companyId]);
    if(!result.affectedRows)V.fail(404,'Empresa não encontrada.');
    await audit(req,companyId,'company.update','company',companyId,{fields:keys});
    OK(res,{ok:true});
  }));
  router.get('/admin/audit',A.requireAuth,A.requireSuperadmin,w(async(req,res)=>{
    const [rows]=await q(`SELECT a.id,a.company_id,a.action,a.entity_type,a.entity_id,a.created_at,a.ip_address,
      u.full_name AS actor,c.trade_name AS company FROM audit_logs a
      LEFT JOIN users u ON u.id=a.actor_user_id LEFT JOIN companies c ON c.id=a.company_id
      ORDER BY a.id DESC LIMIT 150`);
    OK(res,{items:rows});
  }));

  // TODOS OS ENDPOINTS /company SÃO FILTRADOS PELO company_id.
  router.use('/company',...tenant);
  router.get('/company/profile',w(async(req,res)=>{
    const [[row]]=await q('SELECT id,legal_name,trade_name,cnpj,email,phone,city,state,address,plan,subscription_status,expires_at,status FROM companies WHERE id=?',[req.companyId]);
    OK(res,{company:row});
  }));
  router.patch('/company/profile',adminRoles,w(async(req,res)=>{
    const fields=validatedFields(clean(req.body),{create:[],fields:{
      legal_name:F.str('Razão social',180),trade_name:F.str('Nome fantasia',140),
      cnpj:F.opt('CNPJ',18),email:F.mail('E-mail',true),phone:F.opt('Telefone',30),
      city:F.opt('Cidade',120),state:F.opt('UF',2),address:F.opt('Endereço',240)
    }});
    const keys=Object.keys(fields);
    await q(`UPDATE companies SET ${keys.map(k=>`${k}=?`).join(',')} WHERE id=?`,[...keys.map(k=>fields[k]),req.companyId]);
    await audit(req,req.companyId,'profile.update','company',req.companyId,{fields:keys});
    OK(res,{ok:true});
  }));
  router.get('/company/overview',w(async(req,res)=>{
    const cid=req.companyId;
    const [[stats]]=await q(`SELECT
      (SELECT COUNT(*) FROM vehicles WHERE company_id=?) AS fleet,
      (SELECT COUNT(*) FROM vehicles WHERE company_id=? AND status='available') AS available,
      (SELECT COUNT(*) FROM vehicles WHERE company_id=? AND status='rented') AS rented,
      (SELECT COUNT(*) FROM vehicles WHERE company_id=? AND status='maintenance') AS maintenance,
      (SELECT COUNT(*) FROM customers WHERE company_id=?) AS customers,
      (SELECT COUNT(*) FROM leads WHERE company_id=? AND stage NOT IN ('won','lost')) AS open_leads,
      (SELECT COUNT(*) FROM rentals WHERE company_id=? AND status='active') AS active_rentals,
      (SELECT COUNT(*) FROM rentals WHERE company_id=? AND status='reserved') AS reservations,
      (SELECT COUNT(*) FROM rentals WHERE company_id=? AND status='active' AND due_date<CURDATE()) AS overdue,
      (SELECT COALESCE(SUM(amount),0) FROM payments WHERE company_id=? AND paid_at>=DATE_FORMAT(CURDATE(),'%Y-%m-01') AND paid_at<=CURDATE()) AS received_month,
      (SELECT COALESCE(SUM(GREATEST(r.total_amount - COALESCE(p.paid,0),0)),0)
        FROM rentals r LEFT JOIN (SELECT rental_id,SUM(amount) AS paid FROM payments WHERE company_id=? GROUP BY rental_id) p ON p.rental_id=r.id
        WHERE r.company_id=? AND r.status IN ('active','completed')) AS pending_amount`,
      [cid,cid,cid,cid,cid,cid,cid,cid,cid,cid,cid,cid]);
    const [recent]=await q(`SELECT r.id,r.code,r.status,r.due_date,r.total_amount,c.full_name AS customer_name,
      v.brand,v.model,v.plate FROM rentals r
      JOIN customers c ON c.id=r.customer_id JOIN vehicles v ON v.id=r.vehicle_id
      WHERE r.company_id=? ORDER BY r.created_at DESC LIMIT 7`,[cid]);
    const [chart]=await q(`SELECT DATE_FORMAT(paid_at,'%Y-%m') AS month, SUM(amount) AS received
      FROM payments WHERE company_id=? AND paid_at>=DATE_SUB(DATE_FORMAT(CURDATE(),'%Y-%m-01'), INTERVAL 5 MONTH)
      GROUP BY DATE_FORMAT(paid_at,'%Y-%m') ORDER BY month`,[cid]);
    const [pipeline]=await q('SELECT stage,COUNT(*) AS total FROM leads WHERE company_id=? GROUP BY stage',[cid]);
    const [alerts]=await q(`SELECT m.id,m.service_type,m.scheduled_date,v.plate,v.model FROM maintenances m
      JOIN vehicles v ON v.id=m.vehicle_id WHERE m.company_id=? AND m.status<>'completed'
      ORDER BY m.scheduled_date LIMIT 5`,[cid]);
    OK(res,{stats,recent,chart,pipeline,alerts});
  }));

  for(const [resource,conf] of Object.entries(configurations)) {
    router.get(`/company/${resource}`,w(async(req,res)=>{
      const search=typeof req.query.q==='string'?req.query.q.trim().slice(0,90):'';
      const where=search?` AND (${conf.search.map(k=>`${k} LIKE ?`).join(' OR ')})`:'';
      const params=[req.companyId,...(search?conf.search.map(()=>`%${search}%`):[])];
      const [rows]=await q(`SELECT * FROM ${conf.table} WHERE company_id=?${where} ORDER BY id DESC LIMIT 500`,params);
      OK(res,{items:rows,limit:500});
    }));
    router.post(`/company/${resource}`,operations,w(async(req,res)=>{
      const fields=validatedFields(clean(req.body),conf,true);
      const {sql,values}=insertSQL(conf.table,fields,req.companyId);
      const [result]=await q(sql,values);
      await audit(req,req.companyId,`${resource}.create`,resource,result.insertId,{fields:Object.keys(fields)});
      OK(res,{ok:true,id:result.insertId});
    }));
    router.patch(`/company/${resource}/:id`,operations,w(async(req,res)=>{
      const resourceId=V.id(req.params.id);
      const fields=validatedFields(clean(req.body),conf);
      if(resource==='vehicles') {
        const [[current]]=await q('SELECT status FROM vehicles WHERE id=? AND company_id=?',[resourceId,req.companyId]);
        if(!current)V.fail(404,'Veículo não encontrado.');
        if(current.status==='rented' && ('odometer' in fields || 'plate' in fields)) V.fail(409,'Veículo alugado: não é possível alterar placa ou quilometragem durante locação.');
      }
      const {sql,values}=updateSQL(conf.table,fields,req.companyId,resourceId);
      const [result]=await q(sql,values);
      if(!result.affectedRows)V.fail(404,'Registro não encontrado nesta empresa.');
      await audit(req,req.companyId,`${resource}.update`,resource,resourceId,{fields:Object.keys(fields)});
      OK(res,{ok:true});
    }));
  }
  router.patch('/company/vehicles/:id/status',management,w(async(req,res)=>{
    const vehicleId=V.id(req.params.id),status=V.oneOf(req.body?.status,['available','inactive'],'Status');
    await tx(async conn=>{
      const vehicle=await lockVehicle(conn,req.companyId,vehicleId);
      if(vehicle.status==='rented'||vehicle.status==='maintenance') V.fail(409,'Finalize a locação ou manutenção antes de alterar a situação.');
      const [[busy]]=await conn.query("SELECT COUNT(*) AS n FROM rentals WHERE company_id=? AND vehicle_id=? AND status='active'",[req.companyId,vehicleId]);
      if(busy.n)V.fail(409,'Veículo possui locação ativa.');
      await conn.query('UPDATE vehicles SET status=? WHERE id=? AND company_id=?',[status,vehicleId,req.companyId]);
    });
    await audit(req,req.companyId,'vehicle.status','vehicle',vehicleId,{status});
    OK(res,{ok:true});
  }));

  // LOCAÇÕES ---------------------------------------------------------------
  router.get('/company/rentals',w(async(req,res)=>{
    const [rows]=await q(`SELECT r.*,c.full_name AS customer_name,c.phone AS customer_phone,
      v.plate,v.brand,v.model,COALESCE(p.paid,0) AS paid_amount,
      GREATEST(r.total_amount-COALESCE(p.paid,0),0) AS balance
      FROM rentals r JOIN customers c ON c.id=r.customer_id JOIN vehicles v ON v.id=r.vehicle_id
      LEFT JOIN (SELECT rental_id,SUM(amount) AS paid FROM payments WHERE company_id=? GROUP BY rental_id) p ON p.rental_id=r.id
      WHERE r.company_id=? ORDER BY r.id DESC LIMIT 500`,[req.companyId,req.companyId]);
    OK(res,{items:rows,limit:500});
  }));
  router.post('/company/rentals',operations,w(async(req,res)=>{
    const x=clean(req.body),cid=req.companyId;
    const customerId=V.id(x.customer_id),vehicleId=V.id(x.vehicle_id);
    const start=V.date(x.start_date,'Início'),end=V.date(x.due_date,'Devolução');
    const days=V.rentalDays(start,end);
    const status=V.oneOf(x.status||'reserved',['reserved','active'],'Situação');
    if(status==='active' && start>new Date().toISOString().slice(0,10)) V.fail(400,'Para datas futuras, crie uma reserva e inicie a locação na data de retirada.');
    const deposit=V.money(x.deposit_amount??0,'Caução');
    const pickupKm=V.unsigned(x.pickup_km,'Quilometragem de retirada',true);
    const notes=V.optional(x.notes,'Observações',3000);
    const created=await tx(async(conn)=>{
      const vehicle=await lockVehicle(conn,cid,vehicleId);
      const [customers]=await conn.query('SELECT id FROM customers WHERE id=? AND company_id=?',[customerId,cid]);
      if(!customers.length)V.fail(404,'Cliente não pertence à empresa.');
      if(['maintenance','inactive'].includes(vehicle.status))V.fail(409,'Veículo indisponível para locação.');
      if(status==='active' && vehicle.status==='rented')V.fail(409,'Veículo já possui locação ativa.');
      await checkOverlap(conn,cid,vehicleId,start,end);
      const daily=V.money(x.daily_rate??vehicle.daily_rate,'Valor da diária',true);
      const amount=Math.round(days*daily*100)/100;
      const [ins]=await conn.query(`INSERT INTO rentals (company_id,customer_id,vehicle_id,start_date,due_date,daily_rate,total_amount,deposit_amount,pickup_km,status,notes)
        VALUES (?,?,?,?,?,?,?,?,?,?,?)`,[cid,customerId,vehicleId,start,end,daily,amount,deposit,pickupKm,status,notes]);
      const code=`LOC-${new Date().getUTCFullYear()}-${String(ins.insertId).padStart(6,'0')}`;
      await conn.query('UPDATE rentals SET code=? WHERE id=?',[code,ins.insertId]);
      if(status==='active')await conn.query("UPDATE vehicles SET status='rented' WHERE company_id=? AND id=?",[cid,vehicleId]);
      return {id:ins.insertId,code,total_amount:amount};
    });
    await audit(req,cid,'rental.create','rental',created.id,{code:created.code,status});
    OK(res,{ok:true,...created});
  }));
  async function rentalTransition(req,action) {
    const rentalId=V.id(req.params.id),cid=req.companyId;
    const result=await tx(async(conn)=>{
      // Descubra o veículo e bloqueie-o antes da locação (mesma ordem de travas que INSERT).
      const [refs]=await conn.query('SELECT vehicle_id FROM rentals WHERE id=? AND company_id=?',[rentalId,cid]);
      if(!refs.length)V.fail(404,'Locação não encontrada.');
      const vehicle=await lockVehicle(conn,cid,refs[0].vehicle_id);
      const [rentals]=await conn.query('SELECT * FROM rentals WHERE id=? AND company_id=? FOR UPDATE',[rentalId,cid]);
      const rental=rentals[0];
      if(action==='activate') {
        if(rental.status!=='reserved')V.fail(409,'Apenas reservas podem ser iniciadas.');
        if(vehicle.status!=='available')V.fail(409,'Veículo não está disponível.');
        await checkOverlap(conn,cid,vehicle.id,rental.start_date,rental.due_date,rentalId);
        await conn.query("UPDATE rentals SET status='active' WHERE id=?",[rentalId]);
        await conn.query("UPDATE vehicles SET status='rented' WHERE id=?",[vehicle.id]);
      } else if(action==='complete') {
        if(rental.status!=='active')V.fail(409,'Apenas locações em andamento podem ser finalizadas.');
        const km=V.unsigned(req.body?.return_km,'KM de devolução');
        const initial=rental.pickup_km??vehicle.odometer;
        if(km<initial || km<vehicle.odometer)V.fail(400,'KM final não pode ser inferior à quilometragem inicial ou atual do veículo.');
        const finalAmount=req.body?.total_amount!==undefined ? V.money(req.body.total_amount,'Valor final',true) : rental.total_amount;
        const returnDate=V.date(req.body?.actual_return_date||new Date().toISOString().slice(0,10),'Data de devolução');
        if(returnDate<rental.start_date)V.fail(400,'Devolução não pode ser anterior à retirada.');
        await conn.query("UPDATE rentals SET status='completed',actual_return_date=?,return_km=?,total_amount=? WHERE id=?",[returnDate,km,finalAmount,rentalId]);
        await conn.query("UPDATE vehicles SET status='available',odometer=? WHERE id=?",[km,vehicle.id]);
      } else if(action==='cancel') {
        if(!['reserved','active'].includes(rental.status))V.fail(409,'Esta locação já foi encerrada.');
        const [[p]]=await conn.query('SELECT COUNT(*) AS n FROM payments WHERE company_id=? AND rental_id=?',[cid,rentalId]);
        if(p.n)V.fail(409,'Locação com pagamentos não pode ser cancelada diretamente. É necessário conciliar os valores antes.');
        await conn.query("UPDATE rentals SET status='cancelled' WHERE id=?",[rentalId]);
        if(rental.status==='active')await conn.query("UPDATE vehicles SET status='available' WHERE id=?",[vehicle.id]);
      }
      return {id:rentalId,code:rental.code};
    });
    await audit(req,cid,`rental.${action}`,'rental',rentalId,{});
    return result;
  }
  router.post('/company/rentals/:id/activate',operations,w(async(req,res)=>OK(res,{ok:true,...await rentalTransition(req,'activate')})));
  router.post('/company/rentals/:id/complete',operations,w(async(req,res)=>OK(res,{ok:true,...await rentalTransition(req,'complete')})));
  router.post('/company/rentals/:id/cancel',management,w(async(req,res)=>OK(res,{ok:true,...await rentalTransition(req,'cancel')})));

  // FINANCEIRO: lançamentos imutáveis neste MVP (sem exclusão silenciosa).
  router.get('/company/payments',moneyRoles,w(async(req,res)=>{
    const [rows]=await q(`SELECT p.*,r.code,c.full_name AS customer_name FROM payments p
      JOIN rentals r ON r.id=p.rental_id JOIN customers c ON c.id=r.customer_id
      WHERE p.company_id=? ORDER BY p.paid_at DESC,p.id DESC LIMIT 500`,[req.companyId]);
    OK(res,{items:rows,limit:500});
  }));
  router.post('/company/payments',moneyRoles,w(async(req,res)=>{
    const x=clean(req.body),rentalId=V.id(x.rental_id);
    const amount=V.money(x.amount,'Valor do pagamento',true);
    const method=V.oneOf(x.method||'pix',['pix','cash','card','transfer','other'],'Forma de pagamento');
    const paid=V.date(x.paid_at||new Date().toISOString().slice(0,10),'Data do pagamento');
    const notes=V.optional(x.notes,'Observação',300);
    const paymentId=await tx(async(conn)=>{
      const [rentals]=await conn.query('SELECT id,status FROM rentals WHERE company_id=? AND id=? FOR UPDATE',[req.companyId,rentalId]);
      if(!rentals.length)V.fail(404,'Locação não encontrada nesta empresa.');
      if(rentals[0].status==='cancelled')V.fail(409,'Não é possível lançar pagamentos em locações canceladas.');
      const [result]=await conn.query('INSERT INTO payments (company_id,rental_id,amount,method,paid_at,notes) VALUES (?,?,?,?,?,?)',
        [req.companyId,rentalId,amount,method,paid,notes]);
      return result.insertId;
    });
    await audit(req,req.companyId,'payment.create','payment',paymentId,{rentalId,amount,method});
    OK(res,{ok:true,id:paymentId});
  }));

  // MANUTENÇÃO -------------------------------------------------------------
  router.get('/company/maintenances',w(async(req,res)=>{
    const [rows]=await q(`SELECT m.*,v.plate,v.brand,v.model FROM maintenances m
      JOIN vehicles v ON v.id=m.vehicle_id WHERE m.company_id=? ORDER BY m.scheduled_date DESC,m.id DESC LIMIT 500`,[req.companyId]);
    OK(res,{items:rows,limit:500});
  }));
  router.post('/company/maintenances',operations,w(async(req,res)=>{
    const x=clean(req.body),vehicleId=V.id(x.vehicle_id),status=V.oneOf(x.status||'scheduled',['scheduled','in_progress'],'Situação');
    const serviceType=V.required(x.service_type,'Serviço',160),supplier=V.optional(x.supplier,'Fornecedor',150);
    const cost=V.money(x.cost??0,'Custo'),scheduled=V.date(x.scheduled_date,'Data programada');
    const performed=V.date(x.performed_date,'Data de realização',true),notes=V.optional(x.notes,'Observações',3000);
    const result=await tx(async(conn)=>{
      const vehicle=await lockVehicle(conn,req.companyId,vehicleId);
      if(status==='in_progress' && vehicle.status!=='available')V.fail(409,'O veículo precisa estar disponível para iniciar manutenção.');
      if(status==='in_progress') {
        const [[busy]]=await conn.query("SELECT COUNT(*) AS n FROM maintenances WHERE company_id=? AND vehicle_id=? AND status='in_progress'",[req.companyId,vehicleId]);
        if(busy.n)V.fail(409,'Este veículo já tem manutenção em andamento.');
      }
      const [ins]=await conn.query(`INSERT INTO maintenances (company_id,vehicle_id,service_type,supplier,cost,scheduled_date,performed_date,status,notes)
        VALUES (?,?,?,?,?,?,?,?,?)`,[req.companyId,vehicleId,serviceType,supplier,cost,scheduled,performed,status,notes]);
      if(status==='in_progress')await conn.query("UPDATE vehicles SET status='maintenance' WHERE id=?",[vehicleId]);
      return ins.insertId;
    });
    await audit(req,req.companyId,'maintenance.create','maintenance',result,{status});
    OK(res,{ok:true,id:result});
  }));
  router.post('/company/maintenances/:id/status',operations,w(async(req,res)=>{
    const mId=V.id(req.params.id),status=V.oneOf(req.body?.status,['in_progress','completed'],'Situação');
    await tx(async conn=>{
      const [refs]=await conn.query('SELECT vehicle_id FROM maintenances WHERE id=? AND company_id=?',[mId,req.companyId]);
      if(!refs.length)V.fail(404,'Manutenção não encontrada.');
      const vehicle=await lockVehicle(conn,req.companyId,refs[0].vehicle_id);
      const [rows]=await conn.query('SELECT * FROM maintenances WHERE id=? AND company_id=? FOR UPDATE',[mId,req.companyId]);
      const maintenance=rows[0];
      if(status==='in_progress') {
        if(maintenance.status!=='scheduled')V.fail(409,'Apenas manutenções programadas podem ser iniciadas.');
        if(vehicle.status!=='available')V.fail(409,'Veículo indisponível para manutenção.');
        await conn.query("UPDATE maintenances SET status='in_progress' WHERE id=?",[mId]);
        await conn.query("UPDATE vehicles SET status='maintenance' WHERE id=?",[vehicle.id]);
      } else {
        if(maintenance.status!=='in_progress')V.fail(409,'Inicie a manutenção antes de concluí-la.');
        const performed=V.date(req.body?.performed_date||new Date().toISOString().slice(0,10),'Data de conclusão');
        const finalCost=req.body?.cost===undefined?maintenance.cost:V.money(req.body.cost,'Custo final');
        await conn.query("UPDATE maintenances SET status='completed',performed_date=?,cost=? WHERE id=?",[performed,finalCost,mId]);
        await conn.query("UPDATE vehicles SET status='available' WHERE id=?",[vehicle.id]);
      }
    });
    await audit(req,req.companyId,'maintenance.status','maintenance',mId,{status});
    OK(res,{ok:true});
  }));

  // EQUIPE -----------------------------------------------------------------
  router.get('/company/users',adminRoles,w(async(req,res)=>{
    const [rows]=await q(`SELECT id,full_name,email,role,is_active,must_change_password,created_at,last_login_at
      FROM users WHERE company_id=? ORDER BY id DESC LIMIT 300`,[req.companyId]);
    OK(res,{items:rows});
  }));
  router.post('/company/users',adminRoles,w(async(req,res)=>{
    const x=clean(req.body);
    const name=V.required(x.full_name,'Nome',150),mail=V.email(x.email),password=V.required(x.password,'Senha inicial',100);
    if(password.length<12 || !/[a-zA-Z]/.test(password) || !/\d/.test(password))V.fail(400,'Senha inicial: mínimo 12 caracteres, com letras e números.');
    const role=V.oneOf(x.role||'operator',['company_admin','manager','operator','finance'],'Perfil');
    const [result]=await q(`INSERT INTO users (company_id,full_name,email,password_hash,role,must_change_password)
      VALUES (?,?,?,?,?,1)`,[req.companyId,name,mail,await bcrypt.hash(password,12),role]);
    await audit(req,req.companyId,'user.create','user',result.insertId,{role});
    OK(res,{ok:true,id:result.insertId});
  }));
  router.patch('/company/users/:id',adminRoles,w(async(req,res)=>{
    const userId=V.id(req.params.id),x=clean(req.body);
    const [rows]=await q('SELECT id,role,is_active FROM users WHERE company_id=? AND id=?',[req.companyId,userId]);
    if(!rows.length)V.fail(404,'Usuário não pertence a esta empresa.');
    const changes={};
    if(x.full_name!==undefined)changes.full_name=V.required(x.full_name,'Nome',150);
    if(x.role!==undefined)changes.role=V.oneOf(x.role,['company_admin','manager','operator','finance'],'Perfil');
    if(x.is_active!==undefined) {
      if(typeof x.is_active!=='boolean')V.fail(400,'Status inválido.');
      changes.is_active=x.is_active?1:0;
    }
    if(x.password!==undefined) {
      const password=V.required(x.password,'Senha',100);
      if(password.length<12 || !/[a-zA-Z]/.test(password) || !/\d/.test(password))V.fail(400,'Senha: mínimo 12 caracteres, com letras e números.');
      changes.password_hash=await bcrypt.hash(password,12);
      changes.must_change_password=1;
    }
    if(!Object.keys(changes).length)V.fail(400,'Nenhuma alteração válida.');
    if(userId===req.user.id && (changes.is_active===0 || (changes.role && changes.role!=='company_admin')))V.fail(409,'Você não pode remover seu próprio acesso de administrador.');
    await activeAdminGuard(req.companyId,rows[0].role,changes.role??rows[0].role,changes.is_active??rows[0].is_active);
    if(changes.password_hash || changes.is_active===0)await q('DELETE FROM auth_sessions WHERE user_id=?',[userId]);
    const keys=Object.keys(changes);
    await q(`UPDATE users SET ${keys.map(k=>`${k}=?`).join(',')} WHERE company_id=? AND id=?`,[...keys.map(k=>changes[k]),req.companyId,userId]);
    await audit(req,req.companyId,'user.update','user',userId,{fields:keys.filter(k=>k!=='password_hash')});
    OK(res,{ok:true});
  }));

  router.get('/company/audit',adminRoles,w(async(req,res)=>{
    const [rows]=await q(`SELECT a.id,a.action,a.entity_type,a.entity_id,a.created_at,a.ip_address,u.full_name AS actor
      FROM audit_logs a LEFT JOIN users u ON u.id=a.actor_user_id
      WHERE a.company_id=? ORDER BY a.id DESC LIMIT 150`,[req.companyId]);
    OK(res,{items:rows});
  }));

  router.get('/company/reports/export',moneyRoles,w(async(req,res)=>{
    const type=V.oneOf(req.query.type,['vehicles','customers','leads','rentals','payments','maintenances'],'Relatório');
    const report={
      vehicles:{cols:['id','plate','brand','model','model_year','status','daily_rate','odometer'],sql:'SELECT id,plate,brand,model,model_year,status,daily_rate,odometer FROM vehicles WHERE company_id=? ORDER BY id DESC'},
      customers:{cols:['id','full_name','document','email','phone'],sql:'SELECT id,full_name,document,email,phone FROM customers WHERE company_id=? ORDER BY id DESC'},
      leads:{cols:['id','full_name','phone','source','interest','stage','estimated_value'],sql:'SELECT id,full_name,phone,source,interest,stage,estimated_value FROM leads WHERE company_id=? ORDER BY id DESC'},
      rentals:{cols:['code','customer_name','plate','start_date','due_date','status','total_amount'],sql:'SELECT r.code,c.full_name AS customer_name,v.plate,r.start_date,r.due_date,r.status,r.total_amount FROM rentals r JOIN customers c ON c.id=r.customer_id JOIN vehicles v ON v.id=r.vehicle_id WHERE r.company_id=? ORDER BY r.id DESC'},
      payments:{cols:['id','code','amount','method','paid_at'],sql:'SELECT p.id,r.code,p.amount,p.method,p.paid_at FROM payments p JOIN rentals r ON r.id=p.rental_id WHERE p.company_id=? ORDER BY p.id DESC'},
      maintenances:{cols:['id','plate','service_type','supplier','cost','scheduled_date','status'],sql:'SELECT m.id,v.plate,m.service_type,m.supplier,m.cost,m.scheduled_date,m.status FROM maintenances m JOIN vehicles v ON v.id=m.vehicle_id WHERE m.company_id=? ORDER BY m.id DESC'}
    }[type];
    const [rows]=await q(report.sql,[req.companyId]);
    const output='\uFEFF'+report.cols.map(V.csvValue).join(';')+'\r\n'+rows.map(row=>report.cols.map(key=>V.csvValue(row[key])).join(';')).join('\r\n');
    res.set('Content-Type','text/csv; charset=utf-8');
    res.set('Content-Disposition',`attachment; filename="crmlocar-${type}-${Date.now()}.csv"`);
    res.send(output);
  }));

  router.use((req,res)=>res.status(404).json({error:'Rota de API não encontrada.'}));
  return router;
}
module.exports={buildRouter};
