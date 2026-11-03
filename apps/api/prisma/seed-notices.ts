import type { DevelopmentSeedIntake } from "../src/cases/case-state-machine";

// Development seed cases (§9.1). Realistic Indian intake so the advocate list and
// the admin panel look like a working practice; every person, firm and number is
// fictitious. Mobiles use the 90000 00xxx test range; emails use example.com.
// Each case is built through the real create, intake, submit, payment and
// assignment path, so it satisfies every rule a client's case does.
export type SeedNotice = {
  key: string;
  /** The advocate who receives it, or none: it waits in the admin's Open bucket. */
  advocateEmail?: string;
  intake: DevelopmentSeedIntake;
};

export const SEED_NOTICES: SeedNotice[] = [
  {
    key: "demo-advocate-3@legalitt.invalid:0",
    advocateEmail: "demo-advocate-3@legalitt.invalid",
    intake: {
      tier: "ordinary",
      details: {
        client: { fullName: "Sunita Mehra", mobile: "9000000101", email: "sunita.mehra@example.com", address: "B-14, Malviya Nagar, Jaipur, Rajasthan 302017" },
        noticee: { fullName: "Rajeev Mehra", mobile: "9000000102", email: "rajeev.mehra@example.com", address: "22, Vaishali Nagar, Jaipur, Rajasthan 302021", relationship: "Husband" },
        issueType: "family-dispute",
      },
      subject_matter: "Under the family settlement we both signed on 12 March 2025, my husband agreed to pay ₹20,000 every month towards the school fees and upkeep of our two children. He paid until June 2025 and has paid nothing since, despite repeated requests by phone and in writing. Nine months are now outstanding.",
      subject_line: "Legal notice for non-payment of agreed child maintenance under the family settlement dated 12 March 2025",
      legal_demand: {
        selected: ["Pay the outstanding maintenance of ₹1,80,000 within 15 days of this notice.", "Resume the agreed monthly maintenance of ₹20,000 from the next month."],
        custom: "",
      },
      sender: { age: 41, father_name: "Ramesh Chandra Sharma" },
    },
  },
  {
    key: "demo-advocate-4@legalitt.invalid:0",
    advocateEmail: "demo-advocate-4@legalitt.invalid",
    intake: {
      tier: "urgent",
      details: {
        client: { fullName: "Anil Deshpande", mobile: "9000000103", email: "anil.deshpande@example.com", address: "Flat 8, Mayur Apartments, Paud Road, Kothrud, Pune, Maharashtra 411038" },
        noticee: { fullName: "Vikram Joshi", mobile: "9000000104", email: "vikram.joshi@example.com", address: "Flat 302, Sai Residency, Baner, Pune, Maharashtra 411045", relationship: "Tenant" },
        issueType: "tenant-issue",
      },
      subject_matter: "I let Flat 302, Sai Residency, Baner to Mr. Joshi under a leave and licence agreement registered on 1 April 2025 at ₹28,000 a month. He has not paid rent for July to October 2026, and has not vacated although the agreement expired on 31 August 2026 and I asked him in writing to leave.",
      subject_line: "Legal notice for arrears of rent and vacation of Flat 302, Sai Residency, Baner, Pune",
      legal_demand: {
        selected: ["Pay the arrears of rent of ₹1,12,000 within 15 days of this notice.", "Vacate the flat and hand over vacant possession within 30 days."],
        custom: "",
      },
      sender: { age: 58, father_name: "Vasant Deshpande" },
    },
  },
  {
    key: "demo-advocate-4@legalitt.invalid:1",
    advocateEmail: "demo-advocate-4@legalitt.invalid",
    intake: {
      tier: "ordinary",
      details: {
        client: { fullName: "Priya Kulkarni", mobile: "9000000105", email: "priya.kulkarni@example.com", address: "12, Sanewadi Lane, Aundh, Pune, Maharashtra 411007" },
        noticee: { fullName: "Sanjay Patil", mobile: "9000000106", email: "sanjay.patil@example.com", address: "Plot No. 48, Hinjewadi Phase 2, Pune, Maharashtra 411057", relationship: "Neighbour" },
        issueType: "property-dispute",
      },
      subject_matter: "I own Plot No. 47, Hinjewadi Phase 2, as recorded in the 7/12 extract and the sale deed of 2019. In September 2026 my neighbour on Plot No. 48 built a compound wall about four feet inside my eastern boundary. The taluka survey on 3 October 2026 confirmed the encroachment.",
      subject_line: "Legal notice for removal of encroachment on Plot No. 47, Hinjewadi Phase 2, Pune",
      legal_demand: {
        selected: ["Remove the compound wall built inside Plot No. 47 within 30 days of this notice."],
        custom: "Restore the boundary as marked in the taluka survey of 3 October 2026, at your own cost.",
      },
      sender: { age: 36, father_name: "Prakash Kulkarni" },
    },
  },
  {
    key: "demo-advocate-4@legalitt.invalid:2",
    advocateEmail: "demo-advocate-4@legalitt.invalid",
    intake: {
      tier: "ordinary",
      details: {
        client: { fullName: "Rohan Agarwal", mobile: "9000000107", email: "rohan.agarwal@example.com", address: "A-701, Lunkad Gardens, Viman Nagar, Pune, Maharashtra 411014" },
        noticee: { fullName: "Manish Shah", mobile: "9000000108", email: "manish.shah@example.com", address: "4th Floor, Mehta Chambers, Jangli Maharaj Road, Shivajinagar, Pune, Maharashtra 411005", relationship: "Friend" },
        issueType: "money-recovery",
      },
      subject_matter: "On 5 January 2026 I lent Mr. Shah ₹3,50,000 by bank transfer, as a friendly loan to be repaid by 30 June 2026. He acknowledged the loan on WhatsApp. Nothing has been repaid, and he has stopped answering my calls.",
      subject_line: "Legal notice for recovery of a friendly loan of ₹3,50,000 advanced on 5 January 2026",
      legal_demand: {
        selected: ["Repay the loan of ₹3,50,000 within 15 days of this notice."],
        custom: "Pay interest at 9% a year from 30 June 2026 until repayment.",
      },
      sender: { age: 33, father_name: "Suresh Agarwal" },
    },
  },
  {
    key: "waiting",
    intake: {
      tier: "urgent",
      details: {
        client: { fullName: "Harpreet Singh Bedi", mobile: "9000000109", email: "harpreet.bedi@example.com", address: "J-12/14, Rajouri Garden, New Delhi, Delhi 110027" },
        noticee: { fullName: "Deepak Malhotra", mobile: "9000000110", email: "deepak.malhotra@example.com", address: "16/2, Ajmal Khan Road, Karol Bagh, New Delhi, Delhi 110005", relationship: "Customer" },
        issueType: "cheque-bounce",
      },
      subject_matter: "Mr. Malhotra bought furniture from my shop and gave me cheque no. 004512 dated 12 September 2026 for ₹75,000, drawn on Punjab National Bank, Karol Bagh. It was returned unpaid on 18 September 2026 with the remark \"funds insufficient\". He has not paid since.",
      subject_line: "Legal notice under section 138 of the Negotiable Instruments Act for dishonour of cheque no. 004512 for ₹75,000",
      legal_demand: {
        selected: ["Pay the cheque amount of ₹75,000 within 15 days of receiving this notice."],
        custom: "",
      },
      sender: { age: 47, father_name: "Gurcharan Singh Bedi" },
    },
  },
  {
    key: "sparse",
    intake: {
      tier: "ordinary",
      details: {
        client: { fullName: "Kavita Iyer", mobile: "9000000111", email: "kavita.iyer@example.com", address: "No. 9, 12th Main Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560008" },
        noticee: { fullName: "The Manager, Sunrise Home Appliances", mobile: "9000000112", email: "care@example.com", address: "No. 41, Brigade Road, Bengaluru, Karnataka 560025", relationship: "Seller" },
        issueType: "consumer-complaint",
      },
      subject_matter: "On 2 August 2026 I bought a refrigerator for ₹38,500 with a one-year warranty. It stopped cooling within three weeks. The service centre has visited four times without fixing it, and the store has refused a replacement or refund.",
      subject_line: "Legal notice for replacement or refund of a defective refrigerator purchased on 2 August 2026",
      legal_demand: {
        selected: ["Replace the refrigerator with a new unit of the same model within 15 days."],
        custom: "Or refund the purchase price of ₹38,500.",
      },
      sender: { age: 39, father_name: "Venkatesh Iyer" },
    },
  },
];
