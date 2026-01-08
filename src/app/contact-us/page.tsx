"use client";
import React from "react";
import { motion } from "framer-motion";
import { 
  Phone, 
  MessageCircle, 
  Instagram, 
  Youtube, 
  Mail, 
  Clock 
} from "lucide-react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

const bgDark = "#050818";

const ContactPage = () => {
  const phoneNumber = "918299470392";
  const displayPhone = "+91 82994 70392";
  
  const contactMethods = [
    {
      icon: <Phone className="text-white" size={24} />,
      title: "Call Us",
      value: displayPhone,
      label: "Direct Expert Line",
      color: "from-blue-600 to-blue-700",
      link: `tel:${phoneNumber}`,
    },
    {
      icon: <MessageCircle className="text-white" size={24} />,
      title: "WhatsApp",
      value: "Chat with Us",
      label: "Instant Guidance",
      color: "from-green-500 to-green-600",
      link: `https://wa.me/${phoneNumber}`,
    },
    {
      icon: <Instagram className="text-white" size={24} />,
      title: "Instagram",
      value: "@get_edunext",
      label: "Latest MBA Updates",
      color: "from-pink-500 to-rose-600",
      link: "https://www.instagram.com/get_edunext?igsh=OHl4eWV2dWlyenEz",
    },
    {
      icon: <Youtube className="text-white" size={24} />,
      title: "YouTube",
      value: "EduNext Shorts",
      label: "Watch Success Stories",
      color: "from-red-600 to-red-700",
      link: "https://youtube.com/shorts/Mq8BNMVtW0Y?feature=shared",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: bgDark }}>
      <Navbar />

      <main className="flex-grow pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Decorative Background Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-amber-500/10 blur-[120px] rounded-full" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <div className="text-center mb-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 mb-6"
            >
              Connect with EduNext
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-lg max-w-2xl mx-auto"
            >
              Stop crashing into confusion. Get expert guidance for your dream MBA college with our three-click promise.
            </motion.p>
          </div>

          {/* Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactMethods.map((method, idx) => (
              <motion.a
                key={idx}
                href={method.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-amber-500/50 transition-all duration-300 overflow-hidden"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${method.color} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-xl`}>
                  {method.icon}
                </div>
                <h3 className="text-white font-bold text-xl mb-1">{method.title}</h3>
                <p className="text-amber-500 font-semibold mb-2">{method.value}</p>
                <p className="text-gray-500 text-sm">{method.label}</p>
                
                {/* Subtle Glow Effect */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
              </motion.a>
            ))}
          </div>

          {/* Bottom Info Section */}
          {/* <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl flex items-center gap-6 group hover:bg-white/[0.07] transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Clock size={28} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Response Time</h4>
                <p className="text-gray-400">9:00 AM - 7:00 PM</p>
                <p className="text-amber-500/70 text-sm font-medium">Average reply: Under 15 mins</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl flex items-center gap-6 group hover:bg-white/[0.07] transition-colors"
            >
              <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                <Mail size={28} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg">Official Email</h4>
                <p className="text-gray-400">contact@edunext.in</p>
                <p className="text-gray-500 text-sm italic">No spam, just solutions.</p>
              </div>
            </motion.div>
          </div> */}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ContactPage;