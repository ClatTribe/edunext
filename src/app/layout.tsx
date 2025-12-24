import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../../contexts/AuthContext";
import Script from "next/script"; // 1. Import the Script component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EduNext - Indian Colleges Platform",
  description: "Find Your Perfect College, scholarships, and connect with admits",
  icons: {
    icon: [
      { url: '/Edu.png', sizes: '48x48', type: 'image/png' },
      { url: '/Edu.png', sizes: '32x32', type: 'image/png' },
      { url: '/Edu.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/Edu.png',
    shortcut: '/Edu.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* 2. Microsoft Clarity Tracking Script */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="www.clarity.ms"+i;
                y=l.getElementsByTagName(r);y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "uqf0klyal7");
          `}
        </Script>

        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
