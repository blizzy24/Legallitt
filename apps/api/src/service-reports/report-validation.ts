import {BadRequestException} from '@nestjs/common';
import {INDIA_JURISDICTIONS} from '@legalitt/shared';
/** Both draft intake and requested corrections use the same sourced jurisdiction. */
export function validateReportJurisdiction(details:Record<string,unknown>){
 const j=details.jurisdiction as {state_code?:string;state?:string;district_code?:string;district?:string}|undefined;
 if(!j||![j.state_code,j.state,j.district_code,j.district].some(Boolean))return;
 const state=INDIA_JURISDICTIONS.find(s=>s.code===j.state_code);
 if(!state||state.name!==j.state)throw new BadRequestException('Choose a state from the list.');
 if((j.district_code||j.district)&&state.districts.find(d=>d.code===j.district_code)?.name!==j.district)throw new BadRequestException('Choose a district in the selected state.');
}
