require('dotenv').config({ path: '.env.local' });
const key = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!key) {
  console.log('No Gemini Key found in .env.local');
  process.exit(1);
}
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Say hello' }] }]
  })
})
.then(res => res.json())
.then(data => {
  if (data.error) {
    console.error('Gemini API Error:', JSON.stringify(data.error, null, 2));
  } else {
    console.log('Gemini API is working! Output:', data.candidates[0].content.parts[0].text.trim());
  }
})
.catch(err => console.error('Request Failed:', err));
