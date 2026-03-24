"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { supabase } from "../lib/supabase"
import {
  GraduationCap, Wallet, TrendingUp, BarChart3,
  Users, Lock, Sparkles, ChevronDown, ArrowUpRight,
  CheckCircle2, AlertTriangle, MapPin, ArrowRight, ThumbsUp
} from "lucide-react"

// ─── Tool Name (used for logging in student_engagement.tools_used) ───────────
const TOOL_NAME = "college_match"

// ─── Stream Priority ─────────────────────────────────────────────────────────

const STREAM_PRIORITY: Record<string, number> = {
  "B.Tech": 1, "Overall": 2, "MBA": 3, "Commerce": 4, "BBA/BMS": 5,
  "Medical": 6, "Science": 7, "Arts": 8, "Dental": 9, "Computer Applications": 10,
  "Pharmacy": 11, "Law": 12, "Architecture": 13, "Hotel Management": 14,
  "Education": 15, "Mass Communications": 16, "Nursing": 17, "Design": 18,
  "Agriculture": 19, "Fashion Design": 20, "Journalism": 21, "Physiotherapy": 22,
  "Hospitality Management": 23, "Social Work": 24, "Animation": 25, "BCA": 26,
  "Research": 27, "Fashion": 28, "Fashion Technology": 29, "Veterinary Sciences": 30,
  "Executive MBA": 31, "Ayurved": 32, "Open University": 33,
}

// ─── Stream Alias Map ────────────────────────────────────────────────────────

const STREAM_ALIASES: Record<string, string[]> = {
  "B.Tech":               ["b.tech", "btech", "b.e.", "be", "engineering", "bachelor of technology", "bachelor of engineering", "b tech"],
  "MBA":                  ["mba", "master of business", "management", "pgdm", "pgpm", "business administration"],
  "BBA/BMS":              ["bba", "bms", "bachelor of business", "business administration", "business management", "business studies"],
  "Medical":              ["mbbs", "medical", "medicine", "md", "bachelor of medicine", "doctor of medicine"],
  "Commerce":             ["b.com", "bcom", "m.com", "mcom", "commerce", "accounting", "accounts"],
  "Science":              ["b.sc", "bsc", "m.sc", "msc", "science", "bachelor of science", "master of science"],
  "Arts":                 ["b.a.", "ba", "m.a.", "ma", "arts", "humanities", "liberal arts", "bachelor of arts"],
  "Dental":               ["bds", "mds", "dental", "dentistry", "bachelor of dental"],
  "Computer Applications":["mca", "master of computer", "computer applications", "computer application"],
  "BCA":                  ["bca", "bachelor of computer application", "bachelor of computer"],
  "Pharmacy":             ["b.pharm", "bpharm", "m.pharm", "mpharm", "pharmacy", "pharmaceutical", "d.pharm", "dpharm"],
  "Law":                  ["llb", "llm", "law", "legal", "ba llb", "bba llb", "b.a. llb", "integrated law", "bachelor of law"],
  "Architecture":         ["b.arch", "barch", "architecture", "bachelor of architecture", "m.arch"],
  "Hotel Management":     ["hotel management", "hotel", "bhm", "bhmct", "hospitality"],
  "Hospitality Management":["hospitality", "hospitality management", "hotel and hospitality"],
  "Education":            ["b.ed", "bed", "m.ed", "med", "education", "bachelor of education", "teacher training"],
  "Mass Communications":  ["mass communication", "mass comm", "bjmc", "mjmc", "media", "journalism and mass"],
  "Journalism":           ["journalism", "bjmc", "media studies", "mass media"],
  "Nursing":              ["nursing", "b.sc nursing", "bsc nursing", "gnm", "anm"],
  "Design":               ["design", "b.des", "bdes", "m.des", "mdes", "bachelor of design"],
  "Fashion Design":       ["fashion design", "fashion", "nift", "fashion technology"],
  "Fashion Technology":   ["fashion technology", "fashion tech"],
  "Agriculture":          ["agriculture", "b.sc agriculture", "bsc agri", "agricultural", "farming"],
  "Physiotherapy":        ["physiotherapy", "bpt", "mpt", "physical therapy", "bachelor of physiotherapy"],
  "Social Work":          ["social work", "bsw", "msw", "bachelor of social work"],
  "Animation":            ["animation", "multimedia", "vfx", "animation and multimedia"],
  "Research":             ["research", "phd", "ph.d", "doctorate", "doctoral"],
  "Veterinary Sciences":  ["veterinary", "bvsc", "b.v.sc", "animal science", "vet"],
  "Executive MBA":        ["executive mba", "emba", "executive management"],
  "Ayurved":              ["ayurveda", "bams", "ayurvedic", "b.a.m.s"],
  "Open University":      ["open university", "distance", "distance learning", "correspondence", "open learning"],
}

