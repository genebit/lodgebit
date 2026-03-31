import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";
import PaceLoader from "@/components/PaceLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s - Lodgebit",
    default: "Lodgebit",
  },
  description: "Multi-Residence Booking Management Platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lodgebit",
  },
  icons: {
    icon: [
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/favicon.ico" },
    ],
    apple: "/favicon/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        {/* Apply theme synchronously before first paint — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');})();`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} font-sans antialiased`} suppressHydrationWarning>
        {/* Preloader overlay — hides theme/render flash on load */}
        <div
          id="page-preloader"
          suppressHydrationWarning
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            backgroundColor: "#060d18",
            transition: "opacity 0.25s ease",
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){function hide(){var el=document.getElementById('page-preloader');if(!el)return;el.style.opacity='0';el.style.pointerEvents='none';}if(document.readyState==='complete'){requestAnimationFrame(function(){requestAnimationFrame(hide);});}else{window.addEventListener('load',function(){requestAnimationFrame(function(){requestAnimationFrame(hide);});});}})();`,
          }}
        />
        <PaceLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
