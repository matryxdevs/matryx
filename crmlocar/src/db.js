const mysql = require('mysql2/promise');
const fs = require('node:fs');
const path = require('node:path');
const bcrypt = require('bcryptjs');

function getConfig() {
  const keys = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = keys.filter(k => !process.env[k] || process.env[k].startsWith('COLOQUE_'));
  if (missing.length) throw new Error(`Configuração MySQL incompleta: ${missing.join(', ')}. Veja .env.example e o README.`);
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 8,
    connectTimeout: 12000,
    charset: 'utf8mb4',
    dateStrings: true,
    decimalNumbers: true,
    timezone: 'Z'
  };
}

let pool;
function db() {
  if (!pool) pool = mysql.createPool(getConfig());
  return pool;
}
async function initDatabase() {
  const connection = await db().getConnection();
  try {
    await connection.query('SELECT 1');
    const sql = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');
    // DDL simples. Divide as instruções por ponto-e-vírgula; não há procedures/triggers.
    const statements = sql.replace(/^--[^\n]*$/gm, '').split(';').map(s => s.trim()).filter(Boolean);
    for (const statement of statements) await connection.query(statement);
    const [rows] = await connection.query("SELECT COUNT(*) AS total FROM users WHERE role = 'superadmin'");
    if (!rows[0].total) {
      const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      const password = process.env.ADMIN_PASSWORD || '';
      if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 12 || password.startsWith('DEFINA_')) {
        throw new Error('Não existe superadministrador. Defina ADMIN_EMAIL e ADMIN_PASSWORD (mínimo 12 caracteres) nas variáveis de ambiente para criar o primeiro acesso.');
      }
      const hash = await bcrypt.hash(password, 12);
      await connection.query('INSERT INTO users (company_id,full_name,email,password_hash,role) VALUES (NULL,?,?,?,?)', ['Administrador Crmlocar',email,hash,'superadmin']);
      console.log(`Superadministrador inicial criado: ${email}. Remova ADMIN_PASSWORD do ambiente e altere a senha após acessar.`);
    }
  } finally { connection.release(); }
}
module.exports = { db, initDatabase };
