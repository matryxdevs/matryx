const test=require('node:test');
const assert=require('node:assert/strict');
const u=require('../src/utils');

test('intervalo e quantidade de diárias',()=>{
 assert.equal(u.rentalDays('2026-11-20','2026-11-23'),3);
 assert.throws(()=>u.rentalDays('2026-11-23','2026-11-23'));
 assert.throws(()=>u.rentalDays('2026-11-25','2026-11-23'));
});
test('datas inválidas são rejeitadas',()=>{
 assert.equal(u.date('2028-02-29'),'2028-02-29');
 assert.throws(()=>u.date('2026-02-29'));
 assert.throws(()=>u.date('2026-13-01'));
});
test('valor monetário arredondado corretamente',()=>{
 assert.equal(u.money('155.255'),155.26);
 assert.throws(()=>u.money('-10'));
 assert.throws(()=>u.money('abc'));
 assert.throws(()=>u.money('0','Valor',true));
});
test('placas são normalizadas e verificadas',()=>{
 assert.equal(u.plate('abc-1234'),'ABC1234');
 assert.equal(u.plate('abc1d23'),'ABC1D23');
 assert.throws(()=>u.plate('invalida'));
});
test('IDs negativos e inválidos são recusados',()=>{
 assert.equal(u.id('35'),35);
 assert.throws(()=>u.id('0'));
 assert.throws(()=>u.id('1 OR 1=1'));
 assert.throws(()=>u.id('NaN'));
});
test('CSV neutraliza fórmulas e preserva campos',()=>{
 assert.equal(u.csvValue('=1+1'),"\"'=1+1\"");
 assert.equal(u.csvValue('@SUM(A1)'),"\"'@SUM(A1)\"");
 assert.equal(u.csvValue('Cliente "A"'),"\"Cliente \"\"A\"\"\"");
});