// ─── Location Alias Map ──────────────────────────────────────────────────────

const LOCATION_ALIASES: Record<string, string[]> = {
  "delhi":          ["delhi", "new delhi", "ncr", "national capital"],
  "maharashtra":    ["maharashtra", "mumbai", "pune", "nagpur", "thane"],
  "karnataka":      ["karnataka", "bangalore", "bengaluru", "mysore", "mysuru"],
  "uttar pradesh":  ["uttar pradesh", "up", "noida", "lucknow", "greater noida", "ghaziabad"],
  "haryana":        ["haryana", "gurugram", "gurgaon", "faridabad"],
  "tamil nadu":     ["tamil nadu", "chennai", "madras", "coimbatore"],
  "west bengal":    ["west bengal", "kolkata", "calcutta"],
  "telangana":      ["telangana", "hyderabad"],
  "rajasthan":      ["rajasthan", "jaipur", "jodhpur", "udaipur"],
  "gujarat":        ["gujarat", "ahmedabad", "surat", "vadodara", "baroda"],
  "kerala":         ["kerala", "kochi", "cochin", "thiruvananthapuram", "trivandrum"],
  "madhya pradesh": ["madhya pradesh", "bhopal", "indore", "mp"],
  "punjab":         ["punjab", "chandigarh", "amritsar", "ludhiana"],
  "chandigarh":     ["chandigarh", "punjab", "tricity"],
  "jharkhand":      ["jharkhand", "ranchi", "jamshedpur"],
  "odisha":         ["odisha", "orissa", "bhubaneswar"],
  "bihar":          ["bihar", "patna"],
  "goa":            ["goa", "panaji"],
  "uttarakhand":    ["uttarakhand", "dehradun", "roorkee"],
  "himachal pradesh":["himachal pradesh", "shimla", "himachal"],
  "assam":          ["assam", "guwahati"],
  "chhattisgarh":   ["chhattisgarh", "raipur"],
  "jammu & kashmir":["jammu", "kashmir", "j&k", "srinagar"],
  "puducherry":     ["puducherry", "pondicherry"],
}

// ─── Data Helpers ────────────────────────────────────────────────────────────

function cleanVal(val: any): string {
  if (val === null || val === undefined) return ''
  return val.toString().replace(/Compare$/i, '').trim()
}

function textMatchesStream(text: string, stream: string): boolean {
  const t = text.toLowerCase()
  const aliases = STREAM_ALIASES[stream] || [stream.toLowerCase()]
  return aliases.some(alias => t.includes(alias))
}

function locationMatchesState(collegeLocation: string, targetState: string): boolean {
  const loc = collegeLocation.toLowerCase()
  const stateKey = targetState.toLowerCase()
  const aliases = LOCATION_ALIASES[stateKey] || [stateKey]
  return aliases.some(alias => loc.includes(alias))
}

function extractTopStreams(micrositeData: any): string[] {
  const foundStreams: Set<string> = new Set()
  const allTables = [
    ...(micrositeData?.fees || []),
    ...(micrositeData?.admission || []),
    ...(micrositeData?.courses || []),
  ]
  for (const table of allTables) {
    const heading = table.heading || ''
    const rows = table.rows || []
    for (const stream of Object.keys(STREAM_PRIORITY)) {
      if (stream === "Overall") continue
      if (textMatchesStream(heading, stream)) foundStreams.add(stream)
      for (const row of rows) {
        const firstCell = cleanVal(row?.[0])
        if (firstCell && textMatchesStream(firstCell, stream)) foundStreams.add(stream)
      }
    }
  }
  const sorted = Array.from(foundStreams).sort(
    (a, b) => (STREAM_PRIORITY[a] || 99) - (STREAM_PRIORITY[b] || 99)
  )
  if (sorted.length > 0) return sorted.slice(0, 3)
  const feeTables = micrositeData?.fees || []
  return feeTables.map((t: any) => t.heading?.trim()).filter(Boolean).slice(0, 3)
}

