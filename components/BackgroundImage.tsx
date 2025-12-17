import landing from '../public/landing.png'
import Image from 'next/image'
import { motion } from "framer-motion";
import { useAuth } from '../contexts/AuthContext';
import {
  // BookOpen,
  // GraduationCap,
  // Target,
  ArrowRight,
  // Menu,
  // X,
  // ChevronRight,
  // LogOut,
  // User,
} from "lucide-react";
import Link from "next/link";
// BRAND COLORS - Updated to match provided scheme
const primary = "#F59E0B"; // Indigo
const secondary = "#C77808"; // Sky Blue
// const bgDark = "#050818"; // Very Dark Blue/Almost Black
// const accentColor = '#F59E0B';
// const primaryBg = '#050818'; // Very dark navy blue
// const secondaryBg = '#0F172B'; // Slightly lighter navy
// const borderColor = 'rgba(245, 158, 11, 0.15)';
function BackgroundImage() {
  const { user } = useAuth();
  return (
    <div>
        <Image className='relative object-cover h-screen lg:hidden' src={landing} alt='' />
        <div className='Imagetext ml-[5%] absolute top-[80%]'>
        <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm mb-3"
      style={{
        backgroundColor: "rgba(14, 165, 233, 0.1)",
        borderColor: secondary,
      }}
    >
      <span className="relative flex h-2 w-2">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
          style={{ background: secondary }}
        ></span>
        <span
          className="relative inline-flex rounded-full h-2 w-2"
          style={{ background: secondary }}
        ></span>
      </span>
      <span className="text-xs font-bold tracking-wide uppercase" style={{ color: "#f8fafc" }}>
        New: Admit Finder 2.0 is live
      </span>
      <ArrowRight size={12} style={{ color: "#94a3b8" }} />
    </motion.div>
     <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight mb-3 leading-tight whitespace-nowrap sm:whitespace-normal"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          Your Dream MBA College
          <br />
          <span style={{ 
            background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Without the Noise.</span>
        </motion.h1>
          {/* <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="sm:text-lg text-[15px] md:text-xl max-w-lg leading-relaxed mb-4"
                style={{ color: "#94a3b8" }}
              >
                EduNext helps you find the right course, secure scholarships, and
                connect with alumni—all while keeping your data 100% private.
              </motion.p> */}
              {/* <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Link href={user ? "/home" : "/register"}>
        <button
          className="sm:px-8 sm:py-4 p-[15px] font-semibold rounded-full text-lg inline-flex items-center gap-2 cursor-pointer shadow-xl hover:-translate-y-1 transition-all"
          style={{ backgroundColor: primary, color: "white" }}
        >
          {user ? "Go to Dashboard" : "Get Started"}
          <ArrowRight size={20} />
        </button>
      </Link>
    </motion.div> */}
        </div>
    </div>
  )
}

export default BackgroundImage