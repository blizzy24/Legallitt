const test = require('node:test');
const assert = require('node:assert/strict');
const { App } = require('aws-cdk-lib');
const { Template } = require('aws-cdk-lib/assertions');
const { createFoundation } = require('../dist/stack');

test('Gemini is dev-only, injected by ECS from one secret, with no Bedrock grant', () => {
  const app = new App();
  createFoundation(app);
  const dev = Template.fromStack(app.node.findChild('LegalittDev').node.findChild('Compute')).toJSON();
  const ref = { Ref: 'GeminiSecretArn' };
  const definitions = Object.values(dev.Resources).filter(r => r.Type === 'AWS::ECS::TaskDefinition');
  const api = definitions.flatMap(r => r.Properties.ContainerDefinitions).find(c => c.Name === 'api');
  const ops = definitions.flatMap(r => r.Properties.ContainerDefinitions).find(c => c.Name === 'ops');
  const env = Object.fromEntries(api.Environment.map(e => [e.Name, e.Value]));
  assert.equal(env.AI_MODE, 'gemini');
  assert.equal(env.ENVIRONMENT, 'dev');
  assert.equal(env.NODE_ENV, 'development');
  assert.equal(env.GEMINI_API_KEY, undefined);
  assert.deepEqual(api.Secrets, [{ Name: 'GEMINI_API_KEY', ValueFrom: ref }]);
  assert.equal(ops.Secrets, undefined);
  for (const resource of Object.values(dev.Resources).filter(r => r.Type === 'AWS::IAM::Role')) {
    const statements = resource.Properties.Policies.flatMap(p => p.PolicyDocument.Statement);
    const grants = statements.filter(s => JSON.stringify(s).includes('GeminiSecretArn'));
    if (resource.Properties.RoleName === 'legalitt-dev-executionrole')
      assert.deepEqual(grants, [{ Effect: 'Allow', Action: ['secretsmanager:GetSecretValue'], Resource: [ref] }]);
    else assert.deepEqual(grants, []);
  }
  assert.ok(!JSON.stringify(dev).includes('bedrock:'));
  for (const [stage, name] of [['LegalittDev', 'Core'], ['LegalittProd', 'Core'], ['LegalittProd', 'Compute']]) {
    const template = Template.fromStack(app.node.findChild(stage).node.findChild(name)).toJSON();
    assert.ok(!JSON.stringify(template).includes('GeminiSecretArn'));
    assert.ok(!JSON.stringify(template).includes('GEMINI_API_KEY'));
  }
});
