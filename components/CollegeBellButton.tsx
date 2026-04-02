"use client"
import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Bell, X, CheckCircle2 } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import { supabase } from "../lib/supabase"

interface CollegeBellButtonProps {
  collegeName: string
  isBlurred?: boolean
}

export default function CollegeBellButton({ collegeName, isBlurred = false }: CollegeBellButtonProps) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [hasSubscribed, setHasSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [preference, setPreference] = useState<"email" | "whatsapp" | "both" | "dnd">("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if already subscribed
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const { data } = await supabase
          .from('college_enquiries')
          .select('*')
          .eq('user_id', user!.id)
          .single()
          
        if (data) {
          // Pre-fill user preferences even if they haven't subscribed to THIS college yet
          setPreference(data.notification_preference)
          setEmail(data.contact_email || "")
          setPhone(data.contact_phone || "")

          let parsedColleges: string[] = []
          if (data.colleges) {
            try {
              parsedColleges = JSON.parse(data.colleges)
            } catch {
              // Backward compatibility for old comma separated strings
              parsedColleges = data.colleges.split(',').map((c: string) => c.trim())
            }
          }

          if (parsedColleges.includes(collegeName)) {
            setHasSubscribed(true)
          }
        }
      } catch {
        // Ignore PG error for no rows
      }
    }

    if (user && collegeName) {
      checkSubscription()
    }
  }, [user, collegeName])

  const handleOpen = async () => {
    if (isBlurred) return;
    setIsOpen(true)
    setSubmitSuccess(false)
    if (!hasSubscribed) {
      if (user?.email && !email) setEmail(user.email)
      
      // Fetch phone from admit_profiles if available and not yet set
      if (user && !phone) {
        try {
          const { data } = await supabase
            .from('admit_profiles')
            .select('phone')
            .eq('user_id', user.id)
            .single()
          if (data && data.phone) {
            setPhone(data.phone)
          }
        } catch {
          // Ignore
        }
      }
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (user) {
        // Fetch existing record first
        const { data: existingData } = await supabase
          .from('college_enquiries')
          .select('colleges')
          .eq('user_id', user.id)
          .single()

        let collegeArray: string[] = []
        if (existingData?.colleges) {
          try {
            collegeArray = JSON.parse(existingData.colleges)
          } catch {
            collegeArray = existingData.colleges.split(',').map((c: string) => c.trim())
          }
        }

        if (!collegeArray.includes(collegeName)) {
          collegeArray.push(collegeName)
        }
        const updatedColleges = JSON.stringify(collegeArray)

        const payload = {
          user_id: user.id,
          contact_email: email,
          contact_phone: phone,
          notification_preference: preference,
          colleges: updatedColleges
        }

        if (existingData) {
          await supabase.from('college_enquiries').update(payload).eq('user_id', user.id)
        } else {
          await supabase.from('college_enquiries').insert([payload])
        }
      } else {
        // Fallback for non-logged-in users
        const payload = {
          contact_email: email,
          contact_phone: phone,
          notification_preference: preference,
          colleges: JSON.stringify([collegeName])
        }
        await supabase.from('college_enquiries').insert([payload])
      }
      
      setHasSubscribed(true)
      setSubmitSuccess(true)
      setTimeout(() => setIsOpen(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={isBlurred}
        className={`transition-all flex-shrink-0 transform hover:scale-110 active:scale-95 ${
          isBlurred ? "opacity-50 cursor-not-allowed text-slate-500" :
          hasSubscribed ? "text-[#F59E0B]" : "text-slate-500 hover:text-white"
        }`}
        title={hasSubscribed ? "Subscribed to updates" : "Get important updates"}
      >
        <Bell 
          size={18} 
          className={`sm:w-5 sm:h-5 ${hasSubscribed ? 'fill-current animate-pulse' : ''}`} 
        />
      </button>

      {isOpen && mounted && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="w-full max-w-md p-6 rounded-2xl shadow-2xl relative"
            style={{ backgroundColor: '#0F172B', border: '1px solid rgba(245, 158, 11, 0.2)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 size={48} className="text-green-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Saved Successfully!</h3>
                <p className="text-slate-400 text-sm">We&apos;ll keep you updated about {collegeName}</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-4 pr-6 leading-tight">
                  Get important updates and complete information of {collegeName}
                </h3>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      How would you like us to notify you?
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {(['email', 'whatsapp', 'both', 'dnd'] as const).map(opt => (
                        <label 
                          key={opt}
                          className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                            preference === opt 
                              ? 'border-[#F59E0B] bg-[#F59E0B]/10 text-white' 
                              : 'border-slate-700 bg-transparent text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="preference" 
                            value={opt}
                            checked={preference === opt}
                            onChange={(e) => setPreference(e.target.value as "email" | "whatsapp" | "both" | "dnd")}
                            className="mr-2 accent-[#F59E0B]"
                          />
                          {opt.charAt(0).toUpperCase() + opt.slice(1).replace('Dnd', 'DND (Do Not Disturb)')}
                        </label>
                      ))}
                    </div>
                  </div>

                  {preference !== 'dnd' && (
                    <div className="space-y-3">
                      {(preference === 'email' || preference === 'both') && (
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 bg-[#050818] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#F59E0B] transition-colors"
                          />
                        </div>
                      )}
                      
                      {(preference === 'whatsapp' || preference === 'both') && (
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">WhatsApp Number</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter your WhatsApp number"
                            className="w-full px-4 py-2 bg-[#050818] border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#F59E0B] transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-[#050818] rounded-lg p-3 border border-slate-800">
                    <p className="text-xs text-slate-400 text-center">
                      <span className="text-[#F59E0B]">Note:</span> Within up to 7 days you will get the updates from us.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex-1 py-2.5 rounded-lg border border-slate-600 text-slate-300 font-medium hover:bg-slate-800 transition-colors text-sm"
                    >
                      Exit
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || (preference !== 'dnd' && !email && !phone)}
                      className="flex-1 py-2.5 rounded-lg bg-[#F59E0B] text-white font-bold hover:bg-[#d97706] transition-colors disabled:opacity-50 text-sm shadow-lg shadow-amber-900/20"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
