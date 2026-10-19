(function () {
'use strict';
const TEMPLATE_PATH='bls-morocco-official.pdf';
const BLS_ORIGINAL_SHA256='aeda814bec2ab040d23ba3abec7085fcff36a70df9cf044f7f3fd42c437629f6';
const X=595.56/910; 
const T=[[0,81,344,530,18,"f1"],[0,81,388,530,18,"f2"],[0,81,437,530,20,"f3"],[0,82,542,110,38,"f4"],[0,211,511,245,29,"f5"],[0,211,564,245,24,"f6"],[0,477,506,141,27,"f7"],[0,478,576,141,17,"f7b"],[0,478,598,141,7,"f7c"],[0,80,745,536,26,"f10"],[0,80,805,530,13,"f11"],[0,81,981,119,13,"f13"],[0,210,982,122,13,"f14"],[0,342,982,118,13,"f15"],[0,473,983,143,13,"f16"],[0,80,1134,254,11,"f17"],[0,347,1134,271,11,"f17a"],[1,79,143,121,18,"f17b"],[1,213,145,243,16,"f17d"],[1,480,145,139,16,"f17c"],[1,81,317,375,11,"f19"],[1,81,332,375,7,"f19b"],[1,477,325,140,15,"f19c"],[1,254,399,190,13,"f20b"],[1,482,401,133,10,"f20c"],[1,82,447,526,10,"f21"],[1,82,501,537,9,"f22"],[1,208,570,408,13,"f23b"],[1,82,625,539,11,"f24"],[1,82,705,252,9,"f25"],[1,83,716,250,5,"f25b"],[1,350,704,265,10,"f26"],[1,83,799,532,16,"arrival"],[1,83,852,532,16,"departure"],[1,82,951,264,15,"f28b"],[1,410,951,209,15,"f28c"],[1,189,1022,182,11,"f29"],[1,388,1039,229,8,"f29b"],[1,83,1107,536,11,"f30"],[1,82,1195,252,8,"f30b"],[1,82,1202,250,6,"f30c"],[1,350,1192,268,12,"f30d"],[2,83,101,538,11,"f31"],[2,83,115,538,7,"f31a"],[2,83,199,250,15,"f31b"],[2,83,216,248,14,"f31c"],[2,83,233,247,10,"f31d"],[2,83,242,247,6,"f31e"],[2,352,235,259,13,"f31f"],[2,118,481,212,16,"f32a_other"],[2,380,528,234,20,"f32c_other"],[2,388,363,227,8,"f32d"],[2,83,615,537,14,"f33"],[2,83,705,252,15,"f33b"],[2,350,705,268,15,"f33c"],[3,83,1092,260,37,"city"],[3,84,1117,258,17,"signed"]];
const C=[[0,"f8",{"Homme":[83,635],"Femme":[83,656]}],[0,"f9",{"Célibataire":[223,636],"Marié(e)":[325,636],"Partenariat enregistré":[385,636],"Séparé(e)":[516,636],"Divorcé(e)":[579,636],"Veuf / Veuve":[277,657],"Autre":[365,657]}],[0,"f12",{"Passeport ordinaire":[92,849],"Passeport diplomatique":[234,849],"Passeport de service":[389,849],"Passeport officiel":[92,871],"Passeport spécial":[227,871],"Autre":[92,891]}],[1,"f18",{"Conjoint":[105,227],"Enfant":[166,227],"Petit-enfant":[206,227],"Ascendant dépendant":[370,227],"Partenariat enregistré":[105,250],"Autre":[246,250]}],[1,"f20",{"Non":[82,369],"Oui":[82,390]}],[1,"f23",{"Tourisme":[83,535],"Affaires":[184,535],"Visite à la famille ou à des amis":[237,535],"Culture":[439,535],"Sports":[501,535],"Visite officielle":[83,553],"Raisons médicales":[167,553],"Études":[329,553],"Transit aéroportuaire":[377,553],"Autre":[83,570]}],[1,"f27",{"Une entrée":[83,742],"Deux entrées":[198,742],"Entrées multiples":[288,742]}],[1,"f28",{"Non":[83,914],"Oui":[121,914]}],[2,"f32",{"Le demandeur":[83,286],"Un garant":[354,286],"Le demandeur et un garant":[83,286]}],[2,"f32b",{"Oui":[353,326],"Non, autre garant":[353,351]}]];
const M=[[2,"f32a",{"Argent liquide":[83,376],"Chèques de voyage":[83,397],"Carte de crédit":[83,419],"Hébergement prépayé":[83,441],"Transport prépayé":[83,462],"Autre":[83,482]}],[2,"f32c",{"Argent liquide":[354,418],"Hébergement fourni":[354,442],"Tous les frais financés":[354,464],"Transport prépayé":[354,505],"Autre":[354,527]}]];
let pdfTemplateBytes=null;
const $=id=>document.getElementById(id);
const status=m=>{if($('status'))$('status').textContent=m};
const humanDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)?v.slice(8,10)+'-'+v.slice(5,7)+'-'+v.slice(0,4):v;
async function sha256(bytes){let hash=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));return [...hash].map(b=>b.toString(16).padStart(2,'0')).join('')}
async function verifyTemplate(bytes){if(bytes.length<40000)throw Error('Le fichier n’est pas un PDF BLS valide.');let hash=await sha256(bytes);if(hash!==BLS_ORIGINAL_SHA256)throw Error('Le PDF sélectionné ne correspond pas exactement au formulaire BLS Maroc de référence (version transmise à EuroPolytech). Téléchargez le modèle correct depuis la page BLS.');const pdf=await PDFLib.PDFDocument.load(bytes);if(pdf.getPageCount()!==4)throw Error('Le formulaire BLS doit contenir quatre pages.');return bytes;}
async function localTemplate(){if(pdfTemplateBytes)return pdfTemplateBytes;try{const res=await fetch(TEMPLATE_PATH,{cache:'force-cache'});if(res.ok){const bytes=new Uint8Array(await res.arrayBuffer());pdfTemplateBytes=await verifyTemplate(bytes);$('blsStatus').textContent='✓ Modèle original BLS disponible';return bytes;}}catch(err){console.warn('Official bundled template unavailable:',err.message)}return null}
function dateReport(){const missing=all.filter(f=>f[3]&&!data[f[0]]);if(missing.length){status('Veuillez compléter les champs obligatoires et vérifier le dossier avant export ('+missing.length+' manquant(s)).');if(!confirm('Il reste '+missing.length+' champ(s) obligatoires non renseignés. Exporter tout de même un BROUILLON à vérifier ?'))return false}if(data.arrival&&data.departure&&data.departure<data.arrival){alert('La date de départ Schengen ne peut pas précéder la date d’arrivée.');return false}if(data.f14&&data.f15&&data.f15<=data.f14){alert('La date d’expiration du passeport doit être postérieure à sa délivrance.');return false}return true;}
async function getTemplate(){
 let bytes=await localTemplate();if(bytes)return bytes;
 if($('blsTemplateInput').files.length){const file=$('blsTemplateInput').files[0];bytes=await verifyTemplate(new Uint8Array(await file.arrayBuffer()));pdfTemplateBytes=bytes;return bytes;}
 $('blsStatus').textContent='Chargez une seule fois le PDF BLS officiel vierge pour remplir sa mise en page exacte.';
 $('blsTemplateInput').click();throw Error('Modèle BLS original nécessaire : sélectionnez le fichier PDF fourni par BLS.');
}
function textValue(id){if(id==='f32a_other'||id==='f32c_other')return '';return String(data[id]||'').trim()}
function clipToBox(font,s,widthPx,linesMax,fontSize){
 let words=String(s).replace(/\s+/g,' ').trim().split(' ').filter(Boolean);
 if(!words.length)return {lines:[],missing:''};
 const maxWidth=widthPx*X;
 let lines=[],current='',missing='';
 function push(word){if(!current){current=word;return}if(font.widthOfTextAtSize(current+' '+word,fontSize)<=maxWidth)current+=' '+word;else{lines.push(current);current=word}}
 words.forEach(push);if(current)lines.push(current);
 if(lines.length>linesMax){missing=lines.slice(linesMax).join(' ');lines=lines.slice(0,linesMax)}
 return {lines,missing};
}
async function buildPdf() {
 capture();if(!dateReport())return null;
 if(!window.PDFLib)throw Error('Le module PDF n’a pas chargé. Vérifiez la connexion Internet puis réessayez.');
 const bytes=await getTemplate();
 const pdf=await PDFLib.PDFDocument.load(bytes),pages=pdf.getPages();
 const helv=await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
 const bold=await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold);
 const color=PDFLib.rgb(.05,.25,.56),missing=[];
 function stamp(pi,x,y,width,height,key){
   let value=textValue(key);if(!value)return;
   value=humanDate(value);
   if(key==='f31')value=String(data.f31||'');
   let page=pages[pi],w=width, maxLines=Math.max(1,Math.floor(height/12)),fontSize=Math.min(7.3,Math.max(5.2,height*X*.7)),result;
   while(fontSize>5.0){result=clipToBox(helv,value,w,maxLines,fontSize);if(!result.missing)break;fontSize-=.3}
   if(result.missing)missing.push({field:key,text:value});
   const yPdf=page.getHeight()-y*X;
   for(let i=0;i<result.lines.length;i++){
      try{page.drawText(result.lines[i],{x:x*X,y:yPdf-i*fontSize*1.21,size:fontSize,font:helv,color})}
      catch(e){missing.push({field:key,text:value,reason:'character not supported'})}
   }
 }
 T.forEach(([p,x,y,w,h,key])=>stamp(p,x,y,w,h,key));
 function check(pageIndex,x,y){const page=pages[pageIndex];const px=x*X,py=page.getHeight()-(y+3)*X;page.drawText('X',{x:px-2.7,y:py,size:8.0,font:bold,color})}
 C.forEach(([p,k,map])=>{const val=data[k];if(map[val])check(p,...map[val]);if(k==='f32'&&val==='Le demandeur et un garant'&&map['Un garant'])check(p,...map['Un garant'])});
 M.forEach(([p,k,map])=>{String(data[k]||'').split(' | ').forEach(val=>{if(map[val])check(p,...map[val])})});
 if(missing.length){const page=pdf.addPage([595.56,842.04]);page.drawText('ANNEXE - INFORMATIONS À VÉRIFIER',{x:42,y:790,font:bold,size:13,color});page.drawText('Certaines réponses dépassent les cases du formulaire original.',{x:42,y:767,font:helv,size:9,color});let y=740;missing.forEach(({field,text})=>{if(y<100)y=740;const lines=clipToBox(helv,field+': '+text,770,10,8).lines;lines.forEach(line=>{page.drawText(line,{x:42,y,font:helv,size:8,color});y-=12});y-=8})}
 pdf.setTitle('Demande de visa Schengen Portugal - Formulaire BLS Maroc complété');
 pdf.setSubject('Formulaire original BLS Maroc annoté, à vérifier et signer');
 const arr=await pdf.save({useObjectStreams:true});
 return {blob:new Blob([arr],{type:'application/pdf'}),overflow:missing};
}
async function exportOriginal(action){
 const newWindow=action==='print'?window.open('about:blank','_blank'):null;
 $('blsExport').disabled=true;$('blsPrint').disabled=true;
 try{
   const result=await buildPdf();if(!result){if(newWindow)newWindow.close();return}
   const url=URL.createObjectURL(result.blob);
   if(action==='print'){if(newWindow){newWindow.location.href=url;status('Le formulaire BLS rempli est ouvert. Utilisez Imprimer dans le lecteur PDF.')}else{status('Votre navigateur a bloqué l’ouverture. Utilisez Télécharger.');}}
   else{const a=document.createElement('a');a.href=url;const name=(data.f1||'Applicant').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/gi,'_').slice(0,40);a.download='BLS_Portugal_Morocco_Completed_'+name+'.pdf';document.body.append(a);a.click();a.remove();status(result.overflow.length?'PDF original généré avec une annexe pour '+result.overflow.length+' zone(s) trop longue(s). Vérifiez avant dépôt.':'PDF BLS original complété et téléchargé. Imprimez et signez à la main.')}
   setTimeout(()=>URL.revokeObjectURL(url),120000);
 }catch(err){if(newWindow)newWindow.close();status('Export BLS : '+err.message);console.error(err)}
 finally{$('blsExport').disabled=false;$('blsPrint').disabled=false}
}
$('blsExport').onclick=()=>exportOriginal('download');
$('blsPrint').onclick=()=>exportOriginal('print');
$('blsLoad').onclick=()=>$('blsTemplateInput').click();
$('blsTemplateInput').onchange=async()=>{
 const file=$('blsTemplateInput').files?.[0];if(!file)return;
 try{pdfTemplateBytes=await verifyTemplate(new Uint8Array(await file.arrayBuffer()));$('blsStatus').textContent='✓ Fichier BLS original exact, prêt pour le remplissage';status('Modèle vierge BLS chargé localement. Vous pouvez maintenant exporter la version officielle.')}
 catch(err){pdfTemplateBytes=null;$('blsStatus').textContent='Fichier non reconnu';status(err.message)}
};
localTemplate();
})();