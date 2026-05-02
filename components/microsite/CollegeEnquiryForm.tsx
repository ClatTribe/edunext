"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Loader2 } from 'lucide-react'

interface CollegeEnquiryFormProps {
  collegeName?: string
  pageSource: string
  title?: React.ReactNode
}

export default function CollegeEnquiryForm({ collegeName = 'BLOG', pageSource, title }: CollegeEnquiryFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [fullUrl, setFullUrl] = useState(pageSource)

  useEffect(() => {
    // Optionally grab the full window.location.href to know exactly which sub-tab they were on
    if (typeof window !== 'undefined') {
      setFullUrl(window.location.href)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) return

    setStatus('loading')

    try {
      const { error } = await supabase
        .from('microsite_form')
        .insert([
          {
            college_name: collegeName,
            page_source: fullUrl,
            name,
            contact_number: phone,
          }
        ])

      if (error) throw error

      setStatus('success')
      setName('')
      setPhone('')
      
      // Optional: reset success message after some time
      setTimeout(() => setStatus('idle'), 5000)
    } catch (error) {
      console.error('Error submitting enquiry:', error)
      setStatus('error')
    }
  }

  return (
    <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-5 mb-6 shadow-xl relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/50 via-amber-400 to-amber-500/50" />

      <h3 className="text-lg font-bold text-slate-200 mb-2 break-words leading-tight">
        {title ? title : <>Interested in <span className="text-amber-400">{collegeName}</span>?</>}
      </h3>
      <p className="text-xs text-slate-400 mb-5">
        Leave your details and our counselors will reach out to you shortly.
      </p>

      {status === 'success' ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-lg text-sm text-center">
          Thank you! We'll get in touch with you soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : (
              'Enquire Now'
            )}
          </button>

          {status === 'error' && (
            <p className="text-xs text-red-400 text-center mt-2">
              Something went wrong. Please try again.
            </p>
          )}
        </form>
      )}
    </div>
  )
}
