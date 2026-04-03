-- ============================================================================
-- CampusMatch Supabase Migration
-- Complete schema for India's two-sided student-college matching platform
-- ============================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- STUDENTS TABLE
-- ============================================================================
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  city text,
  state text,
  class_year text,
  stream text,
  board text,
  board_percentage numeric(5,2),
  entrance_exam text,
  entrance_score text,
  target_degree text,
  sop_raw text,
  sop_polished text,
  bio_short text,
  dna_type text,
  dna_quiz_scores jsonb,
  extracurriculars jsonb,
  achievements jsonb,
  video_resume_url text,
  video_resume_transcript text,
  fit_score_cache jsonb,
  ghost_mode boolean default false,
  profile_complete boolean default false,
  profile_completeness_pct integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint user_id_unique unique(user_id)
);

-- ============================================================================
-- COLLEGES TABLE
-- ============================================================================
create table if not exists colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  state text not null,
  type text not null,
  programs jsonb not null,
  dna_type text,
  dna_description text,
  nirf_rank integer,
  naac_grade text,
  logo_url text,
  banner_url text,
  website text,
  about_short text,
  placement_avg_lpa numeric(7,2),
  placement_highest_lpa numeric(7,2),
  total_intake integer,
  campus_area_acres numeric(8,2),
  hostel_available boolean default true,
  vibe_score_cache jsonb,
  vibe_rating_count integer default 0,
  featured boolean default false,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint college_name_city_unique unique(name, city)
);

-- ============================================================================
-- SWIPES TABLE
-- ============================================================================
create table if not exists swipes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  college_id uuid not null references colleges(id) on delete cascade,
  direction text not null check (direction in ('like', 'pass')),
  created_at timestamptz default now(),
  constraint swipe_unique unique(student_id, college_id)
);

-- ============================================================================
-- COLLEGE SIGNALS TABLE
-- ============================================================================
create table if not exists college_signals (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references colleges(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  signal_type text not null check (signal_type in ('interested', 'not_interested', 'invited')),
  note text,
  created_at timestamptz default now(),
  constraint college_signal_unique unique(college_id, student_id)
);

-- ============================================================================
-- MATCHES TABLE
-- ============================================================================
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  college_id uuid not null references colleges(id) on delete cascade,
  match_type text not null check (match_type in ('mutual', 'student_interest', 'college_interest')),
  signal_type text,
  icebreaker_text text,
  icebreaker_sent_at timestamptz,
  student_responded boolean default false,
  college_responded boolean default false,
  application_ready boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint match_unique unique(student_id, college_id)
);

-- ============================================================================
-- VIBE RATINGS TABLE
-- ============================================================================
create table if not exists vibe_ratings (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references colleges(id) on delete cascade,
  submitted_by_email_hash text not null,
  semester text,
  academic_rigor integer not null check (academic_rigor >= 1 and academic_rigor <= 10),
  campus_life integer not null check (campus_life >= 1 and campus_life <= 10),
  faculty_quality integer not null check (faculty_quality >= 1 and faculty_quality <= 10),
  placement_support integer not null check (placement_support >= 1 and placement_support <= 10),
  peer_network integer not null check (peer_network >= 1 and peer_network <= 10),
  infrastructure integer not null check (infrastructure >= 1 and infrastructure <= 10),
  diversity_inclusion integer not null check (diversity_inclusion >= 1 and diversity_inclusion <= 10),
  career_growth integer not null check (career_growth >= 1 and career_growth <= 10),
  verified boolean default false,
  created_at timestamptz default now()
);

-- ============================================================================
-- DREAM BUDDIES TABLE
-- ============================================================================
create table if not exists dream_buddies (
  id uuid primary key default gen_random_uuid(),
  student_a uuid not null references students(id) on delete cascade,
  student_b uuid not null references students(id) on delete cascade,
  overlap_colleges jsonb,
  overlap_count integer default 0,
  status text default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  shared_notes jsonb,
  created_at timestamptz default now(),
  constraint dream_buddy_unique unique(student_a, student_b),
  constraint different_students check (student_a != student_b)
);

