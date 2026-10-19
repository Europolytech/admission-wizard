(function () {
'use strict';
const TEMPLATE_PATH='bls-morocco-official.pdf';
const BLS_ORIGINAL_SHA256='aeda814bec2ab040d23ba3abec7085fcff36a70df9cf044f7f3fd42c437629f6';
const X=595.56/910; 
const T=[[0,81,344,530,18,"f1"],[0,81,388,530,18,"f2"],[0,81,437,530,20,"f3"],[0,82,542,110,38,"f4"],[0,211,511,245,29,"f5"],[0,211,564,245,24,"f6"],[0,477,506,141,27,"f7"],[0,478,576,141,17,"f7b"],[0,478,598,141,7,"f7c"],[0,483,673,130,11,"f9other"],[0,80,745,536,26,"f10"],[0,80,805,530,13,"f11"],[0,455,893,159,9,"f12other"],[0,81,981,119,13,"f13"],[0,210,982,122,13,"f14"],[0,342,982,118,13,"f15"],[0,473,983,143,13,"f16"],[0,80,1134,254,11,"f17"],[0,347,1134,271,11,"f17a"],[1,79,143,121,18,"f17b"],[1,213,145,243,16,"f17d"],[1,480,145,139,16,"f17c"],[1,283,254,325,9,"f18other"],[1,81,317,375,11,"f19"],[1,81,332,375,7,"f19b"],[1,477,325,140,15,"f19c"],[1,254,399,190,13,"f20b"],[1,482,401,133,10,"f20c"],[1,82,447,526,10,"f21"],[1,82,501,537,9,"f22"],[1,208,570,408,13,"f23b"],[1,82,625,539,11,"f24"],[1,82,705,252,9,"f25"],[1,83,716,250,5,"f25b"],[1,350,704,265,10,"f26"],[1,83,799,532,16,"arrival"],[1,83,852,532,16,"departure"],[1,82,951,264,15,"f28b"],[1,410,951,209,15,"f28c"],[1,189,1022,182,11,"f29"],[1,388,1039,229,8,"f29b"],[1,83,1107,536,11,"f30"],[1,82,1195,252,30,"f30b"],[1,82,1225,250,10,"f30c"],[1,350,1192,268,12,"f30d"],[2,83,101,538,11,"f31"],[2,83,115,538,7,"f31a"],[2,83,194,250,14,"f31b"],[2,83,211,248,14,"f31c"],[2,83,229,247,13,"f31d"],[2,83,245,247,13,"f31e"],[2,352,235,259,13,"f31f"],[2,118,481,212,16,"f32a_other"],[2,380,528,234,20,"f32c_other"],[2,388,363,227,8,"f32d"],[2,83,615,537,14,"f33"],[2,83,705,252,15,"f33b"],[2,350,705,268,15,"f33c"],[3,83,1065,260,15,"city"],[3,83,1090,258,15,"signed"]];
const C=[[0,"f8",{"Homme":[85,634],"Femme":[85,656]}],[0,"f9",{"Célibataire":[225,634],"Marié(e)":[330,634],"Partenariat enregistré":[389,634],"Séparé(e)":[521,634],"Divorcé(e)":[588,634],"Veuf / Veuve":[282,655],"Autre":[365,655]}],[0,"f12",{"Passeport ordinaire":[96,849],"Passeport diplomatique":[240,850],"Passeport de service":[389,850],"Passeport officiel":[96,870],"Passeport spécial":[230,871],"Autre":[96,891]}],[1,"f18",{"Conjoint":[107,229],"Enfant":[177,229],"Petit-enfant":[229,229],"Ascendant dépendant":[370,229],"Partenariat enregistré":[107,249],"Autre":[249,250]}],[1,"f20",{"Non":[85,369],"Oui":[85,392]}],[1,"f23",{"Tourisme":[85,535],"Affaires":[184,537],"Visite à la famille ou à des amis":[242,537],"Culture":[436,537],"Sports":[494,537],"Visite officielle":[85,552],"Raisons médicales":[212,553],"Études":[334,553],"Transit aéroportuaire":[387,553],"Autre":[85,568]}],[1,"f27",{"Une entrée":[85,743],"Deux entrées":[203,743],"Entrées multiples":[303,743]}],[1,"f28",{"Non":[85,915],"Oui":[123,915]}],[2,"f32",{"Le demandeur":[85,287],"Un garant":[355,287],"Le demandeur et un garant":[85,287]}],[2,"f32b",{"Oui":[355,325],"Non, autre garant":[355,348]}]];
const M=[[2,"f32a",{"Argent liquide":[85,378],"Chèques de voyage":[85,399],"Carte de crédit":[85,420],"Hébergement prépayé":[85,440],"Transport prépayé":[85,461],"Autre":[85,482]}],[2,"f32c",{"Argent liquide":[355,418],"Hébergement fourni":[355,441],"Tous les frais financés":[355,463],"Transport prépayé":[355,506],"Autre":[355,528]}]];
let pdfTemplateBytes=null;
async function templateDB(){return new Promise((resolve,reject)=>{if(!indexedDB){reject(new Error('IndexedDB indisponible'));return}const req=indexedDB.open('EuroPolytechBlsBlankTemplate',1);req.onupgradeneeded=()=>req.result.createObjectStore('pdfs');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)})}
async function fromCache(){try{const db=await templateDB();return await new Promise(resolve=>{const t=db.transaction('pdfs','readonly');const q=t.objectStore('pdfs').get('original');q.onsuccess=()=>resolve(q.result?new Uint8Array(q.result):null);q.onerror=()=>resolve(null)})}catch{return null}}
async function toCache(bytes){try{const db=await templateDB();await new Promise((resolve,reject)=>{const t=db.transaction('pdfs','readwrite');t.objectStore('pdfs').put(bytes,'original');t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}catch(e){console.warn('Blank template not cached:',e.message)}}
const $=id=>document.getElementById(id);
const status=m=>{if($('status'))$('status').textContent=m};
const humanDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)?v.slice(8,10)+'-'+v.slice(5,7)+'-'+v.slice(0,4):v;
async function sha256(bytes){let hash=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));return [...hash].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function verifyTemplate(bytes){if(bytes.length<40000)throw Error('Le fichier n’est pas un PDF BLS valide.');let hash=await sha256(bytes);if(hash!==BLS_ORIGINAL_SHA256)throw Error('Le PDF sélectionné ne correspond pas exactement au formulaire BLS Maroc de référence (version transmise à EuroPolytech). Téléchargez le modèle correct depuis la page BLS.');const pdf=await PDFLib.PDFDocument.load(bytes);if(pdf.getPageCount()!==4)throw Error('Le formulaire BLS doit contenir quatre pages.');return bytes;}
async function localTemplate(){if(pdfTemplateBytes)return pdfTemplateBytes;try{const res=await fetch(TEMPLATE_PATH,{cache:'force-cache'});if(res.ok){const bytes=new Uint8Array(await res.arrayBuffer());pdfTemplateBytes=await verifyTemplate(bytes);$('blsStatus').textContent='✓ Modèle original BLS disponible';return bytes;}}catch(err){console.warn('Official bundled template unavailable:',err.message)}try{const cached=await fromCache();if(cached){pdfTemplateBytes=await verifyTemplate(cached);$('blsStatus').textContent='✓ Modèle BLS mémorisé sur cet appareil';return pdfTemplateBytes}}catch(e){console.warn('Cached BLS file invalid:',e.message)}return null}
function dateReport(){
 const res=window.visaRules?.validate(data,all);
 if(res){const msg=res.errors.map(z=>z.message).slice(0,5);if(msg.length){status('Corrigez avant de générer le BLS : '+msg.join(' | '));throw new Error(msg.join(' ; '))}if(res.warnings.length)status(res.warnings.length+' point(s) à vérifier dans la relecture.');return true;}
 const missing=all.filter(f=>f[3]&&!data[f[0]]);if(missing.length){status('Champs obligatoires manquants : '+missing.length);return false;}
 if(data.arrival&&data.departure&&data.departure<data.arrival){status('Dates de voyage incohérentes.');return false;}return true;
}
async function getTemplate(){
 let bytes=await localTemplate();if(bytes)return bytes;
 if($('blsTemplateInput').files.length){const file=$('blsTemplateInput').files[0];bytes=await verifyTemplate(new Uint8Array(await file.arrayBuffer()));pdfTemplateBytes=bytes;await toCache(bytes);return bytes;}
 $('blsStatus').textContent='Chargez une seule fois le PDF BLS officiel vierge pour remplir sa mise en page exacte.';
 $('blsTemplateInput').click();throw Error('Modèle BLS original nécessaire : sélectionnez le fichier PDF fourni par BLS.');
}
function textValue(id){const effective=window.visaRules?.sanitized(data)||data;return String(effective[id]||'').trim()}
function clipToBox(font,s,widthPx,linesMax,fontSize){
 const text=String(s).replace(/\s+/g,' ').trim(),maxWidth=widthPx*X;let words=text.split(' '),lines=[],current='';
 function pushWord(word){
   if(!word)return;
   if(font.widthOfTextAtSize(word,fontSize)>maxWidth){
     let part='';for(const char of Array.from(word)){const candidate=part+char;if(part&&font.widthOfTextAtSize(candidate,fontSize)>maxWidth){if(current){lines.push(current);current=''}lines.push(part);part=char}else part=candidate}word=part;
   }
   if(!current)current=word;else if(font.widthOfTextAtSize(current+' '+word,fontSize)<=maxWidth)current+=' '+word;
   else{lines.push(current);current=word}
 }
 words.forEach(pushWord);if(current)lines.push(current);
 return {lines:lines.slice(0,linesMax),missing:lines.length>linesMax?lines.slice(linesMax).join(' '):''};
}
function sourceFingerprint(){return JSON.stringify(window.visaRules?.sanitized(data)||data)}
async function buildPdf(){
 capture();if(!dateReport())return null;
 if(!window.PDFLib)throw new Error('Le moteur PDF est indisponible. Veuillez réessayer.');
 const bytes=await getTemplate(),pdf=await PDFLib.PDFDocument.load(bytes),pages=pdf.getPages();
 const helv=await pdf.embedFont(PDFLib.StandardFonts.Helvetica),bold=await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
 const color=PDFLib.rgb(.05,.25,.56),overflows=[];
 const effective=window.visaRules?.sanitized(data)||data;
 function stamp(pi,x,y,width,height,key){
   let value=textValue(key);if(!value)return;
   value=humanDate(value);
   // Never silently shrink to an illegible font. Report text that cannot fit.
   const fontSize=height>=27?7.6:7.4;
   const maxLines=height>=27?2:1;
   const result=clipToBox(helv,value,width,maxLines,fontSize);
   if(result.missing){overflows.push(key);return;}
   const page=pages[pi],baseline=page.getHeight()-y*X;
   result.lines.forEach((line,i)=>{
     try{page.drawText(line,{x:x*X,y:baseline-i*9.2,size:fontSize,font:helv,color})}
     catch(e){overflows.push(key)}
   })
 }
 T.forEach(([p,x,y,w,h,key])=>stamp(p,x,y,w,h,key));
 function check(pi,x,y){const page=pages[pi];page.drawText('X',{x:x*X-2.7,y:page.getHeight()-(y+3)*X,size:8,font:bold,color})}
 C.forEach(([p,k,map])=>{const val=effective[k];if(map[val])check(p,...map[val]);if(k==='f32'&&val==='Le demandeur et un garant'&&map['Un garant'])check(p,...map['Un garant'])});
 M.forEach(([p,k,map])=>{String(effective[k]||'').split(' | ').forEach(val=>{if(map[val])check(p,...map[val])})});
 if(overflows.length)throw new Error('Texte trop long pour la case BLS ('+overflows.join(', ')+'). Raccourcissez ces réponses sans omettre de données importantes. Le PDF ne sera pas tronqué.');
 pdf.setTitle('Demande de visa Schengen - Portugal - formulaire BLS Maroc');
 pdf.setSubject('Formulaire BLS Maroc renseigné - à vérifier et signer');
 return {blob:new Blob([await pdf.save({useObjectStreams:true})],{type:'application/pdf'}),overflow:[],fingerprint:sourceFingerprint()};
}
let reviewed=null,previewUrl=null;
async function showPreview(){
 const btn=$('blsPreview');if(btn)btn.disabled=true;
 try{
 const result=await buildPdf();if(!result)return;
 if(previewUrl)URL.revokeObjectURL(previewUrl);
 previewUrl=URL.createObjectURL(result.blob);reviewed={...result,approved:false};
 const frame=$('blsPreviewFrame');if(frame)frame.src=previewUrl;
 const modal=$('blsPreviewDialog');if(!modal)throw new Error('Fenêtre de vérification PDF indisponible.');
 $('blsApproval').checked=false;modal.showModal();
 status('Prévisualisez les quatre pages, vérifiez les coches puis confirmez.');
 }catch(err){status('Prévisualisation : '+err.message);console.error(err)}
 finally{if(btn)btn.disabled=false}
}
async function exportOriginal(action){
 capture();
 if(!reviewed||!reviewed.approved||reviewed.fingerprint!==sourceFingerprint()){
   status('Vérification obligatoire : ouvrez l’aperçu du PDF BLS, contrôlez-le puis confirmez avant de télécharger.');
   await showPreview();return;
 }
 const url=URL.createObjectURL(reviewed.blob);
 if(action==='print'){const win=window.open(url,'_blank');if(!win)status('Fenêtre bloquée : utilisez le téléchargement et imprimez depuis le lecteur PDF.')}
 else{const link=document.createElement('a');link.href=url;link.download='BLS_Portugal_Morocco_Completed_'+String(data.f1||'Applicant').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'_').slice(0,40)+'.pdf';document.body.append(link);link.click();link.remove();status('Formulaire original BLS téléchargé après vérification. Ajoutez la photographie conforme et signez.')}
 setTimeout(()=>URL.revokeObjectURL(url),120000);
}
window.blsPdfPreview=showPreview;
$('blsPreview').onclick=showPreview;
$('blsApproveButton').onclick=()=>{if(!$('blsApproval').checked){status('Veuillez confirmer avoir relu les quatre pages du BLS.');return}if(reviewed)reviewed.approved=true;$('blsPreviewDialog').close();status('Aperçu confirmé. Vous pouvez télécharger ou imprimer le PDF rempli.');};
$('blsPreviewClose').onclick=()=>$('blsPreviewDialog').close();
$('blsExport').onclick=()=>exportOriginal('download');
$('blsPrint').onclick=()=>exportOriginal('print');
$('blsLoad').onclick=()=>$('blsTemplateInput').click();
$('blsTemplateInput').onchange=async()=>{
 const file=$('blsTemplateInput').files?.[0];if(!file)return;
 try{pdfTemplateBytes=await verifyTemplate(new Uint8Array(await file.arrayBuffer()));await toCache(pdfTemplateBytes);$('blsStatus').textContent='✓ Fichier BLS original exact, mémorisé sur cet appareil';status('Modèle vierge BLS chargé localement. Vous pouvez maintenant exporter la version officielle.')}
 catch(err){pdfTemplateBytes=null;$('blsStatus').textContent='Fichier non reconnu';status(err.message)}
};
localTemplate();
})();