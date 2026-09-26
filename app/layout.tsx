import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Playfair_Display, Space_Grotesk } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { StoreHydration } from "@/components/layout/store-hydration";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { MotionProvider } from "@/components/motion/motion-provider";
import { PageTransition } from "@/components/motion/page-transition";
import { WelcomePopup } from "@/components/marketing/welcome-popup";
import { BRAND, OG_IMAGE, PAYMENT_METHODS, SEO_DESCRIPTION, SEO_KEYWORDS } from "@/lib/brand";
import { organizationJsonLd } from "@/lib/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: "Revizit — L'élégance africaine, ta signature gravée.",
    template: "%s · Revizit",
  },
  description: SEO_DESCRIPTION,
  keywords: [...SEO_KEYWORDS],
  applicationName: BRAND.name,
  authors: [{ name: BRAND.name, url: BRAND.url }],
  creator: BRAND.name,
  publisher: BRAND.name,
  // Pas de `alternates.canonical` ici : une canonical sur "/" s'applique à TOUTES les pages.
  // Chaque route déclare son propre canonical via buildMetadata() (lib/seo.ts).
  openGraph: {
    type: "website",
    locale: BRAND.locale,
    url: BRAND.url,
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.signature}`,
    description: SEO_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${BRAND.name} — ${BRAND.signature}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — ${BRAND.signature}`,
    description: SEO_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
};

// app/layout.tsx — layout global : fonts, thème, Navbar, Footer, toasts.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <script
          type="application/ld+json"
          // Données structurées OnlineStore (revizit.md §9.3)
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "OnlineStore",
              name: BRAND.name,
              url: BRAND.url,
              slogan: BRAND.signature,
              description: SEO_DESCRIPTION,
              address: {
                "@type": "PostalAddress",
                addressLocality: BRAND.city,
                addressCountry: BRAND.countryCode,
              },
              paymentAccepted: [...PAYMENT_METHODS, "Visa"],
              priceRange: "8000 - 500000 FCFA",
              currenciesAccepted: "XOF",
              areaServed: ["CI", "SN", "BF", "ML", "FR"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
        />
      </head>
      <body className="font-sans">
        <ClerkProvider>
          <ThemeProvider>
            <SessionProvider>
              <MotionProvider>
                <StoreHydration />
                <a
                  href="#contenu"
                  className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
                >
                  Aller au contenu
                </a>
                <Navbar />
                <main id="contenu" className="min-h-[60vh]">
                  <PageTransition>{children}</PageTransition>
                </main>
                <Footer />
                <WelcomePopup />
                <Toaster richColors position="top-center" closeButton />
              </MotionProvider>
            </SessionProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
