const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const PDFLib=require('pdf-lib');
const base=path.join(__dirname,'..','visa-schengen-portugal');
const code=fs.readFileSync(path.join(base,'bls-original-export.js'),'utf8');
const raw=fs.readFileSync(path.join(base,'bls-morocco-official.pdf'));
const el={};
['blsExport','blsPrint','blsLoad','blsTemplateInput','status','blsStatus'].forEach(id=>el[id]={disabled:false,textContent:'',files:[],click(){}});
const blobs=[];
const data={
  f1:'EL OTMANI', f3:'ABDELRAHIM', f4:'1992-05-15', f5:'CASABLANCA',
  f6:'MOROCCO',f7:'MOROCCAN',f8:'Homme',f9:'Célibataire',
  f12:'Passeport ordinaire',f13:'BA749000',f14:'2022-01-12',f15:'2032-01-11',f16:'MOROCCO',
  f19:'18 AVENUE CENTRAL, CASABLANCA',f19b:'test@example.com',
  f19c:'+212 600000000',f20:'Non',f21:'ACCOUNTANT',f22:'ACME LTD',
  f23:'Études',f24:'Ten-day vocational training in Porto',
  f25:'PORTUGAL',f26:'PORTUGAL',f27:'Une entrée',
  arrival:'2026-11-20',departure:'2026-11-30',f28:'Oui',
  f28b:'2024-04-02',f28c:'123456789',
  f30:'EUROPOLYTECH ACADEMY',f30b:'PORTO PORTUGAL',f30c:'info@example.com',f30d:'+351999999999',
  f31:'EUROPOLYTECH ACADEMY',f31a:'PORTO',f31b:'TRAINING MANAGER',
  f32:'Le demandeur',f32a:'Argent liquide | Carte de crédit',city:'CASABLANCA',signed:'2026-10-19',consent:'Oui'
};
const context={
  console, PDFLib, crypto:webcrypto, Blob, Uint8Array, Date, String, TextEncoder, setTimeout:()=>0,
  fetch:async()=>({ok:true,arrayBuffer:async()=>raw}),
  URL:{createObjectURL(blob){blobs.push(blob);return 'blob:mock'},revokeObjectURL(){}},
  document:{
    getElementById:id=>el[id]||null,
    createElement:()=>({click(){},remove(){},href:'',download:''}),
    body:{append(){}}
  },
  window:{PDFLib},
  indexedDB:undefined,all:[],data,capture:()=>{},confirm:()=>true,alert:console.warn
};
vm.runInNewContext(code,context,{filename:'bls-original-export.js'});
(async()=>{
 await el.blsExport.onclick();
 await new Promise(r=>setTimeout(r,1000));
 assert.equal(blobs.length,1,'PDF download must produce a blob');
 const bytes=new Uint8Array(await blobs[0].arrayBuffer());
 const loaded=await PDFLib.PDFDocument.load(bytes);
 assert.equal(loaded.getPageCount(),4,'Expected four original BLS pages');
 assert(bytes.length>100000,'Expected unchanged original PDF underlying content');
 console.log('PASS: Completed BLS PDF generated, original 4 pages preserved, '+bytes.length+' bytes');
 console.log('PASS: '+el.status.textContent);
})().catch(e=>{console.error(e);process.exitCode=1});
