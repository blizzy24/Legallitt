// State changes remain owned by the canonical case state machine.
export const DRAFT_KIND='service_report';
export {writeReportSaved,writeReportSubmitted,writeReportChangesRequested,writeReportReleased,writeReportIntake} from '../cases/case-state-machine';
