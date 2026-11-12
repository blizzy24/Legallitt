import {Inject,Injectable,Logger,type OnModuleInit,type OnModuleDestroy} from '@nestjs/common';
import {PrismaService} from '../prisma.service';
import {NOTIFICATIONS,type NotificationsPort} from '../notifications/notifications.port';
import {appendCaseEvent} from './case-state-machine';
import {NoticeWorkflowPolicySchema} from './notice-lifecycle';

/** Notifications only: no simulated person, navigation or status progression. */
@Injectable()
export class NoticeReminders implements OnModuleInit,OnModuleDestroy{
  private timer?:NodeJS.Timeout;private running=false;private readonly logger=new Logger(NoticeReminders.name);
  constructor(private readonly prisma:PrismaService,@Inject(NOTIFICATIONS) private readonly notifications:NotificationsPort){}
  onModuleInit(){this.timer=setInterval(()=>void this.tick().catch(()=>this.logger.warn('Notice reminders will retry')),60000);this.timer.unref();}
  onModuleDestroy(){if(this.timer)clearInterval(this.timer);}
  async tick(now=new Date()){
    if(this.running)return;this.running=true;
    try{
      const db=await this.prisma.getClient(),ids=await db.noticeLifecycle.findMany({where:{case:{status:{notIn:['draft','submitted','payment_pending','completed','cancelled','refunded']}}},select:{case_id:true}});
      for(const {case_id:id}of ids)await db.$transaction(async tx=>{
        await tx.$queryRaw`SELECT id FROM cases WHERE id=${id}::uuid FOR UPDATE`;
        const c=await tx.case.findUniqueOrThrow({where:{id}}),life=await tx.noticeLifecycle.findUniqueOrThrow({where:{case_id:id},include:{policy:true}}),policy=NoticeWorkflowPolicySchema.parse(life.policy.config);
        if(['completed','cancelled','refunded'].includes(c.status))return;
        const admins=await tx.user.findMany({where:{role:'admin',status:'active'},select:{id:true}});
        const alert=async(key:string,recipients:string[],title:string,body:string)=>{
          if(await tx.caseEvent.findFirst({where:{case_id:id,type:'notice_reminder_sent',payload:{path:['key'],equals:key}}}))return;
          for(const user_id of recipients)await this.notifications.send(tx,{user_id,case_id:id,kind:'notice_reminder',title,body});
          await appendCaseEvent(tx,{case_id:id,type:'notice_reminder_sent',payload:{key},created_at:now});
        };
        if(c.status==='client_review'&&!life.handed_to_admin_at){
          const sent=await tx.caseEvent.findFirst({where:{case_id:id,to_status:'client_review',from_status:{not:'client_review'}},orderBy:{id:'desc'}});
          if(sent){const hours=(now.getTime()-sent.created_at.getTime())/3600000;
            for(const threshold of policy.client_reminder_hours)if(hours>=threshold)await alert(`client:${sent.id}:${threshold}`,[c.client_id],'Your notice is waiting for review','Open your Legal Notice to approve the draft or request changes.');
            if(hours>=policy.client_idle_admin_hours)await alert(`idle:${sent.id}`,admins.map(a=>a.id),'Client has not responded',`${c.reference} has waited ${Math.floor(hours/24)} days for client review. Contact the client through Support.`);
          }
        }
        if(life.deadline_at&&!life.handed_to_admin_at&&['assigned','advocate_accepted','in_progress','changes_requested'].includes(c.status)){
          const left=(life.deadline_at.getTime()-now.getTime())/3600000;
          if(left<=policy.deadline_alert_hours)await alert(`deadline:${life.deadline_at.toISOString()}`,admins.map(a=>a.id).concat(c.advocate_id?[c.advocate_id]:[]),'Legal Notice deadline approaching',`${c.reference}: draft due ${life.deadline_at.toISOString()}.`);
          if(left<=0)await alert(`overdue:${life.deadline_at.toISOString()}`,admins.map(a=>a.id),'Legal Notice overdue',`${c.reference}: extend the deadline with a client update or reassign the case.`);
        }
        const rounds=await tx.draftReview.count({where:{draft_id_relation:{case_id:id},reviewer_role:'client',decision:'changes_requested'}});
        if(rounds>policy.change_round_alert)await alert(`changes:${rounds}`,admins.map(a=>a.id),'Repeated Legal Notice changes',`${c.reference} has ${rounds} client change rounds. Review the case and contact the parties through Support.`);
      });
    }finally{this.running=false;}
  }
}
