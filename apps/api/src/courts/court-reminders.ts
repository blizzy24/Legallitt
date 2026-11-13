import {Inject,Injectable,Logger,type OnModuleInit,type OnModuleDestroy} from '@nestjs/common';
import {CourtPolicySchema,noticeDate,type CourtData} from '@legalitt/shared';
import {PrismaService} from '../prisma.service';
import {NOTIFICATIONS,type NotificationsPort} from '../notifications/notifications.port';
import {appendCaseEvent} from '../cases/case-state-machine';
/** Reminders never advance a case or simulate a participant's action. */
@Injectable()
export class CourtReminders implements OnModuleInit,OnModuleDestroy{
 private timer?:NodeJS.Timeout;private running=false;private readonly logger=new Logger(CourtReminders.name);
 constructor(private readonly prisma:PrismaService,@Inject(NOTIFICATIONS)private readonly notifications:NotificationsPort){}
 onModuleInit(){this.timer=setInterval(()=>void this.tick().catch(()=>this.logger.warn('Court reminders will retry')),60000);this.timer.unref();}
 onModuleDestroy(){if(this.timer)clearInterval(this.timer);}
 async tick(now=new Date()){
  if(this.running)return;this.running=true;
  try{const db=await this.prisma.getClient(),work=await db.courtWorkspace.findMany({select:{case_id:true}});
   for(const {case_id:id}of work)await db.$transaction(async tx=>{
    await tx.$queryRaw`SELECT id FROM cases WHERE id=${id}::uuid FOR UPDATE`;
    const c=await tx.case.findUniqueOrThrow({where:{id}}),w=await tx.courtWorkspace.findUniqueOrThrow({where:{case_id:id}}),d=w.data as unknown as CourtData;
    if(['draft','deposit','cancelled','completed'].includes(d.phase))return;
    const policy=CourtPolicySchema.parse((await tx.courtPolicy.findUniqueOrThrow({where:{id:w.policy_id}})).config),admins=await tx.user.findMany({where:{role:'admin',status:'active'},select:{id:true}});
    const alert=async(key:string,recipients:string[],title:string,body:string)=>{if(await tx.caseEvent.findFirst({where:{case_id:id,type:'court_reminder_sent',payload:{path:['key'],equals:key}}}))return;for(const user_id of recipients)await this.notifications.send(tx,{user_id,case_id:id,kind:'court_reminder',title,body});await appendCaseEvent(tx,{case_id:id,type:'court_reminder_sent',payload:{key},created_at:now});};
    const hearings=await tx.courtHearing.findMany({where:{case_id:id}}),day=(date:Date)=>new Date(date.getTime()+330*60000).toISOString().slice(0,10),tomorrow=day(new Date(now.getTime()+86400000));
    for(const h of hearings){if(day(h.at)===tomorrow&&h.advocate_id===c.advocate_id)await alert('hearing:'+h.id+':'+day(h.at),[h.advocate_id],'Court hearing tomorrow',`${c.reference}: ${noticeDate(h.at.toISOString())}, ${h.court}, room ${h.room}. Review your papers.`);if(!h.update&&h.at.getTime()+48*3600000<now.getTime())await alert('hearing-overdue:'+h.id,admins.map(a=>a.id),'Hearing update overdue',`${c.reference}: request the advocate’s update for ${noticeDate(h.at.toISOString())}.`);}
    for(const fee of d.fees)if(fee.paid_at&&!fee.receipt_id&&Date.parse(fee.paid_at)+policy.receipt_alert_days*86400000<now.getTime())await alert('receipt:'+fee.id,admins.map(a=>a.id),'Court fee receipt overdue',`${c.reference}: ${fee.heading}. Payment was recorded but the receipt is missing.`);
    if(w.updated_at.getTime()+30*86400000<now.getTime())await alert('stalled:'+w.updated_at.toISOString(),admins.map(a=>a.id),'Court case has no update for 30 days',`${c.reference}: contact the assigned advocate through the admin panel.`);
   });
  }finally{this.running=false;}
 }
}
