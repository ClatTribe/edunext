import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../../contexts/AuthContext";

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
      { url: '/favion.png', sizes: '48x48', type: 'image/png' },
      { url: '/favion.png', sizes: '32x32', type: 'image/png' },
      { url: '/favion.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favion.png',
    shortcut: '/favion.png',
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
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
