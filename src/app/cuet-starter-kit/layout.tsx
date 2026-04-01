import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./cuet-starterkit.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CUET Starter Kit | Free Resources",
  description: "Free CUET learning resources: PYQs, cheatsheets, forms, and more.",
};

export default function CuetStarterKitLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className={`${inter.className} cuet-starterkit-root`}>{children}</div>;
}
