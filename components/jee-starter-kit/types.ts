
export enum ResourceTab {
  PYQ = 'PYQ',
  CHEATSHEETS = 'CheatSheets',
  TOPPERS = 'From the Topper\'s mouth',
  GK_NOTES = 'GK Notes',
  FORMS = 'Forms & Deadlines',
  DESK = 'From the desk of ClatTribe',
  COLLEGES = 'Know your college',
  MIND_JOURNALS = 'Voices',
  CONTACTS = 'Contact',
}

export interface CollegeInfo {
  name: string;
  location: string;
  rank: number;
  description: string;
  stats: {
    seats: number;
    medianPackage: string;
    cutOff: string;
  };
}

export interface ExamForm {
  name: string;
  startDate: string;
  endDate: string;
  link: string;
  status: 'Open' | 'Closed' | 'Coming Soon';
}
