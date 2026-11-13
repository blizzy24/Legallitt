const fs=require('fs'),assert=require('assert/strict'),root='reports/report-polish-20261113/deploy/';
const c=JSON.parse(fs.readFileSync(root+'change-set-reviewed.json','utf8'));
assert.equal(c.Status,'CREATE_COMPLETE');
const changes=c.Changes.map(x=>x.ResourceChange);
for(const x of changes){assert.equal(x.Action,'Modify');assert.ok(['AWS::ECS::TaskDefinition','AWS::ECS::Service'].includes(x.ResourceType),x.ResourceType);}
assert.ok(changes.some(x=>x.ResourceType==='AWS::ECS::TaskDefinition'));
const result={status:c.Status,changes:changes.map(x=>({logical_id:x.LogicalResourceId,type:x.ResourceType,action:x.Action,replacement:x.Replacement}))};
fs.writeFileSync(root+'change-summary.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