-- ============================================================================
-- DNA QUIZ RESPONSES TABLE
-- ============================================================================
create table if not exists dna_quiz_responses (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  responses jsonb not null,
  dimension_scores jsonb not null,
  assigned_type text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint one_response_per_student unique(student_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Students indexes
create index if not exists idx_students_user_id on students(user_id);
create index if not exists idx_students_dna_type on students(dna_type);
create index if not exists idx_students_profile_complete on students(profile_complete);

-- Colleges indexes
create index if not exists idx_colleges_active on colleges(active);
create index if not exists idx_colleges_type on colleges(type);
create index if not exists idx_colleges_dna_type on colleges(dna_type);
create index if not exists idx_colleges_city_state on colleges(city, state);

-- Swipes indexes
create index if not exists idx_swipes_student_id on swipes(student_id);
create index if not exists idx_swipes_college_id on swipes(college_id);
create index if not exists idx_swipes_direction on swipes(direction);

-- College signals indexes
create index if not exists idx_college_signals_college_id on college_signals(college_id);
create index if not exists idx_college_signals_student_id on college_signals(student_id);
create index if not exists idx_college_signals_type on college_signals(signal_type);

-- Matches indexes
create index if not exists idx_matches_student_id on matches(student_id);
create index if not exists idx_matches_college_id on matches(college_id);
create index if not exists idx_matches_type on matches(match_type);

-- Vibe ratings indexes
create index if not exists idx_vibe_ratings_college_id on vibe_ratings(college_id);
create index if not exists idx_vibe_ratings_verified on vibe_ratings(verified);

-- Dream buddies indexes
create index if not exists idx_dream_buddies_student_a on dream_buddies(student_a);
create index if not exists idx_dream_buddies_student_b on dream_buddies(student_b);
create index if not exists idx_dream_buddies_status on dream_buddies(status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table students enable row level security;
alter table colleges enable row level security;
alter table swipes enable row level security;
alter table college_signals enable row level security;
alter table matches enable row level security;
alter table vibe_ratings enable row level security;
alter table dream_buddies enable row level security;
alter table dna_quiz_responses enable row level security;

-- Students RLS: users can only view/edit their own profile
create policy "Students can view own profile" on students
  for select using (auth.uid() = user_id);

create policy "Students can update own profile" on students
  for update using (auth.uid() = user_id);

create policy "Students can insert own profile" on students
  for insert with check (auth.uid() = user_id);

-- Colleges RLS: public read for active colleges
create policy "Colleges are publicly readable when active" on colleges
  for select using (active = true);

-- Swipes RLS: students can view/modify only their own swipes
create policy "Swipes visible to own student" on swipes
  for select using (
    student_id in (
      select id from students where user_id = auth.uid()
    )
  );

create policy "Swipes can be created by student" on swipes
  for insert with check (
    student_id in (
      select id from students where user_id = auth.uid()
    )
  );

-- College signals RLS: students can view signals about them, colleges can view their signals
create policy "College signals visible to student" on college_signals
  for select using (
    student_id in (
      select id from students where user_id = auth.uid()
    )
  );

-- Matches RLS: students can view matches involving them
create policy "Matches visible to student" on matches
  for select using (
    student_id in (
      select id from students where user_id = auth.uid()
    )
  );

-- Vibe ratings RLS: public read for verified ratings
create policy "Vibe ratings public when verified" on vibe_ratings
  for select using (verified = true);

-- Dream buddies RLS: users can view their own buddy requests
create policy "Dream buddies visible to involved students" on dream_buddies
  for select using (
    student_a in (
      select id from students where user_id = auth.uid()
    ) or student_b in (
      select id from students where user_id = auth.uid()
    )
  );

-- DNA quiz responses RLS: students can view/edit their own responses
create policy "DNA responses visible to own student" on dna_quiz_responses
  for select using (
    student_id in (
      select id from students where user_id = auth.uid()
    )
  );

-- ============================================================================
-- SEED DATA: 12 Indian Colleges
-- ============================================================================

insert into colleges (name, city, state, type, programs, dna_type, dna_description, nirf_rank, naac_grade, logo_url, website, about_short, placement_avg_lpa, placement_highest_lpa, total_intake, campus_area_acres, hostel_available, featured, active) values

-- 1. IIT Bombay
(
  'IIT Bombay',
  'Mumbai',
  'Maharashtra',
  'Engineering',
  '[
    {"name": "B.Tech Computer Science", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 200000},
    {"name": "B.Tech Mechanical Engineering", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 200000},
    {"name": "B.Tech Electrical Engineering", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 200000},
    {"name": "M.Tech Computer Science", "degree": "M.Tech", "duration": "2 years", "fees_per_year_inr": 150000}
  ]'::jsonb,
  'Explorer',
  'Pushing boundaries of engineering and research with focus on innovation and global perspective',
  3,
  'A+',
  'https://www.iitb.ac.in/images/iit-bombay-logo.png',
  'https://www.iitb.ac.in',
  'India''s premier engineering institute focused on excellence in teaching, research, and innovation',
  24.5,
  95.0,
  1100,
  2147.0,
  true,
  true,
  true
),

-- 2. IIT Delhi
(
  'IIT Delhi',
  'Delhi',
  'Delhi',
  'Engineering',
  '[
    {"name": "B.Tech Computer Science", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 200000},
    {"name": "B.Tech Civil Engineering", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 200000},
    {"name": "B.Tech Chemical Engineering", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 200000},
    {"name": "Dual Degree B.Tech + M.Tech", "degree": "Dual", "duration": "5 years", "fees_per_year_inr": 200000}
  ]'::jsonb,
  'Scholar',
  'Rigorous academic programs emphasizing theoretical foundations and research excellence',
  6,
  'A+',
  'https://www.iitd.ac.in/images/iit-delhi-logo.png',
  'https://www.iitd.ac.in',
  'Leading engineering institute in India''s capital with strong focus on research and academics',
  22.8,
  88.0,
  950,
  91.0,
  true,
  true,
  true
),

-- 3. BITS Pilani
(
  'BITS Pilani',
  'Pilani',
  'Rajasthan',
  'Engineering',
  '[
    {"name": "B.E. Computer Science", "degree": "B.E.", "duration": "4 years", "fees_per_year_inr": 1250000},
    {"name": "B.E. Mechanical Engineering", "degree": "B.E.", "duration": "4 years", "fees_per_year_inr": 1250000},
    {"name": "B.E. Electrical Engineering", "degree": "B.E.", "duration": "4 years", "fees_per_year_inr": 1250000},
    {"name": "M.Tech Computer Science", "degree": "M.Tech", "duration": "2 years", "fees_per_year_inr": 800000}
  ]'::jsonb,
  'Builder',
  'Holistic development through hands-on learning, entrepreneurship, and practical skills',
  15,
  'A',
  'https://www.bits-pilani.ac.in/images/bits-pilani-logo.png',
  'https://www.bits-pilani.ac.in',
  'Private engineering university known for industry-focused education and holistic development',
  20.5,
  82.0,
  1200,
  330.0,
  true,
  true,
  true
),

