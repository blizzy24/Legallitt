const test=require('node:test'),assert=require('node:assert/strict'),{randomUUID}=require('node:crypto');
const {PrismaClient}=require('../dist/src/generated/prisma/client'),{PrismaPg}=require('@prisma/adapter-pg');
const {CaseController}=require('../dist/src/cases/case.controller'),{CaseRepository}=require('../dist/src/cases/case-repository'),{CaseStateMachine}=require('../dist/src/cases/case-state-machine'),{CancellationsService}=require('../dist/src/cancellations/cancellations.service');
const {ContactPrivacyInterceptor}=require('../dist/src/cases/contact-privacy'),{InAppNotifications}=require('../dist/src/notifications/in-app-notifications');
const {NotificationRepository,NotificationsController}=require('../dist/src/notifications/notifications.controller');
const {SupportSettings,SupportSettingsController}=require('../dist/src/support/support-settings'),{ReportTariffs,ReportTariffsController}=require('../dist/src/service-reports/report-tariffs');

test('Round 2 HTTP privacy: accepted cases, lists, events and notifications never reveal counterpart phones; admin retains access',{skip:!process.env.LEGALITT_TEST_DATABASE_URL},async()=>{
 const db=new PrismaClient({adapter:new PrismaPg({connectionString:process.env.LEGALITT_TEST_DATABASE_URL})}),prisma={getClient:async()=>db};
 const actors=['client','advocate','client','advocate','admin'].map(role=>({id:randomUUID(),role})),[client,advocate,otherClient,otherAdvocate,admin]=actors,phones={client:'+919'+require('node:crypto').randomInt(100000000,999999999),advocate:'+918'+require('node:crypto').randomInt(100000000,999999999)},delivered=[];
 const cp=phones.client.slice(3),ap=phones.advocate.slice(3),formatted='+91 '+cp.slice(0,5)+' '+cp.slice(5),body='Contact '+formatted+' or '+ap;
 const notifications=new InAppNotifications({send:async input=>{delivered.push(input);return {simulated:true};}});
 let app;
 try{
  await db.user.createMany({data:actors.map(a=>({...a,cognito_sub:'round2-privacy-'+a.id,full_name:'TEST Privacy '+a.role,phone:a===client?phones.client:a===advocate?phones.advocate:null}))});
  const c=await db.case.create({data:{reference:'TEST-PRIVACY-'+randomUUID(),service_code:'legal_notice',client_id:client.id,advocate_id:advocate.id,status:'in_progress',details:{client:{fullName:'TEST Client',mobile:cp,age:41},note:body}}});
  await db.caseParty.create({data:{case_id:c.id,kind:'sender',name:'TEST Client',age:41}});
  await db.caseEvent.create({data:{case_id:c.id,type:'test_contact_event',payload:{note:body}}});
  for(const a of [client,advocate]){
   await db.$transaction(tx=>notifications.send(tx,{user_id:a.id,case_id:c.id,kind:'test_privacy',title:'TEST message',body:body}));
   await db.notification.create({data:{user_id:a.id,case_id:c.id,kind:'test_legacy',title:'TEST retained old notification',body:body}});
  }
  assert.ok(delivered.every(d=>!d.body.includes(d.user_id===client.id?ap:cp.slice(0,5)+' '+cp.slice(5))),'outbound adapter never receives counterpart number');
  let identity=client;require('reflect-metadata');const {Module}=require('@nestjs/common'),{NestFactory,APP_INTERCEPTOR}=require('@nestjs/core'),{AuthGuard}=require('../dist/src/auth/auth.controller'),{AuthService}=require('../dist/src/auth/auth.service'),{PrismaService}=require('../dist/src/prisma.service');
  class Boundary{};Module({controllers:[CaseController,NotificationsController,SupportSettingsController,ReportTariffsController],providers:[AuthGuard,{provide:AuthService,useValue:{identity:async()=>identity}},{provide:PrismaService,useValue:prisma},{provide:APP_INTERCEPTOR,useClass:ContactPrivacyInterceptor},{provide:CaseRepository,useValue:new CaseRepository(prisma)},{provide:CaseStateMachine,useValue:new CaseStateMachine(prisma,notifications)},{provide:CancellationsService,useValue:new CancellationsService(prisma,notifications)},{provide:NotificationRepository,useValue:new NotificationRepository(prisma)},{provide:SupportSettings,useValue:new SupportSettings(prisma)},{provide:ReportTariffs,useValue:new ReportTariffs(prisma)}]})(Boundary);
  app=await NestFactory.create(Boundary,{logger:false});await app.listen(0,'127.0.0.1');const base=await app.getUrl();
  const request=(path,body,authenticated=true)=>fetch(base+'/api/v1'+path,{method:body?'POST':'GET',headers:{...authenticated?{Authorization:'Bearer test'}:{},'Content-Type':'application/json'},...body?{body:JSON.stringify(body)}:{}});
  for(const a of [client,advocate]){identity=a;for(const path of ['/cases','/cases/'+c.id,'/cases/'+c.id+'/events','/notifications']){const r=await request(path);assert.equal(r.status,200);const text=await r.text();assert.doesNotMatch(text,a===client?new RegExp(ap):new RegExp(cp.slice(0,5)+'[\\s-]*'+cp.slice(5)),path);assert.ok(!text.includes('"age":41'));}}
  for(const a of [otherClient,otherAdvocate]){identity=a;assert.equal((await request('/cases/'+c.id)).status,404);assert.equal((await request('/cases/'+c.id+'/events')).status,404);assert.ok(!(await(await request('/cases')).text()).includes(c.id));}
  identity=admin;const adminCase=await(await request('/cases/'+c.id)).json();assert.equal(adminCase.details.client.mobile,cp);assert.equal(adminCase.details.client.age,undefined);assert.equal((await db.case.findUniqueOrThrow({where:{id:c.id}})).details.client.age,41,'historical age retained');
  for(const path of ['/support/settings','/admin/report-tariffs/property_search'])assert.equal((await request(path,null,false)).status,401);
  for(const a of [client,advocate,otherClient,otherAdvocate]){identity=a;assert.equal((await request('/support/settings')).status,200);assert.equal((await request('/support/settings',{})).status,403);assert.equal((await request('/admin/report-tariffs/property_search')).status,403);assert.equal((await request('/admin/report-tariffs/document_forensic',{})).status,403);}
  identity=admin;assert.equal((await request('/admin/report-tariffs/property_search')).status,200);assert.equal((await request('/admin/report-tariffs/legal_advice')).status,400,'editor cannot change out-of-scope tariffs');
 }finally{if(app)await app.close();await db.$disconnect();}
});
