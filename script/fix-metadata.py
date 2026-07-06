#!/usr/bin/env python3
import os, sys

base = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))

patches = [
    {
        'file': 'src/app/college/[slug]/cutoff/page.tsx',
        'replacements': [
            (
                'title: `${name} Cutoff 2026`,',
                'title: `${name} Cutoff 2026 — Branch-wise Opening & Closing Ranks, Category Cutoffs`,'
            ),
            (
                'description: `Check out the detailed cutoff marks and admission ranks for ${name}, ${location}.',
                'description: `Check ${name} cutoff 2026: branch-wise opening & closing ranks, category-wise (General/OBC/SC/ST) closing ranks, merit list, and admission eligibility in ${location}. Updated for 2026.'
            ),
        ]
    },
    {
        'file': 'src/app/college/[slug]/placement/page.tsx',
        'replacements': [
            (
                'title: `${name} Placement 2026`,',
                'title: `${name} Placement 2026 — Average Package, Top Recruiters & Branch-wise Salary`,'
            ),
            (
                'description: `Explore the latest placement statistics, highest packages, and top recruiters for ${name}, ${location}.',
                'description: `${name} placement report 2026: average CTC, highest salary package, top recruiting companies, branch-wise placement stats, and internship data for the ${location} campus. Full report inside.'
            ),
        ]
    },
    {
        'file': 'src/app/college/[slug]/admission/page.tsx',
        'replacements': [
            (
                'title: `${name} Admission 2026`,',
                'title: `${name} Admission 2026 — Application Form, Eligibility, Dates & Process`,'
            ),
            (
                'description: `Get complete details on the admission process, dates, and eligibility for ${name}, ${location}.',
                'description: `${name} admission 2026: application form dates, eligibility criteria, fees, entrance exams accepted, and step-by-step process. Apply now for 2026-27 academic year in ${location}.'
            ),
        ]
    },
    {
        'file': 'src/app/college/[slug]/page.tsx',
        'replacements': [
            (
                'title: `${name}: Fees, Admission 2026, Courses, Cutoff, Ranking, Placement`,',
                'title: `${name} ${location} — Fees 2026, Admission, Courses, Cutoff & Placement`,'
            ),
            (
                'description: `${name} is an institute in ${location}. Read for details on ${name} Fees, Admission 2026, Courses, Cutoff, Ranking and Placement.',
                'description: `Explore ${name} in ${location}: course fees 2026, admission process, available courses, cutoff marks, rankings, placement stats, and student reviews. Compare and apply for 2026 admissions.'
            ),
            (
                'description: `${name} is an institute in ${location}.',
                'description: `Explore ${name} in ${location}: fees 2026, courses, cutoff, rankings, placements and student reviews.'
            ),
        ]
    },
    {
        'file': 'src/app/blogs/[slug]/page.tsx',
        'replacements': [
            (
                'title: `${blog.title} | EduNext`,',
                'title: blog.title,'
            ),
            (
                'description: blog.excerpt || `Read ${blog.title}`,',
                'description: blog.excerpt || `${blog.title} — Complete guide on EduNext.`,'
            ),
        ]
    },
]

all_good = True
for patch in patches:
    filepath = os.path.join(base, patch['file'])
    print(f'\n📄 {patch["file"]}')
    if not os.path.exists(filepath):
        print(f'  ❌ File not found')
        all_good = False
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    changed = False
    for old, new in patch['replacements']:
        if old in content:
            content = content.replace(old, new)
            print(f'  ✅ Fixed: {old[:60]}...')
            changed = True
        else:
            print(f'  ⚠️  Not found: {old[:60]}...')
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print('\n✨ Done! Now commit and push:')
print('git add "src/app/college/[slug]/cutoff/page.tsx" "src/app/college/[slug]/placement/page.tsx" "src/app/college/[slug]/admission/page.tsx" "src/app/college/[slug]/page.tsx" "src/app/blogs/[slug]/page.tsx"')
print('git commit -m "fix: improve metadata titles/descriptions for CTR optimization"')
print('git push origin main')
