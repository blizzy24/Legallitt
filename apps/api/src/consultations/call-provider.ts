export const CALL_PROVIDER=Symbol('CALL_PROVIDER');
export type CallRoom={id:string;simulated:boolean;media_available:boolean;label:string};
/** Provider describes media capability only. Booking membership, participant
 * presence and session time are enforced by the lifecycle, never the provider. */
export interface CallProvider {room(bookingId:string):Promise<CallRoom>}
export class TestCallProvider implements CallProvider {
 async room(bookingId:string):Promise<CallRoom>{return {id:`test:${bookingId}`,simulated:true,media_available:false,label:'Test call room — audio and video are not transmitted.'};}
}