-- 4. NIT Trichy
(
  'NIT Trichy',
  'Tiruchirappalli',
  'Tamil Nadu',
  'Engineering',
  '[
    {"name": "B.Tech Computer Science", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 500000},
    {"name": "B.Tech Mechanical Engineering", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 500000},
    {"name": "B.Tech Chemical Engineering", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 500000},
    {"name": "M.Tech Production Engineering", "degree": "M.Tech", "duration": "2 years", "fees_per_year_inr": 300000}
  ]'::jsonb,
  'Scholar',
  'Strong academic foundation with emphasis on theoretical knowledge and professional development',
  7,
  'A',
  'https://www.nitt.edu/images/nit-trichy-logo.png',
  'https://www.nitt.edu',
  'National Institute of Technology focusing on quality engineering education and research',
  18.2,
  75.0,
  900,
  180.0,
  true,
  true,
  true
),

-- 5. IIIT Hyderabad
(
  'IIIT Hyderabad',
  'Hyderabad',
  'Telangana',
  'Engineering',
  '[
    {"name": "B.Tech Computer Science", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 500000},
    {"name": "B.Tech Electronics and Communication", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 500000},
    {"name": "B.Tech Information Technology", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 500000},
    {"name": "M.Tech Computer Science", "degree": "M.Tech", "duration": "2 years", "fees_per_year_inr": 350000}
  ]'::jsonb,
  'Creator',
  'Innovation-driven institute with focus on cutting-edge technology and creative problem-solving',
  16,
  'A',
  'https://www.iiit.ac.in/images/iiith-logo.png',
  'https://www.iiit.ac.in',
  'Autonomous institution recognized for IT education and groundbreaking research initiatives',
  21.0,
  85.0,
  800,
  85.0,
  true,
  true,
  true
),

