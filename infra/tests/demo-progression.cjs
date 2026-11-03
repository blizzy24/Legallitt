const test = require('node:test'), assert = require('node:assert/strict');
const {App} = require('aws-cdk-lib');
const {Template} = require('aws-cdk-lib/assertions');
const {createFoundation} = require('../dist/stack');

test('only dev API courier milestones are enabled; Core, production and ops have no demo step switches', () => {
  const app = new App(); createFoundation(app);
  for (const [stage, name] of [['LegalittDev','Compute'], ['LegalittDev','Core'], ['LegalittProd','Core'], ['LegalittProd','Compute']]) {
    const template = Template.fromStack(app.node.findChild(stage).node.findChild(name)).toJSON();
    for (const resource of Object.values(template.Resources).filter(r=>r.Type==='AWS::ECS::TaskDefinition')) {
      for (const c of resource.Properties.ContainerDefinitions) {
        const flags = Object.fromEntries((c.Environment ?? []).filter(e=>/^DEMO_(PROGRESSION|ASSIGNMENT|DRAFT_START|DRAFT_SUBMIT|DISPATCH|SHIPMENT_MILESTONES|DELIVERY_CONFIRMATION)$/.test(e.Name)).map(e=>[e.Name,e.Value]));
        assert.deepEqual(flags, stage === 'LegalittDev' && name === 'Compute' && c.Name === 'api' ? {
          DEMO_PROGRESSION:'on', DEMO_ASSIGNMENT:'off', DEMO_DRAFT_START:'off', DEMO_DRAFT_SUBMIT:'off',
          DEMO_DISPATCH:'off', DEMO_SHIPMENT_MILESTONES:'on', DEMO_DELIVERY_CONFIRMATION:'off',
        } : {});
      }
    }
  }
});
