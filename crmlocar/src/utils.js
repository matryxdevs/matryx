class AppError extends Error { constructor(status, message) { super(message); this.status = status; } }
const fail = (status,message) => { throw new AppError(status,message); };
const required = (value,name,max=180) => {
  if (typeof value !== 'string' || !value.trim()) fail(400,`${name} é obrigatório.`);
  if (value.trim().length > max) fail(400,`${name} excede ${max} caracteres.`);
  return value.trim();
};
const optional = (value,name,max=190) => {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.trim().length > max) fail(400,`Valor inválido para ${name}.`);
  return value.trim() || null;
};
const email = (v,name='E-mail',nullable=false) => {
  const value = nullable ? optional(v,name,190) : required(v,name,190);
  if (!value && nullable) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) fail(400,`${name} inválido.`);
  return value.toLowerCase();
};
const oneOf = (value,values,name) => values.includes(value) ? value : fail(400,`${name} inválido.`);
const money = (value,name='Valor',positive=false) => {
  const n = Number(value);
  if (value === '' || value == null || !Number.isFinite(n) || n < 0 || n > 999999999 || (positive && n === 0)) fail(400,`${name} inválido.`);
  return Math.round(n * 100) / 100;
};
const unsigned = (value,name,nullable=false) => {
  if (nullable && (value === '' || value == null)) return null;
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 0 || n > 2000000000 || value === '' || value == null) fail(400,`${name} inválido.`);
  return n;
};
const id = (value) => {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1) fail(400,'Identificador inválido.');
  return n;
};
const date = (value,name='Data',nullable=false) => {
  if (nullable && (value == null || value === '')) return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(400,`${name} inválida.`);
  const day = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(day.getTime()) || day.toISOString().slice(0,10) !== value) fail(400,`${name} inválida.`);
  return value;
};
const rentalDays = (start,end) => {
  const diff = (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000;
  if (!Number.isInteger(diff) || diff < 1 || diff > 3650) fail(400,'O término deve ser posterior ao início (limite de 10 anos).');
  return diff;
};
const plate = value => {
  const v = required(value,'Placa',10).toUpperCase().replace(/[-\s]/g,'');
  if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(v)) fail(400,'Placa inválida. Use ABC1234 ou ABC1D23.');
  return v;
};
const object = x => x && typeof x === 'object' && !Array.isArray(x) ? x : {};
const today = () => new Date().toISOString().slice(0,10);
function csvValue(value) {
  if (value == null) return '""';
  let text = String(value);
  if (/^[\s]*[=+@]/.test(text) || /^[\s]*-(?!\d)/.test(text)) text = "'"+text;
  return '"' + text.replace(/"/g,'""') + '"';
}
module.exports = { AppError,fail,required,optional,email,oneOf,money,unsigned,id,date,rentalDays,plate,object,today,csvValue };