-- 6. Ashoka University
(
  'Ashoka University',
  'Sonipat',
  'Haryana',
  'Liberal Arts',
  '[
    {"name": "BA Economics", "degree": "BA", "duration": "4 years", "fees_per_year_inr": 1200000},
    {"name": "BA Political Science", "degree": "BA", "duration": "4 years", "fees_per_year_inr": 1200000},
    {"name": "BA Philosophy", "degree": "BA", "duration": "4 years", "fees_per_year_inr": 1200000},
    {"name": "BA Interdisciplinary Studies", "degree": "BA", "duration": "4 years", "fees_per_year_inr": 1200000}
  ]'::jsonb,
  'Explorer',
  'Liberal arts education emphasizing critical thinking, global perspective, and intellectual exploration',
  24,
  'A',
  'https://www.ashoka.edu.in/images/ashoka-logo.png',
  'https://www.ashoka.edu.in',
  'India''s premier private liberal arts university fostering intellectual curiosity and social impact',
  10.5,
  35.0,
  300,
  100.0,
  true,
  false,
  true
),

-- 7. Christ University
(
  'Christ University',
  'Bangalore',
  'Karnataka',
  'Management',
  '[
    {"name": "BA Commerce", "degree": "BA", "duration": "3 years", "fees_per_year_inr": 400000},
    {"name": "BBA General Management", "degree": "BBA", "duration": "3 years", "fees_per_year_inr": 600000},
    {"name": "MBA General Management", "degree": "MBA", "duration": "2 years", "fees_per_year_inr": 1000000},
    {"name": "MBA Finance", "degree": "MBA", "duration": "2 years", "fees_per_year_inr": 1050000}
  ]'::jsonb,
  'Connector',
  'Comprehensive management education building strong networks and leadership capabilities',
  45,
  'A++',
  'https://www.christuniversity.in/images/christ-university-logo.png',
  'https://www.christuniversity.in',
  'Leading private university delivering world-class business and management education',
  9.8,
  28.0,
  600,
  50.0,
  true,
  false,
  true
),

-- 8. Manipal Institute of Technology
(
  'Manipal Institute of Technology',
  'Manipal',
  'Karnataka',
  'Engineering',
  '[
    {"name": "B.Tech Computer Science", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 1000000},
    {"name": "B.Tech Information Technology", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 950000},
    {"name": "B.Tech Mechanical Engineering", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 900000},
    {"name": "M.Tech Computer Science", "degree": "M.Tech", "duration": "2 years", "fees_per_year_inr": 650000}
  ]'::jsonb,
  'Builder',
  'Practical engineering education emphasizing industry collaboration and skill development',
  18,
  'A',
  'https://manipal.edu/images/mit-logo.png',
  'https://manipal.edu',
  'Global engineering institute with strong industry partnerships and international recognition',
  16.5,
  72.0,
  1400,
  350.0,
  true,
  false,
  true
),

