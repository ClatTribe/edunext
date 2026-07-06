const nodemailer = require('nodemailer');

// ===== CONFIG =====
const GMAIL_USER = 'edunextweb@gmail.com';
const GMAIL_APP_PASSWORD = 'dlzqkdddvznakozw';

// ===== LEAD STATS =====
const TOTAL_LEADS = 745;
const BTECH_LEADS = 74;
const BSC_LEADS = 142;  // majority are NEET / paramedical / nursing
const MBA_BBA_LEADS = 64;
const MONTHLY_VISITORS = 48000;

// ===== EDTECH TARGETS =====
// Segmented by which leads are most relevant to each company
const edtechCompanies = [
  {
    name: "Physics Wallah (PW)",
    email: "bd@pw.live",
    segment: "JEE + NEET",
    relevantLeads: BTECH_LEADS + BSC_LEADS,
    pitch: "B.Tech (JEE) and B.Sc/Nursing (NEET/paramedical) enquiries"
  },
  {
    name: "Allen Career Institute",
    email: "corporatebd@allen.ac.in",
    segment: "JEE + NEET",
    relevantLeads: BTECH_LEADS + BSC_LEADS,
    pitch: "B.Tech (JEE) and B.Sc/Nursing (NEET/paramedical) enquiries"
  },
  {
    name: "Aakash Institute",
    email: "mktg@aesl.in",
    segment: "JEE + NEET",
    relevantLeads: BTECH_LEADS + BSC_LEADS,
    pitch: "B.Tech (JEE) and B.Sc/medical aspirants"
  },
  {
    name: "Resonance",
    email: "info@resonance.ac.in",
    segment: "JEE",
    relevantLeads: BTECH_LEADS,
    pitch: "B.Tech aspirants researching engineering colleges"
  },
  {
    name: "FIITJEE",
    email: "bd@fiitjee.com",
    segment: "JEE",
    relevantLeads: BTECH_LEADS,
    pitch: "B.Tech aspirants actively researching engineering college options"
  },
  {
    name: "IMS Learning Resources",
    email: "contact@imsindia.com",
    segment: "CAT/MBA",
    relevantLeads: MBA_BBA_LEADS,
    pitch: "MBA and BBA aspirants researching management colleges"
  },
  {
    name: "Career Launcher",
    email: "admissions@careerlauncher.com",
    segment: "CAT/MBA",
    relevantLeads: MBA_BBA_LEADS,
    pitch: "MBA and BBA aspirants at the college research stage"
  },
  {
    name: "T.I.M.E.",
    email: "info@time4education.com",
    segment: "CAT/MBA",
    relevantLeads: MBA_BBA_LEADS,
    pitch: "MBA and BBA aspirants actively comparing management colleges"
  },
  {
    name: "Unacademy",
    email: "partnerships@unacademy.com",
    segment: "All streams",
    relevantLeads: TOTAL_LEADS,
    pitch: "students across engineering, medical, management and arts streams"
  },
  {
    name: "Vedantu",
    email: "partner@vedantu.com",
    segment: "JEE + NEET",
    relevantLeads: BTECH_LEADS + BSC_LEADS,
    pitch: "B.Tech and B.Sc aspirants at the college discovery stage"
  },
];

// ===== EMAIL TEMPLATE =====
function buildEmail(company) {
  const subject = `Partnership opportunity — ${company.relevantLeads} ${company.segment} student leads/month from EduNext`;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; color: #333;">
  <p>Hi ${company.name} Partnerships Team,</p>

  <p>I'm reaching out from <strong>EduNext</strong> (<a href="https://getedunext.com">getedunext.com</a>) — India's fastest-growing college discovery platform with <strong>48,000+ monthly visitors growing at +288% year-on-year</strong>.</p>

  <p>Every month, students visit EduNext to research colleges, compare fees, and check cutoffs — and many of them are at the <strong>exact moment they're deciding which coaching or prep program to join</strong>. This is the highest-intent window for any EdTech company.</p>

  <p>Here's what we have for ${company.name}:</p>
  <ul>
    <li>📊 <strong>${company.relevantLeads} verified leads/month</strong> — ${company.pitch}</li>
    <li>📞 Each lead includes: full name + phone number + course interest</li>
    <li>🎯 These students are actively researching colleges — they haven't enrolled yet</li>
    <li>🌐 <strong>580,000+ Google impressions/month</strong> across 10,000+ college pages</li>
  </ul>

  <p><strong>We'd like to offer you these leads on a simple monthly basis:</strong></p>
  <ul>
    <li>💼 <strong>Pay-per-lead</strong> — ₹150–300 per verified lead</li>
    <li>📅 <strong>Monthly subscription</strong> — ₹8,000–15,000/month for all ${company.segment} leads</li>
  </ul>

  <p>We can also explore a deeper integration — a co-branded banner or CTA on relevant college pages pointing students toward ${company.name}'s free trial or demo class.</p>

  <p>Would you be open to a 15-minute call this week to discuss?</p>

  <p>Warm regards,<br>
  <strong>EduNext Team</strong><br>
  📧 edunextweb@gmail.com<br>
  🌐 <a href="https://getedunext.com">getedunext.com</a></p>
</div>`;

  return { subject, html };
}

// ===== MAILER =====
async function sendEmails() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  console.log('🚀 Starting EdTech outreach campaign...\n');
  console.log(`📧 Sending from: ${GMAIL_USER}`);
  console.log(`🎓 Total EdTech companies: ${edtechCompanies.length}\n`);
  console.log('='.repeat(60));

  let sent = 0, failed = 0;

  for (const company of edtechCompanies) {
    const { subject, html } = buildEmail(company);
    try {
      await transporter.sendMail({
        from: `EduNext <${GMAIL_USER}>`,
        to: company.email,
        subject,
        html,
      });
      console.log(`✅ [${sent + failed + 1}/${edtechCompanies.length}] ${company.name} (${company.email}) — ${company.relevantLeads} leads pitched`);
      sent++;
      await new Promise(r => setTimeout(r, 1500));
    } catch (err) {
      console.log(`❌ [${sent + failed + 1}/${edtechCompanies.length}] FAILED: ${company.name} — ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 EDTECH CAMPAIGN SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Sent:   ${sent}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Total:  ${edtechCompanies.length}`);
  console.log('='.repeat(60));
  console.log('\n✨ Campaign complete!');
}

sendEmails().catch(console.error);
