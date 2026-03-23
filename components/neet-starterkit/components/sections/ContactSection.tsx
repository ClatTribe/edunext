"use client";
import React from "react";
 
const ContactPage = () => {
  const whatsappNumber = '918303865139'; // Remove space for wa.me link
  const phoneNumber = '+91 8303865139';
  const email = 'edunextweb@gmail.com';
 
  const handleWhatsApp = () => {
    window.open(`https://wa.me/${whatsappNumber}`, '_blank');
  };
 
  const handleWhatsAppGroup = () => {
    // FIXED: Changed from wa.me/message to chat.whatsapp.com for group links
    window.open(`https://chat.whatsapp.com/LJ2NZB6P6VPOL1`, '_blank');
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 md:pt-20" style={{ backgroundColor: "#020617" }}>
      <div className="max-w-6xl w-full">
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 md:p-12 lg:p-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            
            {/* LEFT SIDE - Social & WhatsApp Group */}
            <div className="text-center space-y-6 sm:space-y-8">
              
              {/* Social Icons */}
              <div className="flex justify-center gap-4 sm:gap-6">
                <a 
                  href="https://www.youtube.com/@Get_EduNext" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-center hover:scale-110 transition-all hover:bg-slate-700 hover:border-[#F59E0B]"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
 
                <a 
                  href="https://www.instagram.com/get_edunext/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-center hover:scale-110 transition-all hover:bg-slate-700 hover:border-[#F59E0B]"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
 
                <button 
                  onClick={handleWhatsApp}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-800/50 border border-slate-700 rounded-lg flex items-center justify-center hover:scale-110 transition-all hover:bg-slate-700 hover:border-[#25D366]"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </button>
              </div>
 
              {/* WhatsApp Icon Large */}
              <div className="flex justify-center">
                <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-lg">
                  <img 
                    src="/whatsapp.jpeg" 
                    alt="WhatsApp QR Code" 
                    className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg"
                    style={{ objectFit: 'cover', objectPosition: '50% 65%' }}
                  />
                </div>
              </div>
 
              {/* Description */}
              {/* <div className="space-y-1 sm:space-y-2 px-4">
                <p className="text-slate-400 text-base sm:text-lg">
                  Stay updated on anything related to IPMAT/BBA Entrance Exams & get access to various free resources and mentorship.
                </p>
              </div> */}
 
              {/* Join WhatsApp Group Button */}
              <button
                onClick={handleWhatsAppGroup}
                className="w-full sm:w-auto bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#fbbf24] hover:to-[#F59E0B] text-slate-950 font-semibold px-6 sm:px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                Join Our Community
              </button>
 
            </div>
 
            {/* RIGHT SIDE - Contact Info */}
            <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-8">
              
              {/* Interested Button */}
              <button
                onClick={handleWhatsApp}
                className="w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#fbbf24] hover:to-[#F59E0B] text-slate-950 font-bold text-lg sm:text-xl py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Interested? WhatsApp Us
              </button>
 
              {/* Phone Number */}
              <div className="text-center">
                <a 
                  href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                  className="text-2xl sm:text-3xl font-bold text-white hover:text-[#F59E0B] transition-colors break-all"
                >
                  {phoneNumber}
                </a>
              </div>
 
              {/* Email */}
              <div className="text-center space-y-2 px-2">
                <a 
                  href={`mailto:${email}`}
                  className="text-lg sm:text-2xl font-semibold text-white hover:text-[#F59E0B] transition-colors break-all block"
                >
                  {email}
                </a>
                <p className="text-slate-400 text-base sm:text-lg">
                  Email us for any queries
                </p>
              </div>
 
            </div>
 
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default ContactPage;