function extractPlacementStats(micrositeData: any, collegeName: string) {
  const placementData: any[] = micrositeData?.placement || []
  const allRows = placementData.flatMap(t => t.rows || [])
  const nameLower = (collegeName || '').toLowerCase()
  const hp = allRows.find((r: any[]) =>
    Array.isArray(r) &&
    (r[0]?.toString().toLowerCase().includes("highest package") ||
     r[0]?.toString().toLowerCase().includes(nameLower)) &&
    r[1] && r[1] !== '—' && r[1] !== '-'
  )
  const ap = allRows.find((r: any[]) =>
    Array.isArray(r) &&
    (r[0]?.toString().toLowerCase().includes("average package") ||
     r[0]?.toString().toLowerCase().includes("median package")) &&
    r[1] && r[1] !== '—' && r[1] !== '-'
  )
  const pr = allRows.find((r: any[]) =>
    Array.isArray(r) &&
    (r[0]?.toString().toLowerCase().includes("placement rate") ||
     r[0]?.toString().toLowerCase().includes("placement %") ||
     r[0]?.toString().toLowerCase().includes("placed")) &&
    r[1] && r[1] !== '—' && r[1] !== '-'
  )
  return {
    highestPackage: hp ? cleanVal(hp[1]) : null,
    averagePackage: ap ? cleanVal(ap[1]) : null,
    placementRate: pr ? cleanVal(pr[1]) : null,
  }
}

function extractTopStreamFee(micrositeData: any): string | null {
  const feeTables: any[] = micrositeData?.fees || []
  if (feeTables.length === 0) return null
  const rows = feeTables[0].rows || []
  const totalRow = rows.find((r: any[]) =>
    Array.isArray(r) && r[0]?.toString().toLowerCase().includes("total")
  )
  if (totalRow && totalRow[1] && totalRow[1] !== '—') return cleanVal(totalRow[1])
  if (rows.length > 0 && Array.isArray(rows[0]) && rows[0][1]) return cleanVal(rows[0][1])
  return null
}

// ─── Cutoff Extraction ───────────────────────────────────────────────────────

function extractCutoffForExam(micrositeData: any, examName: string): number | null {
  const cutoffTables: any[] = micrositeData?.cutoff || []
  if (cutoffTables.length === 0) return null
  const examLower = examName.toLowerCase()
  const examAliases: Record<string, string[]> = {
    "jee main":   ["jee", "jee main", "jee mains", "jeemain"],
    "jee advanced":["jee advanced", "jee adv", "iit jee"],
    "cat":        ["cat", "common admission test"],
    "mat":        ["mat", "management aptitude"],
    "xat":        ["xat", "xavier aptitude"],
    "neet":       ["neet", "neet ug", "neet-ug"],
    "clat":       ["clat", "common law"],
    "gate":       ["gate"],
    "cuet":       ["cuet", "cucet", "central university"],
    "nata":       ["nata", "national aptitude test"],
    "ipmat":      ["ipmat", "ipm aptitude"],
  }
  let matchAliases = [examLower]
  for (const [, aliases] of Object.entries(examAliases)) {
    if (aliases.some(a => examLower.includes(a) || a.includes(examLower))) {
      matchAliases = aliases
      break
    }
  }
  for (const table of cutoffTables) {
    const heading = (table.heading || '').toLowerCase()
    const rows = table.rows || []
    const headers = (table.headers || []).map((h: string) => h.toLowerCase())
    const tableRelevant = matchAliases.some(a => heading.includes(a)) ||
      matchAliases.some(a => headers.some((h: string) => h.includes(a)))
    if (!tableRelevant) continue
    for (const row of rows) {
      if (!Array.isArray(row)) continue
      for (let i = 1; i < row.length; i++) {
        const cellStr = cleanVal(row[i])
        const num = parseFloat(cellStr.replace(/[^0-9.]/g, ''))
        if (!isNaN(num) && num > 0 && num <= 100) return num
      }
    }
  }
  return null
}

// ─── Matching Algorithm ──────────────────────────────────────────────────────

interface UserProfile {
  name: string
  degree: string
  target_state: string[]
  budget: string[]
  city: string
  state: string
  specialization?: string
  test_scores?: { exam: string; percentile: string }[]
}

interface MatchResult {
  score: number
  factors: { label: string; score: number; detail: string; positive: boolean }[]
}

function parseBudgetToLakhs(budgetArr: string[]): { min: number; max: number } {
  let min = Infinity
  let max = 0
  for (const b of budgetArr) {
    if (b === "Under 1L")   { min = Math.min(min, 0);  max = Math.max(max, 1) }
    if (b === "1-3L")       { min = Math.min(min, 1);  max = Math.max(max, 3) }
    if (b === "3-5L")       { min = Math.min(min, 3);  max = Math.max(max, 5) }
    if (b === "5L")         { min = Math.min(min, 0);  max = Math.max(max, 5) }
    if (b === "5-10L")      { min = Math.min(min, 5);  max = Math.max(max, 10) }
    if (b === "10-15L")     { min = Math.min(min, 10); max = Math.max(max, 15) }
    if (b === "15-25L")     { min = Math.min(min, 15); max = Math.max(max, 25) }
    if (b === "Above 15L" || b === "Above 25L") { min = Math.min(min, 15); max = 999 }
  }
  if (min === Infinity) min = 0
  if (max === 0) max = 999
  return { min, max }
}

