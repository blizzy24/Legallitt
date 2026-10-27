import type { CourierPort } from './courier.port';
/** Manual v1: carrier and waybill remain exactly what the advocate supplies. */
export class SimulatedCourier implements CourierPort { readonly simulated = true; }
