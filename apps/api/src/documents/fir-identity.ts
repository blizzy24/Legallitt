import {BadRequestException,ServiceUnavailableException} from '@nestjs/common';
import {FirIdentityPolicySchema,acceptedFirIdentity,type FirIdentityPolicy} from '@legalitt/shared';
import type {Prisma} from '../generated/prisma/client';

export async function firIdentityPolicy(tx:Prisma.TransactionClient):Promise<FirIdentityPolicy>{
 const service=await tx.service.findUnique({where:{code:'fir_draft'}});
 const config=(service?.config??{}) as Record<string,unknown>,parsed=FirIdentityPolicySchema.safeParse(config.fir_identity_policy);
 if(!parsed.success)throw new ServiceUnavailableException('FIR identity requirements are unavailable. Retry loading; contact support if this continues.');
 return parsed.data;
}
export async function requireFirIdentity(tx:Prisma.TransactionClient,caseId:string,documentId?:string){
 const policy=await firIdentityPolicy(tx);
 const docs=await tx.document.findMany({where:{case_id:caseId,kind:'id_proof',status:'uploaded',...(documentId?{id:documentId}:{})}});
 if(!docs.some(doc=>acceptedFirIdentity(policy,doc)))throw new BadRequestException('Upload one accepted identity document in Documents & Evidence. Aadhaar must be masked. Select that document in the FIR draft before generating its PDF.');
 return policy;
}
