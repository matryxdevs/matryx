/* Crmlocar 1.0 — frontend sem dependências ou build. Valores reais vêm da API MySQL. */
const root=document.querySelector('#root');
const toastHost=document.querySelector('#toastHost');
const modalHost=document.querySelector('#modalHost');
const ICON={
  grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  car:'<path d="M5 17h14l-1.5-7.5a2 2 0 0 0-2-1.5h-7a2 2 0 0 0-2 1.5L5 17Z"/><path d="m7 13 1-3h8l1 3M5 17v2M19 17v2M3 13l2-2M21 13l-2-2"/><circle cx="8" cy="16" r=".5"/><circle cx="16" cy="16" r=".5"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  key:'<circle cx="8" cy="15" r="5"/><path d="m11.5 11.5 8-8L22 6l-3 3 1.5 1.5-2.5 2.5L16.5 11l-2.9 2.9"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  chart:'<path d="M4 19V10M10 19V5M16 19v-8M22 19v-14M2 21h22"/>',
  wallet:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="15" r="1"/>',
  wrench:'<path d="M14.7 6.3a5 5 0 0 0-6.4 6.4l-5 5a2 2 0 0 0 2.8 2.8l5-5a5 5 0 0 0 6.4-6.4L14 12l-3-3 3.7-2.7Z"/>',
  team:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 11a3 3 0 1 0-1-5.8M21 20v-2a6 6 0 0 0-4-5.66"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.2-1.5l2-1.5-2-3.4-2.3.9a8 8 0 0 0-2.5-1.5L13.5 2h-3L10 5a8 8 0 0 0-2.5 1.5l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9A8 8 0 0 0 10 19l.5 3h3l.5-3a8 8 0 0 0 2.5-1.5l2.3.9 2-3.4-2-1.5A7 7 0 0 0 19 12Z"/>',
  building:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 21v-4h6v4M8 7h2M14 7h2M8 11h2M14 11h2"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  arrow:'<path d="M5 12h14m-7-7 7 7-7 7"/>',
  back:'<path d="M19 12H5m7 7-7-7 7-7"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
  close:'<path d="M18 6 6 18M6 6l12 12"/>',
  pencil:'<path d="m16 4 4 4-11 11H5v-4L16 4Z"/><path d="m14 6 4 4"/>',
  check:'<path d="m4 12 5 5L20 6"/>',
  alert:'<path d="M10.3 3.4 2.5 17.4A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.6L13.7 3.4a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  shield:'<path d="m12 2 8 4v5c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V6Z"/><path d="m9 12 2 2 4-4"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  copy:'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  refresh:'<path d="M21 12a9 9 0 0 1-15.5 6.3M3 12A9 9 0 0 1 18.5 5.7M3 17v-5h5M21 7v5h-5"/>',
  dollar:'<circle cx="12" cy="12" r="10"/><path d="M12 5v14M16 8c-1.5-2-6-2-7.5 0-2 3 1 4 3.5 4 4.5 0 5.5 3 3.5 5-1.5 2-6 2-7.5 0"/>',
  layers:'<path d="m12 3-9 5 9 5 9-5-9-5ZM3 12l9 5 9-5M3 16l9 5 9-5"/>',
  trend:'<path d="m3 17 7-7 4 4 7-7M15 7h6v6"/>',
  filter:'<path d="M4 5h16l-6 7v6l-4 2v-8Z"/>',
  map:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'
};
const ic=(name,size=18)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" aria-hidden="true">${ICON[name]||ICON.grid}</svg>`;
const esc=(value)=>String(value??'').replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=value=>Number(value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const fmtDate=value=>value?new Date(String(value).slice(0,10)+'T12:00:00').toLocaleDateString('pt-BR'):'—';
const fmtDatetime=value=>value?new Date(String(value).replace(' ','T')).toLocaleString('pt-BR'):'—';
const initials=s=>String(s||'?').trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const tomorrow=()=>{const d=new Date();d.setDate(d.getDate()+1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const LABEL={available:'Disponível',rented:'Locado',maintenance:'Manutenção',inactive:'Inativo',reserved:'Reservado',active:'Em andamento',completed:'Concluído',cancelled:'Cancelado',new:'Novo',contacted:'Em contato',proposal:'Proposta',negotiation:'Negociação',won:'Ganho',lost:'Perdido',trial:'Teste',past_due:'Em atraso',suspended:'Suspenso',scheduled:'Programada',in_progress:'Em andamento',company_admin:'Administrador',manager:'Gestor',operator:'Operacional',finance:'Financeiro',superadmin:'Superadmin',start:'Start',pro:'Pro',enterprise:'Enterprise',pix:'Pix',cash:'Dinheiro',card:'Cartão',transfer:'Transferência',other:'Outro'};
const LABEL_TYPE={vehicles:'Veículos',customers:'Clientes',leads:'Oportunidades',rentals:'Locações',payments:'Pagamentos',maintenances:'Manutenções',users:'Equipe',companies:'Empresas'};
const status=(value,label)=>{const cls=['available','completed','active','won'].includes(value)?'good':['reserved','trial','scheduled','contacted','proposal','negotiation','in_progress','past_due'].includes(value)?'warn':['cancelled','lost','suspended','inactive','maintenance'].includes(value)?'bad':'purple';return `<span class="status ${cls}"><i class="dot"></i>${esc(label||LABEL[value]||value||'—')}</span>`};
const btn=(label,action='',cls='outline',extra='')=>`<button type="button" class="btn ${cls}" ${action?`data-action="${esc(action)}"`:''} ${extra}>${label}</button>`;
const brand=(small=false)=>`<a href="/" class="brand" data-go="/" aria-label="Crmlocar"><img src="/assets/logo-crmlocar.png" alt=""><span>crm<strong>locar</strong>${small?'<small>Gestão para locadoras</small>':''}</span></a>`;
const state={user:null,csrf:null,tenantId:null,tenantName:null,view:'overview',data:null,tableSearch:'',lookups:{},renderToken:0};
const isSuper=()=>state.user?.role==='superadmin';
const can=(...roles)=>isSuper()||roles.includes(state.user?.role);
function toast(message,error=false){
  const el=document.createElement('div');el.className='toast '+(error?'error':'success');
  el.innerHTML=`${ic(error?'alert':'check')}${esc(message)}`;toastHost.appendChild(el);setTimeout(()=>el.remove(),4700);
}
async function api(path,opts={}) {
  const headers={};
  if(opts.body!==undefined)headers['Content-Type']='application/json';
  if(state.csrf && opts.method && !['GET','HEAD'].includes(opts.method))headers['X-CSRF-Token']=state.csrf;
  if(state.tenantId)headers['X-Company-Id']=String(state.tenantId);
  const response=await fetch('/api'+path,{credentials:'same-origin',method:opts.method||'GET',headers,body:opts.body!==undefined?JSON.stringify(opts.body):undefined});
  const result=await response.json().catch(()=>({error:'Resposta inválida do servidor.'}));
  if(!response.ok){const e=new Error(result.error||'Ocorreu um erro.');e.status=response.status;e.code=result.code;throw e;}
  return result;
}
function goto(url){history.pushState(null,'',url);route();}
async function route(){
  if(state.user){if(location.pathname==='/'||location.pathname==='/entrar')history.replaceState(null,'','/app');renderApp();return;}
  if(location.pathname==='/app'||location.pathname==='/admin')history.replaceState(null,'','/entrar');
  if(location.pathname==='/entrar')renderLogin();else renderLanding();
}
async function bootstrap(){
  try{const result=await api('/auth/me');state.user=result.user;state.csrf=result.csrfToken;}
  catch(e){if(e.status!==401&&e.status!==403){toast('Não foi possível conectar ao servidor: '+e.message,true);}state.user=null;state.csrf=null;}
  route();
}
function renderLanding(){
 document.title='Crmlocar | CRM para locadoras de veículos';
 root.innerHTML=`<div class="marketing">
  <header class="public-nav">${brand()}<nav class="navlinks"><a href="#recursos">Funcionalidades</a><a href="#multiempresa">Multiempresa</a><a href="#sobre">Sobre</a></nav><div class="public-actions"><button class="btn outline" data-go="/entrar">Área do cliente</button><button class="btn" data-go="/entrar">Acessar plataforma ${ic('arrow',16)}</button></div></header>
  <section class="hero"><div class="hero-copy"><span class="pill-badge"><i class="dot"></i> A nova forma de gerenciar locadoras</span><h1>Sua locadora no controle. <em>Seus resultados em movimento.</em></h1><p>Controle frota, clientes, reservas, contratos, pagamentos e manutenção em uma plataforma completa. Tudo organizado, com indicadores reais e acesso seguro para cada empresa.</p><div class="hero-cta"><button class="btn" data-go="/entrar">Entrar no Crmlocar ${ic('arrow')}</button><a href="#recursos" class="btn outline">Conheça os recursos</a></div><div class="hero-trust">${ic('shield',17)} Acessos por perfil <span>•</span> Informações separadas por empresa <span>•</span> MySQL</div></div>
    <div class="mock-window"><div class="hero-decoration"></div><div class="mock-head"><div class="mock-logo"><img src="/assets/favicon.png" alt=""> Crmlocar <span class="subtle">/ Painel</span></div><div class="mock-mini"><span class="mock-dot">AL</span> Admin Locadora</div></div><div class="mock-title">Visão geral da operação</div><p class="mock-sub">Acompanhe os principais indicadores em um só lugar.</p><div class="mock-stats"><div class="mock-stat"><span>Veículos na frota</span><strong>48</strong><small>Frota cadastrada</small></div><div class="mock-stat"><span>Locações ativas</span><strong>31</strong><small>Contratos em aberto</small></div><div class="mock-stat"><span>Receita do mês</span><strong>R$ 28k</strong><small>Pagamentos recebidos</small></div></div><div class="mock-title" style="font-size:12px;margin-top:25px">Evolução financeira</div><div class="mock-chart">${[37,48,46,63,57,78,66,84,73,96].map(h=>`<div style="height:${h}%"></div>`).join('')}</div><div class="mock-bottom"><span class="mock-badge">● Operação monitorada</span><span>Frota, contratos e financeiro integrados</span></div><span class="preview-tag">Prévia ilustrativa • Valores fictícios</span></div></section>
  <section class="marketing-section" id="recursos"><div class="container"><div class="section-center"><span class="eyebrow">Tudo conectado</span><h2>Os recursos que sua operação precisa</h2><p>Menos planilhas isoladas, mais rastreabilidade e decisões fundamentadas em dados atualizados.</p></div><div class="features">
    ${[['car','Gestão de frota','Cadastre carros, placas, tarifas, quilometragem e disponibilidade.'],['calendar','Reservas e locações','Acompanhe períodos, contratos, retiradas, devoluções e atrasos.'],['users','Gestão de clientes','Centralize informações cadastrais, contatos e histórico de contratos.'],['wallet','Financeiro','Registre recebimentos e monitore valores pendentes e desempenho mensal.'],['wrench','Manutenção preventiva','Programe serviços e controle os veículos fora de operação.'],['trend','CRM comercial','Organize leads, propostas e negociações com um funil comercial.']].map(([icon,title,desc])=>`<article class="feature-card"><div class="feature-icon">${ic(icon,22)}</div><h3>${title}</h3><p>${desc}</p></article>`).join('')}
  </div></div></section>
  <section class="marketing-banner" id="multiempresa"><div><span class="eyebrow" style="color:#D9C6FD">Painel do administrador master</span><h2>Uma plataforma. Várias empresas. Controle centralizado.</h2><p>Cadastre locadoras, habilite usuários, administre planos e acompanhe cada empresa sem misturar seus dados.</p></div><div><button class="btn" data-go="/entrar">Acessar área administrativa ${ic('arrow')}</button></div></section>
  <footer class="public-footer" id="sobre">${brand()}<span>© ${new Date().getFullYear()} Crmlocar. Plataforma de gestão para locadoras de veículos.</span><span>Segurança • Gestão • Escalabilidade</span></footer>
 </div>`;
}
function renderLogin(){
 document.title='Entrar | Crmlocar';
 root.innerHTML=`<main class="login-page"><aside class="login-showcase">${brand()}<div><img class="login-logo-art" src="/assets/logo-crmlocar.png" alt="Identidade visual Crmlocar"><h2>Sua locadora em outro nível de gestão.</h2><p>Uma plataforma para transformar reservas, frota, clientes e financeiro em uma operação conectada.</p></div><span class="foot">© ${new Date().getFullYear()} Crmlocar • Gestão inteligente</span></aside><section class="login-form-wrap"><div class="login-box"><a class="login-back" href="/" data-go="/">${ic('back',16)} Voltar ao início</a><h1>Boas-vindas!</h1><p>Entre com suas credenciais para acessar sua empresa ou o painel central de administração.</p><form id="loginForm"><div class="field"><label class="field-label" for="loginEmail">E-mail de acesso</label><input required type="email" id="loginEmail" class="input" autocomplete="username" placeholder="seuemail@empresa.com.br"></div><div class="field"><label class="field-label" for="loginPass">Senha</label><input required type="password" id="loginPass" class="input" autocomplete="current-password" placeholder="Digite sua senha"></div><div class="login-error" id="loginError" aria-live="polite"></div><button class="btn block login-submit" type="submit">Acessar plataforma ${ic('arrow')}</button></form><div class="login-notice">${ic('shield',15)} Acesso exclusivo a empresas cadastradas e usuários autorizados. Para habilitar uma locadora, procure o administrador do Crmlocar.</div></div></section></main>`;
 document.querySelector('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();const button=e.currentTarget.querySelector('button[type=submit]'),error=document.querySelector('#loginError');button.disabled=true;error.textContent='';
  try{await api('/auth/login',{method:'POST',body:{email:document.querySelector('#loginEmail').value,password:document.querySelector('#loginPass').value}});const me=await api('/auth/me');state.user=me.user;state.csrf=me.csrfToken;state.view='overview';state.tenantId=null;state.tenantName=null;goto('/app');}
  catch(err){error.textContent=err.message;}finally{button.disabled=false;}
 });
}
const ADMIN_NAV=[['overview','Visão da plataforma','grid'],['companies','Empresas cadastradas','building'],['audit','Auditoria global','shield'],['account','Minha conta','settings']];
const COMPANY_NAV=[['overview','Visão geral','grid'],['vehicles','Veículos','car'],['customers','Clientes','users'],['rentals','Reservas e locações','calendar'],['leads','Oportunidades','trend'],['payments','Financeiro','wallet'],['maintenances','Manutenções','wrench'],['users','Equipe e acessos','team'],['reports','Relatórios','file'],['settings','Configurações','settings'],['audit','Auditoria','shield']];
const isAdminArea=()=>isSuper()&&!state.tenantId;
const currentNav=()=>isAdminArea()?ADMIN_NAV:COMPANY_NAV.filter(x=>(!['users','audit'].includes(x[0])||can('company_admin'))&&(!['payments','reports'].includes(x[0])||can('company_admin','manager','finance')));
function renderApp(){
 document.title='Painel | Crmlocar';const nav=currentNav();
 if(!nav.some(n=>n[0]===state.view))state.view='overview';
 root.innerHTML=`<div class="app-shell"><aside class="sidebar" id="sidebar"><div class="side-brand">${brand(true)}</div><div class="side-label">${isAdminArea()?'Administração SaaS':'Área de trabalho'}</div><nav class="side-nav">${nav.map(([key,label,icon])=>`<button data-view="${key}" class="nav-link ${state.view===key?'active':''}">${ic(icon,18)} <span>${esc(label)}</span></button>`).join('')}</nav><div class="side-bottom"><div class="side-help"><strong>${ic('shield',14)} Acesso protegido</strong>Dados organizados por empresa com permissões de usuário e trilha de auditoria.</div><div class="side-user"><div class="avatar">${esc(initials(state.user.name))}</div><div class="txt"><strong>${esc(state.user.name)}</strong><span>${esc(LABEL[state.user.role]||state.user.role)}</span></div><button title="Sair" class="icon-btn" data-action="logout">${ic('logout')}</button></div></div></aside><div class="main"><header class="topbar"><div class="breadcrumb"><button class="icon-btn menu-toggle" data-action="toggle-menu">${ic('menu')}</button><span>${isAdminArea()?'Administração':esc(state.tenantName||state.user.company?.name||'Locadora')}</span>${ic('arrow',12)}<strong id="currentCrumb">${esc(nav.find(n=>n[0]===state.view)?.[1]||'Visão geral')}</strong></div><div class="top-right"><span class="top-chip"><i class="dot"></i> Sessão segura</span><div class="avatar">${esc(initials(state.user.name))}</div></div></header><div class="content" id="content"></div></div></div>`;
 if(state.user.mustChangePassword){showChangePassword();return;}
 loadView();
}
function setView(view){state.view=view;state.tableSearch='';const sidebar=document.querySelector('#sidebar');if(sidebar)sidebar.classList.remove('open');root.querySelectorAll('.nav-link').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===view));const n=currentNav().find(x=>x[0]===view);const crumb=document.querySelector('#currentCrumb');if(crumb)crumb.textContent=n?.[1]||'Painel';loadView();}
function enterCompany(item){state.tenantId=item.id;state.tenantName=item.trade_name;state.view='overview';renderApp();}
function exitCompany(){state.tenantId=null;state.tenantName=null;state.view='overview';renderApp();}
function pageTitle(title,sub,actions=''){return `<div class="page-title"><div><h1>${title}</h1><p>${sub}</p></div><div class="page-actions">${actions}</div></div>`;}
function statCard(label,value,icon='chart',hint='',tone=''){return `<div class="stat-card"><div class="stat-upper"><span class="stat-label">${esc(label)}</span><div class="stat-icon ${tone}">${ic(icon)}</div></div><div class="stat-value">${esc(value)}</div><div class="stat-hint">${esc(hint)}</div></div>`;}
function companyBanner(){return isSuper()&&state.tenantId?`<div class="notice-banner"><div>${ic('building',17)} Você está administrando: <strong>${esc(state.tenantName)}</strong></div>${btn(`${ic('back',14)} Voltar ao painel master`,'exit-company','outline sm')}</div>`:'';}
function spinner(){return '<div class="boot-loader" style="min-height:260px"><div class="loader"></div><span>Carregando dados da plataforma...</span></div>';}
async function loadView(){
  const token=++state.renderToken,content=document.querySelector('#content');if(!content)return;
  content.innerHTML=companyBanner()+spinner();
  try{
    const view=state.view;let html='';
    if(isAdminArea()){
      if(view==='overview')html=renderAdminHome(await api('/admin/stats'));
      else if(view==='companies')html=renderCompanies(await api('/admin/companies'));
      else if(view==='account')html=renderMasterAccount();
      else html=renderAudit(await api('/admin/audit'),true);
    }else{
      if(view==='overview')html=renderOverview(await api('/company/overview'));
      else if(['vehicles','customers','leads','rentals','payments','maintenances','users'].includes(view))html=renderList(view,await api(`/company/${view}`));
      else if(view==='reports')html=renderReports();
      else if(view==='settings')html=renderSettings(await api('/company/profile'));
      else html=renderAudit(await api('/company/audit'),false);
    }
    if(token!==state.renderToken)return;content.innerHTML=companyBanner()+html;
  }catch(e){if(token!==state.renderToken)return;content.innerHTML=companyBanner()+`<div class="surface"><div class="empty"><div class="empty-icon">${ic('alert',24)}</div><strong>Não foi possível carregar</strong><p>${esc(e.message)}</p><button class="btn outline" data-action="reload" style="margin-top:17px">${ic('refresh')} Tentar novamente</button></div></div>`;if(e.code==='PASSWORD_CHANGE_REQUIRED')showChangePassword();}
}
function renderAdminHome(data){
 state.data={resource:'companies',items:data.latest};
 const s=data.totals;
 return pageTitle('Central de administração','Visão consolidada de todas as locadoras cadastradas.',btn(`${ic('plus')} Nova empresa`,'new-company'))+
 `<div class="stats-grid">${statCard('Empresas cadastradas',s.companies,'building','Total de locadoras')}${statCard('Empresas habilitadas',s.active_companies,'shield','Com acesso ativo','green')}${statCard('Veículos nas empresas',s.vehicles,'car','Somatório de todas as frotas')}${statCard('Locações em andamento',s.active_rentals,'key','Contratos ativos','green')}</div>`+
 `<div class="stats-grid">${statCard('Usuários cadastrados',s.users,'team','Exceto administrador master')}${statCard('Recebimentos das empresas',money(s.payments_month),'wallet','Total registrado neste mês')}</div>`+
 `<div class="surface"><div class="surface-head"><strong>Últimas locadoras cadastradas</strong><button class="btn ghost sm" data-view="companies">Ver todas ${ic('arrow',14)}</button></div>${data.latest.length?`<div class="table-scroll"><table class="data-table"><thead><tr><th>Empresa</th><th>Plano</th><th>Situação</th><th>Veículos</th><th>Locações</th><th>Ação</th></tr></thead><tbody>${data.latest.map(x=>`<tr><td><strong>${esc(x.trade_name)}</strong><small>Cadastro ${fmtDate(x.created_at)}</small></td><td>${esc(LABEL[x.plan]||x.plan)}</td><td>${status(x.status==='suspended'?'suspended':x.subscription_status,x.status==='suspended'?'Suspenso':x.subscription_status==='active'?'Ativo':null)}</td><td>${x.vehicles}</td><td>${x.active_rentals}</td><td>${btn('Acessar','enter-company','outline sm',`data-id="${x.id}"`)}</td></tr>`).join('')}</tbody></table></div>`:empty('Nenhuma empresa cadastrada. Use “Nova empresa” para iniciar.')}</div>`;
}
function empty(message,icon='file'){return `<div class="empty"><div class="empty-icon">${ic(icon,24)}</div>${esc(message)}</div>`;}
function monthLabels(){const labels=[];const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-5);for(let i=0;i<6;i++){labels.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`);d.setMonth(d.getMonth()+1);}return labels;}
function chartHTML(rows){const map=Object.fromEntries(rows.map(r=>[r.month,Number(r.received)]));const keys=monthLabels(),values=keys.map(k=>map[k]||0),max=Math.max(1,...values);return `<div class="chart-view">${keys.map((k,i)=>`<div class="chart-col"><div class="chart-bar-shell"><div class="chart-bar" style="height:${Math.max(3,values[i]/max*100)}%"><div class="chart-tooltip">${esc(money(values[i]))}</div></div></div><span>${esc(new Date(k+'-02T12:00:00').toLocaleDateString('pt-BR',{month:'short'}))}</span></div>`).join('')}</div>`;}
function renderOverview(data){
 const s=data.stats,total=Number(s.fleet)||0;
 const actions=can('company_admin','manager','operator')?btn(`${ic('plus')} Nova locação`,'new-rental'):'';
 const pipeline=['new','contacted','proposal','negotiation','won','lost'];const counts=Object.fromEntries(data.pipeline.map(x=>[x.stage,x.total]));const max=Math.max(1,...Object.values(counts));
 return pageTitle(`Olá, ${esc(state.user.name.split(' ')[0])}! 👋`,'Veja o que está acontecendo na sua operação hoje.',actions)+
 `<div class="stats-grid">${statCard('Veículos na frota',s.fleet,'car',`${s.available} disponíveis`)}${statCard('Locações ativas',s.active_rentals,'key',`${s.reservations} reservas futuras`,'green')}${statCard('Recebido no mês',money(s.received_month),'wallet','Conforme pagamentos lançados')}${statCard('Valores pendentes',money(s.pending_amount),'dollar','Contratos ativos e concluídos','amber')}</div>`+
 `<div class="dash-grid"><div class="surface"><div class="surface-head"><div><strong>Recebimentos nos últimos 6 meses</strong><br><span>Valores efetivamente registrados no financeiro</span></div>${ic('chart',18)}</div><div class="surface-body">${chartHTML(data.chart)}</div></div><div class="surface"><div class="surface-head"><strong>Situação da frota</strong><span>${total} veículos</span></div><div class="surface-body">${[['Disponíveis',s.available],['Locados',s.rented],['Em manutenção',s.maintenance],['Inativos',Math.max(0,total-s.available-s.rented-s.maintenance)]].map(([name,val])=>`<div class="progress-row"><div class="pipeline-item"><span>${esc(name)}</span><strong>${val}</strong></div><div class="progress"><div style="width:${total?Number(val)/total*100:0}%"></div></div></div>`).join('')}<div class="warning" style="margin-top:22px">${ic('clock',15)} ${Number(s.overdue)>0?`${s.overdue} locação(ões) com prazo de devolução ultrapassado.`:'Nenhuma locação ativa com prazo vencido.'}</div></div></div></div>`+
 `<div class="dash-grid"><div class="surface"><div class="surface-head"><strong>Últimas locações</strong><button class="btn ghost sm" data-view="rentals">Ver todas ${ic('arrow',14)}</button></div>${data.recent.length?data.recent.map(r=>`<div class="list-row"><div class="left"><strong>${esc(r.code)} · ${esc(r.customer_name)}</strong><small>${esc(r.plate)} · ${esc(r.brand)} ${esc(r.model)} · Devolução ${fmtDate(r.due_date)}</small></div><div class="right"><strong>${esc(money(r.total_amount))}</strong><small>${status(r.status)}</small></div></div>`).join(''):empty('Nenhuma locação cadastrada.','calendar')}</div><div class="surface"><div class="surface-head"><strong>Funil de oportunidades</strong><button class="btn ghost sm" data-view="leads">Ver CRM ${ic('arrow',14)}</button></div><div class="surface-body">${pipeline.map(key=>`<div class="progress-row"><div class="pipeline-item"><span>${esc(LABEL[key])}</span><strong>${counts[key]||0}</strong></div><div class="progress"><div style="width:${(counts[key]||0)/max*100}%"></div></div></div>`).join('')}</div></div></div>`+
 `<div class="surface"><div class="surface-head"><strong>Manutenções programadas e pendentes</strong><button class="btn ghost sm" data-view="maintenances">Ver manutenções ${ic('arrow',14)}</button></div><div class="surface-body">${data.alerts.length?`<div class="alerts-list">${data.alerts.map(m=>`<div class="alert-item">${ic('wrench',18)}<div><strong>${esc(m.service_type)} — ${esc(m.plate)}</strong><small>${esc(m.model)} · Programada para ${fmtDate(m.scheduled_date)}</small></div></div>`).join('')}</div>`:`<p class="hint">Nenhuma manutenção pendente.</p>`}</div></div>`;
}
const HEADERS={
 vehicles:['Veículo / placa','Categoria','Ano','Diária','Quilometragem','Situação','Ações'],
 customers:['Cliente','Documento','Telefone','E-mail','Cadastro','Ações'],
 leads:['Contato','Origem','Interesse','Valor potencial','Etapa','Ações'],
 rentals:['Contrato / cliente','Veículo','Período','Valor total','Recebido / saldo','Situação','Ações'],
 payments:['Contrato / cliente','Pagamento','Forma','Data','Observações'],
 maintenances:['Veículo','Serviço / fornecedor','Data programada','Custo','Situação','Ações'],
 users:['Usuário','E-mail','Perfil','Status','Último acesso','Ações'],
 companies:['Locadora','Responsável','Plano','Veículos / clientes','Situação','Ações']
};
const DESCRIPTIONS={vehicles:'Gerencie os veículos, disponibilidade, tarifas e dados da frota.',customers:'Cadastre clientes e mantenha as informações organizadas.',leads:'Organize o relacionamento comercial e acompanhe suas negociações.',rentals:'Controle reservas, contratos em andamento, devoluções e valores pendentes.',payments:'Consulte e registre os recebimentos associados às locações.',maintenances:'Programe serviços e monitore veículos em manutenção.',users:'Defina quais colaboradores podem acessar os dados desta empresa.',companies:'Cadastre novas locadoras, gerencie seus planos e acesse os painéis individuais.'};
const rowAction=(action,label,item,cls='outline')=>btn(label,action,cls+' sm',`data-id="${Number(item.id)}"`);
const canWrite=resource=>resource==='payments'?can('company_admin','manager','finance'):resource==='users'?can('company_admin'):resource==='companies'?isSuper():can('company_admin','manager','operator');
function renderRow(resource,x){
  const edit=canWrite(resource)?rowAction('edit-row',ic('pencil',13)+' Editar',x):'';
  const car=(name,subtitle)=>`<div class="mini-car"><div class="mini-car-icon">${ic('car')}</div><div><strong>${esc(name)}</strong><small>${esc(subtitle)}</small></div></div>`;
  if(resource==='vehicles')return `<tr data-search="${esc(Object.values(x).join(' ').toLowerCase())}"><td>${car(`${x.brand} ${x.model}`,x.plate)}</td><td>${esc(x.category||'—')}</td><td>${esc(x.model_year||'—')}</td><td><strong>${money(x.daily_rate)}</strong></td><td>${Number(x.odometer||0).toLocaleString('pt-BR')} km</td><td>${status(x.status)}</td><td><div class="table-actions">${edit}${can('company_admin','manager')&&['available','inactive'].includes(x.status)?rowAction('vehicle-status',x.status==='available'?'Desativar':'Ativar',x):''}</div></td></tr>`;
  if(resource==='customers')return `<tr data-search="${esc(Object.values(x).join(' ').toLowerCase())}"><td><strong>${esc(x.full_name)}</strong></td><td>${esc(x.document||'—')}</td><td>${esc(x.phone||'—')}</td><td>${esc(x.email||'—')}</td><td>${fmtDate(x.created_at)}</td><td><div class="table-actions">${edit}</div></td></tr>`;
  if(resource==='leads')return `<tr data-search="${esc(Object.values(x).join(' ').toLowerCase())}"><td><strong>${esc(x.full_name)}</strong><small>${esc(x.phone||x.email||'—')}</small></td><td>${esc(x.source||'—')}</td><td>${esc(x.interest||'—')}</td><td><strong>${money(x.estimated_value)}</strong></td><td>${status(x.stage)}</td><td><div class="table-actions">${edit}</div></td></tr>`;
  if(resource==='rentals'){
    const buttons=x.status==='reserved'&&can('company_admin','manager','operator')?rowAction('activate-rental','Iniciar',x,'flat'):
      x.status==='active'&&can('company_admin','manager','operator')?rowAction('finish-rental','Devolver',x,'flat'):'';
    const cancel=['active','reserved'].includes(x.status)&&can('company_admin','manager')?rowAction('cancel-rental','Cancelar',x,'ghost'):'';
    return `<tr data-search="${esc(Object.values(x).join(' ').toLowerCase())}"><td><strong class="mono">${esc(x.code)}</strong><small>${esc(x.customer_name)}</small></td><td>${car(`${x.brand} ${x.model}`,x.plate)}</td><td>${fmtDate(x.start_date)} → ${fmtDate(x.due_date)}</td><td><strong>${money(x.total_amount)}</strong></td><td><strong>${money(x.paid_amount)}</strong><small>Saldo: ${money(x.balance)}</small></td><td>${status(x.status)}${x.status==='active'&&x.due_date<today()?'<small style="color:#D14D60">Prazo vencido</small>':''}</td><td><div class="table-actions">${buttons}${cancel}</div></td></tr>`;
  }
  if(resource==='payments')return `<tr data-search="${esc(Object.values(x).join(' ').toLowerCase())}"><td><strong>${esc(x.code)}</strong><small>${esc(x.customer_name)}</small></td><td><strong>${money(x.amount)}</strong></td><td>${esc(LABEL[x.method]||x.method)}</td><td>${fmtDate(x.paid_at)}</td><td>${esc(x.notes||'—')}</td></tr>`;
  if(resource==='maintenances')return `<tr data-search="${esc(Object.values(x).join(' ').toLowerCase())}"><td>${car(`${x.brand} ${x.model}`,x.plate)}</td><td><strong>${esc(x.service_type)}</strong><small>${esc(x.supplier||'Fornecedor não informado')}</small></td><td>${fmtDate(x.scheduled_date)}</td><td><strong>${money(x.cost)}</strong></td><td>${status(x.status)}</td><td><div class="table-actions">${can('company_admin','manager','operator')&&x.status==='scheduled'?rowAction('start-maintenance','Iniciar',x,'flat'):''}${can('company_admin','manager','operator')&&x.status==='in_progress'?rowAction('finish-maintenance','Concluir',x,'flat'):''}</div></td></tr>`;
  if(resource==='users')return `<tr data-search="${esc(Object.values(x).join(' ').toLowerCase())}"><td><strong>${esc(x.full_name)}</strong>${x.must_change_password?'<small>Deve trocar a senha</small>':''}</td><td>${esc(x.email)}</td><td>${esc(LABEL[x.role]||x.role)}</td><td>${status(x.is_active?'available':'suspended')}</td><td>${fmtDatetime(x.last_login_at)}</td><td><div class="table-actions">${edit}</div></td></tr>`;
  if(resource==='companies')return `<tr data-search="${esc(Object.values(x).join(' ').toLowerCase())}"><td><strong>${esc(x.trade_name)}</strong><small>${esc(x.legal_name)}</small></td><td><strong>${esc(x.admin_email||'—')}</strong><small>${esc(x.cnpj||'CNPJ não informado')}</small></td><td>${esc(LABEL[x.plan]||x.plan)}<small>Venc.: ${fmtDate(x.expires_at)}</small></td><td>${Number(x.vehicle_count||0)} veículos / ${Number(x.customer_count||0)} clientes</td><td>${status(x.status==='suspended'?'suspended':x.subscription_status,x.status==='suspended'?'Suspenso':x.subscription_status==='active'?'Ativo':null)}</td><td><div class="table-actions">${rowAction('enter-company','Acessar',x,'flat')}${rowAction('edit-company',ic('pencil',13),x)}</div></td></tr>`;
  return '';
}
function tableHTML(resource,items){
 const headers=HEADERS[resource],emptyLabel=resource==='companies'?'Nenhuma empresa cadastrada.':`Nenhum registro de ${LABEL_TYPE[resource]?.toLowerCase()||resource} encontrado.`;
 return `<div class="table-shell"><div class="table-tools"><div class="search-wrap">${ic('search',16)}<input type="search" class="input" id="tableSearch" placeholder="Buscar registros..." aria-label="Pesquisar"></div><div class="count" id="visibleCount">${items.length} registro(s) exibido(s)</div></div><div class="table-scroll"><table class="data-table"><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody id="tableRows">${items.map(item=>renderRow(resource,item)).join('')||`<tr><td colspan="${headers.length}">${empty(emptyLabel)}</td></tr>`}</tbody></table></div><div class="table-footer"><span>Dados reais do banco de dados da empresa selecionada</span><span>Exibidos até ${resource==='users'?'300':'500'} registros • exporte dados em Relatórios</span></div></div>`;
}
function renderList(resource,data){
 state.data={resource,items:data.items};
 const canCreate=canWrite(resource) && resource!=='payments' ? btn(`${ic('plus')} ${resource==='users'?'Novo usuário':resource==='rentals'?'Nova locação':resource==='maintenances'?'Nova manutenção':resource==='leads'?'Nova oportunidade':resource==='customers'?'Novo cliente':'Novo veículo'}`,'new-row') : resource==='payments'&&canWrite(resource)?btn(`${ic('plus')} Registrar pagamento`,'new-row'):'';
 const actions=canCreate+(resource==='payments'?`<button class="btn outline" data-action="export-report" data-type="payments">${ic('download')} Exportar CSV</button>`:'');
 const title=resource==='rentals'?'Reservas e locações':resource==='payments'?'Financeiro':resource==='users'?'Equipe e acessos':LABEL_TYPE[resource];
 return pageTitle(title,DESCRIPTIONS[resource],actions)+tableHTML(resource,data.items);
}
function renderCompanies(data){state.data={resource:'companies',items:data.items};return pageTitle('Empresas cadastradas',DESCRIPTIONS.companies,btn(`${ic('plus')} Cadastrar empresa`,'new-company'))+tableHTML('companies',data.items);}
function renderMasterAccount(){return pageTitle('Minha conta','Configurações da sua conta de administrador master.')+`<div class="simple-grid"><div class="surface"><div class="surface-head"><strong>Dados de acesso</strong></div><div class="surface-body"><div class="summary-list"><div class="summary-row"><span>Nome</span><strong>${esc(state.user.name)}</strong></div><div class="summary-row"><span>E-mail</span><strong>${esc(state.user.email)}</strong></div><div class="summary-row"><span>Permissão</span><strong>Administrador master</strong></div></div><div style="margin-top:21px">${btn(`${ic('key')} Alterar minha senha`,'change-password')}</div></div></div><div class="surface"><div class="surface-head"><strong>Controle administrativo</strong></div><div class="surface-body"><p class="hint">Sua conta pode cadastrar locadoras, controlar planos e gerenciar os registros de cada empresa. Use uma senha exclusiva, não compartilhe o acesso e revise regularmente o histórico de auditoria.</p></div></div></div>`;}
function renderAudit(data,global){return pageTitle(global?'Auditoria da plataforma':'Auditoria da empresa','Histórico dos principais eventos, alterações e operações realizadas.')+
 `<div class="table-shell"><div class="table-scroll"><table class="data-table"><thead><tr><th>Data e hora</th><th>Responsável</th>${global?'<th>Empresa</th>':''}<th>Evento</th><th>Objeto</th><th>Identificador</th><th>IP</th></tr></thead><tbody>${data.items.length?data.items.map(x=>`<tr><td>${fmtDatetime(x.created_at)}</td><td><strong>${esc(x.actor||'Sistema')}</strong></td>${global?`<td>${esc(x.company||'Plataforma')}</td>`:''}<td><span class="status purple">${esc(x.action)}</span></td><td>${esc(x.entity_type)}</td><td>${esc(x.entity_id||'—')}</td><td>${esc(x.ip_address||'—')}</td></tr>`).join(''):`<tr><td colspan="${global?7:6}">${empty('Nenhum evento registrado.','shield')}</td></tr>`}</tbody></table></div></div>`;}
function renderReports(){
 const cards=[['vehicles','Veículos','Placas, modelos, situação da frota e tarifas.','car'],['customers','Clientes','Cadastro e informações de contato.','users'],['leads','Oportunidades','Etapas do CRM e potenciais negociações.','trend'],['rentals','Locações','Contratos, períodos e valores das locações.','calendar'],['payments','Recebimentos','Histórico de valores efetivamente recebidos.','wallet'],['maintenances','Manutenções','Histórico de serviços, custos e execução.','wrench']];
 return pageTitle('Relatórios e exportações','Exporte os registros da locadora em arquivos CSV compatíveis com planilhas.')+
 `<div class="report-grid">${cards.map(([type,title,desc,icon])=>`<div class="report-card"><div class="feature-icon">${ic(icon,22)}</div><h3>${title}</h3><p>${desc}</p><button class="btn outline sm" data-action="export-report" data-type="${type}">${ic('download',15)} Baixar CSV</button></div>`).join('')}</div><div class="warning" style="margin-top:24px">A exportação contém dados da empresa acessada e pode incluir informações pessoais. Compartilhe somente com pessoas autorizadas, conforme a LGPD.</div>`;
}
function settingsFields(company){return [
  ['trade_name','Nome fantasia','text',true,company.trade_name],['legal_name','Razão social','text',true,company.legal_name],
  ['cnpj','CNPJ','text',false,company.cnpj],['email','E-mail corporativo','email',false,company.email],
  ['phone','Telefone','tel',false,company.phone],['city','Cidade','text',false,company.city],
  ['state','UF','text',false,company.state],['address','Endereço','text',false,company.address]
 ];}
function renderSettings(data){const c=data.company;
 const content=can('company_admin')?`<form id="settingsForm"><div class="form-grid">${settingsFields(c).map(([name,label,type,required,value])=>`<div class="field"><label class="field-label" for="settings_${name}">${label}</label><input class="input" id="settings_${name}" name="${name}" type="${type}" ${required?'required':''} value="${esc(value||'')}"></div>`).join('')}</div><div class="settings-actions"><button type="submit" class="btn">${ic('check')} Salvar alterações</button><span class="hint">As informações ficam vinculadas a esta empresa.</span></div></form>`:
 `<div class="summary-list">${settingsFields(c).map(([key,label,,,value])=>`<div class="summary-row"><span>${label}</span><strong>${esc(value||'—')}</strong></div>`).join('')}</div>`;
 return pageTitle('Configurações da empresa','Dados cadastrais e informações da conta.')+
 `<div class="simple-grid"><div class="surface settings-form"><div class="surface-head"><strong>Informações da locadora</strong></div><div class="surface-body">${content}</div></div><div><div class="surface"><div class="surface-head"><strong>Plano e acesso</strong></div><div class="surface-body"><div class="summary-list"><div class="summary-row"><span>Plano</span><strong>${esc(LABEL[c.plan]||c.plan)}</strong></div><div class="summary-row"><span>Situação</span>${status(c.subscription_status,c.subscription_status==='active'?'Ativo':null)}</div><div class="summary-row"><span>Vencimento</span><strong>${fmtDate(c.expires_at)}</strong></div><div class="summary-row"><span>Empresa</span>${status(c.status==='active'?'available':'suspended')}</div></div></div></div><div class="surface" style="margin-top:20px"><div class="surface-head"><strong>Segurança da conta</strong></div><div class="surface-body"><p class="hint" style="margin-bottom:18px">Utilize uma senha exclusiva e altere-a periodicamente. Sua sessão será encerrada após a atualização.</p>${btn(`${ic('key')} Alterar minha senha`,'change-password')}</div></div></div></div>`;
}
function randomPassword(){const chars='ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';const bytes=new Uint8Array(18);crypto.getRandomValues(bytes);return Array.from(bytes,n=>chars[n%chars.length]).join('');}
function field(name,label,type='text',options={}){
 return {name,label,type,required:!!options.required,value:options.value??'',choices:options.choices||[],placeholder:options.placeholder||'',help:options.help||'',min:options.min,max:options.max,step:options.step||'any',wide:!!options.wide};
}
const textField=(n,l,req=false,value='')=>field(n,l,'text',{required:req,value});
const emailField=(n,l,req=false,value='')=>field(n,l,'email',{required:req,value});
const numField=(n,l,req=false,value='',min=0)=>field(n,l,'number',{required:req,value,min,step:'any'});
const dateField=(n,l,req=false,value='')=>field(n,l,'date',{required:req,value});
const selectField=(n,l,choices,req=true,value='')=>field(n,l,'select',{required:req,value,choices});
const multiline=(n,l,value='')=>field(n,l,'textarea',{value,wide:true});
function fieldHTML(f){
 const attrs=`name="${esc(f.name)}" id="field_${esc(f.name)}" ${f.required?'required':''} ${f.min!==undefined?`min="${esc(f.min)}"`:''} ${f.max!==undefined?`max="${esc(f.max)}"`:''} ${f.type==='number'?`step="${esc(f.step)}"`:''}`;
 const input=f.type==='select'?`<select class="select" ${attrs}><option value="">Selecione...</option>${f.choices.map(([value,label])=>`<option value="${esc(value)}" ${String(f.value)===String(value)?'selected':''}>${esc(label)}</option>`).join('')}</select>`:
 f.type==='textarea'?`<textarea class="textarea" ${attrs} placeholder="${esc(f.placeholder)}">${esc(f.value)}</textarea>`:
 `<input class="input" type="${esc(f.type)}" ${attrs} placeholder="${esc(f.placeholder)}" value="${esc(f.value)}" ${f.type==='password'?'autocomplete="new-password"':''}>`;
 return `<div class="field ${f.wide?'full':''}"><label for="field_${esc(f.name)}" class="field-label">${esc(f.label)} ${f.required?'<span style="color:#C44F6F">*</span>':''}</label>${input}${f.help?`<div class="hint" style="margin-top:5px">${esc(f.help)}</div>`:''}</div>`;
}
function modal({title,description='',fields=[],submitText='Salvar',onSubmit,closable=true,footerExtra=''}){
 modalHost.innerHTML=`<div class="modal-backdrop" id="modalBackdrop"><div class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-head"><div><h2>${esc(title)}</h2>${description?`<p>${esc(description)}</p>`:''}</div>${closable?`<button class="icon-btn" data-action="close-modal" aria-label="Fechar">${ic('close')}</button>`:''}</div><form id="modalForm"><div class="modal-body"><div class="form-grid">${fields.map(fieldHTML).join('')}</div><div class="login-error" id="modalError"></div></div><div class="modal-foot">${footerExtra}${closable?`<button class="btn outline" type="button" data-action="close-modal">Cancelar</button>`:''}<button class="btn" type="submit">${esc(submitText)} ${ic('arrow',15)}</button></div></form></div></div>`;
 const form=document.querySelector('#modalForm');const first=form.querySelector('input,select,textarea');first?.focus();
 form.addEventListener('submit',async e=>{
  e.preventDefault();const body={};for(const [k,v] of new FormData(form).entries())body[k]=v;
  const button=form.querySelector('button[type=submit]'),error=form.querySelector('#modalError');button.disabled=true;error.textContent='';
  try{await onSubmit(body);closeModal();}
  catch(err){error.textContent=err.message;if(err.status===401)reauthenticate();}
  finally{button.disabled=false;}
 });
}
function closeModal(){modalHost.innerHTML='';}
async function saveRow(resource,body,id=null){
 const url=id?`/company/${resource}/${id}`:`/company/${resource}`;
 if(id&&resource==='users'){
   if(body.is_active!==undefined)body.is_active=body.is_active==='1';
   if(!body.password)delete body.password;
 }
 if(id&&resource==='vehicles'){if(body.model_year==='')body.model_year=null;}
 if(resource==='vehicles'){body.plate=body.plate.toUpperCase();}
 if(!id&&resource==='rentals'){
   if(!body.daily_rate)delete body.daily_rate;
   if(body.pickup_km==='')body.pickup_km=null;
 }
 if(body.password==='')delete body.password;
 await api(url,{method:id?'PATCH':'POST',body});toast(id?'Registro atualizado com sucesso.':'Cadastro realizado com sucesso.');loadView();
}
async function createCompanyForm(item=null){
 const isEdit=!!item;
 const fields=[textField('trade_name','Nome fantasia',true,item?.trade_name),textField('legal_name','Razão social',true,item?.legal_name),
 textField('cnpj','CNPJ',false,item?.cnpj),emailField('email','E-mail da empresa',false,item?.email),textField('phone','Telefone',false,item?.phone),textField('city','Cidade',false,item?.city),textField('state','UF',false,item?.state),
 selectField('plan','Plano',[['start','Start'],['pro','Pro'],['enterprise','Enterprise']],true,item?.plan||'start'),
 selectField('subscription_status','Situação do plano',[['trial','Período de teste'],['active','Ativo'],['past_due','Em atraso'],['suspended','Suspenso']],true,item?.subscription_status||'trial'),
 dateField('expires_at','Vencimento do acesso',false,item?.expires_at||'')];
 if(isEdit)fields.push(selectField('status','Acesso da empresa',[['active','Habilitado'],['suspended','Bloqueado']],true,item?.status||'active'));
 else fields.push(textField('admin_name','Nome do administrador da locadora',true),emailField('admin_email','E-mail do administrador',true),field('admin_password','Senha inicial do administrador','password',{required:true,help:'Mínimo 12 caracteres, com letras e números. O usuário deverá alterá-la no primeiro acesso.',wide:true}));
 modal({title:isEdit?'Editar empresa':'Cadastrar nova locadora',description:isEdit?'Atualize informações, plano e situação de acesso.':'A empresa e seu administrador serão criados em uma única operação.',fields,submitText:isEdit?'Salvar alterações':'Cadastrar empresa',onSubmit:async data=>{
  await api(isEdit?`/admin/companies/${item.id}`:'/admin/companies',{method:isEdit?'PATCH':'POST',body:data});toast(isEdit?'Empresa atualizada.':'Empresa cadastrada e acesso criado.');loadView();
 }});
}
function configForm(resource,item=null){
 const v=(name)=>item?.[name]??'';
 switch(resource){
  case 'vehicles':return [textField('plate','Placa (ABC1234 / ABC1D23)',true,v('plate')),textField('brand','Marca',true,v('brand')),textField('model','Modelo',true,v('model')),
    numField('model_year','Ano do modelo',false,v('model_year'),1900),textField('color','Cor',false,v('color')),textField('category','Categoria',false,v('category')),
    selectField('fuel_type','Combustível',[['flex','Flex'],['gasolina','Gasolina'],['diesel','Diesel'],['eletrico','Elétrico'],['hibrido','Híbrido']],false,v('fuel_type')),
    numField('daily_rate','Valor da diária (R$)',true,v('daily_rate')),
    numField('odometer','Quilometragem atual',true,v('odometer'))];
  case 'customers':return [textField('full_name','Nome completo / empresa',true,v('full_name')),textField('document','CPF / CNPJ',false,v('document')),
    textField('phone','Telefone / WhatsApp',false,v('phone')),emailField('email','E-mail',false,v('email')),
    textField('driver_license','CNH (quando aplicável)',false,v('driver_license')),textField('address','Endereço',false,v('address')),multiline('notes','Observações',v('notes'))];
  case 'leads':return [textField('full_name','Nome do potencial cliente',true,v('full_name')),textField('phone','Telefone / WhatsApp',false,v('phone')),emailField('email','E-mail',false,v('email')),
    selectField('source','Origem',[['Instagram','Instagram'],['Facebook','Facebook'],['WhatsApp','WhatsApp'],['Google','Google'],['Indicação','Indicação'],['Site','Site'],['Outro','Outro']],false,v('source')),
    textField('interest','Veículo / interesse',false,v('interest')),
    selectField('stage','Etapa do funil',[['new','Novo'],['contacted','Em contato'],['proposal','Proposta'],['negotiation','Negociação'],['won','Ganho'],['lost','Perdido']],true,v('stage')||'new'),
    numField('estimated_value','Valor estimado (R$)',false,v('estimated_value')||0),multiline('notes','Observações da negociação',v('notes'))];
  case 'users':return [textField('full_name','Nome completo',true,v('full_name')),
    ...(item?[]:[emailField('email','E-mail de acesso',true)]),
    selectField('role','Perfil de acesso',[['company_admin','Administrador da empresa'],['manager','Gestor'],['operator','Operacional'],['finance','Financeiro']],true,v('role')||'operator'),
    ...(item?[selectField('is_active','Situação',[['1','Acesso habilitado'],['0','Acesso bloqueado']],true,String(item.is_active?1:0))]:[]),
    field('password',item?'Nova senha (deixe vazio para manter)':'Senha inicial','password',{required:!item,help:'Mínimo 12 caracteres com letras e números. A troca será exigida no próximo login.',wide:true})];
  default:return [];
 }
}
async function newRow(resource){
 if(['vehicles','customers','leads','users'].includes(resource)){
  modal({title:(resource==='users'?'Adicionar usuário':resource==='vehicles'?'Cadastrar veículo':resource==='customers'?'Cadastrar cliente':'Nova oportunidade'),
    description:`Informe os dados para ${resource==='users'?'criar um novo acesso':'registrar na locadora'}.`,fields:configForm(resource),submitText:'Cadastrar',onSubmit:async body=>saveRow(resource,body)});return;
 }
 if(resource==='rentals'){
  const [vehicles,customers]=await Promise.all([api('/company/vehicles'),api('/company/customers')]);
  if(!vehicles.items.length||!customers.items.length){toast('Cadastre pelo menos um veículo e um cliente antes de criar uma locação.',true);return;}
  const fields=[selectField('customer_id','Cliente',customers.items.map(c=>[c.id,c.full_name]),true),
    selectField('vehicle_id','Veículo',vehicles.items.filter(v=>!['maintenance','inactive'].includes(v.status)).map(v=>[v.id,`${v.plate} • ${v.brand} ${v.model} (${money(v.daily_rate)}/dia)`]),true),
    dateField('start_date','Data da retirada',true,today()),dateField('due_date','Previsão de devolução',true,tomorrow()),
    selectField('status','Operação inicial',[['reserved','Reserva'],['active','Iniciar locação agora']],true,'reserved'),
    numField('daily_rate','Diária negociada (R$) — opcional',false,''),numField('deposit_amount','Caução prevista (R$)',false,0),
    numField('pickup_km','KM na retirada (opcional)',false,''),multiline('notes','Observações do contrato')];
  modal({title:'Nova reserva / locação',description:'O sistema verifica conflitos de período antes de registrar o contrato.',fields,submitText:'Criar contrato',onSubmit:async data=>{await saveRow('rentals',data);}});return;
 }
 if(resource==='payments'){
  const rentals=await api('/company/rentals');const options=rentals.items.filter(r=>r.status!=='cancelled').map(r=>[r.id,`${r.code} · ${r.customer_name} · ${money(r.total_amount)}`]);
  if(!options.length){toast('Cadastre uma locação antes de registrar pagamentos.',true);return;}
  modal({title:'Registrar recebimento',description:'O pagamento ficará vinculado à locação e refletirá nos indicadores financeiros.',fields:[
    selectField('rental_id','Contrato de locação',options,true),numField('amount','Valor recebido (R$)',true,''),
    selectField('method','Forma de pagamento',[['pix','Pix'],['cash','Dinheiro'],['card','Cartão'],['transfer','Transferência'],['other','Outro']],true,'pix'),
    dateField('paid_at','Data do recebimento',true,today()),multiline('notes','Observações do lançamento')],submitText:'Registrar recebimento',onSubmit:async data=>saveRow('payments',data)});return;
 }
 if(resource==='maintenances'){
  const vehicles=await api('/company/vehicles');if(!vehicles.items.length){toast('Cadastre um veículo antes da manutenção.',true);return;}
  modal({title:'Programar manutenção',description:'Informe o veículo e o serviço a ser executado.',fields:[
    selectField('vehicle_id','Veículo',vehicles.items.map(v=>[v.id,`${v.plate} • ${v.brand} ${v.model}`]),true),
    textField('service_type','Tipo de serviço',true),textField('supplier','Oficina / fornecedor'),
    numField('cost','Custo estimado (R$)',false,0),dateField('scheduled_date','Data programada',true,today()),
    selectField('status','Situação inicial',[['scheduled','Programada'],['in_progress','Iniciar imediatamente']],true,'scheduled'),
    multiline('notes','Observações')],submitText:'Registrar manutenção',onSubmit:async data=>saveRow('maintenances',data)});
 }
}
function editRow(resource,item){
 modal({title:resource==='users'?'Editar usuário':resource==='vehicles'?'Editar veículo':resource==='customers'?'Editar cliente':'Editar oportunidade',
  description:'Altere os campos necessários e salve as informações.',fields:configForm(resource,item),submitText:'Salvar alterações',onSubmit:async body=>saveRow(resource,body,item.id)});
}
async function downloadCSV(type){
 const headers={};if(state.tenantId)headers['X-Company-Id']=String(state.tenantId);
 const response=await fetch(`/api/company/reports/export?type=${encodeURIComponent(type)}`,{credentials:'same-origin',headers});
 if(!response.ok){const result=await response.json().catch(()=>({}));throw new Error(result.error||'Não foi possível exportar o relatório.');}
 const blob=await response.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`crmlocar-${type}-${today()}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Relatório exportado com sucesso.');
}
async function doAction(action,el){
 if(action==='logout'){await api('/auth/logout',{method:'POST'});reauthenticate();return;}
 if(action==='toggle-menu'){document.querySelector('#sidebar')?.classList.toggle('open');return;}
 if(action==='close-modal'){if(!state.user?.mustChangePassword)closeModal();return;}
 if(action==='exit-company'){exitCompany();return;}
 if(action==='reload'){loadView();return;}
 if(action==='new-company'){createCompanyForm();return;}
 if(action==='new-rental'){newRow('rentals');return;}
 if(action==='change-password'){showChangePassword();return;}
 if(action==='new-row'){newRow(state.view);return;}
 if(action==='export-report'){await downloadCSV(el.dataset.type);return;}
 const item=(state.data?.items||[]).find(x=>String(x.id)===String(el.dataset.id));
 if(!item){toast('Registro não encontrado. Atualize a página.',true);return;}
 if(action==='enter-company'){enterCompany(item);return;}
 if(action==='edit-company'){createCompanyForm(item);return;}
 if(action==='edit-row'){editRow(state.view,item);return;}
 if(action==='vehicle-status'){
  const next=item.status==='available'?'inactive':'available';
  if(!confirm(`Confirma ${next==='inactive'?'desativar':'ativar'} o veículo ${item.plate}?`))return;
  await api(`/company/vehicles/${item.id}/status`,{method:'PATCH',body:{status:next}});toast('Situação do veículo atualizada.');loadView();return;
 }
 if(action==='activate-rental'){
  if(!confirm(`Iniciar a locação ${item.code} para ${item.customer_name}?`))return;
  await api(`/company/rentals/${item.id}/activate`,{method:'POST',body:{}});toast('Locação iniciada.');loadView();return;
 }
 if(action==='finish-rental'){
  modal({title:`Devolver veículo · ${item.code}`,description:'Informe a quilometragem final e confirme os valores do contrato.',fields:[
    numField('return_km','Quilometragem na devolução',true,'',Number(item.pickup_km||0)),
    numField('total_amount','Valor final do contrato (R$)',true,item.total_amount),
    dateField('actual_return_date','Data da devolução',true,today())],submitText:'Finalizar locação',onSubmit:async data=>{
      await api(`/company/rentals/${item.id}/complete`,{method:'POST',body:data});toast('Locação concluída e veículo liberado.');loadView();
    }});return;
 }
 if(action==='cancel-rental'){
  if(!confirm(`Cancelar o contrato ${item.code}? A operação não poderá ser desfeita.`))return;
  await api(`/company/rentals/${item.id}/cancel`,{method:'POST',body:{}});toast('Contrato cancelado.');loadView();return;
 }
 if(action==='start-maintenance'){
  if(!confirm(`Iniciar manutenção de ${item.plate}? O veículo ficará indisponível.`))return;
  await api(`/company/maintenances/${item.id}/status`,{method:'POST',body:{status:'in_progress'}});toast('Manutenção iniciada.');loadView();return;
 }
 if(action==='finish-maintenance'){
  modal({title:'Concluir manutenção',description:`Veículo ${item.plate} · ${item.service_type}`,fields:[
    numField('cost','Custo final (R$)',true,item.cost),dateField('performed_date','Data da conclusão',true,today())],
    submitText:'Concluir manutenção',onSubmit:async data=>{
      await api(`/company/maintenances/${item.id}/status`,{method:'POST',body:{status:'completed',...data}});
      toast('Manutenção concluída e veículo disponibilizado.');loadView();
    }});return;
 }
}
function reauthenticate(){state.user=null;state.csrf=null;state.tenantId=null;state.tenantName=null;state.data=null;state.view='overview';closeModal();history.replaceState(null,'','/entrar');renderLogin();}
function showChangePassword(){
 const forced=!!state.user?.mustChangePassword;
 modal({title:forced?'Defina sua senha pessoal':'Alterar minha senha',description:forced?'Por segurança, o primeiro acesso exige a troca da senha inicial.':'Após alterar sua senha, você precisará entrar novamente.',
  closable:!forced,fields:[field('currentPassword','Senha atual','password',{required:true,wide:true}),field('newPassword','Nova senha','password',{required:true,wide:true,help:'Mínimo 12 caracteres, com letras e números.'})],
  submitText:'Atualizar senha',onSubmit:async body=>{const result=await api('/auth/change-password',{method:'POST',body});toast(result.message);state.user.mustChangePassword=false;reauthenticate();}});
}
// Delegação de eventos: todo botão gerado no HTML tem um efeito real.
document.addEventListener('click',async event=>{
 const nav=event.target.closest('[data-view]');
 if(nav){event.preventDefault();setView(nav.dataset.view);return;}
 const go=event.target.closest('[data-go]');
 if(go){event.preventDefault();goto(go.dataset.go);return;}
 const action=event.target.closest('[data-action]');
 if(action){event.preventDefault();try{await doAction(action.dataset.action,action);}catch(err){toast(err.message,true);if(err.status===401)reauthenticate();}}
});
document.addEventListener('input',event=>{
 if(event.target.id==='tableSearch'){
  const query=event.target.value.trim().toLowerCase(),rows=document.querySelectorAll('#tableRows tr[data-search]');let visible=0;
  rows.forEach(row=>{const match=row.dataset.search.includes(query);row.hidden=!match;if(match)visible++;});
  const count=document.querySelector('#visibleCount');if(count)count.textContent=`${visible} registro(s) encontrado(s)`;
 }
});
document.addEventListener('submit',async event=>{
 if(event.target.id==='settingsForm'){
  event.preventDefault();const button=event.target.querySelector('button[type=submit]');button.disabled=true;
  try{const data=Object.fromEntries(new FormData(event.target).entries());await api('/company/profile',{method:'PATCH',body:data});toast('Dados da empresa atualizados.');loadView();}
  catch(err){toast(err.message,true);}finally{button.disabled=false;}
 }
});
window.addEventListener('popstate',()=>{if(state.user)renderApp();else route();});
bootstrap();