function parseFeeString(feeStr: string): number | null {
  if (!feeStr) return null
  let s = feeStr.toString().trim()
  s = s.replace(/[₹$]/g, '').replace(/,/g, '').trim().toLowerCase()
  const croreMatch = s.match(/([\d.]+)\s*(crore|cr)/)
  if (croreMatch) return parseFloat(croreMatch[1]) * 100
  const lakhMatch = s.match(/([\d.]+)\s*(lakh|lakhs|lac|lacs|lpa|l)\b/)
  if (lakhMatch) return parseFloat(lakhMatch[1])
  const kMatch = s.match(/([\d.]+)\s*k\b/)
  if (kMatch) return parseFloat(kMatch[1]) / 100
  const num = parseFloat(s.replace(/[^0-9.]/g, ''))
  if (isNaN(num)) return null
  if (num > 100000) return num / 100000
  if (num > 1000) return num / 100000
  if (num > 100) return num / 100
  return num
}

function computeMatch(profile: UserProfile, college: any, micrositeData: any): MatchResult {
  const factors: MatchResult['factors'] = []
  let totalWeight = 0
  let weightedScore = 0

  const topStreams = extractTopStreams(micrositeData)
  const placement = extractPlacementStats(micrositeData, college?.college_name || '')
  const topFee = extractTopStreamFee(micrositeData)
  const collegeLocation = college?.location || ''

  // ── 1. Stream Match (weight: 25) ──
  const weight1 = 25
  totalWeight += weight1
  const userDegree = profile.degree || ''
  const streamMatch = topStreams.some(stream => {
    const aliases = STREAM_ALIASES[stream] || [stream.toLowerCase()]
    const userAliases = STREAM_ALIASES[userDegree] || [userDegree.toLowerCase()]
    return aliases.some(a => userAliases.some(u => a.includes(u) || u.includes(a)))
  })
  const allText = JSON.stringify(micrositeData).toLowerCase()
  const userAliasesForScan = STREAM_ALIASES[userDegree] || [userDegree.toLowerCase()]
  const broadMatch = !streamMatch && userAliasesForScan.some(a => a.length > 2 && allText.includes(a))

  if (streamMatch) {
    weightedScore += weight1
    factors.push({ label: "Stream", score: 100, detail: `Offers ${userDegree}`, positive: true })
  } else if (broadMatch) {
    weightedScore += weight1 * 0.7
    factors.push({ label: "Stream", score: 70, detail: `${userDegree} found in college data`, positive: true })
  } else if (topStreams.length > 0) {
    weightedScore += weight1 * 0.1
    factors.push({ label: "Stream", score: 10, detail: `Known for ${topStreams[0]}, not ${userDegree}`, positive: false })
  } else {
    weightedScore += weight1 * 0.4
    factors.push({ label: "Stream", score: 40, detail: "Stream data unavailable", positive: false })
  }

  // ── 2. Location Match (weight: 20) ──
  const weight2 = 20
  totalWeight += weight2
  const targetStates = profile.target_state
  const locationMatch = targetStates.some(s => locationMatchesState(collegeLocation, s))

  if (locationMatch) {
    weightedScore += weight2
    factors.push({ label: "Location", score: 100, detail: "In your preferred state", positive: true })
  } else if (targetStates.length === 0) {
    weightedScore += weight2 * 0.5
    factors.push({ label: "Location", score: 50, detail: "No state preference set", positive: true })
  } else {
    weightedScore += weight2 * 0.15
    factors.push({ label: "Location", score: 15, detail: `Not in ${targetStates.slice(0, 2).join(', ')}`, positive: false })
  }

  // ── 3. Budget Fit (weight: 20) ──
  const weight3 = 20
  totalWeight += weight3
  if (topFee && profile.budget.length > 0) {
    const feeLakhs = parseFeeString(topFee)
    const { max } = parseBudgetToLakhs(profile.budget)
    if (feeLakhs !== null && max < 999) {
      if (feeLakhs <= max) {
        weightedScore += weight3
        factors.push({ label: "Budget", score: 100, detail: `Fees ${topFee} — within range`, positive: true })
      } else if (feeLakhs <= max * 1.3) {
        weightedScore += weight3 * 0.5
        factors.push({ label: "Budget", score: 50, detail: `Fees ${topFee} — slightly above budget`, positive: false })
      } else {
        weightedScore += weight3 * 0.1
        factors.push({ label: "Budget", score: 10, detail: `Fees ${topFee} — over your budget`, positive: false })
      }
    } else {
      weightedScore += weight3 * 0.5
      factors.push({ label: "Budget", score: 50, detail: "Fee data unclear", positive: true })
    }
  } else {
    weightedScore += weight3 * 0.5
    factors.push({ label: "Budget", score: 50, detail: profile.budget.length === 0 ? "No budget set" : "Fee data unavailable", positive: true })
  }

  // ── 4. Placement Strength (weight: 15) ──
  const weight4 = 15
  totalWeight += weight4
  if (placement.averagePackage || placement.highestPackage) {
    const avgPkg = parseFeeString(placement.averagePackage || '') ||
                   (parseFeeString(placement.highestPackage || '') ? (parseFeeString(placement.highestPackage || '')! * 0.6) : null)
    if (avgPkg && avgPkg >= 5) {
      weightedScore += weight4
      factors.push({ label: "Placement", score: 100, detail: `Avg package ${placement.averagePackage || 'strong'}`, positive: true })
    } else if (avgPkg && avgPkg >= 3) {
      weightedScore += weight4 * 0.7
      factors.push({ label: "Placement", score: 70, detail: `Avg package ${placement.averagePackage || 'decent'}`, positive: true })
    } else {
      weightedScore += weight4 * 0.35
      factors.push({ label: "Placement", score: 35, detail: `Avg package ${placement.averagePackage || 'below average'}`, positive: false })
    }
  } else {
    weightedScore += weight4 * 0.25
    factors.push({ label: "Placement", score: 25, detail: "Placement data unavailable", positive: false })
  }

  // ── 5. Admission Eligibility / Cutoff Gate (weight: 20) ──
  const weight5 = 20
  totalWeight += weight5
  const testScores = profile.test_scores || []

  if (testScores.length > 0) {
    let bestCutoffResult: { score: number; detail: string; positive: boolean } | null = null
    for (const ts of testScores) {
      if (!ts.exam || !ts.percentile) continue
      const studentPercentile = parseFloat(ts.percentile)
      if (isNaN(studentPercentile)) continue
      const cutoff = extractCutoffForExam(micrositeData, ts.exam)
      if (cutoff === null) continue
      if (studentPercentile >= cutoff) {
        const margin = studentPercentile - cutoff
        const s = margin >= 10 ? 100 : margin >= 5 ? 85 : 70
        bestCutoffResult = { score: s, detail: `${ts.exam} ${ts.percentile}%ile — above cutoff (${cutoff})`, positive: true }
        break
      } else {
        const gap = cutoff - studentPercentile
        const s = gap <= 5 ? 40 : gap <= 15 ? 20 : 5
        if (!bestCutoffResult || s > bestCutoffResult.score) {
          bestCutoffResult = { score: s, detail: `${ts.exam} ${ts.percentile}%ile — below cutoff (${cutoff})`, positive: false }
        }
      }
    }
    if (bestCutoffResult) {
      weightedScore += weight5 * (bestCutoffResult.score / 100)
      factors.push({ label: "Eligibility", ...bestCutoffResult })
    } else {
      weightedScore += weight5 * 0.5
      factors.push({ label: "Eligibility", score: 50, detail: "Cutoff data not available for your exams", positive: true })
    }
  } else {
    weightedScore += weight5 * 0.4
    factors.push({ label: "Eligibility", score: 40, detail: "Add test scores for accurate eligibility check", positive: false })
  }

  const score = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 50
  return { score, factors }
}

