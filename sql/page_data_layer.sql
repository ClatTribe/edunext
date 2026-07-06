-- ============================================================
-- EduNext pSEO  |  page data layer
-- Function: get_colleges_for_page(slug) -> ranked colleges that
--           match a /best-colleges/<slug> page.
-- Used by the Next.js page at render time (supabase.rpc(...)).
-- NOTE: the exam_map / course_map below MUST stay in sync with
--       seo_pages_source (same canonical mapping).
-- ============================================================

create or replace function get_colleges_for_page(p_slug text)
returns table (
  slug         text,
  college_name text,
  location     text,
  rating       numeric,
  review_count int,
  image        text,
  card_detail  jsonb
)
language sql
stable
as $$
  with p as (
    select exam_slug, city_slug, course_slug
    from seo_pages
    where slug = p_slug
    limit 1
  ),
  exam_map(raw, slug) as (values
    ('mht-cet','mht-cet'),('kcet','kcet'),('tnea','tnea'),('tancet','tancet'),('cat','cat'),
    ('neet','neet'),('uptac','uptac'),('jee-main','jee-main'),('jee','jee-main'),
    ('ap-eapcet','ap-eapcet'),('keam','keam'),('neet-pg','neet-pg'),('ts-eamcet','ts-eamcet'),
    ('karnataka-pgcet','karnataka-pgcet'),('jeecup','jeecup'),('gujcet','gujcet'),('hstes','hstes'),
    ('cuet','cuet'),('cuet-pg','cuet-pg'),('wbjee','wbjee'),('ojee','ojee'),('mh-cet-law','mh-cet-law'),
    ('tsicet','tsicet'),('ipu-cet','ipu-cet'),('nchmct-jee','nchmct-jee'),('nata','nata'),
    ('mah-bed-cet','mah-bed-cet'),('clat','clat'),('cmat','cmat'),('gate','gate')
  ),
  course_map(raw, slug) as (values
    ('mba','mba'),('b.tech','btech'),('b.tech {lateral}','btech'),('be','btech'),
    ('b.sc','bsc'),('b.sc {hons.}','bsc'),('m.sc','msc'),('bba','bba'),('b.com','bcom'),
    ('b.com {hons.}','bcom'),('ba','ba'),('ba {hons.}','ba'),('bca','bca'),('mca','mca'),
    ('m.tech','mtech'),('ma','ma'),('m.com','mcom'),('mbbs','mbbs'),('b.ed','bed'),
    ('b pharma','bpharma'),('ph.d','phd'),('m.d','md'),('md','md'),('b.sc (nursing)','bsc-nursing')
  )
  select
    cm.slug,
    cm.college_name,
    cm.location,
    case when (cm.card_detail::jsonb->>'rating') ~ '^[0-9]+(\.[0-9]+)?$'
         then (cm.card_detail::jsonb->>'rating')::numeric else null end  as rating,
    case when (cm.card_detail::jsonb->>'review_count') ~ '^[0-9]+$'
         then (cm.card_detail::jsonb->>'review_count')::int else null end as review_count,
    cm.image,
    cm.card_detail::jsonb                                                as card_detail
  from college_microsites cm
  cross join p
  where
    -- CITY filter (only if this page has a city)
    (p.city_slug is null
       or trim(both '-' from regexp_replace(
            lower(nullif(trim(split_part(cm.location, ',', 2)), '')),
            '[^a-z0-9]+','-','g')) = p.city_slug)
    -- EXAM filter (only if this page has an exam)
    and (p.exam_slug is null or exists (
          select 1
          from unnest(string_to_array(lower((cm.card_detail::jsonb)->>'entrance_exam'), ',')) as t(tok)
          join exam_map em on trim(t.tok) = em.raw
          where em.slug = p.exam_slug))
    -- COURSE filter (only if this page has a course)
    and (p.course_slug is null or exists (
          select 1
          from jsonb_array_elements_text(
                case when jsonb_typeof((cm.card_detail::jsonb)->'courses') = 'array'
                     then (cm.card_detail::jsonb)->'courses' else '[]'::jsonb end) as rc(raw)
          join course_map cmap on lower(trim(rc.raw)) = cmap.raw
          where cmap.slug = p.course_slug))
  order by rating desc nulls last, review_count desc nulls last, cm.college_name asc;
$$;

-- Allow the API roles to call it (Supabase)
grant execute on function get_colleges_for_page(text) to anon, authenticated, service_role;

-- Quick test:
-- select slug, college_name, rating from get_colleges_for_page('cuet-colleges-in-delhi-for-mba');
