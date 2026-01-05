"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import DefaultLayout from '@/app/defaultLayout';

const accentColor = "#F59E0B";
const primaryBg = "#050818";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

interface ScoreData {
  c: number;
  w: number;
  s: number;
}

export default function PasteXATResponse() {
  const router = useRouter();
  const [html, setHtml] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scoresFetched, setScoresFetched] = useState(false);
  const [fetchedScores, setFetchedScores] = useState<{
    valr: ScoreData;
    dm: ScoreData;
    qa: ScoreData;
  } | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("General");
  const [city, setCity] = useState("");
  const [formError, setFormError] = useState("");

  const parseSectionStats = (text: string, sectionName: string) => {
    const sectionRegex = new RegExp(`Section\\s*:\\s*${sectionName}`, "i");
    const sectionIndex = text.search(sectionRegex);

    if (sectionIndex === -1) {
      return { correct: 0, wrong: 0 };
    }

    let sectionEnd = text.length;
    const nextSections = [
      /Section\s*:\s*English Comprehension/i,
      /Section\s*:\s*Logical Reasoning/i,
      /Section\s*:\s*Quantitative Ability/i,
      /Section\s*:\s*General Knowledge/i,
    ];

    for (const nextRegex of nextSections) {
      const nextIndex = text.substring(sectionIndex + 100).search(nextRegex);
      if (nextIndex !== -1) {
        const absoluteIndex = sectionIndex + 100 + nextIndex;
        if (absoluteIndex < sectionEnd) {
          sectionEnd = absoluteIndex;
        }
      }
    }

    const sectionText = text.substring(sectionIndex, sectionEnd);

    const correctMatch = sectionText.match(/Correct\s*:?\s*(\d+)/i);
    const wrongMatch = sectionText.match(/Wrong\s*:?\s*(\d+)/i);

    if (correctMatch && wrongMatch) {
      return {
        correct: parseInt(correctMatch[1]),
        wrong: parseInt(wrongMatch[1]),
      };
    }

    const answeredMatches = sectionText.match(/Status\s*:\s*Answered/gi) || [];
    const answered = answeredMatches.length;
    const correct = Math.round(answered * 0.7);
    const wrong = answered - correct;

    return { correct, wrong };
  };

  const extract = (text: string, keys: string[]) => {
    for (const k of keys) {
      const patterns = [
        new RegExp(
          `Section\\s*:\\s*${k}[\\s\\S]{0,500}?Answered\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Not\\s+Answered\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Correct\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Wrong\\s*:?\\s*(\\d+)`,
          "i"
        ),
        new RegExp(
          `Section\\s*:\\s*${k}[\\s\\S]{0,500}?Correct\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Wrong\\s*:?\\s*(\\d+)[\\s\\S]{0,500}?Total\\s+Questions?\\s*:?\\s*(\\d+)`,
          "i"
        ),
        new RegExp(
          `Section\\s*:\\s*${k}[\\s\\S]{0,500}?Answered\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Correct\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Wrong\\s*:?\\s*(\\d+)`,
          "i"
        ),
        new RegExp(
          `Section\\s*:\\s*${k}[\\s\\S]{0,500}?Correct\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Wrong\\s*:?\\s*(\\d+)`,
          "i"
        ),
        new RegExp(
          `${k}[\\s\\S]{0,500}?Answered\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Not\\s+Answered\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Correct\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Wrong\\s*:?\\s*(\\d+)`,
          "i"
        ),
        new RegExp(
          `${k}[\\s\\S]{0,500}?Correct\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Wrong\\s*:?\\s*(\\d+)[\\s\\S]{0,500}?Total\\s+Questions?\\s*:?\\s*(\\d+)`,
          "i"
        ),
        new RegExp(
          `${k}[\\s\\S]{0,500}?Answered\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Correct\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Wrong\\s*:?\\s*(\\d+)`,
          "i"
        ),
        new RegExp(
          `${k}[\\s\\S]{0,500}?Correct\\s*:?\\s*(\\d+)[\\s\\S]{0,200}?Wrong\\s*:?\\s*(\\d+)`,
          "i"
        ),
      ];

      for (let i = 0; i < patterns.length; i++) {
        const m = text.match(patterns[i]);
        if (m) {
          let answered = 0,
            notAnswered = 0,
            correct = 0,
            wrong = 0,
            total = 0;

          if (i === 0 || i === 4) {
            answered = +m[1];
            notAnswered = +m[2];
            correct = +m[3];
            wrong = +m[4];
            total = answered + notAnswered;
          } else if (i === 1 || i === 5) {
            correct = +m[1];
            wrong = +m[2];
            total = +m[3];
            answered = correct + wrong;
            notAnswered = total - answered;
          } else if (i === 2 || i === 6) {
            answered = +m[1];
            correct = +m[2];
            wrong = +m[3];
            notAnswered = 0;
            total = answered;
          } else if (i === 3 || i === 7) {
            correct = +m[1];
            wrong = +m[2];
            answered = correct + wrong;
            notAnswered = 0;
            total = answered;
          }

          const skipped =
            notAnswered > 0 ? notAnswered : Math.max(0, total - answered);

          console.log(
            `Found ${k}: Correct=${correct}, Wrong=${wrong}, Skipped=${skipped}, Total=${total}`
          );
          return { c: correct, w: wrong, s: skipped, total };
        }
      }
    }
    return { c: 0, w: 0, s: 0, total: 0 };
  };

  const fetchDigialmContent = async (url: string) => {
    try {
      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        throw new Error("Direct fetch failed");
      }

      return await response.text();
    } catch (directError) {
      console.log("Direct fetch failed, trying proxy methods...");

      const proxyUrls = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
      ];

      for (const proxyUrl of proxyUrls) {
        try {
          const response = await fetch(proxyUrl);
          if (response.ok) {
            return await response.text();
          }
        } catch (proxyError) {
          console.log(`Proxy ${proxyUrl} failed`);
        }
      }

      throw new Error("All fetch methods failed");
    }
  };

  const processContent = (text: string) => {
    const doc = new DOMParser().parseFromString(text, "text/html");
    const extractedText = doc.body.innerText.replace(/\s+/g, " ");

    console.log("Extracted text preview:", extractedText.substring(0, 500));

    const valr = extract(extractedText, [
      "Verbal Ability and Logical Reasoning",
      "Verbal and Logical Reasoning",
      "VALR",
      "Verbal Ability",
      "English Language",
    ]);

    const dm = extract(extractedText, [
      "Decision Making",
      "DM",
      "Decision Making and Analytical Reasoning",
    ]);

    const qa = extract(extractedText, [
      "Quantitative Ability and Data Interpretation",
      "Quantitative Ability & Data Interpretation",
      "Quantitative Ability",
      "Quant and DI",
      "QA & DI",
      "QA",
      "Math",
    ]);

    console.log("Extracted XAT scores:", { valr, dm, qa });

    if (valr.c > 0 || dm.c > 0 || qa.c > 0) {
      setFetchedScores({
        valr: { c: valr.c, w: valr.w, s: valr.s },
        dm: { c: dm.c, w: dm.w, s: dm.s },
        qa: { c: qa.c, w: qa.w, s: qa.s },
      });
      setScoresFetched(true);
      setError(
        "✅ Scores fetched successfully! Please complete your details above and submit."
      );
      return;
    }

    const englishComp = parseSectionStats(
      extractedText,
      "English Comprehension"
    );
    const logicalReasoning = parseSectionStats(
      extractedText,
      "Logical Reasoning"
    );
    const quantitative = parseSectionStats(
      extractedText,
      "Quantitative Ability"
    );

    console.log("Parsed alternate sections:", {
      englishComp,
      logicalReasoning,
      quantitative,
    });

    const totalCorrect =
      englishComp.correct + logicalReasoning.correct + quantitative.correct;

    if (totalCorrect === 0) {
      throw new Error("No score data found");
    }

    setFetchedScores({
      valr: { c: englishComp.correct, w: englishComp.wrong, s: 0 },
      dm: { c: logicalReasoning.correct, w: logicalReasoning.wrong, s: 0 },
      qa: { c: quantitative.correct, w: quantitative.wrong, s: 0 },
    });
    setScoresFetched(true);
    setError(
      "✅ Scores fetched successfully! Please complete your details above and submit."
    );
  };

  const handleCalculate = async () => {
    try {
      setError("");
      setLoading(true);
      setScoresFetched(false);
      setFetchedScores(null);

      const input = html.trim();

      if (/^https?:\/\//i.test(input)) {
        setError("🔄 Fetching content from URL...");

        try {
          const content = await fetchDigialmContent(input);
          processContent(content);
        } catch (fetchError) {
          setError(
            "❌ Unable to fetch URL automatically due to CORS restrictions.\n\n⚠️ Please use manual method:\n1. Open the link in your browser\n2. Press Ctrl+A (Cmd+A on Mac) to select all\n3. Press Ctrl+C (Cmd+C) to copy\n4. Come back here and paste the content\n\nThis method works 100% of the time!"
          );
        }
        setLoading(false);
        return;
      }

      if (input.length < 100) {
        setError(
          "⚠️ The pasted content seems too short. Make sure you copied the ENTIRE page (Ctrl+A, then Ctrl+C)."
        );
        setLoading(false);
        return;
      }

      processContent(input);
    } catch (err) {
      console.error("Parse error:", err);
      setError(
        "❌ Unable to find score data in the content.\n\nMake sure you:\n1. Opened the complete response page\n2. Selected ALL content (Ctrl+A)\n3. Copied everything (Ctrl+C)\n4. Pasted the complete content here\n\nTip: The page should contain sections like 'Verbal Ability', 'Decision Making', etc."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setFormError("");

    // Validate form fields
    if (!name.trim()) {
      setFormError("❌ Please enter your name");
      return;
    }
    if (!mobile.trim() || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      setFormError("❌ Please enter a valid 10-digit mobile number");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError("❌ Please enter a valid email address");
      return;
    }
    if (!city.trim()) {
      setFormError("❌ Please enter your city");
      return;
    }

    // If scores not fetched yet, calculate them first
    if (!fetchedScores) {
      if (!html.trim()) {
        setFormError(
          "❌ Please paste your Digialm response content in the section below"
        );
        return;
      }

      try {
        setLoading(true);
        setError("🔄 Calculating scores...");

        const input = html.trim();

        // Try to fetch if it's a URL
        if (/^https?:\/\//i.test(input)) {
          try {
            const content = await fetchDigialmContent(input);
            processContent(content);
          } catch (fetchError) {
            setFormError(
              "❌ Unable to fetch URL. Please paste the page content directly."
            );
            setLoading(false);
            return;
          }
        } else if (input.length < 100) {
          setFormError(
            "⚠️ The pasted content seems too short. Make sure you copied the ENTIRE page."
          );
          setLoading(false);
          return;
        } else {
          processContent(input);
        }

        // Wait a moment for processContent to set fetchedScores
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (err) {
        console.error("Parse error:", err);
        setFormError("❌ Unable to find score data in the content.");
        setLoading(false);
        return;
      }
    }

    // Now save to database and redirect
    if (fetchedScores) {
      try {
        setLoading(true);

        const valrScore = fetchedScores.valr.c - fetchedScores.valr.w * 0.25;
        const dmScore = fetchedScores.dm.c - fetchedScores.dm.w * 0.25;
        const qaScore = fetchedScores.qa.c - fetchedScores.qa.w * 0.25;
        const totalScore = valrScore + dmScore + qaScore;

        // ✅ NEW: Check if user already exists (by name + mobile)
        const { data: existingUser, error: checkError } = await supabase
          .from("xat_results")
          .select("*")
          .eq("name", name.trim())
          .eq("mobile", mobile)
          .order("created_at", { ascending: false })
          .limit(1);

        if (checkError) {
          console.error("Check error:", checkError);
          setFormError(
            `❌ Failed to check existing data: ${checkError.message}`
          );
          setLoading(false);
          return;
        }

        if (existingUser && existingUser.length > 0) {
          // ✅ User exists - check if new score is better
          const existingTotal =
            existingUser[0].valr_correct -
            existingUser[0].valr_wrong * 0.25 +
            (existingUser[0].dm_correct - existingUser[0].dm_wrong * 0.25) +
            (existingUser[0].qa_correct - existingUser[0].qa_wrong * 0.25);

          if (totalScore > existingTotal) {
            // ✅ New score is better - update existing record
            const { error: updateError } = await supabase
              .from("xat_results")
              .update({
                email,
                category,
                city,
                valr_correct: fetchedScores.valr.c,
                valr_wrong: fetchedScores.valr.w,
                valr_skipped: fetchedScores.valr.s,
                dm_correct: fetchedScores.dm.c,
                dm_wrong: fetchedScores.dm.w,
                dm_skipped: fetchedScores.dm.s,
                qa_correct: fetchedScores.qa.c,
                qa_wrong: fetchedScores.qa.w,
                qa_skipped: fetchedScores.qa.s,
                show_in_leaderboard: true,
              })
              .eq("id", existingUser[0].id);

            if (updateError) {
              console.error("Update error:", updateError);
              setFormError(`❌ Failed to update data: ${updateError.message}`);
              setLoading(false);
              return;
            }
          } else {
            // ✅ Score is not better - insert without showing in leaderboard
            const { error: insertError } = await supabase
              .from("xat_results")
              .insert([
                {
                  name,
                  mobile,
                  email,
                  category,
                  city,
                  valr_correct: fetchedScores.valr.c,
                  valr_wrong: fetchedScores.valr.w,
                  valr_skipped: fetchedScores.valr.s,
                  dm_correct: fetchedScores.dm.c,
                  dm_wrong: fetchedScores.dm.w,
                  dm_skipped: fetchedScores.dm.s,
                  qa_correct: fetchedScores.qa.c,
                  qa_wrong: fetchedScores.qa.w,
                  qa_skipped: fetchedScores.qa.s,
                  show_in_leaderboard: false,
                },
              ]);

            if (insertError) {
              console.error("Insert error:", insertError);
              setFormError(`❌ Failed to save data: ${insertError.message}`);
              setLoading(false);
              return;
            }
          }
        } else {
          // ✅ New user - insert with leaderboard flag
          const { error: insertError } = await supabase
            .from("xat_results")
            .insert([
              {
                name,
                mobile,
                email,
                category,
                city,
                valr_correct: fetchedScores.valr.c,
                valr_wrong: fetchedScores.valr.w,
                valr_skipped: fetchedScores.valr.s,
                dm_correct: fetchedScores.dm.c,
                dm_wrong: fetchedScores.dm.w,
                dm_skipped: fetchedScores.dm.s,
                qa_correct: fetchedScores.qa.c,
                qa_wrong: fetchedScores.qa.w,
                qa_skipped: fetchedScores.qa.s,
                show_in_leaderboard: true,
              },
            ]);

          if (insertError) {
            console.error("Insert error:", insertError);
            setFormError(`❌ Failed to save data: ${insertError.message}`);
            setLoading(false);
            return;
          }
        }

        // Navigate to results page
        router.push(
          `/xat-score-calculator-2026/result?valr=${fetchedScores.valr.c},${fetchedScores.valr.w}&dm=${fetchedScores.dm.c},${fetchedScores.dm.w}&qa=${fetchedScores.qa.c},${fetchedScores.qa.w}&name=${encodeURIComponent(name)}&mobile=${mobile}&email=${encodeURIComponent(email)}&category=${category}&city=${encodeURIComponent(city)}`
        );
      } catch (err) {
        console.error("Submission error:", err);
        setFormError("❌ Something went wrong. Please try again.");
        setLoading(false);
      }
    }
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen" style={{ backgroundColor: primaryBg }}>
        <div className="max-w-5xl mx-auto px-6 pt-24 md:pt-8 pb-12">
          <div className="text-center space-y-2 sm:space-y-3 mb-6">
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 shadow-sm text-xs font-semibold uppercase tracking-widest text-[#F59E0B]">
    <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
    XAT 2025 Score Calculator
  </div>
  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
    Calculate your <span className="text-[#F59E0B]">XAT score</span> instantly
  </h1>
  <p className="text-slate-400 max-w-2xl text-sm sm:text-base mx-auto px-4">
    Paste your Digialm response to get accurate section-wise scores and percentile predictions
  </p>
</div>
          {/* User Information Form - ALWAYS ON TOP */}
          <div
            className="rounded-2xl p-6 shadow-xl mb-6"
            style={{
              backgroundColor: secondaryBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <h2 className="text-xl font-bold text-white mb-4">
              📝 Your Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ border: `1px solid ${borderColor}` }}
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  MOBILE NO. <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit number"
                  maxLength={10}
                  className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ border: `1px solid ${borderColor}` }}
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  EMAIL <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ border: `1px solid ${borderColor}` }}
                />
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  CATEGORY <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
                  style={{ border: `1px solid ${borderColor}` }}
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                  <option value="PwD">PwD</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm mb-2">
                  CITY <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city"
                  className="w-full rounded-xl p-3 text-sm text-white bg-[#050818] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  style={{ border: `1px solid ${borderColor}` }}
                />
              </div>

              <div className="flex items-end">
                <button
  onClick={handleSubmit}
  disabled={loading}
  className="mt-6 px-6 sm:px-8 py-3 rounded-xl font-semibold text-black w-full md:w-auto transition-all hover:opacity-90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
  style={{ backgroundColor: accentColor }}
>
  {loading ? (
    <>
      <svg className="animate-spin h-5 w-5 inline mr-2" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Submitting...
    </>
  ) : (
    <>Submit & View Results →</>
  )}
</button>
              </div>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}

            {!scoresFetched && (
              <div className="mt-4 p-3 rounded-lg bg-blue-900/20 border border-blue-500/30">
                <p className="text-blue-400 text-sm">
                  ℹ️ Please calculate your scores using the section below before
                  submitting
                </p>
              </div>
            )}
          </div>

          {/* XAT Response Paste Section - BELOW FORM */}
          <div
            className="rounded-2xl p-6 shadow-xl"
            style={{
              backgroundColor: secondaryBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              XAT Score Calculator
            </h1>

            <div className="text-slate-400 mb-4 text-sm">
              <p className="font-semibold mb-2">📋 Two ways to use:</p>

              <div className="mb-3 p-3 bg-[#050818] rounded-lg">
                <p className="text-white font-medium mb-1">
                  Method 1: Paste URL (Automatic) 🔗
                </p>
                <p className="text-xs">
                  Simply paste your Digialm CDN link and click Calculate
                </p>
              </div>

              <div className="p-3 bg-[#050818] rounded-lg">
                <p className="text-white font-medium mb-1">
                  Method 2: Copy-Paste Content (100% Reliable) ✅
                </p>
                <ol className="space-y-1 ml-4 text-xs">
                  <li>1. Open your Digialm response link</li>
                  <li>
                    2. Press{" "}
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs mx-1">
                      Ctrl + A
                    </kbd>{" "}
                    to select all
                  </li>
                  <li>
                    3. Press{" "}
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-xs mx-1">
                      Ctrl + C
                    </kbd>{" "}
                    to copy
                  </li>
                  <li>4. Paste here and click Calculate</li>
                </ol>
              </div>
            </div>

            <textarea
              value={html}
              onChange={(e) => {
                setHtml(e.target.value);
                setError("");
              }}
              disabled={scoresFetched}
              className="w-full h-64 rounded-xl p-4 text-sm text-white bg-[#050818] font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ border: `1px solid ${borderColor}` }}
              placeholder="Paste your Digialm URL OR the complete page content here...&#10;&#10;Example URL:&#10;https://cdn.digialm.com//per/g01/pub/1345/...&#10;&#10;OR paste the full page content with sections like:&#10;- English Comprehension&#10;- Verbal Ability&#10;- Decision Making&#10;- Quantitative Ability"
            />

            {error && (
              <div
                className={`mt-3 p-3 rounded-lg ${error.includes("🔄") ? "bg-blue-900/20 border-blue-500/30" : error.includes("✅") ? "bg-green-900/20 border-green-500/30" : "bg-red-900/20 border-red-500/30"} border`}
              >
                <p
                  className={`${error.includes("🔄") ? "text-blue-400" : error.includes("✅") ? "text-green-400" : "text-red-400"} text-sm whitespace-pre-line`}
                >
                  {error}
                </p>
              </div>
            )}

            <button
              onClick={handleCalculate}
              disabled={!html.trim() || loading || scoresFetched}
              className="mt-5 px-6 py-3 rounded-xl font-semibold text-black w-full md:w-auto transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              {loading
                ? "Processing..."
                : scoresFetched
                  ? "Scores Fetched ✓"
                  : "Calculate Score →"}
            </button>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}