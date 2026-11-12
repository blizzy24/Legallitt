import {z} from 'zod';

const code=z.string().regex(/^[a-z][a-z0-9_]{0,63}$/);
export const FirIdentityPolicySchema=z.strictObject({
 version:z.number().int().positive(),required:z.literal(true),
 accepted_documents:z.array(z.strictObject({code,label:z.string().trim().min(1).max(100),requires_masking:z.boolean()})).min(1).max(30),
}).superRefine((policy,ctx)=>{
 if(new Set(policy.accepted_documents.map(d=>d.code)).size!==policy.accepted_documents.length)ctx.addIssue({code:'custom',message:'Duplicate identity document type'});
 for(const d of policy.accepted_documents)if((/aadhaar|aadhar/i.test(d.code+' '+d.label))&&(d.code!=='masked_aadhaar'||!d.requires_masking))ctx.addIssue({code:'custom',message:'Aadhaar must be masked; full Aadhaar cannot be configured'});
});
export type FirIdentityPolicy=z.infer<typeof FirIdentityPolicySchema>;
export const IdentityUploadSchema=z.strictObject({document_type:code,masked_copy:z.boolean()});
export type IdentityUpload=z.infer<typeof IdentityUploadSchema>;
export const IdentityEvidenceSchema=IdentityUploadSchema.extend({policy_version:z.number().int().positive(),declared_at:z.iso.datetime()});
export type IdentityEvidence=z.infer<typeof IdentityEvidenceSchema>;
export function acceptedFirIdentity(policy:FirIdentityPolicy,doc:{kind:string;status:string;identity_evidence?:unknown}){
 if(doc.kind!=='id_proof'||doc.status!=='uploaded')return false;
 const evidence=IdentityEvidenceSchema.safeParse(doc.identity_evidence);if(!evidence.success)return false;
 const type=policy.accepted_documents.find(t=>t.code===evidence.data.document_type);
 return !!type&&(!type.requires_masking||evidence.data.masked_copy);
}
export const FIR_ID_NOTICE='Upload any one accepted identity document. Never upload a full Aadhaar card: use the masked copy showing only the last four digits. We keep only the last four digits you enter, shown masked (XXXX-XXXX-1234); no number is read from the file. An upload is not identity verification.';
export const MASKED_AADHAAR_HELP='Get a masked copy from UIDAI: open My Aadhaar, choose Download Aadhaar, select the masked Aadhaar option and complete the OTP download.';
export const MASKED_AADHAAR_URL='https://myaadhaar.uidai.gov.in/';
