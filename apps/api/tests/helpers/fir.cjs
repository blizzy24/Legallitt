const {randomUUID}=require('node:crypto');
const {INDIA_JURISDICTIONS,seedFirDraft}=require('@legalitt/shared');
const provided=value=>({status:'provided',value}),unknown=()=>({status:'unknown'});
const personal=()=>({father_name:provided('TEST Father Rao'),age:provided(37),gender:provided('Woman'),occupation:provided('TEST Teacher'),present_address:provided('TEST Present Street 22')});
function intake(){
 const state=INDIA_JURISDICTIONS.find(s=>s.name==='Maharashtra'),district=state.districts.find(d=>d.name==='Mumbai');
 return {intake_version:2,intake_step:5,contact:{fullName:'TEST Complainant Rao',mobile:'2025550100',email:'fir-test@example.invalid'},jurisdiction:{state:state.name,state_code:state.code,district:district.name,district_code:district.code,policeStation:'TEST Colaba Station'},incident:{type:'theft',date:'2026-11-10',time:'09:30',location:'TEST Harbour Road',description:'TEST ONLY original client narrative.',additional:'TEST original additional information.'},people:[
  {id:randomUUID(),kind:'complainant',name:'TEST Complainant Rao',phone:'2025550100',residence:'TEST Registered Street 11',details:'',personal_details:personal()},
  {id:randomUUID(),kind:'accused',name:'TEST Known Suspect',phone:'2025550101',alias:'TEST alias',details:'TEST jacket',primary:true},
  {id:randomUUID(),kind:'accused',name:'',unknown:true,details:'TEST unknown suspect blue coat'},
  {id:randomUUID(),kind:'witness',name:'TEST Witness One',phone:'2025550102',role:'TEST passerby',presence:'TEST at start',details:'TEST first note'},
  {id:randomUUID(),kind:'witness',name:'TEST Witness Two',phone:'2025550103',role:'TEST shopkeeper',presence:'TEST at end',details:'TEST second note'},
 ]};
}
function editable(input=intake()){
 const draft=seedFirDraft(input,randomUUID);
 draft.distance_and_direction_from_station=provided('TEST 2 km north');
 for(const [n,a]of draft.accused.items.entries())for(const key of ['alias','phone','other_details','vehicle_used','suspected_motive'])a[key]??=provided(`TEST accused ${n+1} ${key}`);
 draft.accused.items[1].phone=unknown();draft.accused.items[1].vehicle_used={status:'not_applicable'};
 draft.legal_sections=[{id:randomUUID(),act:'TEST Act (synthetic)',section:'TEST 123',description:'TEST manually chosen provision'}];
 draft.statement_of_facts='TEST ONLY advocate edited narrative. No real offence or police filing.';
 return draft;
}
module.exports={intake,personal,editable,provided,unknown};
