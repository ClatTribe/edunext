/**
 * fix-metadata.js  — regex-based, handles any formatting variation
 * Run: node script/fix-metadata.js
 */
const fs = require('fs');
const path = require('path');
const BASE = path.resolve(__dirname, '..');

function patchFile(relPath, patches) {
  const filePath = path.join(BASE, relPath);
  if (!fs.existsSync(filePath)) { console.error(`❌ Not found: ${relPath}`); return; }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const { find, replace, desc } of patches) {
    const before = content;
    content = content.replace(find, replace);
    if (content !== before) {
      console.log(`  ✅ ${desc}`);
      changed = true;
    } else {
      console.log(`  ⚠️  Already patched or not found: ${desc}`);
    }
  }

  if (changed) fs.writeFileSync(filePath, content, 'utf8');
}

console.log('\n📄 cutoff/page.tsx');
patchFile('src/app/college/[slug]/cutoff/page.tsx', [
  {
    desc: 'title',
    find: /title:\s*`\$\{name\} Cutoff 2026`/g,
    replace: 'title: `${name} Cutoff 2026 — Branch-wise Opening & Closing Ranks, Category Cutoffs`'
  },
  {
    desc: 'description',
    find: /description:\s*`Check out the detailed cutoff marks and admission ranks for \$\{name\}, \$\{location\}\.`/g,
    replace: 'description: `Check ${name} cutoff 2026: branch-wise opening & closing ranks, category-wise (General/OBC/SC/ST) closing ranks, merit list, and admission eligibility in ${location}. Updated for 2026.`'
  }
]);

console.log('\n📄 placement/page.tsx');
patchFile('src/app/college/[slug]/placement/page.tsx', [
  {
    desc: 'title',
    find: /title:\s*`\$\{name\} Placement 2026`/g,
    replace: 'title: `${name} Placement 2026 — Average Package, Top Recruiters & Branch-wise Salary`'
  },
  {
    desc: 'description',
    find: /description:\s*`Explore the latest placement statistics, highest packages, and top recruiters for \$\{name\}, \$\{location\}\.`/g,
    replace: 'description: `${name} placement report 2026: average CTC, highest salary package, top recruiting companies, branch-wise placement stats, and internship data for the ${location} campus. Full report inside.`'
  }
]);

console.log('\n📄 admission/page.tsx');
patchFile('src/app/college/[slug]/admission/page.tsx', [
  {
    desc: 'title',
    find: /title:\s*`\$\{name\} Admission 2026`/g,
    replace: 'title: `${name} Admission 2026 — Application Form, Eligibility, Dates & Process`'
  },
  {
    desc: 'description',
    find: /description:\s*`Get complete details on the admission process, dates, and eligibility for \$\{name\}, \$\{location\}\.`/g,
    replace: 'description: `${name} admission 2026: application form dates, eligibility criteria, fees, entrance exams accepted, and step-by-step process. Apply now for 2026-27 academic year in ${location}.`'
  }
]);

console.log('\n📄 college main page.tsx');
patchFile('src/app/college/[slug]/page.tsx', [
  {
    desc: 'title',
    find: /title:\s*`\$\{name\}: Fees, Admission 2026, Courses, Cutoff, Ranking, Placement`/g,
    replace: 'title: `${name} ${location} — Fees 2026, Admission, Courses, Cutoff & Placement`'
  },
  {
    desc: 'description',
    find: /description:\s*`\$\{name\} is an institute in \$\{location\}\. Read for details on \$\{name\} Fees, Admission 2026, Courses, Cutoff, Ranking and Placement\.`/g,
    replace: 'description: `Explore ${name} in ${location}: course fees 2026, admission process, available courses, cutoff marks, rankings, placement stats, and student reviews. Compare and apply for 2026 admissions.`'
  },
  {
    desc: 'openGraph description',
    find: /description:\s*`\$\{name\} is an institute in \$\{location\}\.`/g,
    replace: 'description: `Explore ${name} in ${location}: course fees 2026, admission process, available courses, cutoff marks, rankings, placement stats, and student reviews. Compare and apply for 2026 admissions.`'
  }
]);

console.log('\n📄 blogs/[slug]/page.tsx');
patchFile('src/app/blogs/[slug]/page.tsx', [
  {
    desc: 'title (remove | EduNext suffix)',
    find: /title:\s*`\$\{blog\.title\} \| EduNext`/g,
    replace: 'title: blog.title'
  },
  {
    desc: 'description fallback',
    find: /description:\s*blog\.excerpt \|\| `Read \$\{blog\.title\}`/g,
    replace: 'description: blog.excerpt || `${blog.title} — Complete guide on EduNext.`'
  }
]);

console.log('\n✨ Done! Now run:');
console.log('git add src/app/college/\\[slug\\]/cutoff/page.tsx src/app/college/\\[slug\\]/placement/page.tsx src/app/college/\\[slug\\]/admission/page.tsx src/app/college/\\[slug\\]/page.tsx src/app/blogs/\\[slug\\]/page.tsx');
console.log('git commit -m "fix: improve metadata titles/descriptions for CTR optimization"');
console.log('git push origin main');
