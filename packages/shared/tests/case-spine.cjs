const test=require('node:test'),assert=require('node:assert/strict');
const {SERVICE_CODES,CreateCaseSchema,adminCasePath,adminCaseListPath,unbuiltCasePath,notificationDestination}=require('../dist');

test('creation keeps notice intake validation and accepts only empty spines for other services',()=>{
  for(const service_code of SERVICE_CODES){
    assert.equal(CreateCaseSchema.parse({service_code}).service_code,service_code);
    assert.equal(CreateCaseSchema.safeParse({service_code,client_id:'spoofed'}).success,false);
    if(service_code!=='legal_notice') for(const extra of [{details:{}},{tier:'urgent'},{matter_type:'other'}])
      assert.equal(CreateCaseSchema.safeParse({service_code,...extra}).success,false);
  }
  assert.equal(CreateCaseSchema.safeParse({service_code:'unknown'}).success,false);
  assert.equal(CreateCaseSchema.safeParse({service_code:'legal_notice',tier:'invented'}).success,false);
  assert.equal(CreateCaseSchema.parse({service_code:'legal_notice',tier:'urgent',details:{issueType:'property-dispute'}}).details.issueType,'property-dispute');
});

test('case and inbox destinations keep notice URLs stable and never send other services to notice screens',()=>{
  assert.equal(adminCaseListPath('legal_notice'),'/legal-notices');
  assert.equal(adminCasePath('legal_notice','case-1'),'/legal-notices/case-1');
  for(const service of SERVICE_CODES.filter(s=>s!=='legal_notice')){
    assert.equal(adminCasePath(service,'case-1'),`/services/${service}/cases/case-1`);
    const row={case_id:'case-1',case:{service_code:service,status:'assigned'}};
    assert.equal(notificationDestination(row,'admin'),adminCasePath(service,'case-1'));
    for(const role of ['client','advocate']){
      const path=unbuiltCasePath(service,'case-1',role,row.case);
      assert.equal(notificationDestination(row,role),path);
      const destination=new URL(path,'https://legalitt.invalid');
      assert.equal(destination.searchParams.get('caseId'),'case-1');
      // Dedicated service screens encode their service in the path. Only the
      // generic case shell needs the service query parameter.
      if(destination.pathname.startsWith('/cases/')||destination.pathname.startsWith('/advocate/requests/'))
        assert.equal(destination.searchParams.get('service'),service);
      assert.ok(!path.includes('/notice/')&&!path.includes('/legal-notice/'));
    }
  }
});
