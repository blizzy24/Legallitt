const test=require('node:test'),assert=require('node:assert/strict');
const {NotificationFeed,notificationDestination}=require('../dist');
const row={id:'notification',case_id:'case-uuid',kind:'case_assigned',title:'Assigned',body:'LN-2026-0001',created_at:new Date().toISOString(),read_at:null,case:{reference:'LN-2026-0001',status:'assigned'}};
const tick=()=>new Promise(r=>setImmediate(r));
test('notification destinations follow current lifecycle and retain the case id',()=>{
 assert.equal(notificationDestination(row,'advocate'),'/advocate/notice/case-uuid/fee?caseId=case-uuid');
 for(const [status,screen]of[['changes_requested','drafting'],['approved','final'],['completed','report']])assert.equal(notificationDestination({...row,case:{...row.case,status}},'advocate'),`/advocate/notice/case-uuid/${screen}?caseId=case-uuid`);
 assert.equal(notificationDestination({...row,case:{...row.case,status:'completed'}},'client'),'/legal-notice/delivery?caseId=case-uuid');
 assert.equal(notificationDestination(row,'admin'),'/legal-notices/case-uuid');
 assert.equal(notificationDestination({...row,case_id:null},'client'),null);
});
test('poll started before mark-read cannot restore unread state; failures stay inline and logout discards results',async()=>{
 let pending,requests=0;
 const api={request:async(path)=>{if(path.includes('/read'))return{};requests++;if(requests===1)return{items:[row],unread_count:1,next_cursor:null};return new Promise(resolve=>pending=resolve);}};
 const feed=new NotificationFeed(api),stop=feed.start();await tick();assert.equal(feed.snapshot().unread,1);
 const stale=feed.refresh();await tick();assert.equal(await feed.read(row.id),true);assert.equal(feed.snapshot().unread,0);
 pending({items:[row],unread_count:1,next_cursor:null});await stale;assert.equal(feed.snapshot().unread,0);assert.ok(feed.snapshot().items[0].read_at);
 const later=feed.refresh();await tick();stop();pending({items:[row],unread_count:9,next_cursor:null});await later;assert.equal(feed.snapshot().unread,0);
 const broken=new NotificationFeed({request:async()=>{throw Error('Offline test');}});const end=broken.start();await tick();assert.equal(broken.snapshot().error,'Offline test');assert.equal(await broken.read('id'),false);end();
});
