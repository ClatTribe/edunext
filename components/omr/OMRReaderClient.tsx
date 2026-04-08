"use client";

import { useState } from "react";
import { OMRConfig, OMRResult, OMRAnswer, DEFAULT_CONFIG } from "../../lib/omr";
import SheetConfig from "./SheetConfig";
import ImageUploader from "./ImageUploader";
import ResultsGrid from "./ResultsGrid";
import { cropAnswerSection, isFullSheetPhoto } from "../../lib/omr-crop";

async function callOMRApi(
  image: string,
  config: OMRConfig,
  isCropped?: boolean,
): Promise<OMRResult> {
  const res = await fetch("/api/parse-omr", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image, config, isCropped }),
  });
  return res.json();
}

// Dual-pass: run twice and merge with agreement logic
function mergeWithVerification(
  pass1: OMRAnswer[],
  pass2: OMRAnswer[],
): OMRAnswer[] {
  // Build a map from question number for pass2
  const pass2Map = new Map(pass2.map((a) => [a.questionNumber, a]));
  const merged: OMRAnswer[] = [];

  for (const a1 of pass1) {
    const a2 = pass2Map.get(a1.questionNumber);

    if (!a2) {
      merged.push(a1);
      continue;
    }

    if (a1.selectedOption === a2.selectedOption) {
      merged.push({ ...a1, confidence: "high" });
    } else if (a1.selectedOption === null) {
      merged.push(a2);
    } else if (a2.selectedOption === null) {
      merged.push(a1);
    } else {
      const confRank = { high: 3, medium: 2, low: 1 };
      const winner =
        confRank[a1.confidence] >= confRank[a2.confidence] ? a1 : a2;
      merged.push({ ...winner, confidence: "medium" });
    }
  }

  // Add any questions only in pass2
  for (const a2 of pass2) {
    if (!merged.find((m) => m.questionNumber === a2.questionNumber)) {
      merged.push(a2);
    }
  }

  return merged.sort((a, b) => a.questionNumber - b.questionNumber);
}

