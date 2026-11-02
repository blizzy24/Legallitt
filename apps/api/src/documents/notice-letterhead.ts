// Legal Notice Response, designs 189/267. Measurements use the paper crop
// (60,402,658,932), never the surrounding phone frame. See the comparison report.
export const noticeLetterhead = {
  sourceWidth: 658, sourceHeight: 932,
  width: 595.28, height: 841.89,
  headerHeight: 153, headerRule: 4, footerTop: 879, footerRuleTop: 873,
  left: 27, right: 632, bodySize: 12, leading: 22,
  titleTop: 182, titleSize: 22, titleRuleTop: 212,
  referenceTop: 231, toTop: 271, subjectTop: 358, introTop: 398,
  ink: '#111111', band: '#0B0B0B', gold: '#EFCE96', white: '#FFFFFF',
  firm: 'INT LegalConsultants Pvt. Ltd.',
  email: 'Intlegalconsultantspvtltd@gmail.com', website: 'www.legalitt.com',
  // These two typos are deliberately retained at the project owner's request.
  referenceLabel: 'Reffrence Id',
  copy: 'A copy of this Notice has been preserve in my office for record and future reference.',
  signFirm: 'INT LegalConsultant Pvt. Ltd.',
  disclaimer: 'Disclaimer : This legal notice has been generated through an automated document preparation platform based solely on the information, statements, and instructions provided by the user. The platform utilizes technology-assisted drafting tools to facilitate document creation and does not independently verify the accuracy, completeness, authenticity, or legal sufficiency of any information supplied by the user.',
} as const;
