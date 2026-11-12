// A5 "+ Add Legal Section": a short curated list of commonly used Bharatiya Nyaya
// Sanhita, 2023 provisions. BNS only — IPC was replaced on 1 July 2024 ([DECIDE] A5).
// The advocate can still add any other BNS provision by number and offence.
export type BnsSection = {section: string; offence: string};
export const BNS_ACT = 'BNS';
export const BNS_SECTIONS: readonly BnsSection[] = [
  {section: '3(5)', offence: 'Common intention'},
  {section: '61(2)', offence: 'Criminal conspiracy'},
  {section: '74', offence: 'Assault to outrage a woman’s modesty'},
  {section: '75', offence: 'Sexual harassment'},
  {section: '78', offence: 'Stalking'},
  {section: '79', offence: 'Insulting the modesty of a woman'},
  {section: '85', offence: 'Cruelty by husband or relatives'},
  {section: '103(1)', offence: 'Murder'},
  {section: '106(1)', offence: 'Causing death by negligence'},
  {section: '109', offence: 'Attempt to murder'},
  {section: '115(2)', offence: 'Voluntarily causing hurt'},
  {section: '117(2)', offence: 'Voluntarily causing grievous hurt'},
  {section: '118(1)', offence: 'Hurt by dangerous weapons or means'},
  {section: '126(2)', offence: 'Wrongful restraint'},
  {section: '127(2)', offence: 'Wrongful confinement'},
  {section: '281', offence: 'Rash driving on a public way'},
  {section: '303(2)', offence: 'Theft'},
  {section: '304', offence: 'Snatching'},
  {section: '305', offence: 'Theft in a dwelling, vehicle or place of worship'},
  {section: '308(2)', offence: 'Extortion'},
  {section: '309(4)', offence: 'Robbery'},
  {section: '316(2)', offence: 'Criminal breach of trust'},
  {section: '318(4)', offence: 'Cheating and dishonestly inducing delivery of property'},
  {section: '319(2)', offence: 'Cheating by personation'},
  {section: '324(2)', offence: 'Mischief'},
  {section: '324(4)', offence: 'Mischief causing damage'},
  {section: '329(3)', offence: 'Criminal trespass'},
  {section: '329(4)', offence: 'House-trespass'},
  {section: '336(2)', offence: 'Forgery'},
  {section: '340(2)', offence: 'Using a forged document as genuine'},
  {section: '351(2)', offence: 'Criminal intimidation'},
  {section: '351(3)', offence: 'Criminal intimidation (threat of death or grievous hurt)'},
  {section: '352', offence: 'Intentional insult to provoke breach of peace'},
  {section: '356(2)', offence: 'Defamation'},
];
export const bnsLabel = (s: {act: string; section: string; description: string}) =>
  [`${s.act} ${s.section}`.trim(), s.description.trim() ? `(${s.description.trim()})` : ''].filter(Boolean).join(' ');
export function searchBns(query: string) {
  const q = query.trim().toLocaleLowerCase().replace(/^bns\s*/, '');
  if (!q) return BNS_SECTIONS;
  return BNS_SECTIONS.filter(s => s.section.toLocaleLowerCase().startsWith(q) || s.offence.toLocaleLowerCase().includes(q));
}
