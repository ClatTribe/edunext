-- ============================================================
-- EduNext pSEO  |  daily auto-update for /best-colleges pages
-- Keeps seo_pages in sync with college_microsites automatically:
--   - recomputes combinations + counts (refresh_seo_pages)
--   - auto-publishes any newly-qualifying pages (>= 5 colleges)
-- Run this ONCE in Supabase. Requires the pg_cron extension.
-- ============================================================

-- wrapper: refresh, then publish new qualifying pages
create or replace function refresh_and_publish_seo_pages() returns void
language plpgsql as $$
begin
  perform refresh_seo_pages();
  -- auto-publish newly-qualifying pages. Remove this line if you prefer
  -- to publish manually in phased batches.
  update seo_pages set is_published = true
   where qualifies and not is_published;
end;
$$;

-- schedule it daily at 02:00
create extension if not exists pg_cron;
select cron.schedule(
  'refresh-seo-pages',
  '0 2 * * *',
  $$ select refresh_and_publish_seo_pages(); $$
);

-- Useful checks:
-- list scheduled jobs:        select jobid, schedule, command, active from cron.job;
-- run it once right now:      select refresh_and_publish_seo_pages();
-- recent run history:         select * from cron.job_run_details order by start_time desc limit 5;
-- remove the job (if needed): select cron.unschedule('refresh-seo-pages');