// ─── Engagement Helpers (student_engagement table) ───────────────────────────

async function logToolUsage(userId: string) {
  try {
    await supabase.rpc("log_tool_usage", {
      p_user_id: userId,
      p_tool_name: TOOL_NAME,
    })
  } catch (err) {
    console.error("Failed to log tool usage:", err)
  }
}

async function likeCollege(userId: string, collegeName: string) {
  try {
    await supabase.rpc("like_college", {
      p_user_id: userId,
      p_college_name: collegeName,
    })
  } catch (err) {
    console.error("Failed to like college:", err)
  }
}

async function unlikeCollege(userId: string, collegeName: string) {
  try {
    const { error } = await supabase.rpc("unlike_college", {
      p_user_id: userId,
      p_college_name: collegeName,
    })
    // Fallback: if RPC fails, do direct update
    if (error) {
      const { data: row } = await supabase
        .from("student_engagement")
        .select("liked_colleges")
        .eq("user_id", userId)
        .single()
      if (row) {
        const updated = (row.liked_colleges || []).filter((c: string) => c !== collegeName)
        await supabase
          .from("student_engagement")
          .update({ liked_colleges: updated, updated_at: new Date().toISOString() })
          .eq("user_id", userId)
      }
    }
  } catch (err) {
    console.error("Failed to unlike college:", err)
  }
}

