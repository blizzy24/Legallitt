import {z} from 'zod';

export const LegalAdviceModeSchema=z.enum(['chat','audio','video']);
export type LegalAdviceMode=z.infer<typeof LegalAdviceModeSchema>;
export const LegalAdviceCategorySchema=z.enum(['General Consultation','Family Law','Criminal Law','Consumer Dispute','Service Matter','Cyber Crime','Property Law','Corporate Law','Labour Law','Arbitration']);
export const LegalAdviceTierSchema=z.strictObject({
  code:z.string().regex(/^[a-z][a-z_]*$/),label:z.string().trim().min(1).max(100),
  minimum_years:z.number().nonnegative(),maximum_years:z.number().positive().nullable(),
}).refine(v=>v.maximum_years===null||v.maximum_years>v.minimum_years,'Tier upper bound must exceed its lower bound');
export type LegalAdviceTier=z.infer<typeof LegalAdviceTierSchema>;
const paise=z.string().regex(/^[1-9]\d{0,11}$/);
export const LegalAdviceTariffSchema=z.strictObject({
  tier_code:z.string().min(1),mode:LegalAdviceModeSchema,base_paise:paise.nullable(),
});
export const LegalAdviceConfigSchema=z.strictObject({
  version:z.number().int().positive(),timezone:z.literal('Asia/Kolkata'),
  tiers:z.array(LegalAdviceTierSchema).min(1),tariffs:z.array(LegalAdviceTariffSchema),
  working_days:z.array(z.number().int().min(0).max(6)).min(1),
  opening_minute:z.number().int().min(0).max(1439),closing_minute:z.number().int().min(1).max(1440),
  slot_minutes:z.number().int().min(5).max(120),minimum_notice_minutes:z.number().int().nonnegative(),
  session_minutes:z.number().int().positive(),join_before_minutes:z.number().int().nonnegative(),
  acceptance_minutes:z.number().int().positive(),proposal_reply_minutes:z.number().int().positive(),
  maximum_pause_minutes:z.number().int().positive(),no_show_minutes:z.number().int().positive(),
  reschedule_notice_minutes:z.number().int().nonnegative(),maximum_reschedules:z.number().int().nonnegative(),
  chat_valid_minutes:z.number().int().positive(),summary_due_minutes:z.number().int().positive(),
  written_advice_due_minutes:z.number().int().positive(),written_advice_base_paise:paise,
}).superRefine((v,ctx)=>{
  const fail=(message:string)=>ctx.addIssue({code:'custom',message});
  if(v.opening_minute>=v.closing_minute)fail('Working hours must close after opening');
  if(new Set(v.working_days).size!==v.working_days.length)fail('Working days must be unique');
  const tiers=[...v.tiers].sort((a,b)=>a.minimum_years-b.minimum_years);
  if(new Set(tiers.map(t=>t.code)).size!==tiers.length)fail('Tier codes must be unique');
  if(tiers[0]?.minimum_years!==0||tiers.at(-1)?.maximum_years!==null)fail('Experience tiers must cover zero years through an unbounded final tier');
  for(let i=1;i<tiers.length;i++)if(tiers[i-1].maximum_years!==tiers[i].minimum_years)fail('Experience tiers must have no gaps or overlaps');
  const keys=new Set<string>();
  for(const t of v.tariffs){const key=`${t.tier_code}:${t.mode}`;if(keys.has(key))fail('Duplicate tier/mode tariff');keys.add(key);if(!tiers.some(x=>x.code===t.tier_code))fail('Unknown tariff tier');}
  for(const t of tiers)for(const mode of LegalAdviceModeSchema.options)if(!keys.has(`${t.code}:${mode}`))fail('Each tier/mode needs a tariff row, including explicit NOT SET');
});
export type LegalAdviceConfig=z.infer<typeof LegalAdviceConfigSchema>;

/** Half-open ranges: boundary years enter the more experienced tier. Unknown
 * experience never silently becomes Emerging. Bounds come from versioned config. */
export function legalAdviceTierFor(years:number|null|undefined,tiers:LegalAdviceTier[]):LegalAdviceTier|null{
  if(years==null||!Number.isFinite(years)||years<0)return null;
  return tiers.find(t=>years>=t.minimum_years&&(t.maximum_years===null||years<t.maximum_years))??null;
}
