const test=require('node:test'),assert=require('node:assert/strict');
const {App}=require('aws-cdk-lib'),{Template}=require('aws-cdk-lib/assertions'),{createFoundation}=require('../dist/stack');
test('notice SES is opt-in, constrained to one sender/identity, and absent from ops and production',()=>{
 const app=new App();createFoundation(app);const stage=app.node.findChild('LegalittDev');const template=Template.fromStack(stage.node.findChild('Compute')).toJSON();
 assert.equal(template.Parameters.NoticeSesFromEmail.Default,'');assert.equal(template.Parameters.NoticeSesIdentityArn.Default,'');
 const roles=Object.values(template.Resources).filter(r=>r.Type==='AWS::IAM::Role');
 for(const role of roles){const ses=role.Properties.Policies.flatMap(p=>p.PolicyDocument.Statement).filter(s=>JSON.stringify(s).includes('ses:SendEmail'));if(role.Properties.RoleName==='legalitt-dev-apirole'){assert.equal(ses.length,1);const statement=ses[0]['Fn::If'][1];assert.deepEqual(statement.Resource,[{Ref:'NoticeSesIdentityArn'}]);assert.deepEqual(statement.Condition.StringEquals['ses:FromAddress'],{Ref:'NoticeSesFromEmail'});}else assert.equal(ses.length,0);}
 assert.ok(!JSON.stringify(Template.fromStack(app.node.findChild('LegalittProd').node.findChild('Compute')).toJSON()).includes('NoticeSesFromEmail'));
});