async function checkIfLiked(userId: string, collegeName: string): Promise<boolean> {
  try {
    const { data } = await supabase.rpc("check_college_liked", {
      p_user_id: userId,
      p_college_name: collegeName,
    })
    return data === true
  } catch {
    return false
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({
  icon: Icon, label, value, iconColor = "text-amber-500", blurred = false,
}: {
  icon: any; label: string; value: string | null; iconColor?: string; blurred?: boolean
}) {
  if (!value && !blurred) return null
  return (
    <div className="relative p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <Icon className={`w-3.5 h-3.5 mb-1.5 ${iconColor} opacity-60`} />
      <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mb-1">{label}</p>
      <div className={blurred ? "blur-[6px] select-none pointer-events-none" : ""}>
        <p className="text-sm font-black text-white truncate">{value || "₹12.5 LPA"}</p>
      </div>
      {blurred && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0a1022]/30">
          <Lock className="w-3.5 h-3.5 text-amber-500/40" />
        </div>
      )}
    </div>
  )
}

function StreamBadge({ name, rank }: { name: string; rank: number }) {
  const colors = [
    "border-amber-500/20 text-amber-400/90 bg-amber-500/[0.04]",
    "border-blue-500/20 text-blue-400/90 bg-blue-500/[0.04]",
    "border-purple-500/20 text-purple-400/90 bg-purple-500/[0.04]",
  ]
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${colors[rank] || colors[0]}`}>
      <GraduationCap className="w-2.5 h-2.5" />
      {name}
    </span>
  )
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 70 ? "#10b981" : score >= 45 ? "#F59E0B" : "#ef4444"
  const label = score >= 70 ? "Strong Match" : score >= 45 ? "Moderate" : "Weak Match"
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          <circle
            cx="40" cy="40" r="36" fill="none"
            stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-white">{score}</span>
        </div>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color }}>{label}</span>
    </div>
  )
}

function FactorRow({ label, score, detail, positive }: {
  label: string; score: number; detail: string; positive: boolean
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="shrink-0">
        {positive
          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-white uppercase tracking-wider">{label}</span>
          <span className="text-[9px] font-bold text-slate-500">{score}%</span>
        </div>
        <div className="w-full h-1 rounded-full bg-white/[0.05] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${score}%`,
              backgroundColor: score >= 70 ? '#10b981' : score >= 40 ? '#F59E0B' : '#ef4444'
            }}
          />
        </div>
        <p className="text-[9px] text-slate-500 mt-0.5">{detail}</p>
      </div>
    </div>
  )
}

function RecommendedCard({ college }: { college: { slug: string; college_name: string; location: string; matchScore: number } }) {
  const color = college.matchScore >= 70 ? "#10b981" : "#F59E0B"
  return (
    <Link href={`/college/${college.slug}`} className="group block">
      <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-amber-500/20 hover:bg-white/[0.04] transition-all">
        <div
          className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border"
          style={{ borderColor: `${color}30`, color }}
        >
          {college.matchScore}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">
            {college.college_name}
          </p>
          <p className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-2.5 h-2.5" />
            {college.location?.split(',')[0] || 'India'}
          </p>
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </Link>
  )
}

// ─── Like Button with Animation (ThumbsUp) ──────────────────────────────────

