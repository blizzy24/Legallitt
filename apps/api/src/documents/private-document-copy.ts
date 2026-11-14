import {ConflictException} from '@nestjs/common';
import {createHash} from 'node:crypto';
import type {Prisma,Document,Case} from '../generated/prisma/client';
import type {CaseActor} from '../cases/case-access';
import {counterpartPhones} from '../cases/contact-privacy';
import {DocumentStorage,stagingKey} from './document-storage';
import {privateGeneratedPdf} from './pdf-contact-privacy';

/** Called only after the normal document membership/release checks. The derived
 * object is private in the same encrypted bucket; its URL has the same expiry as
 * the original. It never replaces a stored document or changes a case version. */
export async function privateDocumentCopy(tx:Prisma.TransactionClient,storage:DocumentStorage,actor:CaseActor,record:Case,doc:Document){
 if(doc.mime_type!=='application/pdf'||!['legal_notice','fir_draft','forensic_report','forensic_affidavit','service_report','consultation_report'].includes(doc.kind))return doc.s3_key;
 const draft=await tx.draft.findFirst({where:{case_id:record.id,document_id:doc.id}}),content=draft?.content as {production?:string;sender?:string}|undefined;
 // Uploaded reports and client evidence are original evidence, not generated
 // copies. No OCR/content extraction is added to the identity pipeline.
 if(doc.kind==='service_report'&&content?.production!=='property')return doc.s3_key;
 const phones=await counterpartPhones(tx,actor,record.id);
 const client=(record.details as {client?:{age?:unknown}})?.client;
 const hideAge=record.service_code==='legal_notice'&&(client?.age!=null||/\bAge[d]?\s*:?\s*\d/i.test(content?.sender??'')||!!await tx.caseParty.findFirst({where:{case_id:record.id,kind:'sender',age:{not:null}},select:{id:true}}));
 if(!phones.some(v=>typeof v==='string'&&v.replace(/\D/g,'').length>=7)&&!hideAge)return doc.s3_key;
 const source=await storage.head(doc.s3_key);if(!source)throw new ConflictException('The document is unavailable. Contact Support.');
 const hash=createHash('sha256').update(JSON.stringify({version:1,key:doc.s3_key,source,phones,hideAge})).digest('hex');
 const key=doc.s3_key.slice(0,doc.s3_key.lastIndexOf('/')+1)+`privacy-v1-${hash}.pdf`;
 if(await storage.head(key))return key;
 let bytes:Uint8Array|null;
 try{bytes=await privateGeneratedPdf(await storage.read(doc.s3_key,source),phones,hideAge);}catch{throw new ConflictException('A private copy could not be prepared. Contact Support; the original file is retained.');}
 if(!bytes)return doc.s3_key;
 const ticket=await storage.upload(key,'application/pdf',bytes.length),form=new FormData();for(const [name,value]of Object.entries(ticket.fields))form.append(name,value);form.append('file',new Blob([Buffer.from(bytes)],{type:'application/pdf'}),'Document.pdf');
 const response=await fetch(ticket.url,{method:'POST',body:form});if(!response.ok)throw new ConflictException('The private copy could not be saved. Retry.');
 const pending=await storage.head(stagingKey(key));if(!pending||pending.size!==bytes.length)throw new ConflictException('The private copy could not be verified. Retry.');
 await storage.promote(key,pending,'application/pdf');return key;
}
