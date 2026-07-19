import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClassShare — Classroom Presentation Manager",
  description: "Scan QR, upload presentations instantly. Modern classroom file management system.",
  icons: {
    icon: "/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "ClassShare",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
        <meta name="apple-mobile-web-app-title" content="ClassShare" />
      </head>
      <body className="antialiased min-h-screen bg-[#f8f9ff] dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-100 selection:bg-violet-500/30">
        {children}
        <script dangerouslySetInnerHTML={{
          __html: `if("serviceWorker" in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("/sw.js").catch(()=>{})})}`,
        }} />
      </body>
    </html>
  );
}
