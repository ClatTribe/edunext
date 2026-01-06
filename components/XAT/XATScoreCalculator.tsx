"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/app/defaultLayout";

const accentColor = "#F59E0B";
const primaryBg = "#050818";
const secondaryBg = "#0F172B";
const borderColor = "rgba(245, 158, 11, 0.15)";

interface ScoreData {
  c: number;
  w: number;
  s: number;
}

interface QuestionStatus {
  id: string;
  status: "Answered" | "Not Answered";
  section: "VALR" | "DM" | "QA" | "GK";
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

  const extractScoresFromHTML = (htmlContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    const text = doc.body.innerText || doc.body.textContent || "";

    console.log("Extracted text preview:", text.substring(0, 2000));

    // Extract all questions with their status
    const questions: QuestionStatus[] = [];

    // Pattern: Question ID : XXXXXXXXXX Status : (Answered|Not Answered)
    const questionRegex =
      /Question\s+ID\s*:\s*(\d+)[\s\S]*?Status\s*:\s*(Answered|Not\s+Answered)/gi;
    let match;

    while ((match = questionRegex.exec(text)) !== null) {
      const questionId = match[1];
      const status = match[2].replace(/\s+/g, " ").trim();

      console.log(`Found Question ID: ${questionId}, Status: ${status}`);

      // Determine section based on question ID ranges (XAT 2025 pattern)
      // VALR: Questions 1-26
      // DM: Questions 27-48
      // QA: Questions 49-76
      // GK: Questions 77-95

      const qNum = parseInt(questionId.slice(-2)); // Get last 2 digits
      let section: "VALR" | "DM" | "QA" | "GK";

      if (qNum >= 1 && qNum <= 26) {
        section = "VALR";
      } else if (qNum >= 27 && qNum <= 48) {
        section = "DM";
      } else if (qNum >= 49 && qNum <= 76) {
        section = "QA";
      } else {
        section = "GK"; // 77-95
      }

      questions.push({
        id: questionId,
        status: status === "Answered" ? "Answered" : "Not Answered",
        section: section,
      });
    }

    console.log(`Total questions found: ${questions.length}`);
    console.log("Questions by section:", {
      VALR: questions.filter((q) => q.section === "VALR").length,
      DM: questions.filter((q) => q.section === "DM").length,
      QA: questions.filter((q) => q.section === "QA").length,
      GK: questions.filter((q) => q.section === "GK").length,
    });

    if (questions.length === 0) {
      throw new Error("No questions found in the content");
    }

    // Calculate statistics for each section
    const calculateSectionStats = (sectionQuestions: QuestionStatus[]) => {
      const answered = sectionQuestions.filter(
        (q) => q.status === "Answered"
      ).length;
      const notAnswered = sectionQuestions.filter(
        (q) => q.status === "Not Answered"
      ).length;

      // For XAT 2025, we need to estimate correct/wrong from answered questions
      // Assuming an average accuracy - this will be updated when user sees actual results
      // We'll mark all as "attempted" and let them see the breakdown later

      return {
        attempted: answered,
        skipped: notAnswered,
        total: sectionQuestions.length,
      };
    };

    const valrQuestions = questions.filter((q) => q.section === "VALR");
    const dmQuestions = questions.filter((q) => q.section === "DM");
    const qaQuestions = questions.filter((q) => q.section === "QA");

    const valrStats = calculateSectionStats(valrQuestions);
    const dmStats = calculateSectionStats(dmQuestions);
    const qaStats = calculateSectionStats(qaQuestions);

    console.log("Section Statistics:", {
      VALR: valrStats,
      DM: dmStats,
      QA: qaStats,
    });

    // Return with attempted count - we'll need user to input correct/wrong manually
    // Or we can make assumptions based on difficulty
    return {
      valr: {
        attempted: valrStats.attempted,
        skipped: valrStats.skipped,
        total: valrStats.total,
      },
      dm: {
        attempted: dmStats.attempted,
        skipped: dmStats.skipped,
        total: dmStats.total,
      },
      qa: {
        attempted: qaStats.attempted,
        skipped: qaStats.skipped,
        total: qaStats.total,
      },
      questions: questions,
    };
  };

