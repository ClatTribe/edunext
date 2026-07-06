const nodemailer = require('nodemailer');

// ===== CONFIG =====
const GMAIL_USER = 'edunextweb@gmail.com';
const GMAIL_APP_PASSWORD = 'dlzqkdddvznakozw';

// ===== COLLEGE LEADS DATA =====
const colleges = [
  { name: "St. Anthony's College", location: "Shillong", leads: 9,  email: "anthony@anthonys.ac.in",                      website: "anthonys.ac.in" },
  { name: "St. Mary's College",    location: "Shillong", leads: 8,  email: "smcshillong@rediffmail.com",                  website: "smcs.ac.in" },
  { name: "KES' Shroff College",   location: "Mumbai",   leads: 6,  email: "office@kessc.edu.in",                         website: "kessc.edu.in" },
  { name: "DG Vaishnav College",   location: "Chennai",  leads: 5,  email: "helpdesk@dgvaishnavcollege.edu.in",           website: "dgvaishnavcollege.edu.in" },
  { name: "UPES",                  location: "Dehradun", leads: 5,  email: "enrollments@upes.ac.in",                      website: "upes.ac.in" },
  { name: "Sri Aurobindo College of Commerce & Management", location: "Ludhiana", leads: 5, email: "saccm2004@gmail.com", website: "saccm.in" },
  { name: "Ethiraj College for Women", location: "Chennai", leads: 4, email: "ethirajmba@yahoo.com",                      website: "ethirajcollege.edu.in" },
  { name: "KPB Hinduja College of Commerce", location: "Mumbai", leads: 4, email: "hindujacollege@gmail.com",             website: "hindujacollege.edu.in" },
  { name: "JSS Academy of Technical Education", location: "Noida", leads: 4, email: "admissions@jssaten.ac.in",          website: "jssaten.ac.in" },
  { name: "Guru Nanak College",    location: "Moga",     leads: 4,  email: "gnc_moga@yahoo.co.in",                       website: "gncmoga.com" },
  { name: "BMCC",                  location: "Pune",     leads: 4,  email: "bmccpune04@gmail.com",                       website: "bmcc.ac.in" },
  { name: "Sir KP College of Commerce", location: "Surat", leads: 4, email: "contact@kpcommerce.org",                    website: "kpccommerce.ac.in" },
  { name: "Bhavan's College",      location: "Mumbai",   leads: 3,  email: "bhavanscollegeandheri@gmail.com",            website: "bhavans.ac.in" },
  { name: "VIPS",                  location: "Delhi",    leads: 3,  email: "vipsedu@vips.edu",                           website: "vips.edu" },
  { name: "J.S. University",       location: "Shikohabad", leads: 3, email: "jsuniversityshikohabad@gmail.com",          website: "jsu.ac.in" },
];

// ===== EMAIL TEMPLATE =====
function buildEmail(college) {
  const subject = `${college.leads} students enquired about ${college.name} on EduNext this month`;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; color: #333;">
  <p>Hi ${college.name} Admissions Team,</p>

  <p>I'm reaching out from <strong>EduNext</strong> (<a href="https://getedunext.com">getedunext.com</a>) — India's fastest-growing college discovery platform.</p>

  <p>In the past 30 days, <strong>${college.leads} students</strong> visited your college page on EduNext and submitted their contact details requesting admission information. These are high-intent students who searched specifically for <strong>${college.name}</strong>.</p>

  <p>Here's a quick snapshot of EduNext right now:</p>
  <ul>
    <li>📈 <strong>48,000+ monthly visitors</strong> — growing at +288% year-on-year</li>
    <li>🔍 <strong>580,000+ monthly Google impressions</strong></li>
    <li>🎓 <strong>10,000+ college profiles</strong> across India</li>
  </ul>

  <p><strong>We'd like to share these ${college.leads} student leads with you.</strong></p>

  <p>Two simple options:</p>
  <ul>
    <li>💼 <strong>Pay-per-lead</strong> — ₹300–500 per verified lead (name + phone + course interest)</li>
    <li>📅 <strong>Monthly subscription</strong> — ₹10,000–15,000/month for all future leads from your college page</li>
  </ul>

  <p>These are not cold lists or scraped data — these are students who came to EduNext and specifically asked for information about <em>your</em> college.</p>

  <p>Would you be open to a quick 10-minute call this week? You can also reply to this email and I'll share a sample lead immediately.</p>

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
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  console.log('🚀 Starting college outreach email campaign...\n');
  console.log(`📧 Sending from: ${GMAIL_USER}`);
  console.log(`🎓 Total colleges: ${colleges.length}\n`);
  console.log('='.repeat(60));

  let sent = 0;
  let failed = 0;

  for (const college of colleges) {
    const { subject, html } = buildEmail(college);

    try {
      await transporter.sendMail({
        from: `EduNext <${GMAIL_USER}>`,
        to: college.email,
        subject,
        html,
      });

      console.log(`✅ [${sent + failed + 1}/${colleges.length}] Sent to ${college.name} (${college.email}) — ${college.leads} leads`);
      sent++;

      // Small delay to avoid Gmail rate limits
      await new Promise(r => setTimeout(r, 1500));

    } catch (err) {
      console.log(`❌ [${sent + failed + 1}/${colleges.length}] FAILED: ${college.name} (${college.email}) — ${err.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 CAMPAIGN SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Sent:   ${sent}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📁 Total:  ${colleges.length}`);
  console.log('='.repeat(60));
  console.log('\n✨ Campaign complete!');
}

sendEmails().catch(console.error);
