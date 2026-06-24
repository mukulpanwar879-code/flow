import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlowForge — Modular Diagram Builder",
  description:
    "A fully modular visual flowchart & diagram builder. Design blocks, edit flow lines, export to JSON / SVG / PNG / HTML. Ready to deploy on Vercel.",
  keywords: ["flowchart", "diagram", "builder", "JSON", "SVG", "Next.js", "Vercel"],
  authors: [{ name: "FlowForge" }],
  openGraph: {
    title: "FlowForge — Modular Diagram Builder",
    description: "Build, document, and render diagrams from JSON.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased bg-background text-foreground`}>
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
