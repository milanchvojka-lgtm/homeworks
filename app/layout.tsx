import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Geist, Source_Sans_3 } from "next/font/google";
import { cn } from "@/lib/utils";
import { ThemeProvider, themeInitScript } from "@/components/theme-provider";

const sourceSans3 = Source_Sans_3({subsets:['latin'],variable:'--font-sans'});
const sourceSans = Source_Sans_3({subsets:['latin'],variable:'--font-source-sans'});

export const metadata: Metadata = {
  title: "Homeworks",
  description: "Rodinný systém pro domácí povinnosti a odměny.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Homeworks",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="cs"
      suppressHydrationWarning
      className={cn("h-full antialiased", "font-sans", sourceSans3.variable, sourceSans.variable)}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