function LikeButton({
  isLiked, loading, disabled, onClick,
}: {
  isLiked: boolean; loading: boolean; disabled: boolean; onClick: () => void
}) {
  const [animating, setAnimating] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (loading || disabled) return
    if (!isLiked) {
      setAnimating(true)
      setTimeout(() => setAnimating(false), 600)
    }
    onClick()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || disabled}
      className="relative shrink-0 group/like"
      title={disabled ? "Complete your profile to like colleges" : isLiked ? "Remove like" : "Like this college"}
    >
      <style jsx>{`
        @keyframes like-pop {
          0% { transform: scale(1); }
          15% { transform: scale(1.4) rotate(-8deg); }
          30% { transform: scale(0.85) rotate(4deg); }
          50% { transform: scale(1.15) rotate(-2deg); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes like-burst {
          0% { opacity: 0.8; transform: scale(0.6); }
          100% { opacity: 0; transform: scale(2.5); }
        }
        .like-pop { animation: like-pop 0.55s cubic-bezier(0.17, 0.89, 0.32, 1.28); }
        .like-burst { animation: like-burst 0.5s ease-out forwards; }
      `}</style>

      {animating && (
        <div
          className="like-burst absolute inset-0 rounded-full pointer-events-none"
          style={{ border: '2px solid #3b82f6', margin: '-6px' }}
        />
      )}

      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
        disabled
          ? 'bg-white/[0.02] cursor-not-allowed'
          : isLiked
            ? 'bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/20'
            : 'bg-white/[0.02] hover:bg-blue-500/10 border border-white/[0.06] hover:border-blue-500/20'
      } ${animating ? 'like-pop' : ''}`}>
        {loading ? (
          <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <ThumbsUp
            className={`w-4 h-4 transition-all ${
              disabled
                ? 'text-slate-700'
                : isLiked
                  ? 'text-blue-400 fill-blue-400'
                  : 'text-slate-500 group-hover/like:text-blue-400'
            }`}
          />
        )}
      </div>
    </button>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface CollegeMatchCardProps {
  college: any
  micrositeData: any
  isProfileComplete?: boolean
}

export default function CollegeMatchCard({
  college, micrositeData, isProfileComplete = false,
}: CollegeMatchCardProps) {
  const params = useParams()
  const slug = params?.slug as string
  const [isOpen, setIsOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null)
  const [recommended, setRecommended] = useState<any[]>([])
  const [loadingMatch, setLoadingMatch] = useState(false)

  // Like state
  const [isLiked, setIsLiked] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const collegeName = college?.college_name || "This College"
  const aboutText: string = college?.about || micrositeData?.about || ""
  const aboutSnippet = aboutText.length > 140 ? aboutText.slice(0, 140).trim() + "…" : aboutText
  const topStreams = extractTopStreams(micrositeData)
  const placement = extractPlacementStats(micrositeData, collegeName)
  const topFee = extractTopStreamFee(micrositeData)

  const hasData = topStreams.length > 0 || placement.highestPackage || placement.averagePackage || topFee
  if (!hasData) return null

  // Check if college is already liked (on mount)
  useEffect(() => {
    if (!isProfileComplete) return
    const checkLike = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setCurrentUserId(user.id)
      const liked = await checkIfLiked(user.id, collegeName)
      setIsLiked(liked)
    }
    checkLike()
  }, [isProfileComplete, collegeName])

  // Fetch profile + compute match + log tool usage when dropdown opens
  useEffect(() => {
    if (!isOpen || !isProfileComplete || matchResult) return

    const run = async () => {
      setLoadingMatch(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Log tool usage (awaited, no duplicates via RPC)
        await logToolUsage(user.id)

        const { data: profile } = await supabase
          .from("admit_profiles")
          .select("name, degree, target_state, budget, city, state, specialization, test_scores")
          .eq("user_id", user.id)
          .single()

        if (!profile) return

        const p: UserProfile = {
          name: profile.name || '',
          degree: profile.degree || '',
          target_state: profile.target_state || [],
          budget: profile.budget || [],
          city: profile.city || '',
          state: profile.state || '',
          specialization: profile.specialization || '',
          test_scores: profile.test_scores || [],
        }
        setUserProfile(p)
        setCurrentUserId(user.id)

        const result = computeMatch(p, college, micrositeData)
        setMatchResult(result)

        // Always fetch recommended colleges
        const targetStates = p.target_state.length > 0
          ? p.target_state
          : [college?.location?.split(',').pop()?.trim()].filter(Boolean)

        let query = supabase
          .from("college_microsites")
          .select("id, slug, college_name, location, microsite_data")
          .neq("id", college.id)
          .limit(12)

        if (targetStates.length > 0) {
          const orFilter = targetStates
            .filter(Boolean)
            .map(s => `location.ilike.%${s}%`)
            .join(",")
          if (orFilter) {
            query = query.or(orFilter)
          }
        }

        const { data: candidates } = await query

        if (candidates && candidates.length > 0) {
          const scored = candidates.map(c => {
            const mData = typeof c.microsite_data === 'string'
              ? JSON.parse(c.microsite_data) : (c.microsite_data || {})
            const cMatch = computeMatch(p, c, mData)
            return {
              slug: c.slug,
              college_name: c.college_name,
              location: c.location || '',
              matchScore: cMatch.score,
            }
          })

          const top = scored
            .filter(c => c.slug !== slug)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 2)

          setRecommended(top)
        }
      } catch (err) {
        console.error("Match computation error:", err)
      } finally {
        setLoadingMatch(false)
      }
    }
    run()
  }, [isOpen, isProfileComplete])

  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!currentUserId || !isProfileComplete) return
    setLikeLoading(true)
    try {
      if (isLiked) {
        await unlikeCollege(currentUserId, collegeName)
        setIsLiked(false)
      } else {
        await likeCollege(currentUserId, collegeName)
        setIsLiked(true)
        // Also log tool usage on like (backup — safe to call multiple times, no duplicates)
        await logToolUsage(currentUserId)
      }
    } catch (err) {
      console.error("Like toggle error:", err)
    } finally {
      setLikeLoading(false)
    }
  }

  return (
    <section className="scroll-mt-28">

      <style jsx>{`
        @keyframes shimmer-slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-bar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(245, 158, 11, 0.08) 40%,
            rgba(245, 158, 11, 0.15) 50%,
            rgba(245, 158, 11, 0.08) 60%,
            transparent 100%
          );
          animation: shimmer-slide 3s ease-in-out infinite;
        }
      `}</style>

      <div className="relative rounded-2xl border border-white/[0.06] bg-[#0a1022] overflow-hidden transition-all duration-500">

        {/* ── COLLAPSED BAR ── */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="shimmer-bar relative w-full text-left px-5 sm:px-6 py-4 flex items-center justify-between gap-4 group/bar cursor-pointer transition-colors hover:bg-white/[0.02]"
        >
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-amber-500 via-amber-500/60 to-transparent" />
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black text-white uppercase tracking-tight leading-snug group-hover/bar:text-amber-400 transition-colors">
                Is this college right for you?
              </h3>
              {!isOpen && aboutSnippet && (
                <p className="text-[10px] text-slate-500 font-medium mt-0.5 truncate max-w-md">
                  {aboutSnippet}
                </p>
              )}
            </div>
          </div>
          <div className={`shrink-0 w-7 h-7 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </button>

        {/* ── EXPANDED CONTENT ── */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1200px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="border-t border-white/[0.04] px-5 sm:px-6 pt-5 pb-6 space-y-5">

            {/* Top Streams + Like Button */}
            {topStreams.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-600">Known For</p>
                  <LikeButton
                    isLiked={isLiked}
                    loading={likeLoading}
                    disabled={!isProfileComplete}
                    onClick={handleLikeToggle}
                  />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {topStreams.map((stream, i) => (
                    <StreamBadge key={stream} name={stream} rank={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div>
              <p className="text-[8px] font-bold uppercase tracking-widest text-slate-600 mb-2">
                {topStreams[0] ? `${topStreams[0]} Numbers` : "Key Numbers"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <StatCard icon={Wallet} label="Fees" value={topFee} iconColor="text-amber-500" />
                <StatCard icon={TrendingUp} label="Highest Pkg" value={placement.highestPackage} iconColor="text-green-500" />
                <StatCard icon={BarChart3} label="Avg Pkg" value={placement.averagePackage} iconColor="text-blue-500" />
                <StatCard icon={Users} label="Placed" value={placement.placementRate} iconColor="text-purple-500" />
              </div>
            </div>

            {/* ── PERSONALIZED SECTION ── */}
            <div className="rounded-xl border border-dashed border-amber-500/15 bg-[#050818]/40 overflow-hidden">

              {isProfileComplete ? (
                <div className="p-4 sm:p-5">

                  {/* Loading state */}
                  {loadingMatch && (
                    <div className="flex items-center justify-center gap-2 py-6">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-slate-400 font-medium">Analyzing your match...</span>
                    </div>
                  )}

                  {/* Match Result */}
                  {matchResult && !loadingMatch && (
                    <div className="space-y-5">

                      {/* Score + Factors */}
                      <div className="flex flex-col sm:flex-row gap-5">
                        <div className="shrink-0 flex justify-center">
                          <ScoreRing score={matchResult.score} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-[8px] font-bold uppercase tracking-widest text-slate-600 mb-2">Match Breakdown</p>
                          {matchResult.factors.map((f, i) => (
                            <FactorRow key={i} {...f} />
                          ))}
                        </div>
                      </div>

                      {/* Status Banner */}
                      {matchResult.score >= 70 ? (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-green-500/[0.06] border border-green-500/10">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-green-400">This college aligns well with your profile</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {matchResult.factors.filter(f => f.positive).map(f => f.label).join(', ')} — looking good for you.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/10">
                          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-amber-400">Partial match — compare with others</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {matchResult.factors.filter(f => !f.positive).map(f => f.label).join(', ')} could be a better fit elsewhere.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Recommended Colleges */}
                      {recommended.length > 0 && (
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-widest text-slate-600 mb-2">
                            {matchResult.score >= 70 ? "Also Great For You" : "Better Matches For You"}
                          </p>
                          <div className="space-y-2">
                            {recommended.map((c) => (
                              <RecommendedCard key={c.slug} college={c} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* ── No profile → Blurred + CTA ── */
                <div className="px-4 py-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <StatCard icon={Sparkles} label="Match" value={null} blurred iconColor="text-amber-500" />
                    <StatCard icon={TrendingUp} label="Career Fit" value={null} blurred iconColor="text-green-500" />
                    <StatCard icon={BarChart3} label="Budget Fit" value={null} blurred iconColor="text-blue-500" />
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <p className="text-[10px] text-slate-500 font-medium">
                      Complete your profile to unlock personalized results
                    </p>
                    <Link
                      href="/profile"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-[#050818] rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-[9px] uppercase tracking-widest shrink-0"
                    >
                      Complete Profile
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  )
}