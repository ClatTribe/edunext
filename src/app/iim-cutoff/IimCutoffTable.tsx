"use client"
import { useMemo, useState } from "react"
import Link from "next/link"
import { IIM_CATEGORIES, IIM_CUTOFFS, type IimCategory } from "../../../lib/iimCutoffs"

type SortKey = "overall" | "name"

const PROCESS_STYLE: Record<string, string> = {
  Own: "border-slate-700 text-slate-300",
  CAP: "border-sky-500/40 text-sky-300",
  JAP: "border-emerald-500/40 text-emerald-300",
}

function fmt(v: number | null | undefined, empty: string) {
  return v === null || v === undefined ? empty : String(v)
}

export default function IimCutoffTable() {
  const [category, setCategory] = useState<IimCategory>("General")
  const [sort, setSort] = useState<SortKey>("overall")

  const rows = useMemo(() => {
    const list = IIM_CUTOFFS.map((iim) => ({ iim, c: iim.cutoffs[category] }))
    if (sort === "name") return list.sort((a, b) => a.iim.name.localeCompare(b.iim.name))
    return list.sort((a, b) => (b.c?.overall ?? -1) - (a.c?.overall ?? -1) || a.iim.name.localeCompare(b.iim.name))
  }, [category, sort])

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choose category">
        {IIM_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            aria-pressed={cat === category}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${cat === category ? "bg-amber-400 text-black border-amber-400" : "border-slate-700 hover:border-amber-400"}`}
          >
            {cat}
          </button>
        ))}
        <span className="mx-1 hidden sm:inline text-slate-700">|</span>
        <label htmlFor="iim-sort" className="text-xs text-slate-500">Sort</label>
        <select
          id="iim-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
        >
          <option value="overall">Highest cutoff first</option>
          <option value="name">IIM name (A to Z)</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="text-left p-3">IIM</th>
              <th className="text-right p-3">Overall</th>
              <th className="text-right p-3">VARC</th>
              <th className="text-right p-3">DILR</th>
              <th className="text-right p-3">QA</th>
              <th className="text-left p-3">Process</th>
              <th className="text-left p-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ iim, c }) => (
              <tr key={iim.slug} className="border-t border-slate-800 align-top hover:bg-amber-400/[0.04]">
                <td className="p-3">
                  <Link href={`/college/${iim.slug}/cutoff`} className="text-white font-medium hover:text-amber-400">
                    {iim.name}
                  </Link>
                  {iim.note && <div className="text-xs text-slate-500 mt-0.5">{iim.note}</div>}
                </td>
                <td className="p-3 text-right text-amber-400 font-semibold tabular-nums whitespace-nowrap">
                  {c ? fmt(c.overall, "No overall min.") : "Not stated"}
                </td>
                <td className="p-3 text-right tabular-nums">{c ? fmt(c.varc, "None") : "–"}</td>
                <td className="p-3 text-right tabular-nums">{c ? fmt(c.dilr, "None") : "–"}</td>
                <td className="p-3 text-right tabular-nums">{c ? fmt(c.qa, "None") : "–"}</td>
                <td className="p-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full border text-xs ${PROCESS_STYLE[iim.process]}`}>{iim.process}</span>
                </td>
                <td className="p-3 text-xs text-slate-400 whitespace-nowrap">
                  {iim.cycle}
                  {!iim.official && <div className="text-amber-400/80">Reported</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Minimum CAT percentile ({category} category) needed to be considered for shortlisting. &quot;None&quot; means the IIM sets no sectional minimum.
        Tap an IIM for its full cutoff page.
      </p>
    </div>
  )
}
