// D-25: every answer describes behaviour that exists in the app today (checked against
// the built flows on 11 Nov 2026). No invented policies. Edit here when a flow changes.
export const SUPPORT_HOURS = 'Monday to Saturday, 9 AM – 7 PM IST'; // D-03: client's operational promise, pending confirmation.

export type Faq = {category: 'Getting Started' | 'Advocates' | 'Consultations' | 'Cases' | 'Billing' | 'Documents' | 'Account'; q: string; a: string};
export const FAQ_CATEGORIES = ['Advocates', 'Consultations', 'Cases', 'Billing', 'Documents', 'Account'] as const;
export const FAQS: Faq[] = [
  {category: 'Getting Started', q: 'Which services can I use?',
    a: 'Legal Notice, FIR Draft, Legal Advice, Property Search Report, Document Forensic, High Court Representation and District Court Representation. Open a service from Home or All Services to see what it includes and its fee before you start.'},
  {category: 'Advocates', q: 'How do I find an advocate?',
    a: 'Open Legal Advice and choose an advocate from the list. Every advocate listed has been approved by Legalitt and has published consultation hours. For other services, Legalitt’s team assigns a suitable advocate after you pay, and you’ll see their name on your case once assigned.'},
  {category: 'Advocates', q: 'How do I save an advocate?',
    a: 'Tap the heart on an advocate’s profile. Saved advocates appear under Profile → Saved Advocates, where you can book a consultation with them directly.'},
  {category: 'Consultations', q: 'How does a Legal Advice consultation work?',
    a: 'Choose an advocate and an available 30-minute slot, then pay. At the booked time you join a chat consultation with the advocate. Afterwards the advocate prepares a written brief, which Legalitt reviews before it reaches you. Voice and video consultations aren’t available yet.'},
  {category: 'Consultations', q: 'Can I change my consultation time?',
    a: 'Yes. Open the consultation from My Cases and choose Reschedule to pick another available slot with the same advocate.'},
  {category: 'Cases', q: 'How can I track my case?',
    a: 'Open the My Cases tab and tap the case. Its timeline shows each step as it happens — payment, advocate assignment, drafting, review and completion. You’ll also get an in-app notification when something changes.'},
  {category: 'Cases', q: 'How does a Legal Notice work?',
    a: 'You describe the dispute, the person you’re sending it to and what you want them to do, add documents and pay. Your advocate drafts the notice and sends it to you to review. You can approve it or request changes. Once approved, the advocate posts the signed notice by courier and you can follow delivery in the app until it’s delivered.'},
  {category: 'Cases', q: 'Does an FIR Draft register an FIR with the police?',
    a: 'No. An advocate prepares a written FIR draft from the facts you give, Legalitt reviews it, and you receive the PDF in your case. You take it to the police station yourself. An identity document is required: a masked Aadhaar (last four digits only), passport, voter ID or driving licence.'},
  {category: 'Cases', q: 'Can I cancel a request?',
    a: 'Before an advocate has accepted your case, you can cancel it from Request Details for a full refund. After an advocate has accepted, you can request cancellation; Legalitt’s team decides the refund and tells you the reason. Once the work has been delivered or the case is complete, it can’t be cancelled — contact Legalitt Support instead.'},
  {category: 'Billing', q: 'What will I pay?',
    a: 'The Complete Payment screen shows the full breakdown before you pay: the service fee, Legalitt’s platform fee and GST, plus any delivery fee and extra pages. The first 25 PDF pages across all your uploads are included; each additional page costs ₹25, without GST.'},
  {category: 'Billing', q: 'How can I view my payment history?',
    a: 'Go to Profile → Payments. Each payment shows its breakdown, and you can download a payment receipt. Receipts aren’t GST tax invoices; tax invoices will be available once Legalitt’s GST details are added.'},
  {category: 'Documents', q: 'How do I upload a document?',
    a: 'Each service has a documents step where you can add PDF, JPG or PNG files up to 25 MB each. Your uploads appear under Profile → Documents.'},
  {category: 'Documents', q: 'Who can see my documents?',
    a: 'You, the advocate assigned to that case and Legalitt’s team. Identity numbers are never read or recorded from identity documents you upload.'},
  {category: 'Documents', q: 'Can I delete a document?',
    a: 'You can remove an upload that isn’t part of a submitted case. Documents attached to a case you’ve submitted stay with that case.'},
  {category: 'Account', q: 'How do I change my profile information?',
    a: 'Go to Profile and tap Edit Profile.'},
  {category: 'Account', q: 'How do I change my password?',
    a: 'Go to Profile → Privacy & Security → Change Password. If you sign in with a one-time code, your account has no password to change.'},
  {category: 'Account', q: 'How do I get a copy of my data or delete my account?',
    a: 'Go to Profile → Privacy & Security → Data & Documents. Download My Data gives you a copy of your profile, cases, payments and messages. Delete Account sends a deletion request: your account is deactivated straight away and Legalitt’s team completes the deletion. It can’t be requested while a paid case is in progress.'},
];
