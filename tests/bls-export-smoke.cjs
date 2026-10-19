const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const PDFLib=require('pdf-lib');
const base=path.join(__dirname,'..','visa-schengen-portugal');
const template=fs.readFileSync(path.join(base,'bls-morocco-official.pdf'));
const rules=fs.readFileSync(path.join(base,'visa-rules.js'),'utf8');
const code=fs.readFileSync(path.join(base,'bls-original-export.js'),'utf8');
const elements={};
for(const id of ['blsPreview','blsExport','blsPrint','blsLoad','blsTemplateInput','status','blsStatus','blsPreviewFrame','blsPreviewDialog','blsApproval','blsApproveButton','blsPreviewClose','blsPreviewOpen']){
 elements[id]={disabled:false,textContent:'',checked:false,files:[],click(){},close(){this.open=false},showModal(){this.open=true}};
}
const urls=[];
const data={
 f1:'SAMPLE',f3:'APPLICANT',f4:'1990-05-15',f5:'RABAT',f6:'MOROCCO',f7:'MOROCCAN',
 f8:'Homme',f9:'Célibataire',f12:'Passeport ordinaire',f13:'AB123456',
 f14:'2022-01-12',f15:'2032-01-11',f16:'MOROCCO',
 f19:'10 EXAMPLE STREET RABAT',f19b:'example@test.invalid',f19c:'+212600000000',
 f20:'Non',f21:'ACCOUNTANT',f22:'EXAMPLE LTD, RABAT, +212600000000',
 f23:'Études',f24:'Ten-day professional training in Porto from 20 to 30 November 2026.',
 f25:'PORTUGAL',f26:'PORTUGAL',f27:'Entrées multiples',
 arrival:'2026-11-20',departure:'2026-11-30',f28:'Non',f29Applicable:'Non',
 f30role:'Hôtel / hébergement',f30:'SAMPLE HOTEL',f30b:'RUA EXEMPLO 10 PORTO',
 f30c:'hotel@test.invalid',f30d:'+351200000000',
 f31:'EUROPOLYTECH ACADEMY',f31a:'PORTO',f31b:'TRAINING MANAGER',
 f32:'Le demandeur',f32a:'Argent liquide | Carte de crédit',
 f32b:'Oui',f32c:'Argent liquide | Tous les frais financés',
 f33self:'Oui',f33:'SHOULD NOT APPEAR',city:'RABAT',signed:'2026-10-19',consent:'Oui',
 screenPassport:'Moroccan citizen',screenResidence:'Morocco'
};
const windowObj={PDFLib};
const context={
 console,PDFLib,crypto:webcrypto,Blob,Uint8Array,Date,String,TextEncoder,
 window:windowObj,document:{getElementById:id=>elements[id]||null,
   createElement:()=>({click(){},remove(){},href:'',download:''}),body:{append(){}}},
 fetch:async()=>({ok:true,arrayBuffer:async()=>template}),
 URL:{createObjectURL(b){urls.push(b);return 'blob:mock/'+urls.length},revokeObjectURL(){}},
 indexedDB:undefined,all:[],data,capture:()=>{},confirm:()=>true,alert:console.warn,setTimeout:()=>0
};
vm.runInNewContext(rules,context,{filename:'visa-rules.js'});
vm.runInNewContext(code,context,{filename:'bls-original-export.js'});
(async()=>{
 const vr=windowObj.visaRules;
 assert(vr,'Rules module was not loaded');
 const clean=vr.sanitized(data);
 assert.equal(clean.f32b,'','Self-funded applicant must not retain guarantor identity');
 assert.equal(clean.f32c,'','Self-funded applicant must not retain guarantor benefits');
 assert.equal(clean.f33,'','Self-completed application must leave third-party completer blank');
 assert.equal(vr.validate({...data,screenResidence:'United Kingdom'},[]).warnings.some(x=>x.field==='screenResidence'),true);
 assert.equal(vr.validate({...data,screenPassport:'British citizen (UK)'},[]).warnings.some(x=>x.field==='screenPassport'),true);
 console.log('PASS: Funding, preparer and jurisdiction validation rules');

 await elements.blsPreview.onclick();
 assert(elements.blsPreviewDialog.open===true,'PDF preview must open');
 assert.equal(urls.length,1,'Preview must generate the original PDF');
 assert.equal(elements.blsApproval.checked,false,'PDF confirmation must be unchecked by default');
 await elements.blsExport.onclick();
 assert.equal(urls.length,2,'Without approval the tool must require another preview, not download');
 elements.blsApproval.checked=true;
 elements.blsApproveButton.onclick();
 assert.equal(elements.blsPreviewDialog.open,false,'Approval closes preview');
 await elements.blsExport.onclick();
 assert.equal(urls.length,3,'Approval triggers download after reviewing');
 const bytes=new Uint8Array(await urls[2].arrayBuffer());
 const doc=await PDFLib.PDFDocument.load(bytes);
 assert.equal(doc.getPageCount(),4,'Filled original BLS PDF remains exactly four pages');
 assert(bytes.length>100000,'Original BLS underlying content must remain');
 console.log('PASS: Reviewed four-page original BLS PDF exported ('+bytes.length+' bytes)');

 // A change after approval must invalidate the exported document.
 data.f30='DIFFERENT HOTEL';
 await elements.blsExport.onclick();
 assert(elements.blsPreviewDialog.open===true,'Editing form invalidates prior approval');
 console.log('PASS: Changes require a new four-page PDF preview');

 data.f30b='UNREASONABLYLONGSINGLEWORD'.repeat(45);
 const before=urls.length;
 await elements.blsPreview.onclick();
 assert.equal(urls.length,before,'Overlong entry must not produce an apparently complete BLS PDF');
 assert(elements.status.textContent.includes('Texte trop long'),'Readable-text validation warning expected');
 console.log('PASS: Overlong field is rejected instead of printed illegibly or truncated');
})().catch(err=>{console.error(err);process.exitCode=1});
