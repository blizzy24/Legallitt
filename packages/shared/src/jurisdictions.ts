import snapshot from './reference/india-jurisdictions.json';
export const INDIA_JURISDICTIONS = snapshot.states;
export const JURISDICTION_RETRIEVED_AT = snapshot.retrieved_at;
export function jurisdictionMatches(stateCode: string, districtCode: string) {
  return INDIA_JURISDICTIONS.find(s=>s.code===stateCode)?.districts.some(d=>d.code===districtCode) ?? false;
}
