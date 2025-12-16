// "use client";
// import React, { useEffect, useState } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { supabase } from '../lib/supabase';
// import { X, Phone, MapPin, CheckCircle2, Loader2 } from 'lucide-react';

// // Color scheme matching the college compare page
// const accentColor = '#F59E0B';
// const primaryBg = '#050818'; // Very dark navy blue
// const secondaryBg = '#0F172B'; // Slightly lighter navy
// const borderColor = 'rgba(245, 158, 11, 0.15)';


// const CONTACT_OPTIONS = [
//   { value: "WhatsApp", label: "WhatsApp", icon: "💬" },
//   { value: "Email", label: "Email", icon: "📧" },
//   { value: "Calling", label: "Phone Call", icon: "📞" },
//   { value: "LinkedIn", label: "LinkedIn", icon: "💼" },
// ];

// const LeadDataPopup = () => {
//   const { user, loading: authLoading } = useAuth();
//   const [showPopup, setShowPopup] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [userName, setUserName] = useState('');
  
//   const [formData, setFormData] = useState({
//     city: '',
//     phone: '',
//     contact_preferences: [] as string[],
//   });

//   const [errors, setErrors] = useState({
//     city: '',
//     phone: '',
//     contact_preferences: '',
//   });

//   useEffect(() => {
//     const checkLeadData = async () => {
//       if (!user || authLoading) return;

//       try {
//         setLoading(true);

//         // Check if lead data already exists
//         const { data: existingLead, error: leadError } = await supabase
//           .from('lead_data')
//           .select('id')
//           .eq('user_id', user.id)
//           .single();

//         if (leadError && leadError.code !== 'PGRST116') {
//           console.error('Error checking lead data:', leadError);
//         }

//         // If lead data exists, don't show popup
//         if (existingLead) {
//           setShowPopup(false);
//           setLoading(false);
//           return;
//         }

//         // Fetch user name from profiles table
//         const { data: profile, error: profileError } = await supabase
//           .from('profiles')
//           .select('full_name')
//           .eq('id', user.id)
//           .single();

//         if (profileError) {
//           console.error('Error fetching profile:', profileError);
//           // Fallback to user metadata
//           setUserName(
//             user.user_metadata?.full_name || 
//             user.user_metadata?.name || 
//             user.email?.split('@')[0] || 
//             'User'
//           );
//         } else {
//           setUserName(profile?.full_name || 'User');
//         }

//         // Show popup if no lead data exists
//         setShowPopup(true);
//         setLoading(false);
//       } catch (err) {
//         console.error('Error in checkLeadData:', err);
//         setLoading(false);
//       }
//     };

//     checkLeadData();
//   }, [user, authLoading]);

//   const validateForm = () => {
//     const newErrors = {
//       city: '',
//       phone: '',
//       contact_preferences: '',
//     };

//     let isValid = true;

//     if (!formData.city.trim()) {
//       newErrors.city = 'City is required';
//       isValid = false;
//     }

//     if (!formData.phone.trim()) {
//       newErrors.phone = 'Phone number is required';
//       isValid = false;
//     } else if (!/^[0-9+\-() ]{10,}$/.test(formData.phone.trim())) {
//       newErrors.phone = 'Please enter a valid phone number';
//       isValid = false;
//     }

