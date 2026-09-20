import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileActionBar from "@/components/layout/MobileActionBar";
import { CLINIC_NAME, CLINIC_CITY, CLINIC_PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: {
    default: `${CLINIC_NAME} | Trusted Dental Care in Kampala`,
    template: `%s | ${CLINIC_NAME}`,
  },
  description:
    "Professional general, cosmetic, restorative, orthodontic, and children's dental care in Kampala, Uganda. Led by Dr. Silver. Request an appointment today.",
  keywords: [
    "Dr. Dental Crest Dental Surgery",
    "Dentist in Kampala",
    "Dental Clinic Kampala",
    "Dr. Silver dentist",
    "Uganda Dental Surgery",
    "Teeth cleaning Kampala",
    "Cosmetic dentistry Uganda",
    "Orthodontics Kampala",
  ],
  authors: [{ name: CLINIC_NAME }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    title: `${CLINIC_NAME} | Trusted Dental Care in Kampala`,
    description:
      "General, cosmetic, restorative, orthodontic, and children's dentistry in Kampala. Request an appointment online.",
    url: "/",
    siteName: CLINIC_NAME,
    locale: "en_UG",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    name: CLINIC_NAME,
    telephone: CLINIC_PHONE,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kampala",
      addressCountry: "UG",
    },
    areaServed: "Kampala, Uganda",
    medicalSpecialty: "Dentistry",
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-white text-[#333840] selection:bg-[#a8d8c4] selection:text-[#08c068]">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MobileActionBar />
      </body>
    </html>
  );
}
