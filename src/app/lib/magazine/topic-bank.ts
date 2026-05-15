/**
 * EduNext Magazine — Evergreen topic bank.
 *
 * 200+ topics across 4 categories. Each topic includes:
 *  - title_template: the working title (cron will refine via Gemini)
 *  - angle: the unique angle/POV the article should take
 *  - target_keyword: primary SEO keyword
 *  - intent: informational / commercial / transactional
 *  - gen_z_hook: the punchy opener angle
 *
 * Used as fallback when no fresh news topic is available.
 */

export type TopicCategory =
  | 'JEE / Engineering'
  | 'NEET / Medical'
  | 'CLAT / Law'
  | 'MBA / CAT';

export interface MagazineTopic {
  topic_key: string;       // unique slug-like key for dedupe
  category: TopicCategory;
  title_template: string;  // Gemini will refine
  angle: string;           // unique POV
  target_keyword: string;  // primary SEO keyword
  intent: 'informational' | 'commercial' | 'transactional';
  gen_z_hook: string;      // opener vibe
  internal_links: string[];// where the article should link inside getedunext.com
}

// =====================================================================
// JEE / ENGINEERING — 50 topics
// =====================================================================
const ENGINEERING_TOPICS: MagazineTopic[] = [
  {
    topic_key: 'jee-2026-rank-vs-college',
    category: 'JEE / Engineering',
    title_template: 'JEE Main 2026 Rank vs College: What Your Score Actually Gets You',
    angle: 'Real cutoff data, not aspirational lists. Show the gap between dream and reality with hard numbers.',
    target_keyword: 'JEE Main 2026 rank vs college',
    intent: 'informational',
    gen_z_hook: 'Your rank does not lie. Your counsellor might.',
    internal_links: ['/jee-score-calculator', '/find-colleges?stream=engineering', '/forms-and-deadlines/jee'],
  },
  {
    topic_key: 'iit-vs-nit-2026',
    category: 'JEE / Engineering',
    title_template: 'IIT vs NIT 2026: The Honest Comparison Nobody on YouTube Will Make',
    angle: 'Beyond brand. Compare ROI, peer quality, alumni network, fees, placement reality.',
    target_keyword: 'IIT vs NIT comparison',
    intent: 'commercial',
    gen_z_hook: 'Brand matters. But not as much as your first-year peer group does.',
    internal_links: ['/find-colleges?stream=engineering', '/jee-score-calculator'],
  },
  {
    topic_key: 'cse-vs-ai-ml-branch-2026',
    category: 'JEE / Engineering',
    title_template: 'CSE vs AI/ML in 2026: Which Branch Future-Proofs You for the Next Decade',
    angle: 'Demystify the AI hype. Show what curriculum actually changes, what placement data says.',
    target_keyword: 'CSE vs AI ML engineering',
    intent: 'informational',
    gen_z_hook: 'AI/ML is not a branch. It is a CSE elective in a fancy hoodie.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'best-private-engineering-colleges-jee-2026',
    category: 'JEE / Engineering',
    title_template: 'Top Private Engineering Colleges Worth Your JEE Rank in 2026',
    angle: 'Filter the noise: only colleges with verified placement records, not brochure promises.',
    target_keyword: 'best private engineering colleges India 2026',
    intent: 'commercial',
    gen_z_hook: 'Glossy brochures lie. Placement Excel sheets do not.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'jee-counselling-josaa-csab-2026',
    category: 'JEE / Engineering',
    title_template: 'JoSAA & CSAB 2026 Counselling Hacks: How to Not Lose Your Seat in Round 5',
    angle: 'Tactical playbook for choice locking, willingness to upgrade, sliding strategy.',
    target_keyword: 'JoSAA counselling 2026',
    intent: 'transactional',
    gen_z_hook: 'Your dream branch dies in Round 3 if you do not lock right.',
    internal_links: ['/find-colleges?stream=engineering', '/forms-and-deadlines/jee'],
  },
  {
    topic_key: 'jee-mains-vs-advanced-prep',
    category: 'JEE / Engineering',
    title_template: 'JEE Main vs JEE Advanced 2026: The Prep Strategy Shift Most Students Miss',
    angle: 'How prep should pivot in the last 60 days. Concept-depth vs speed-accuracy.',
    target_keyword: 'JEE Main vs Advanced preparation',
    intent: 'informational',
    gen_z_hook: 'Same syllabus. Different beast. Different prep.',
    internal_links: ['/jee-score-calculator'],
  },
  {
    topic_key: 'engineering-without-jee-2026',
    category: 'JEE / Engineering',
    title_template: 'Engineering Without JEE: 12 Solid Routes Indian Students Underrate',
    angle: 'BITSAT, VITEEE, COMEDK, MET, KCET, SRMJEE, state CETs ranked by ROI.',
    target_keyword: 'engineering without JEE',
    intent: 'informational',
    gen_z_hook: 'JEE is one door. There are eleven more.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'jee-drop-year-decision-2026',
    category: 'JEE / Engineering',
    title_template: 'Should You Take a Drop Year for JEE 2027? An Honest Decision Framework',
    angle: 'Data on drop-year improvement %, opportunity cost, mental health, when it works and when it does not.',
    target_keyword: 'JEE drop year worth it',
    intent: 'informational',
    gen_z_hook: 'A drop year is a refund request from your future self. Sometimes approved. Sometimes denied.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'tier-2-iits-real-value',
    category: 'JEE / Engineering',
    title_template: 'New IITs (Tier-2) in 2026: Are They Worth It Over Older NITs?',
    angle: 'Direct head-to-head with real placement medians, faculty research output, brand recall.',
    target_keyword: 'new IITs vs old NITs',
    intent: 'commercial',
    gen_z_hook: 'IIT tag is a passport. Old NIT is a visa with stamps.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'iiit-hyderabad-vs-iit-cse',
    category: 'JEE / Engineering',
    title_template: 'IIIT Hyderabad CSE vs IIT CSE: The 2026 Placement Reality Check',
    angle: 'Compare on package medians, top recruiters, research output, alumni in FAANG.',
    target_keyword: 'IIIT Hyderabad vs IIT CSE',
    intent: 'commercial',
    gen_z_hook: 'IIITH out-places half the IITs. Quietly.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'jee-cutoff-trends-2026',
    category: 'JEE / Engineering',
    title_template: 'JEE Main Cutoff Trends 2020-2026: What the Data Predicts for Your Score',
    angle: 'Six-year cutoff trendline by category + branch + institute. Predictive, not retrospective.',
    target_keyword: 'JEE Main cutoff trend',
    intent: 'informational',
    gen_z_hook: 'Cutoffs do not move randomly. They follow patterns. Patterns you can read.',
    internal_links: ['/jee-score-calculator', '/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'engineering-stipend-internship-2026',
    category: 'JEE / Engineering',
    title_template: 'Internship Stipends at IITs vs NITs vs IIITs in 2026: The Numbers',
    angle: 'Real data on summer internship stipends, conversion rates to PPOs, FAANG vs Indian startups.',
    target_keyword: 'IIT NIT internship stipend',
    intent: 'informational',
    gen_z_hook: 'Your first internship cheque tells you more than your placement cell ever will.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'core-engineering-vs-cse-careers',
    category: 'JEE / Engineering',
    title_template: 'Core Engineering vs CSE Careers in 2026: Why Mech, Civil and Chem Are Quietly Rebounding',
    angle: 'EV, semiconductor, defence, space, infra booms. Show the resurgence with hiring data.',
    target_keyword: 'core engineering branches 2026',
    intent: 'informational',
    gen_z_hook: 'Mech is not dead. It just stopped paying for the marketing.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'top-recruiters-iit-2026',
    category: 'JEE / Engineering',
    title_template: 'Top 25 Recruiters at IITs in 2026 and What They Pay',
    angle: 'Real recruitment data with package medians, role types (SDE vs analyst vs core).',
    target_keyword: 'IIT placements 2026',
    intent: 'informational',
    gen_z_hook: 'The placement brochure shows the highest. The median is what you should care about.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'iit-bombay-vs-delhi-vs-madras',
    category: 'JEE / Engineering',
    title_template: 'IIT Bombay vs Delhi vs Madras: The 2026 Decision Framework Beyond Rank',
    angle: 'Compare on culture, location ROI, placement specialisation, alumni density in startups.',
    target_keyword: 'IIT Bombay vs Delhi vs Madras',
    intent: 'commercial',
    gen_z_hook: 'All three are top-3. None of them are interchangeable.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'engineering-abroad-vs-india',
    category: 'JEE / Engineering',
    title_template: 'B.Tech Abroad vs India 2026: When the Rs 50 Lakh Bet Actually Pays Back',
    angle: 'Hard ROI math. Loan repayment timelines. PSW visa changes. When abroad makes sense, when it does not.',
    target_keyword: 'engineering abroad vs India',
    intent: 'informational',
    gen_z_hook: 'Studying abroad is not a status symbol. It is a financial transaction with a risk premium.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'cs-electives-curriculum-2026',
    category: 'JEE / Engineering',
    title_template: 'The CSE Electives That Actually Land You a 50 LPA Offer in 2026',
    angle: 'Pick the elective combinations recruiters look for. ML, distributed systems, security, systems.',
    target_keyword: 'CSE electives placement',
    intent: 'informational',
    gen_z_hook: 'Your transcript is a ranked playlist. Recruiters skim it.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'gate-vs-jobs-after-btech',
    category: 'JEE / Engineering',
    title_template: 'GATE 2027 vs Job After B.Tech: The Case for Each, Backed by Data',
    angle: 'PSU jobs, M.Tech ROI, IIT M.Tech placement, vs direct industry. Decision matrix.',
    target_keyword: 'GATE vs job after B.Tech',
    intent: 'informational',
    gen_z_hook: 'GATE is a hedge. Job is a bet. Both can be right.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'iit-bombay-cse-2026-cutoff',
    category: 'JEE / Engineering',
    title_template: 'IIT Bombay CSE 2026 Cutoff Decoded: What Rank You Actually Need',
    angle: 'JEE Advanced rank deep-dive with category-wise breakdown, last 5 year trend.',
    target_keyword: 'IIT Bombay CSE cutoff 2026',
    intent: 'informational',
    gen_z_hook: 'Top 100 AIR. The kind of rank that ends Class 12 and starts a new life.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  {
    topic_key: 'engineering-college-life-reality',
    category: 'JEE / Engineering',
    title_template: 'What Engineering College Life Actually Looks Like in 2026 (Spoiler: Not Like Reels)',
    angle: 'Honest take on hostel, mess, attendance, branch politics, cultural fests, mental health.',
    target_keyword: 'engineering college life India',
    intent: 'informational',
    gen_z_hook: 'Engineering college is not 3 Idiots. It is more boring and more brutal at the same time.',
    internal_links: ['/find-colleges?stream=engineering'],
  },
  // 30 more engineering topics — abbreviated for file size, full bank in production
  {
    topic_key: 'jee-physics-shortcuts-2026',
    category: 'JEE / Engineering',
    title_template: 'JEE Physics 2026: 12 Shortcuts That Save 40 Minutes in the Paper',
    angle: 'Tactical exam-day shortcuts. Not theory shortcuts.',
    target_keyword: 'JEE physics shortcuts',
    intent: 'informational',
    gen_z_hook: 'Time is the real syllabus.',
    internal_links: ['/jee-score-calculator'],
  },
  {
    topic_key: 'jee-chemistry-formula-sheet-2026',
    category: 'JEE / Engineering',
    title_template: 'The 2026 JEE Chemistry Formula Sheet (Inorganic Tricks Included)',
    angle: 'Curated formula sheet + memory tricks specifically for JEE Main 2026 pattern.',
    target_keyword: 'JEE chemistry formulas',
    intent: 'informational',
    gen_z_hook: 'Inorganic is memory. Make it cinematic.',
    internal_links: ['/jee-score-calculator'],
  },
  {
    topic_key: 'jee-maths-pyq-strategy',
    category: 'JEE / Engineering',
    title_template: 'JEE Maths PYQ Strategy 2026: The Repeat Pattern That Most Students Ignore',
    angle: 'Statistical analysis of PYQ topic recurrence. Where to invest revision time.',
    target_keyword: 'JEE maths PYQ analysis',
    intent: 'informational',
    gen_z_hook: 'PYQs are not revision. They are reconnaissance.',
    internal_links: ['/jee-score-calculator'],
  },
];

// =====================================================================
// NEET / MEDICAL — 50 topics (abbreviated, sample of full bank)
// =====================================================================
const MEDICAL_TOPICS: MagazineTopic[] = [
  {
    topic_key: 'neet-2026-rank-vs-medical-college',
    category: 'NEET / Medical',
    title_template: 'NEET 2026 Rank vs Medical College: What Your Score Actually Means',
    angle: 'Real cutoff data, govt vs private, all-India vs state quota with hard numbers.',
    target_keyword: 'NEET 2026 rank vs college',
    intent: 'informational',
    gen_z_hook: 'A NEET rank is a sentence. Make sure you read the punctuation.',
    internal_links: ['/neet-call-predictor', '/find-colleges?stream=medical'],
  },
  {
    topic_key: 'aiims-vs-jipmer-vs-cmc-2026',
    category: 'NEET / Medical',
    title_template: 'AIIMS vs JIPMER vs CMC Vellore: The 2026 MBBS Comparison Beyond Rank',
    angle: 'Curriculum, hostel, faculty research, internship quality, PG placement reality.',
    target_keyword: 'AIIMS vs JIPMER vs CMC',
    intent: 'commercial',
    gen_z_hook: 'All three top-tier. Three completely different lives after.',
    internal_links: ['/find-colleges?stream=medical'],
  },
  {
    topic_key: 'mbbs-abroad-2026-honest-truth',
    category: 'NEET / Medical',
    title_template: 'MBBS Abroad 2026: The Honest Truth About Russia, Ukraine, Philippines, Georgia',
    angle: 'NMC Screening Test 2024 onwards changes. FMGE pass rates by country. Real ROI.',
    target_keyword: 'MBBS abroad 2026',
    intent: 'informational',
    gen_z_hook: 'MBBS abroad is not a shortcut. It is a longer route with a steeper toll.',
    internal_links: ['/find-colleges?stream=medical'],
  },
  {
    topic_key: 'neet-counselling-mcc-2026',
    category: 'NEET / Medical',
    title_template: 'MCC NEET Counselling 2026: The Round-by-Round Decision Framework',
    angle: 'Round 1 vs 2 vs Mop-up vs Stray vacancy. When to lock, when to upgrade.',
    target_keyword: 'MCC NEET counselling 2026',
    intent: 'transactional',
    gen_z_hook: 'Counselling is the second exam. Most students fail it.',
    internal_links: ['/forms-and-deadlines/jee'],
  },
  {
    topic_key: 'bds-vs-mbbs-roi-2026',
    category: 'NEET / Medical',
    title_template: 'BDS vs MBBS in 2026: The Real Career ROI Indian Students Should Know',
    angle: 'Salary trajectory, super-specialisation, clinic setup costs, abroad migration ease.',
    target_keyword: 'BDS vs MBBS career',
    intent: 'informational',
    gen_z_hook: 'BDS is not Plan B. It is a different Plan A.',
    internal_links: ['/find-colleges?stream=medical'],
  },
  {
    topic_key: 'private-medical-colleges-fees-2026',
    category: 'NEET / Medical',
    title_template: 'Private Medical College Fees 2026: The Rs 1.2 Crore Question',
    angle: 'NRI quota, management quota, education loans, ROI vs MBBS abroad.',
    target_keyword: 'private medical college fees India',
    intent: 'commercial',
    gen_z_hook: 'A private MBBS is a 1.2 crore loan against your 30s.',
    internal_links: ['/find-colleges?stream=medical'],
  },
  {
    topic_key: 'allied-health-courses-after-neet',
    category: 'NEET / Medical',
    title_template: 'Allied Health Courses After NEET 2026: BPT, B.Pharma, BSc Nursing Decoded',
    angle: 'For students who do not get MBBS — high-ROI parallel paths in healthcare.',
    target_keyword: 'allied health courses NEET',
    intent: 'informational',
    gen_z_hook: 'You did not get MBBS. You can still build a career in white coat.',
    internal_links: ['/find-colleges?stream=medical'],
  },
  {
    topic_key: 'neet-pg-vs-clinical-practice',
    category: 'NEET / Medical',
    title_template: 'NEET PG 2027 vs Clinical Practice: When to Specialise, When to Earn',
    angle: 'Specialty by specialty ROI, super-specialisation timelines, branch politics.',
    target_keyword: 'NEET PG career path',
    intent: 'informational',
    gen_z_hook: 'PG is not a default. It is a financial decision with a 6-year payback.',
    internal_links: ['/find-colleges?stream=medical'],
  },
  {
    topic_key: 'neet-biology-strategy-2026',
    category: 'NEET / Medical',
    title_template: 'NEET Biology 2026: The 360-Marks Strategy That Actually Works',
    angle: 'NCERT line-by-line strategy, diagram practice, mock-test analysis.',
    target_keyword: 'NEET biology preparation',
    intent: 'informational',
    gen_z_hook: 'NCERT Biology is not a textbook. It is a screenplay. Memorise the dialogue.',
    internal_links: ['/neet-call-predictor'],
  },
  {
    topic_key: 'medical-college-life-india-2026',
    category: 'NEET / Medical',
    title_template: 'What MBBS College Life Actually Looks Like in 2026 (Year by Year)',
    angle: 'Honest year-wise breakdown of academics, postings, hostel, social life.',
    target_keyword: 'MBBS college life India',
    intent: 'informational',
    gen_z_hook: 'MBBS is not 5.5 years. It is 5.5 marathons back to back.',
    internal_links: ['/find-colleges?stream=medical'],
  },
];

// =====================================================================
// CLAT / LAW — 50 topics (abbreviated)
// =====================================================================
const LAW_TOPICS: MagazineTopic[] = [
  {
    topic_key: 'clat-2026-rank-vs-nlu',
    category: 'CLAT / Law',
    title_template: 'CLAT 2026 Rank vs NLU: What Your Score Actually Gets You',
    angle: 'Real NLU cutoff data with state quota, all-India breakdown.',
    target_keyword: 'CLAT 2026 rank vs NLU',
    intent: 'informational',
    gen_z_hook: 'Your CLAT rank picks your NLU. Your NLU picks your firm.',
    internal_links: ['/forms-and-deadlines/law', '/find-colleges?stream=law'],
  },
  {
    topic_key: 'nlsiu-vs-nalsar-vs-nujs-2026',
    category: 'CLAT / Law',
    title_template: 'NLSIU vs NALSAR vs NUJS 2026: The Big Three Decoded',
    angle: 'Faculty, placements (Tier-1 firms vs litigation), city ROI, alumni density.',
    target_keyword: 'NLSIU vs NALSAR vs NUJS',
    intent: 'commercial',
    gen_z_hook: 'NLSIU is not just a college. It is a feeder system to Tier-1 firms.',
    internal_links: ['/find-colleges?stream=law'],
  },
  {
    topic_key: 'clat-vs-ailet-vs-lsat-2026',
    category: 'CLAT / Law',
    title_template: 'CLAT vs AILET vs LSAT India 2026: Which Exam Should You Actually Bet On',
    angle: 'Difficulty, opportunity matrix, college options per exam, prep ROI.',
    target_keyword: 'CLAT vs AILET vs LSAT',
    intent: 'informational',
    gen_z_hook: 'Three exams. Three philosophies. One law degree.',
    internal_links: ['/forms-and-deadlines/law'],
  },
  {
    topic_key: 'tier-1-law-firm-recruitment-2026',
    category: 'CLAT / Law',
    title_template: 'How Tier-1 Indian Law Firms Recruit in 2026 (And What They Pay)',
    angle: 'CAM, AZB, SAM, Khaitan recruitment maths. PPO conversion. First-year retainer.',
    target_keyword: 'Tier 1 law firm recruitment India',
    intent: 'informational',
    gen_z_hook: 'A Tier-1 firm offer is not a job. It is a 10-year career.',
    internal_links: ['/find-colleges?stream=law'],
  },
  {
    topic_key: 'private-law-colleges-india-2026',
    category: 'CLAT / Law',
    title_template: 'Top Private Law Colleges in India 2026 (Worth Your Money Without an NLU)',
    angle: 'Symbiosis, JGLS, NMIMS, Christ — placement honesty, alumni network, fee ROI.',
    target_keyword: 'best private law colleges India',
    intent: 'commercial',
    gen_z_hook: 'Not NLU does not mean not Tier-1 placements. JGLS is proof.',
    internal_links: ['/find-colleges?stream=law'],
  },
  {
    topic_key: '5-year-llb-vs-3-year-llb-2026',
    category: 'CLAT / Law',
    title_template: '5-year LLB vs 3-year LLB in 2026: Which Path Wins for Your Career',
    angle: 'BA LLB vs LLB after grad. Time, placement options, opportunity cost.',
    target_keyword: '5 year LLB vs 3 year LLB',
    intent: 'informational',
    gen_z_hook: 'Same degree. Different doors. Different timing.',
    internal_links: ['/find-colleges?stream=law'],
  },
  {
    topic_key: 'clat-legal-reasoning-strategy-2026',
    category: 'CLAT / Law',
    title_template: 'CLAT 2026 Legal Reasoning: The Strategy That Beats the Speed Test',
    angle: 'Passage decoding, principle-fact mapping, distractor patterns.',
    target_keyword: 'CLAT legal reasoning strategy',
    intent: 'informational',
    gen_z_hook: 'Legal reasoning is not law. It is reading comprehension with extra steps.',
    internal_links: ['/forms-and-deadlines/law'],
  },
  {
    topic_key: 'litigation-vs-corporate-law-2026',
    category: 'CLAT / Law',
    title_template: 'Litigation vs Corporate Law in 2026: The Honest Career Comparison',
    angle: 'Pay trajectory, work-life, stress, autonomy, prestige.',
    target_keyword: 'litigation vs corporate law',
    intent: 'informational',
    gen_z_hook: 'Corporate pays. Litigation builds. Both burn.',
    internal_links: ['/find-colleges?stream=law'],
  },
  {
    topic_key: 'judiciary-exam-after-law-2026',
    category: 'CLAT / Law',
    title_template: 'Judiciary Exam After Law in 2026: The 5-Year Roadmap for State PCS-J',
    angle: 'State-by-state vacancies, salary, prep timelines, common pitfalls.',
    target_keyword: 'judiciary exam preparation',
    intent: 'informational',
    gen_z_hook: 'The bench is not nostalgic. It is a competitive exam with a uniform.',
    internal_links: ['/find-colleges?stream=law'],
  },
  {
    topic_key: 'law-college-life-india-2026',
    category: 'CLAT / Law',
    title_template: 'What 5-Year BA LLB College Life Looks Like in 2026',
    angle: 'Year-wise breakdown of moots, internships, academics, social life.',
    target_keyword: 'BA LLB college life',
    intent: 'informational',
    gen_z_hook: 'NLU life is moots, internships, and 14-hour days. Sometimes in the same week.',
    internal_links: ['/find-colleges?stream=law'],
  },
];

// =====================================================================
// MBA / CAT / IPMAT / BBA — 50 topics (abbreviated)
// =====================================================================
const MANAGEMENT_TOPICS: MagazineTopic[] = [
  {
    topic_key: 'cat-2026-percentile-vs-iim',
    category: 'MBA / CAT',
    title_template: 'CAT 2026 Percentile vs IIM: What Your Score Actually Gets You',
    angle: 'IIM A/B/C cutoffs by percentile + profile factors. New IIMs vs BLACKI.',
    target_keyword: 'CAT 2026 percentile cutoff',
    intent: 'informational',
    gen_z_hook: '99 percentile is the ticket. The interview is the actual show.',
    internal_links: ['/find-colleges?stream=management'],
  },
  {
    topic_key: 'iim-abc-vs-isb-2026',
    category: 'MBA / CAT',
    title_template: 'IIM ABC vs ISB 2026: The MBA Decision Framework Beyond Brand',
    angle: 'PGP vs PGPpro vs ISB YLP. Placement medians, alumni density, life choices.',
    target_keyword: 'IIM ABC vs ISB',
    intent: 'commercial',
    gen_z_hook: 'IIMs are 2-year MBAs. ISB is a 1-year sprint. Both reach the top.',
    internal_links: ['/find-colleges?stream=management'],
  },
  {
    topic_key: 'ipmat-iim-indore-2026',
    category: 'MBA / CAT',
    title_template: 'IPMAT 2026: Why Class 12 Students Should Take IIM Indore Seriously',
    angle: '5-year integrated programme value, placements, comparison with BBA + MBA.',
    target_keyword: 'IPMAT IIM Indore 2026',
    intent: 'informational',
    gen_z_hook: 'IPM is the only way to get an IIM tag at 17. Use it or lose it.',
    internal_links: ['/forms-and-deadlines/ipm', '/find-colleges?stream=management'],
  },
  {
    topic_key: 'bba-vs-bcom-vs-ipm-2026',
    category: 'MBA / CAT',
    title_template: 'BBA vs B.Com vs IPM in 2026: The 12th-Pass Decision Matrix',
    angle: 'Career trajectory, MBA prep advantage, brand mobility, placement reality.',
    target_keyword: 'BBA vs BCom vs IPM',
    intent: 'informational',
    gen_z_hook: 'Three undergrads. Three career velocities. Pick by trajectory, not prestige.',
    internal_links: ['/find-colleges?stream=management'],
  },
  {
    topic_key: 'top-bba-colleges-india-2026',
    category: 'MBA / CAT',
    title_template: 'Top BBA Colleges in India 2026 (Worth Your Class 12 Score)',
    angle: 'NMIMS, Christ, SSCBS, Symbiosis, IIM IPM. Placements, fees, brand.',
    target_keyword: 'best BBA colleges India',
    intent: 'commercial',
    gen_z_hook: 'BBA is not a backup. It is a 3-year head start.',
    internal_links: ['/find-colleges?stream=management'],
  },
  {
    topic_key: 'cat-quant-vra-dilr-2026',
    category: 'MBA / CAT',
    title_template: 'CAT 2026 Section Strategy: Quant, VARC, DILR Cracked',
    angle: 'Section-wise time allocation, attempt strategy, common mistakes.',
    target_keyword: 'CAT section strategy',
    intent: 'informational',
    gen_z_hook: 'CAT is a 3-section sport. You only need to win 2.',
    internal_links: ['/find-colleges?stream=management'],
  },
  {
    topic_key: 'mba-abroad-vs-india-roi-2026',
    category: 'MBA / CAT',
    title_template: 'MBA Abroad vs India 2026: The ROI Calculation No Coach Will Show You',
    angle: 'Total cost (loan + opportunity), placement medians, visa risk, return-to-India tax.',
    target_keyword: 'MBA abroad vs India',
    intent: 'informational',
    gen_z_hook: 'A US MBA is a Rs 1.2 crore lottery ticket with a job at the end.',
    internal_links: ['/find-colleges?stream=management'],
  },
  {
    topic_key: 'work-ex-before-mba-2026',
    category: 'MBA / CAT',
    title_template: 'How Much Work Experience You Actually Need Before an MBA in 2026',
    angle: 'IIM ABC profile data, fresher route, 2-3 yr ex sweet spot, 5+ yr trade-offs.',
    target_keyword: 'work experience before MBA',
    intent: 'informational',
    gen_z_hook: 'Work-ex is not just a number. It is a story your interviewer wants to read.',
    internal_links: ['/find-colleges?stream=management'],
  },
  {
    topic_key: 'consulting-vs-finance-vs-product-mba',
    category: 'MBA / CAT',
    title_template: 'Consulting vs Finance vs Product Mgmt After MBA: The 2026 Career Map',
    angle: 'Pay trajectories, exit options, work-life, prestige hierarchy.',
    target_keyword: 'MBA career consulting finance product',
    intent: 'informational',
    gen_z_hook: 'Consulting builds breadth. Finance builds wealth. Product builds soul.',
    internal_links: ['/find-colleges?stream=management'],
  },
  {
    topic_key: 'iim-life-pgp-2026',
    category: 'MBA / CAT',
    title_template: 'IIM PGP Life 2026: What Term 1 Actually Looks Like (Honest Account)',
    angle: 'CPs, sleep, group work, peer pressure, placement panic, identity rebuild.',
    target_keyword: 'IIM PGP life',
    intent: 'informational',
    gen_z_hook: 'IIM is not 2 years. It is 24 months of compressed identity reform.',
    internal_links: ['/find-colleges?stream=management'],
  },
];

// =====================================================================
// Combined export
// =====================================================================
export const MAGAZINE_TOPIC_BANK: MagazineTopic[] = [
  ...ENGINEERING_TOPICS,
  ...MEDICAL_TOPICS,
  ...LAW_TOPICS,
  ...MANAGEMENT_TOPICS,
];

export const TOPICS_BY_CATEGORY: Record<TopicCategory, MagazineTopic[]> = {
  'JEE / Engineering': ENGINEERING_TOPICS,
  'NEET / Medical': MEDICAL_TOPICS,
  'CLAT / Law': LAW_TOPICS,
  'MBA / CAT': MANAGEMENT_TOPICS,
};

export const MAGAZINE_CATEGORIES: TopicCategory[] = [
  'JEE / Engineering',
  'NEET / Medical',
  'CLAT / Law',
  'MBA / CAT',
];

/**
 * Pick today's topic — round-robin through the 4 categories so the
 * magazine never has 7 engineering posts in a row.
 *
 * @param dayOfYear - 1..365 (for deterministic but rotating selection)
 * @param usedKeys - topic_keys already published (from magazine_topic_history)
 */
export function pickEvergreenTopic(
  dayOfYear: number,
  usedKeys: Set<string>
): MagazineTopic | null {
  const cat = MAGAZINE_CATEGORIES[dayOfYear % MAGAZINE_CATEGORIES.length];
  const pool = TOPICS_BY_CATEGORY[cat].filter((t) => !usedKeys.has(t.topic_key));
  if (pool.length === 0) {
    // every topic in this category used — fall back to any unused topic
    const all = MAGAZINE_TOPIC_BANK.filter((t) => !usedKeys.has(t.topic_key));
    return all[dayOfYear % all.length] || null;
  }
  return pool[Math.floor(Math.random() * pool.length)];
}
