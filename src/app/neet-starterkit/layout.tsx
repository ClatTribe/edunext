import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./neet-starterkit.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEET Starter Kit | Free Resources",
  description: "Free NEET learning resources: PYQs, cheatsheets, forms, and more.",
};

export default function NeetStarterKitLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={`${inter.className} neet-starterkit-root`}>{children}</div>;
}

