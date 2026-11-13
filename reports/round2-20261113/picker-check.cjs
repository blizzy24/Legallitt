const fs=require('fs'),assert=require('assert/strict'),puppeteer=require('puppeteer-core');
const kit=require('../../scripts/helpers/fir-walk-kit.cjs');process.loadEnvFile('apps/api/.env.local');
(async()=>{const state=JSON.parse(fs.readFileSync('reports/round2-20261113/reports/live/state.json','utf8')),id=state.cases[0].id;
 const password=await require('../../apps/api/dist/src/auth/demo').demoPassword();const browser=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{const p=await kit.signIn(browser,null,{role:'client',email:'demo-client@legalitt.invalid',password,mobile:'https://legalitt-5.vercel.app',adminWeb:'https://legalitt-admin-panel.vercel.app',errors:[]});
 p.on('console',msg=>{if(/picker|gesture|activation/i.test(msg.text()))console.log('BROWSER',msg.text());});
 await kit.go(p,'https://legalitt-5.vercel.app/property-search/request?caseId='+id);await kit.text(p,'Review request');
 await kit.text(p,'Saved');await kit.delay(1000);console.log('Saved form ready');
 await kit.chooseFile(p,'Upload property document','reports/round2-20261113/reports/live/report-intake.pdf');console.log('PASS saved-form picker opens');
 await kit.delay(2500);
 await p.setRequestInterception(true);p.on('request',r=>{if(r.method()==='PATCH'&&r.url().endsWith('/cases/'+id))setTimeout(()=>r.continue(),6500);else r.continue();});
 await kit.fill(p,'What would you like us to check?','TEST ONLY: check fictional title records with a delayed save.');
 const chooser=p.waitForFileChooser({timeout:12000});await kit.click(p,'Upload property document');await(await chooser).accept([]);console.log('PASS picker opens while save is delayed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
