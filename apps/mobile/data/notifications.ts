export type NotificationItem = {
  id: string; title: string; body: string; unread: boolean; when: string; group: 'TODAY' | 'YESTERDAY' | 'EARLIER';
  category: 'Cases' | 'Consultations' | 'Payments'; icon: 'calendar' | 'wallet' | 'message' | 'document' | 'consult' | 'case' | 'request';
  chip: string; action: string; tone: 'green' | 'orange' | 'neutral'; href?: string;
};
// Design 60, fixture-only. API rows never borrow these names, amounts or references.
export const CLIENT_NOTIFICATIONS: NotificationItem[] = [
  {id:'consultation', title:'Consultation Confirmed', body:'Your Legal Advice consultation with Adv. Priya Sharma is confirmed.', unread:true, when:'10:42 AM',group:'TODAY',category:'Consultations',icon:'calendar',chip:'● Today, 4:30 PM',action:'View Details',tone:'green',href:'/legal-advice/confirmed'},
  {id:'case',title:'Case Updated',body:'Your case Rahul Sharma vs. Amit Verma has a new update.',unread:true,when:'9:15 AM',group:'TODAY',category:'Cases',icon:'document',chip:'Docket #DR-4402',action:'Review filing',tone:'neutral',href:'/(tabs)/cases'},
  {id:'payment',title:'Payment Received',body:'Your payment of ₹36,500 was successfully processed.',unread:false,when:'Yesterday',group:'YESTERDAY',category:'Payments',icon:'wallet',chip:'UPI • Settled',action:'View Receipt',tone:'green',href:'/payments'},
  {id:'request',title:'Request Update',body:'Your District Representation request is awaiting advocate review.',unread:false,when:'Yesterday',group:'YESTERDAY',category:'Cases',icon:'request',chip:'In Review',action:'Track Status',tone:'orange',href:'/requests'},
];