-- 9. VIT Vellore
(
  'VIT Vellore',
  'Vellore',
  'Tamil Nadu',
  'Engineering',
  '[
    {"name": "B.Tech Computer Science", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 800000},
    {"name": "B.Tech Electronics and Communication", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 800000},
    {"name": "B.Tech Mechanical Engineering", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 800000},
    {"name": "M.Tech Computer Science", "degree": "M.Tech", "duration": "2 years", "fees_per_year_inr": 500000}
  ]'::jsonb,
  'Builder',
  'Innovation-focused engineering with emphasis on skill enhancement and practical knowledge',
  12,
  'A+',
  'https://www.vit.ac.in/images/vit-logo.png',
  'https://www.vit.ac.in',
  'ABET accredited engineering institute known for innovation in teaching and research',
  14.2,
  68.0,
  2400,
  400.0,
  true,
  false,
  true
),

-- 10. SRM Chennai
(
  'SRM Institute of Science and Technology',
  'Chennai',
  'Tamil Nadu',
  'Engineering',
  '[
    {"name": "B.Tech Computer Science", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 750000},
    {"name": "B.Tech Mechanical Engineering", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 700000},
    {"name": "B.Tech Electrical Engineering", "degree": "B.Tech", "duration": "4 years", "fees_per_year_inr": 700000},
    {"name": "M.Tech Information Technology", "degree": "M.Tech", "duration": "2 years", "fees_per_year_inr": 450000}
  ]'::jsonb,
  'Connector',
  'Industry-connected engineering education fostering collaboration and professional growth',
  22,
  'A',
  'https://www.srmist.edu.in/images/srm-logo.png',
  'https://www.srmist.edu.in',
  'Multi-campus research university offering comprehensive engineering and science programs',
  13.8,
  65.0,
  2000,
  350.0,
  true,
  false,
  true
),

-- 11. Symbiosis Pune
(
  'Symbiosis Institute of Business Management',
  'Pune',
  'Maharashtra',
  'Management',
  '[
    {"name": "MBA General Management", "degree": "MBA", "duration": "2 years", "fees_per_year_inr": 1200000},
    {"name": "MBA Finance", "degree": "MBA", "duration": "2 years", "fees_per_year_inr": 1250000},
    {"name": "MBA Marketing", "degree": "MBA", "duration": "2 years", "fees_per_year_inr": 1200000},
    {"name": "PGP Business Administration", "degree": "PGP", "duration": "2 years", "fees_per_year_inr": 1100000}
  ]'::jsonb,
  'Leader',
  'Premium management education developing transformational business leaders',
  19,
  'A++',
  'https://www.sibm.edu/images/sibm-logo.png',
  'https://www.sibm.edu',
  'Leading business school in India offering transformative management education',
  19.5,
  92.0,
  400,
  25.0,
  false,
  false,
  true
),

-- 12. Flame University
(
  'Flame University',
  'Pune',
  'Maharashtra',
  'Liberal Arts',
  '[
    {"name": "BA Economics and Finance", "degree": "BA", "duration": "4 years", "fees_per_year_inr": 1000000},
    {"name": "BA Literature and Thought", "degree": "BA", "duration": "4 years", "fees_per_year_inr": 1000000},
    {"name": "BA History and Civilization", "degree": "BA", "duration": "4 years", "fees_per_year_inr": 1000000},
    {"name": "BA Interdisciplinary Studies", "degree": "BA", "duration": "4 years", "fees_per_year_inr": 1000000}
  ]'::jsonb,
  'Creator',
  'Creative liberal arts education nurturing imaginative thinkers and innovators',
  32,
  'A',
  'https://www.flame.edu.in/images/flame-logo.png',
  'https://www.flame.edu.in',
  'India''s premier liberal arts university focused on creative thinking and social responsibility',
  8.2,
  25.0,
  250,
  75.0,
  true,
  false,
  true
);

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
