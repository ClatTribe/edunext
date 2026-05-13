"use client"

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Loader2, Download, CheckCircle2, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CollegeEnquiryFormProps {
  collegeName?: string
  pageSource: string
  title?: React.ReactNode
  pdfUrl?: string
}

export default function CollegeEnquiryForm({ collegeName = 'BLOG', pageSource, title, pdfUrl }: CollegeEnquiryFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [course, setCourse] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [fullUrl, setFullUrl] = useState(pageSource)
  const [isDownloaded, setIsDownloaded] = useState(false)

  useEffect(() => {
    // Optionally grab the full window.location.href to know exactly which sub-tab they were on
    if (typeof window !== 'undefined') {
      setFullUrl(window.location.href)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !course) return

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
            course,
          }
        ])

      if (error) throw error

      setStatus('success')
      setName('')
      setPhone('')
      setCourse('')
      
      // If no PDF URL, reset status after 5s
      if (!pdfUrl) {
        setTimeout(() => setStatus('idle'), 5000)
      }
    } catch (error) {
      console.error('Error submitting enquiry:', error)
      setStatus('error')
    }
  }

  const handleDownload = () => {
    if (!pdfUrl) return
    
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${collegeName}_Brochure.pdf`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setIsDownloaded(true)
    setTimeout(() => setIsDownloaded(false), 3000)
  }

  return (
    <div className="bg-[#0a0a0f] border border-white/10 rounded-xl p-5 mb-6 shadow-xl relative overflow-hidden min-h-[300px] flex flex-col">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/50 via-amber-400 to-amber-500/50" />

      <AnimatePresence mode="wait">
        {status === 'success' && pdfUrl ? (
          <motion.div
            key="brochure"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-4"
          >
            <div className="w-16 h-20 bg-amber-500/10 border-2 border-amber-500/30 rounded-lg flex items-center justify-center relative group">
              <FileText className="w-8 h-8 text-amber-500" />
              <div className="absolute -top-2 -right-2 bg-emerald-500 rounded-full p-1 shadow-lg">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-200">
                {collegeName} Brochure
              </h3>
              <p className="text-xs text-slate-400 px-4">
                Thank you for your interest! You can now download the official brochure.
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="w-full mt-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg py-3 text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
            >
              <Download size={16} />
              Download Brochure
            </button>

            {isDownloaded && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[10px] text-emerald-400 font-medium"
              >
                Brochure downloaded successfully!
              </motion.p>
            )}
          </motion.div>
        ) : status === 'success' ? (
          <motion.div
            key="success-msg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center py-10"
          >
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-xl text-sm text-center w-full">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-3 opacity-80" />
              <p className="font-bold mb-1">Submission Successful!</p>
              <p className="text-emerald-400/70 text-xs">Thank you! We'll get in touch with you soon.</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h3 className="text-lg font-bold text-slate-200 mb-2 break-words leading-tight">
              {title ? title : <>Interested in <span className="text-amber-400">{collegeName}</span>?</>}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Leave your details and our counselors will reach out to you shortly.
            </p>

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
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Course</label>
                <select
                  required
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors"
                >
                  <option value="" disabled className="bg-[#0a0a0f] text-slate-400">Select a course</option>
                  <option value="MBA" className="bg-[#0a0a0f] text-slate-200">MBA</option>
                  <option value="B.Tech" className="bg-[#0a0a0f] text-slate-200">B.Tech</option>
                  <option value="MBBS" className="bg-[#0a0a0f] text-slate-200">MBBS</option>
                  <option value="BBA" className="bg-[#0a0a0f] text-slate-200">BBA</option>
                  <option value="B.Sc" className="bg-[#0a0a0f] text-slate-200">B.Sc</option>
                  <option value="Other" className="bg-[#0a0a0f] text-slate-200">Other</option>
                </select>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

