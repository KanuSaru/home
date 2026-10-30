import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Archivo, Jacquard_24, VT323 } from "next/font/google";
import { config, home } from "@/content/site";
import { LangProvider } from "@/lib/i18n";
import { Shell } from "@/components/Shell";
import { Analytics } from "@/components/Analytics";
import "./globals.css";

// Archivo carries the text (its width axis makes the heavy, wide headings),
// Jacquard 24 is the pixel blackletter wordmark, VT323 is for live readouts.
const archivo = Archivo({ subsets: ["latin", "latin-ext"], axes: ["wdth"], display: "swap", variable: "--font-archivo" });
const jacquard = Jacquard_24({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-jacquard" });
const vt323 = VT323({ subsets: ["latin"], weight: "400", display: "swap", variable: "--font-vt323" });

export const metadata: Metadata = {
  // SITE_URL comes from the deploy workflow, so it follows a custom domain on its own
  metadataBase: new URL(process.env.SITE_URL || "https://kanusaru.github.io/home"),
  title: { default: "Kanu", template: "%s, Kanu" },
  description: home.intro.en,
  authors: [{ name: "Erick Fabián Donado Fonseca" }],
};

export const viewport: Viewport = { themeColor: "#131312", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${jacquard.variable} ${vt323.variable}`}>
      <body>
        <LangProvider>
          <Shell>{children}</Shell>
        </LangProvider>
        {config.goatcounter && <Analytics />}
        {config.goatcounter && (
          <Script
            data-goatcounter={`https://${config.goatcounter}.goatcounter.com/count`}
            src="https://gc.zgo.at/count.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
