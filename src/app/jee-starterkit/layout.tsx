import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./jee-starterkit.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JEE Starter Kit | Free Resources",
  description: "Free JEE learning resources: PYQs, cheatsheets, forms, and more.",
};

export default function JeeStarterKitLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${inter.className} jee-starterkit-root`}>{children}</div>
  );
}

