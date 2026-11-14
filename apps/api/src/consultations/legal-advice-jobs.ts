import {Injectable,Logger,type OnModuleInit,type OnModuleDestroy} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {LegalAdviceWorkflow} from './legal-advice.service';
import {adviceData} from './legal-advice-rules';
@Injectable()
export class LegalAdviceJobs implements OnModuleInit,OnModuleDestroy {
 private timer?:NodeJS.Timeout;private running=false;private readonly logger=new Logger(LegalAdviceJobs.name);
 constructor(private readonly prisma:PrismaService,private readonly flow:LegalAdviceWorkflow){}
 onModuleInit(){this.timer=setInterval(()=>void this.tick().catch(()=>this.logger.warn('Legal Advice background reconciliation will retry')),60000);this.timer.unref();}
 onModuleDestroy(){if(this.timer)clearInterval(this.timer);}
 async tick(){if(this.running)return;this.running=true;try{const db=await this.prisma.getClient(),rows=await db.legalAdviceBooking.findMany({where:{phase:{notIn:['draft','payment_pending','cancelled','refunded']}},orderBy:{updated_at:'asc'},take:500});for(const b of rows){await this.flow.reconcile(b.case_id);if(!adviceData(b.session).ai){const c=await db.case.findUniqueOrThrow({where:{id:b.case_id}});await this.flow.generateAi({id:c.client_id,role:'client',trigger:'system'},b.case_id);}}}finally{this.running=false;}}
}