export default function OMRReaderClient() {
  const [config, setConfig] = useState<OMRConfig>(DEFAULT_CONFIG);
  const [images, setImages] = useState<string[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState<OMRResult | null>(null);
  const [error, setError] = useState("");
  const [croppedPreview, setCroppedPreview] = useState<string>("");

  const handleImagesChange = (newImages: string[], newPreviews: string[]) => {
    setImages(newImages);
    setPreviews(newPreviews);
    setError("");
    setResult(null);
    setCroppedPreview("");
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      setError("Please upload at least one OMR sheet image.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCroppedPreview("");

    try {
      const allAnswersPass1: OMRAnswer[] = [];
      const allAnswersPass2: OMRAnswer[] = [];

      for (let i = 0; i < images.length; i++) {
        setProgress(`Processing image ${i + 1} of ${images.length}...`);

        let imageToSend = images[i];
        const isFullSheet = await isFullSheetPhoto(images[i]);
        let isCropped = false;

        if (isFullSheet) {
          setProgress(`Cropping answer section from image ${i + 1}...`);
          imageToSend = await cropAnswerSection(images[i]);
          isCropped = true;
          if (i === 0) setCroppedPreview(imageToSend);
        }

        // ✅ Compress before sending (reduces phone photo size)
        imageToSend = await compressImage(imageToSend);

        // Pass 1
        setProgress(
          `Reading OMR — Pass 1${images.length > 1 ? ` (image ${i + 1}/${images.length})` : ""}...`,
        );
        const data1 = await callOMRApi(imageToSend, config, isCropped);
        if (!data1.success)
          throw new Error(data1.error || `Failed on image ${i + 1} (pass 1)`);
        allAnswersPass1.push(...data1.answers);

        // Pass 2 (verification)
        setProgress(
          `Verifying — Pass 2${images.length > 1 ? ` (image ${i + 1}/${images.length})` : ""}...`,
        );
        const data2 = await callOMRApi(imageToSend, config, isCropped);
        if (!data2.success)
          throw new Error(data2.error || `Failed on image ${i + 1} (pass 2)`);
        allAnswersPass2.push(...data2.answers);
      }

      // Merge two passes
      const merged = mergeWithVerification(allAnswersPass1, allAnswersPass2);

      // Pad to full 200 questions — fill gaps with unanswered
      const mergedMap = new Map(merged.map((a) => [a.questionNumber, a]));
      const fullAnswers: OMRAnswer[] = Array.from(
        { length: config.totalQuestions },
        (_, i) => {
          const qNum = i + 1;
          return (
            mergedMap.get(qNum) ?? {
              questionNumber: qNum,
              selectedOption: null,
              confidence: "high",
            }
          );
        },
      );

      const totalAnswered = merged.filter(
        (a) => a.selectedOption !== null,
      ).length;

      const agreements = merged.filter((a) => a.confidence === "high").length;
      const disagreements = merged.filter(
        (a) => a.confidence === "medium",
      ).length;

      setResult({
        success: true,
        answers: merged,
        totalDetected: merged.length,
        totalAnswered,
        totalUnanswered: merged.length - totalAnswered,
        summary: merged
          .filter((a) => a.selectedOption !== null)
          .map((a) => `${a.questionNumber}: ${a.selectedOption}`)
          .join(", "),
        rawAIResponse: `Dual-pass: ${agreements} agreed, ${disagreements} disagreed`,
      });

      setTimeout(() => {
        document
          .getElementById("omr-results")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
      setProgress("");
    }
  };

  const handleReset = () => {
    setImages([]);
    setPreviews([]);
    setResult(null);
    setError("");
    setCroppedPreview("");
  };
  // Add this helper function
  async function compressImage(
    base64: string,
    maxWidth = 1800,
  ): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        // Compress to JPEG at 85% quality
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = base64;
    });
  }

  return (
    <div className="max-w-4xl mx-auto">
      <SheetConfig config={config} onChange={setConfig} disabled={loading} />

      <ImageUploader
        images={images}
        previews={previews}
        onImagesChange={handleImagesChange}
        disabled={loading}
      />

      {croppedPreview && !loading && !result && (
        <div className="mt-4 rounded-xl overflow-hidden border border-amber-500/30">
          <div className="flex items-center justify-between px-3 py-2 bg-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm">✂️</span>
              <p className="text-xs text-amber-400 font-medium">
                Cropped region sent to AI — verify all bubbles are visible
              </p>
            </div>
            <button
              onClick={() => setCroppedPreview("")}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              dismiss
            </button>
          </div>
          <img
            src={croppedPreview}
            alt="Cropped OMR answer section"
            className="w-full"
          />
          <div className="px-3 py-2 bg-slate-900">
            <p className="text-xs text-slate-500">
              If bubbles are cut off or header is still visible, adjust{" "}
              <code className="text-amber-500/70">cropRatio</code> in{" "}
              <code className="text-amber-500/70">lib/omr-crop.ts</code>
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {loading && (
        <div
          className="mt-6 rounded-2xl p-6"
          style={{
            backgroundColor: "#0F172B",
            border: "1px solid rgba(245,158,11,0.15)",
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-amber-500 text-xl">
                🔍
              </div>
            </div>
            <p className="text-amber-400 font-semibold text-base">
              {progress || "Processing..."}
            </p>
            <p className="text-slate-500 text-xs">
              Dual-pass verification — may take 20–30 seconds...
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={loading || images.length === 0}
          className="px-8 py-3 bg-amber-500 text-black font-bold rounded-lg text-lg hover:bg-amber-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {loading ? "Reading..." : "Read OMR Sheet"}
        </button>

        {(images.length > 0 || result) && !loading && (
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-slate-800 text-slate-300 font-medium rounded-lg text-lg hover:bg-slate-700 transition-all"
          >
            Reset
          </button>
        )}
      </div>

      {result && result.success && (
        <div id="omr-results">
          <ResultsGrid
            result={result}
            originalImage={images[0]}
            config={config}
          />
        </div>
      )}
    </div>
  );
}
