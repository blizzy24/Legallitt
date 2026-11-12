import AdvocateFirReviewScreen from './review';
// design/449: the compact A6 layout opened right after "Send for Review". It leaves
// out the status panel while the advocate has nothing to do, and Continue returns
// to Cases. Live data, same screen as design/219.
export default function CompactFirReview() { return <AdvocateFirReviewScreen compact/>; }