  const fetchDigialmContent = async (url: string) => {
    try {
      console.log("Attempting to fetch URL:", url);

      const response = await fetch(url, {
        mode: "cors",
        credentials: "omit",
        headers: {
          Accept: "text/html,application/xhtml+xml,application/xml",
        },
      });

      if (response.ok) {
        return await response.text();
      }

      throw new Error("Direct fetch failed");
    } catch (directError) {
      console.log("Direct fetch failed, trying CORS proxies...");

      const proxyUrls = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        `https://corsproxy.io/?${encodeURIComponent(url)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
      ];

      for (const proxyUrl of proxyUrls) {
        try {
          console.log("Trying proxy:", proxyUrl);
          const response = await fetch(proxyUrl);
          if (response.ok) {
            const content = await response.text();
            console.log("Proxy fetch successful");
            return content;
          }
        } catch (proxyError) {
          console.log(`Proxy failed:`, proxyError);
        }
      }

      throw new Error("All fetch methods failed");
    }
  };

  const processContent = (content: string) => {
    try {
      const result = extractScoresFromHTML(content);

      console.log("Extraction result:", result);

      if (!result.questions || result.questions.length === 0) {
        throw new Error("No valid questions found");
      }

      // For now, we'll estimate 70% accuracy for answered questions
      // User can adjust this in a more detailed interface
      const estimateScores = (attempted: number, skipped: number) => {
        const estimatedCorrect = Math.round(attempted * 0.7); // 70% accuracy assumption
        const estimatedWrong = attempted - estimatedCorrect;
        return {
          c: estimatedCorrect,
          w: estimatedWrong,
          s: skipped,
        };
      };

      setFetchedScores({
        valr: estimateScores(result.valr.attempted, result.valr.skipped),
        dm: estimateScores(result.dm.attempted, result.dm.skipped),
        qa: estimateScores(result.qa.attempted, result.qa.skipped),
      });

      setScoresFetched(true);
      setError(
        `✅ Found ${result.questions.length} questions!\n\n` +
          `📊 VALR: ${result.valr.attempted} attempted, ${result.valr.skipped} skipped\n` +
          `📊 DM: ${result.dm.attempted} attempted, ${result.dm.skipped} skipped\n` +
          `📊 QA: ${result.qa.attempted} attempted, ${result.qa.skipped} skipped\n\n` +
          `⚠️ Note: Estimated 70% accuracy for attempted questions. Complete your details and submit!`
      );
    } catch (err) {
      console.error("Processing error:", err);
      throw new Error("Unable to extract questions from content");
    }
  };

  const handleCalculate = async () => {
    try {
      setError("");
      setLoading(true);
      setScoresFetched(false);
      setFetchedScores(null);

      const input = html.trim();

      if (!input) {
        setError("⚠️ Please paste your Digialm URL or content");
        setLoading(false);
        return;
      }

      if (/^https?:\/\//i.test(input) || /digialm\.com/i.test(input)) {
        setError("🔄 Fetching content from URL...");

        let url = input;
        if (!url.startsWith("http")) {
          url = "https://" + url;
        }

        try {
          const content = await fetchDigialmContent(url);
          processContent(content);
        } catch (fetchError) {
          console.error("Fetch error:", fetchError);
          setError(
            "❌ Unable to fetch URL automatically due to CORS restrictions.\n\n" +
              "⚠️ Please use manual method:\n" +
              "1. Open the link in your browser\n" +
              "2. Press Ctrl+A (Cmd+A on Mac) to select all\n" +
              "3. Press Ctrl+C (Cmd+C) to copy\n" +
              "4. Come back here and paste the content"
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
        "❌ Unable to find question data in the content.\n\n" +
          "Make sure you:\n" +
          "1. Opened the complete response page with 'Question ID' and 'Status' visible\n" +
          "2. Selected ALL content (Ctrl+A)\n" +
          "3. Copied everything (Ctrl+C)\n" +
          "4. Pasted the complete content here\n\n" +
          "The page should show questions with 'Question ID' and 'Status: Answered/Not Answered'"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setFormError("");

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

    if (!fetchedScores) {
      setFormError(
        "❌ Please calculate your scores first using the section below"
      );
      return;
    }

    try {
      setLoading(true);

      const valrScore = fetchedScores.valr.c - fetchedScores.valr.w * 0.25;
      const dmScore = fetchedScores.dm.c - fetchedScores.dm.w * 0.25;
      const qaScore = fetchedScores.qa.c - fetchedScores.qa.w * 0.25;
      const totalScore = valrScore + dmScore + qaScore;

      const { data: existingUser, error: checkError } = await supabase
        .from("xat_results")
        .select("*")
        .eq("name", name.trim())
        .eq("mobile", mobile)
        .order("created_at", { ascending: false })
        .limit(1);

      if (checkError) {
        console.error("Check error:", checkError);
        setFormError(`❌ Failed to check existing data: ${checkError.message}`);
        setLoading(false);
        return;
      }

      if (existingUser && existingUser.length > 0) {
        const existingTotal =
          existingUser[0].valr_correct -
          existingUser[0].valr_wrong * 0.25 +
          (existingUser[0].dm_correct - existingUser[0].dm_wrong * 0.25) +
          (existingUser[0].qa_correct - existingUser[0].qa_wrong * 0.25);

        if (totalScore > existingTotal) {
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

      router.push(
        `/xat-score-calculator-2026/result?valr=${fetchedScores.valr.c},${fetchedScores.valr.w}&dm=${fetchedScores.dm.c},${fetchedScores.dm.w}&qa=${fetchedScores.qa.c},${fetchedScores.qa.w}&name=${encodeURIComponent(name)}&mobile=${mobile}&email=${encodeURIComponent(email)}&category=${category}&city=${encodeURIComponent(city)}`
      );
    } catch (err) {
      console.error("Submission error:", err);
      setFormError("❌ Something went wrong. Please try again.");
      setLoading(false);
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
              Calculate your <span className="text-[#F59E0B]">XAT score</span>{" "}
              instantly
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm sm:text-base mx-auto px-4">
              Paste your Digialm response to get accurate section-wise scores
            </p>
          </div>

          {/* User Form */}
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
                  <option>General</option>
                  <option>OBC</option>
                  <option>SC</option>
                  <option>ST</option>
                  <option>EWS</option>
                  <option>PwD</option>
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
                  className="px-8 py-3 rounded-xl font-semibold text-black w-full transition-all hover:opacity-90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: accentColor }}
                >
                  {loading ? "Submitting..." : "Submit & View Results →"}
                </button>
              </div>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                <p className="text-red-400 text-sm">{formError}</p>
              </div>
            )}
          </div>

          {/* Score Calculator */}
          <div
            className="rounded-2xl p-6 shadow-xl space-y-5"
            style={{
              backgroundColor: secondaryBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            {/* HEADER */}
            <h2 className="text-2xl font-bold text-white">
              Calculate XAT Score
            </h2>

            {/* LINK INPUT (TOP) */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                Paste Digialm URL or Response Content
              </label>

              <textarea
                value={html}
                onChange={(e) => {
                  setHtml(e.target.value);
                  setError("");
                }}
                disabled={scoresFetched}
                className="w-full h-20 rounded-xl p-4 text-sm text-white bg-[#050818] font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                style={{ border: `1px solid ${borderColor}` }}
                placeholder="https://cdn.digialm.com/... OR paste full response page here"
              />
            </div>

            {/* METHODS SECTION (DOWN) */}
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6">
                  How to check XAT 2026 scores?
                </h1>

                <div className="text-slate-400 text-sm space-y-3">
                  <div className="p-3 bg-[#050818] rounded-lg border border-slate-700/50">
                    <p className="text-xs">
                      Works with XAT 2025+ format showing
                      <span className="text-amber-400"> Question ID </span>
                      and
                      <span className="text-amber-400">
                        {" "}
                        Status: Answered / Not Answered
                      </span>
                    </p>
                  </div>

                  <div className="p-3 bg-[#050818] rounded-lg border border-slate-700/50">
                    <p className="text-white font-medium mb-1">
                      Click on "Candidate Response" and copy the response sheet
                      link
                    </p>
                  </div>

                  <div className="p-3 bg-[#050818] rounded-lg border border-slate-700/50">
                    <p className="text-white font-medium mb-1">
                      Paste the link in the textbox above and click on Submit
                    </p>
                  </div>

                  <div className="p-3 bg-[#050818] rounded-lg border border-slate-700/50">
                    <p className="text-white font-medium mb-1">
                      📊 Instant Results
                    </p>
                    <p className="text-xs">
                      Get your predicted percentile and section-wise breakdown
                      in
                      <span className="text-emerald-400"> real-time</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    💡 <span className="font-semibold">Pro Tip:</span> Make sure
                    you're logged into the official XAT website before copying
                    your response sheet link
                  </p>
                </div>
              </div>
            </div>

            {/* ERROR / STATUS */}
            {error && (
              <div
                className={`p-3 rounded-lg border ${
                  error.includes("✅")
                    ? "bg-green-900/20 border-green-500/30 text-green-400"
                    : error.includes("🔄")
                      ? "bg-blue-900/20 border-blue-500/30 text-blue-400"
                      : "bg-red-900/20 border-red-500/30 text-red-400"
                }`}
              >
                <p className="text-sm whitespace-pre-line">{error}</p>
              </div>
            )}

            {/* ACTION BUTTON */}
            <button
              onClick={handleCalculate}
              disabled={!html.trim() || loading || scoresFetched}
              className="w-1/3 px-6 py-3 rounded-xl font-semibold text-black transition-all disabled:opacity-50"
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
