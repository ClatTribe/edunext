-- ============================================================
-- EduNext pSEO  |  seo_pages setup
-- Source table : college_microsites  (~19,166 rows)
-- Output       : ~2,025 validated combination pages (>= 5 colleges)
-- URL prefix   : /best-colleges/<slug>
-- Re-runnable  : refresh_seo_pages() recomputes counts + qualification
--                (DB badle -> pages khud update; safe for a daily cron)
-- ============================================================


-- 1) TARGET TABLE -------------------------------------------------
create table if not exists seo_pages (
  id            bigserial primary key,
  slug          text unique not null,            -- URL part after /best-colleges/
  tier          smallint    not null,            -- 1, 2, or 3
  page_type     text        not null,            -- exam | city | course | exam_city | exam_course | city_course | exam_city_course
  exam          text,                            -- canonical exam name (for display/meta)
  city          text,                            -- city name (for display/meta)
  course        text,                            -- canonical course name (for display/meta)
  exam_slug     text,
  city_slug     text,
  course_slug   text,
  college_count int     not null default 0,
  qualifies     boolean not null default true,   -- meets >=5 threshold (AUTO-managed by refresh)
  is_published  boolean not null default false,  -- rollout control (YOU flip in batches)
  custom_title       text,                       -- optional manual override (refresh never touches)
  custom_description text,
  custom_intro       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_seo_pages_live on seo_pages (qualifies, is_published);
create index if not exists idx_seo_pages_dims on seo_pages (exam_slug, city_slug, course_slug);

-- RLS: keep row-level security ON, but allow public (anon) to read ONLY published pages.
-- Without this policy the anon API key returns 0 rows -> pages 404 and sitemap is empty.
alter table seo_pages enable row level security;
drop policy if exists "public read published seo_pages" on seo_pages;
create policy "public read published seo_pages"
  on seo_pages for select
  to anon, authenticated
  using (is_published = true);


-- 2) SOURCE VIEW  (canonical mapping + matching + slug building) --
--    Edit exam_map / course_map here to add/remove canonical values.
create or replace view seo_pages_source as
with
exam_map(raw, canonical, slug) as (values
  ('mht-cet','MHT-CET','mht-cet'),('kcet','KCET','kcet'),('tnea','TNEA','tnea'),
  ('tancet','TANCET','tancet'),('cat','CAT','cat'),('neet','NEET','neet'),
  ('uptac','UPTAC','uptac'),('jee-main','JEE Main','jee-main'),('jee','JEE Main','jee-main'),
  ('ap-eapcet','AP EAPCET','ap-eapcet'),('keam','KEAM','keam'),('neet-pg','NEET PG','neet-pg'),
  ('ts-eamcet','TS EAMCET','ts-eamcet'),('karnataka-pgcet','Karnataka PGCET','karnataka-pgcet'),
  ('jeecup','JEECUP','jeecup'),('gujcet','GUJCET','gujcet'),('hstes','HSTES','hstes'),
  ('cuet','CUET','cuet'),('cuet-pg','CUET PG','cuet-pg'),('wbjee','WBJEE','wbjee'),
  ('ojee','OJEE','ojee'),('mh-cet-law','MH CET Law','mh-cet-law'),('tsicet','TSICET','tsicet'),
  ('ipu-cet','IPU CET','ipu-cet'),('nchmct-jee','NCHMCT JEE','nchmct-jee'),('nata','NATA','nata'),
  ('mah-bed-cet','MAH BEd CET','mah-bed-cet'),('clat','CLAT','clat'),('cmat','CMAT','cmat'),
  ('gate','GATE','gate')
),
course_map(raw, canonical, slug) as (values
  ('mba','MBA','mba'),('b.tech','B.Tech','btech'),('b.tech {lateral}','B.Tech','btech'),
  ('be','B.Tech','btech'),('b.sc','B.Sc','bsc'),('b.sc {hons.}','B.Sc','bsc'),
  ('m.sc','M.Sc','msc'),('bba','BBA','bba'),('b.com','B.Com','bcom'),
  ('b.com {hons.}','B.Com','bcom'),('ba','BA','ba'),('ba {hons.}','BA','ba'),
  ('bca','BCA','bca'),('mca','MCA','mca'),('m.tech','M.Tech','mtech'),('ma','MA','ma'),
  ('m.com','M.Com','mcom'),('mbbs','MBBS','mbbs'),('b.ed','B.Ed','bed'),
  ('b pharma','B.Pharma','bpharma'),('ph.d','PhD','phd'),('m.d','MD','md'),('md','MD','md'),
  ('b.sc (nursing)','B.Sc Nursing','bsc-nursing')
),
base as (
  select
    cm.slug as college_slug,
    nullif(trim(split_part(cm.location, ',', 2)), '') as city_name,
    lower((cm.card_detail::jsonb)->>'entrance_exam') as exam_raw,
    case when jsonb_typeof((cm.card_detail::jsonb)->'courses') = 'array'
         then (cm.card_detail::jsonb)->'courses' else '[]'::jsonb end as courses_arr
  from college_microsites cm
),
ce as (   -- college -> canonical exam
  select distinct b.college_slug, em.canonical as exam, em.slug as exam_slug
  from base b
  cross join lateral unnest(string_to_array(b.exam_raw, ',')) as t(tok)
  join exam_map em on trim(t.tok) = em.raw
),
cc as (   -- college -> canonical course
  select distinct b.college_slug, cmap.canonical as course, cmap.slug as course_slug
  from base b
  cross join lateral jsonb_array_elements_text(b.courses_arr) as rc(raw)
  join course_map cmap on lower(trim(rc.raw)) = cmap.raw
),
cy as (   -- college -> city (+ slug); display derived FROM slug so it is 1:1 (kills duplicate slugs from case/spelling variants)
  select distinct
    college_slug,
    initcap(replace(trim(both '-' from regexp_replace(lower(city_name), '[^a-z0-9]+', '-', 'g')), '-', ' ')) as city,
    trim(both '-' from regexp_replace(lower(city_name), '[^a-z0-9]+', '-', 'g')) as city_slug
  from base
  where city_name is not null
)
-- TIER 1: exam
select (exam_slug||'-colleges') as slug, 1 as tier, 'exam' as page_type,
       exam, null::text as city, null::text as course,
       exam_slug, null::text as city_slug, null::text as course_slug,
       count(distinct college_slug)::int as college_count
