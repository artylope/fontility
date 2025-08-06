import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@/components/analytics";
import ErrorBoundary from "@/components/error-boundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fontility - Beautiful Font Pair Generator",
  description: "Stand out from the crowd. Find your perfect font pairs.",
  keywords: ["font pairs", "typography", "design", "google fonts", "font generator"],
  authors: [{ name: "Fontility" }],
  metadataBase: new URL("https://pair.fontility.com"),
  openGraph: {
    title: "Fontility - Beautiful Font Pair Generator",
    description: "Stand out from the crowd. Find your perfect font pairs.",
    url: "https://pair.fontility.com",
    siteName: "Fontility",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fontility - Font Pair Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fontility - Beautiful Font Pair Generator",
    description: "Stand out from the crowd. Find your perfect font pairs.",
    images: ["/og-image.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Analytics />
            {children}
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
