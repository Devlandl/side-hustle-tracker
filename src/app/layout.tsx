import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import InstallPrompt from "@/components/InstallPrompt";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://hustletracker.tvrapp.app"),
  title: {
    default: "Side Hustle Tracker - Track Every Dollar From Every Hustle",
    template: "%s | Side Hustle Tracker",
  },
  description:
    "Track income across multiple side hustles, log expenses, estimate quarterly taxes, and hit your earnings goals. One-time purchase, no subscriptions.",
  keywords: [
    "side hustle tracker",
    "income tracker",
    "expense tracker",
    "freelance income",
    "gig worker taxes",
    "quarterly tax calculator",
    "side hustle app",
  ],
  authors: [{ name: "TVR App Store" }],
  creator: "TVR App Store",
  publisher: "TVR App Store",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hustletracker.tvrapp.app",
    siteName: "Side Hustle Tracker",
    title: "Side Hustle Tracker - Track Every Dollar From Every Hustle",
    description:
      "Track income across multiple side hustles, log expenses, estimate quarterly taxes, and hit your earnings goals.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Side Hustle Tracker - Track Every Dollar From Every Hustle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Side Hustle Tracker - Track Every Dollar From Every Hustle",
    description:
      "Track income across multiple side hustles, log expenses, estimate quarterly taxes, and hit your earnings goals.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} bg-brand-black text-brand-white`}>
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <InstallPrompt />
        <script dangerouslySetInnerHTML={{ __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js'); }); }` }} />
      </body>
    </html>
  );
}
