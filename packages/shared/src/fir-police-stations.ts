// Flow C3 / section 5 item 4: police stations for Madhya Pradesh (Indore and
// Bhopal districts, LGD codes 410 and 396). Everywhere else the client types the
// station name. Station names are commonly published ones and have not yet been
// checked against MP Police's official list (§9.1); "Type police station name"
// remains available in these districts too.
const MP = '23';
const stations = (district: string, slug: string, names: string[]) =>
  names.map(name => ({id: `mp-${slug}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`, state_code: MP, district_code: district, name}));

export const FIR_POLICE_STATIONS = [
  ...stations('410', 'indore', ['Aerodrome', 'Annapurna', 'Azad Nagar', 'Banganga', 'Bhanwarkuan', 'Chandan Nagar', 'Chhatripura', 'Dwarkapuri',
    'Heera Nagar', 'Juni Indore', 'Kanadia', 'Khajrana', 'Lasudia', 'Malharganj', 'MIG', 'Palasia', 'Pandharinath', 'Pardeshipura',
    'Rajendra Nagar', 'Raoji Bazar', 'Sadar Bazar', 'Sanyogitaganj', 'Tejaji Nagar', 'Tilak Nagar', 'Tukoganj', 'Vijay Nagar']),
  ...stations('396', 'bhopal', ['Ashoka Garden', 'Ayodhya Nagar', 'Bagsewaniya', 'Bajaria', 'Chhola Mandir', 'Gandhi Nagar', 'Gautam Nagar',
    'Govindpura', 'Habibganj', 'Hanumanganj', 'Jahangirabad', 'Kamla Nagar', 'Koh-e-Fiza', 'Kolar Road', 'Kotwali', 'Mangalwara',
    'Misrod', 'MP Nagar', 'Nishatpura', 'Piplani', 'Ratibad', 'Shahjahanabad', 'Shahpura', 'Shyamla Hills', 'Talaiya', 'Tila Jamalpura', 'TT Nagar']),
] as const;
export type FirPoliceStation = typeof FIR_POLICE_STATIONS[number];
export const firPoliceStations = (stateCode?: string, districtCode?: string) =>
  FIR_POLICE_STATIONS.filter(s => s.state_code === stateCode && s.district_code === districtCode);