from ce group by exam, exam_slug having count(distinct college_slug) >= 5
union all
-- TIER 1: city
select ('colleges-in-'||city_slug), 1, 'city',
       null, city, null, null, city_slug, null,
       count(distinct college_slug)::int
from cy group by city, city_slug having count(distinct college_slug) >= 5
union all
-- TIER 1: course
select (course_slug||'-colleges'), 1, 'course',
       null, null, course, null, null, course_slug,
       count(distinct college_slug)::int
from cc group by course, course_slug having count(distinct college_slug) >= 5
union all
-- TIER 2: exam + city
select (ce.exam_slug||'-colleges-in-'||cy.city_slug), 2, 'exam_city',
       ce.exam, cy.city, null, ce.exam_slug, cy.city_slug, null,
       count(distinct ce.college_slug)::int
from ce join cy using (college_slug)
group by ce.exam, ce.exam_slug, cy.city, cy.city_slug
having count(distinct ce.college_slug) >= 5
union all
-- TIER 2: exam + course
select (ce.exam_slug||'-colleges-for-'||cc.course_slug), 2, 'exam_course',
       ce.exam, null, cc.course, ce.exam_slug, null, cc.course_slug,
       count(distinct ce.college_slug)::int
from ce join cc using (college_slug)
group by ce.exam, ce.exam_slug, cc.course, cc.course_slug
having count(distinct ce.college_slug) >= 5
union all
-- TIER 2: city + course
select (cc.course_slug||'-colleges-in-'||cy.city_slug), 2, 'city_course',
       null, cy.city, cc.course, null, cy.city_slug, cc.course_slug,
       count(distinct cy.college_slug)::int
from cy join cc using (college_slug)
group by cy.city, cy.city_slug, cc.course, cc.course_slug
having count(distinct cy.college_slug) >= 5
union all
-- TIER 3: exam + city + course
select (ce.exam_slug||'-colleges-in-'||cy.city_slug||'-for-'||cc.course_slug), 3, 'exam_city_course',
       ce.exam, cy.city, cc.course, ce.exam_slug, cy.city_slug, cc.course_slug,
       count(distinct ce.college_slug)::int
from ce join cy using (college_slug) join cc using (college_slug)
group by ce.exam, ce.exam_slug, cy.city, cy.city_slug, cc.course, cc.course_slug
having count(distinct ce.college_slug) >= 5;


-- 3) REFRESH FUNCTION  (idempotent; run daily) -------------------
create or replace function refresh_seo_pages() returns void
language plpgsql as $$
begin
  -- upsert every currently-valid combination
  insert into seo_pages
    (slug, tier, page_type, exam, city, course, exam_slug, city_slug, course_slug,
     college_count, qualifies, updated_at)
  select
     slug, tier, page_type, exam, city, course, exam_slug, city_slug, course_slug,
     college_count, true, now()
  from (select distinct on (slug) * from seo_pages_source order by slug, college_count desc) s
  on conflict (slug) do update set
     tier          = excluded.tier,
     page_type     = excluded.page_type,
     exam          = excluded.exam,
     city          = excluded.city,
     course        = excluded.course,
     exam_slug     = excluded.exam_slug,
     city_slug     = excluded.city_slug,
     course_slug   = excluded.course_slug,
     college_count = excluded.college_count,
     qualifies     = true,
     updated_at    = now();
     -- NOTE: is_published and custom_* are intentionally NOT touched here

  -- combos that dropped below the threshold -> stop qualifying
  update seo_pages
     set qualifies = false, updated_at = now()
   where qualifies = true
     and slug not in (select slug from seo_pages_source);
end;
$$;


-- 4) FIRST RUN  (populates ~2,025 rows) --------------------------
select refresh_seo_pages();


-- 5) VERIFY  (run these to sanity-check) -------------------------
-- count by tier/type (should total ~2025):
--   select tier, page_type, count(*) from seo_pages where qualifies group by 1,2 order by 1,2;
-- biggest pages:
--   select slug, tier, college_count from seo_pages where qualifies order by college_count desc limit 25;
-- a specific example:
--   select * from seo_pages where slug = 'cuet-colleges-in-delhi-for-mba';


-- 6) (OPTIONAL) DAILY AUTO-REFRESH via pg_cron -------------------
--   create extension if not exists pg_cron;
--   select cron.schedule('refresh-seo-pages','0 2 * * *', $$ select refresh_seo_pages(); $$);
-- (Or call select refresh_seo_pages(); from your own scheduled job.)


-- 7) PHASED PUBLISHING  (flip pages live in batches) -------------
--   Week 1 -> hub pages:   update seo_pages set is_published = true where tier = 1 and qualifies;
--   Week 2 -> pairs:       update seo_pages set is_published = true where tier = 2 and qualifies;
--   Week 3 -> triples:     update seo_pages set is_published = true where tier = 3 and qualifies;
-- Your pages + sitemap should show rows WHERE qualifies AND is_published.
