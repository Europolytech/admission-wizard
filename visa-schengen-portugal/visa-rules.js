(function(){
'use strict';
const blank=v=>!String(v??'').trim();
const dayCount=(a,b)=>{if(!a||!b)return null;const d1=new Date(a+'T12:00:00Z'),d2=new Date(b+'T12:00:00Z');if(!Number.isFinite(d1.valueOf())||!Number.isFinite(d2.valueOf()))return null;return Math.floor((d2-d1)/86400000)+1};
const sponsorKeys=['f32b','f32c','f32c_other','f32d'],selfKeys=['f32a','f32a_other'],personalKeys=['f33','f33b','f33c'],priorKeys=['f28b','f28c'],permitKeys=['f29','f29b'];
const isSelf=d=>d.f32==='Le demandeur',isSponsor=d=>d.f32==='Un garant',share=d=>d.f32==='Le demandeur et un garant';
function sanitized(source){
 const d={...source};
 if(d.f7b&&d.f7&&d.f7b.trim().toLowerCase()===d.f7.trim().toLowerCase())d.f7b='';
 if(d.f20!=='Oui'){d.f20b='';d.f20c=''}
 if(d.workStatus==='Not working / retired')d.f22='';
 if(d.f28!=='Oui'){d.f28b='';d.f28c=''}
 if(d.f29Applicable!=='Oui'){permitKeys.forEach(k=>d[k]='')}
 if(d.f33self!=='Non'){personalKeys.forEach(k=>d[k]='')}
 if(d.f18==='Non applicable'){['f17','f17a','f17b','f17c','f17d','f18other'].forEach(k=>d[k]='')}
 if(d.f12!=='Autre')d.f12other='';
 if(d.f9!=='Autre')d.f9other='';
 if(d.f18!=='Autre')d.f18other='';
 if(d.f23!=='Autre')d.f23b='';
 if(isSelf(d)){sponsorKeys.forEach(k=>d[k]='')}
 if(isSponsor(d)){selfKeys.forEach(k=>d[k]='')}
 if(!['Oui','Non, autre garant'].includes(d.f32b))d.f32d='';
 if(!String(d.f32a||'').split(' | ').includes('Autre'))d.f32a_other='';
 if(!String(d.f32c||'').split(' | ').includes('Autre'))d.f32c_other='';
 return d;
}
function fieldVisible(id,d){
 if(['f20b','f20c'].includes(id))return d.f20==='Oui';
 if(id==='f22')return d.workStatus!=='Not working / retired';
 if(priorKeys.includes(id))return d.f28==='Oui';
 if(permitKeys.includes(id))return d.f29Applicable==='Oui';
 if(personalKeys.includes(id))return d.f33self==='Non';
 if(['f17','f17a','f17b','f17c','f17d','f18other'].includes(id))return d.f18!=='Non applicable' && (id!=='f18other'||d.f18==='Autre');
 if(id==='f9other')return d.f9==='Autre';
 if(id==='f12other')return d.f12==='Autre';
 if(id==='f23b')return d.f23==='Autre';
 if(selfKeys.includes(id))return !isSponsor(d) && (id!=='f32a_other'||String(d.f32a||'').split(' | ').includes('Autre'));
 if(sponsorKeys.includes(id))return !isSelf(d) && (id!=='f32c_other'||String(d.f32c||'').split(' | ').includes('Autre')) && (id!=='f32d'||d.f32b==='Non, autre garant');
 return true;
}
function updateOnChange(d,id){
 const clean=sanitized(d);
 for(const k of Object.keys(clean))if(clean[k]!==d[k])d[k]=clean[k];
}
function validate(source,fields=[]){
 const d=sanitized(source),errors=[],warnings=[],info=[];
 const e=(field,message)=>errors.push({field,message}),w=(field,message)=>warnings.push({field,message});
 for(const f of fields)if(f[3]&&fieldVisible(f[0],d)&&blank(d[f[0]]))e(f[0],'Champ obligatoire : '+f[1]);
 if(d.f29Applicable==='Oui'&&(blank(d.f29)||blank(d.f29b)))e('f29','Précisez l’autorisation de destination finale et ses dates/autorité.');
 if(d.f33self==='Non'&&(!d.f33||!d.f33b||!d.f33c))e('f33','Les coordonnées du tiers remplissant le formulaire doivent être complètes.');
 if(d.f20==='Oui'&&(!d.f20b||!d.f20c))e('f20b','Précisez le titre de séjour et sa validité.');
 if(d.f32){
   if(isSelf(d)&&!d.f32a)e('f32a','Indiquez au moins un moyen de financement personnel.');
   if(isSponsor(d)||share(d)){
     if(!d.f32b||d.f32b==='Non applicable')e('f32b','Précisez si le garant figure en question 30/31.');
     if(!d.f32c)e('f32c','Indiquez la nature de la prise en charge.');
     if(d.f32b==='Non, autre garant'&&!d.f32d)e('f32d','Indiquez le nom du garant.');
   }
   if(share(d)&&!d.f32a)e('f32a','La prise en charge partagée exige de préciser aussi les moyens personnels.');
 }
 if(d.f32b==='Non, autre garant'&&isSelf(d))e('f32b','Le financement personnel ne peut pas simultanément déclarer un garant.');
 if(d.f33self==='Oui'&&source.f33&&String(source.f33).trim())w('f33','Les renseignements sur la personne tierce seront exclus si vous remplissez votre propre demande.');
 if(d.f30role==='Hôtel / hébergement' && d.f30 && d.f31 && String(d.f30).trim().toLowerCase()===String(d.f31).trim().toLowerCase())w('f30','Q30 et Q31 portent le même nom. Vérifiez que l’organisme est réellement votre hébergement.');
 if(d.f30role!=='Personne invitante'&&blank(d.f30))w('f30','Indiquez l’hôtel, le logement ou l’invitant réel et sa réservation, pas simplement le lieu de formation.');
 if(['Employed / self-employed','Student'].includes(d.workStatus)&&blank(d.f22))e('f22','Indiquez le nom, l’adresse et le téléphone de l’employeur ou de l’établissement scolaire.');
 if(['Employed / self-employed','Student'].includes(d.workStatus)&&d.f22&&!/[+\d][\d\s().-]{6,}/.test(d.f22))e('f22','Le numéro de téléphone de l’employeur/établissement manque à la question 22.');
 if(d.f24&&d.f24.trim().length<42)w('f24','Précisez l’intitulé du programme, la nature de la formation et les dates, conformément aux justificatifs.');
 if(d.f7b&&d.f7&&d.f7b.toLowerCase()===d.f7.toLowerCase())w('f7b','La nationalité de naissance ne doit être indiquée que si elle est différente.');
 if(d.arrival&&d.departure&&d.departure<d.arrival)e('departure','La date de sortie Schengen précède la date d’arrivée.');
 if(d.f14&&d.f15&&d.f15<=d.f14)e('f15','La date d’expiration du passeport doit suivre sa date de délivrance.');
 const days=dayCount(d.arrival,d.departure);
 if(days&&days>90)e('departure','Le séjour déclaré dépasse 90 jours (sans préjuger d’autres séjours dans les 180 jours). Vérifiez le type de visa requis.');
 if(d.f15&&d.departure){const expiry=new Date(d.f15+'T00:00:00Z'),exit=new Date(d.departure+'T00:00:00Z');const threshold=new Date(exit);threshold.setUTCMonth(threshold.getUTCMonth()+3);if(expiry<threshold)e('f15','Le passeport paraît expirer moins de trois mois après la sortie prévue.');}
 if(d.f14&&d.arrival){const issue=new Date(d.f14+'T00:00:00Z'),arr=new Date(d.arrival+'T00:00:00Z'),limit=new Date(arr);limit.setUTCFullYear(limit.getUTCFullYear()-10);if(issue<limit)w('f14','Le passeport peut être trop ancien selon les conditions d’entrée Schengen (délivré il y a plus de 10 ans).')}
 if(!d.screenResidence)w('screenResidence','Indiquez votre pays de résidence légale pour contrôler la compétence consulaire.');
 else if(!/^(maroc|morocco)$/i.test(String(d.screenResidence).trim()))w('screenResidence','La résidence légale déclarée n’est pas le Maroc. Le centre BLS Maroc n’est généralement pas le lieu de dépôt approprié.');
 if(d.screenPassport==='British citizen (UK)'&&(!days||days<=90))w('screenPassport','Un citoyen britannique voyageant pour un court séjour peut être dispensé de visa Schengen. Vérifiez les exceptions, la finalité et la règle des 90/180 jours avant de déposer une demande.');
 if(d.screenPassport==='Other / unclear'||!d.screenPassport)w('screenPassport','Vérifiez si ce passeport nécessite un visa et si la catégorie C convient.');
 if(d.f25&&!String(d.f25).toLowerCase().includes('portug'))w('f25','Cet assistant est prévu pour le Portugal comme destination principale ; vérifiez l’État compétent.');
 if(d.f26&&d.f25&&d.f26.toLowerCase()!==d.f25.toLowerCase())info.push({field:'f26',message:'Première entrée différente de la destination principale : vérifiez que l’itinéraire le justifie.'});
 if(d.f27==='Entrées multiples')w('f27','Une demande à entrées multiples doit être cohérente avec vos besoins et vos justificatifs.');
 if(d.f23==='Études'&&days&&days>85)w('f23','Assurez-vous que l’activité de formation proposée est compatible avec le visa C et la durée du séjour.');
 return {errors,warnings,info,days,d};
}
window.visaRules={sanitized,fieldVisible,updateOnChange,validate,dayCount};
})();