//     if (formData.contact_preferences.length === 0) {
//       newErrors.contact_preferences = 'Please select at least one contact preference';
//       isValid = false;
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) {
//       return;
//     }

//     try {
//       setSubmitting(true);

//       const { error } = await supabase
//         .from('lead_data')
//         .insert({
//           user_id: user!.id,
//           name: userName,
//           city: formData.city.trim(),
//           phone: formData.phone.trim(),
//           contact_preferences: formData.contact_preferences,
//         });

//       if (error) {
//         console.error('Error saving lead data:', error);
//         alert('Failed to save data. Please try again.');
//         return;
//       }

//       // Success - hide popup
//       setShowPopup(false);
//     } catch (err) {
//       console.error('Error:', err);
//       alert('An error occurred. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleContactPreferenceToggle = (value: string) => {
//     setFormData(prev => ({
//       ...prev,
//       contact_preferences: prev.contact_preferences.includes(value)
//         ? prev.contact_preferences.filter(v => v !== value)
//         : [...prev.contact_preferences, value]
//     }));
    
//     // Clear error when user makes a selection
//     if (errors.contact_preferences) {
//       setErrors(prev => ({ ...prev, contact_preferences: '' }));
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       handleSubmit();
//     }
//   };

//   // Don't render anything while checking auth or loading
//   if (authLoading || loading || !showPopup) {
//     return null;
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
//       <div 
//         className="rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-xl"
//         style={{ backgroundColor: secondaryBg, border: `1px solid ${borderColor}` }}
//       >
//         {/* Header */}
//         <div 
//           className="p-6 rounded-t-2xl"
//           style={{ background: `linear-gradient(135deg, ${accentColor}, #8b5cf6)` }}
//         >
//           <div className="flex items-center justify-center mb-2">
//             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
//               <CheckCircle2 style={{ color: accentColor }} size={32} />
//             </div>
//           </div>
//           <h2 className="text-2xl font-bold text-white text-center mb-1">
//             Welcome, {userName.split(' ')[0]}! 👋
//           </h2>
//           <p className="text-blue-100 text-center text-sm">
//             Let's complete your profile to get started
//           </p>
//         </div>

//         {/* Form */}
//         <div className="p-6">
//           <div className="space-y-5">
//             {/* Name (Read-only) */}
//             <div>
//               <label className="block text-sm font-semibold text-slate-300 mb-2">
//                 Your Name
//               </label>
//               <div 
//                 className="rounded-lg px-4 py-3 text-white"
//                 style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', border: `2px solid ${borderColor}` }}
//               >
//                 {userName}
//               </div>
//             </div>

//             {/* City */}
//             <div>
//               <label className="block text-sm font-semibold text-slate-300 mb-2">
//                 City <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
//                 <input
//                   type="text"
//                   value={formData.city}
//                   onChange={(e) => {
//                     setFormData(prev => ({ ...prev, city: e.target.value }));
//                     if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
//                   }}
//                   onKeyPress={handleKeyPress}
//                   placeholder="Enter your city"
//                   className={`w-full pl-11 pr-4 py-3 rounded-lg focus:outline-none transition-all text-white placeholder:text-slate-500`}
//                   style={{ 
//                     backgroundColor: primaryBg,
//                     border: errors.city ? '2px solid #ef4444' : `2px solid ${borderColor}`
//                   }}
//                   onFocus={(e) => !errors.city && (e.target.style.border = `2px solid ${accentColor}`)}
//                   onBlur={(e) => !errors.city && (e.target.style.border = `2px solid ${borderColor}`)}
//                 />
//               </div>
//               {errors.city && (
//                 <p className="text-red-400 text-xs mt-1 ml-1">{errors.city}</p>
//               )}
//             </div>

//             {/* Phone */}
//             <div>
//               <label className="block text-sm font-semibold text-slate-300 mb-2">
//                 Contact Number <span className="text-red-400">*</span>
//               </label>
//               <div className="relative">
//                 <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
//                 <input
//                   type="tel"
//                   value={formData.phone}
//                   onChange={(e) => {
//                     setFormData(prev => ({ ...prev, phone: e.target.value }));
//                     if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
//                   }}
//                   onKeyPress={handleKeyPress}
//                   placeholder="+91 XXXXX XXXXX"
//                   className={`w-full pl-11 pr-4 py-3 rounded-lg focus:outline-none transition-all text-white placeholder:text-slate-500`}
//                   style={{ 
//                     backgroundColor: primaryBg,
//                     border: errors.phone ? '2px solid #ef4444' : `2px solid ${borderColor}`
//                   }}
//                   onFocus={(e) => !errors.phone && (e.target.style.border = `2px solid ${accentColor}`)}
//                   onBlur={(e) => !errors.phone && (e.target.style.border = `2px solid ${borderColor}`)}
//                 />
//               </div>
//               {errors.phone && (
//                 <p className="text-red-400 text-xs mt-1 ml-1">{errors.phone}</p>
//               )}
//             </div>

//             {/* Contact Preferences */}
//             <div>
//               <label className="block text-sm font-semibold text-slate-300 mb-2">
//                 How would you like us to contact you? <span className="text-red-400">*</span>
//               </label>
//               <div className="grid grid-cols-2 gap-2">
//                 {CONTACT_OPTIONS.map((option) => (
//                   <button
//                     key={option.value}
//                     type="button"
//                     onClick={() => handleContactPreferenceToggle(option.value)}
//                     className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium flex items-center justify-center gap-2`}
//                     style={
//                       formData.contact_preferences.includes(option.value)
//                         ? {
//                             borderColor: accentColor,
//                             backgroundColor: 'rgba(99, 102, 241, 0.2)',
//                             color: accentColor,
//                           }
//                         : {
//                             borderColor: borderColor,
//                             backgroundColor: primaryBg,
//                             color: '#cbd5e1',
//                           }
//                     }
//                     onMouseEnter={(e) => {
//                       if (!formData.contact_preferences.includes(option.value)) {
//                         e.currentTarget.style.borderColor = accentColor
//                       }
//                     }}
//                     onMouseLeave={(e) => {
//                       if (!formData.contact_preferences.includes(option.value)) {
//                         e.currentTarget.style.borderColor = borderColor
//                       }
//                     }}
//                   >
//                     <span>{option.icon}</span>
//                     <span>{option.label}</span>
//                   </button>
//                 ))}
//               </div>
//               {errors.contact_preferences && (
//                 <p className="text-red-400 text-xs mt-1 ml-1">{errors.contact_preferences}</p>
//               )}
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button
//             onClick={handleSubmit}
//             disabled={submitting}
//             className="w-full mt-6 text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90"
//             style={{ background: accentColor }}
//           >
//             {submitting ? (
//               <>
//                 <Loader2 className="animate-spin" size={20} />
//                 Saving...
//               </>
//             ) : (
//               <>
//                 <CheckCircle2 size={20} />
//                 Complete Profile
//               </>
//             )}
//           </button>

//           <p className="text-xs text-slate-400 text-center mt-4">
//             This information helps us provide you with personalized recommendations
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LeadDataPopup;