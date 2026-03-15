import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Anil Khanna | Senior Full Stack Developer",
  description:
    "Portfolio of Anil Khanna — Senior Full Stack Developer with 14+ years of experience. Expert in iOS, Flutter, React, Next.js, .NET Core, and cloud technologies.",
  keywords: [
    "Anil Khanna",
    "Senior Full Stack Developer",
    "iOS Developer",
    "Flutter Developer",
    "React",
    "Next.js",
    "Swift",
    "TypeScript",
    "Node.js",
    "Dotnet Core",
    "Portfolio",
  ],
  authors: [{ name: "Anil Khanna" }],
  creator: "Anil Khanna",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Anil Khanna | Senior Full Stack Developer",
    description:
      "Portfolio of Anil Khanna — Senior Full Stack Developer with 14+ years of experience in mobile & web technologies.",
    siteName: "Anil Khanna Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anil Khanna | Senior Full Stack Developer",
    description:
      "Portfolio of Anil Khanna — Senior Full Stack Developer with 14+ years of experience.",
    creator: "@anilkhanna",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Anil Khanna",
    jobTitle: "Senior Full Stack Developer",
    url: "https://anilkhanna.dev",
    sameAs: [
      "https://www.linkedin.com/in/anil-khanna-07299b23/",
    ],
    knowsAbout: [
      "iOS Development",
      "Flutter",
      "Swift",
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "C#",
      "Dotnet Core",
      "PostgreSQL",
      "MongoDB",
      "Docker",
      "AWS",
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          {children}
          <CustomCursor />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
