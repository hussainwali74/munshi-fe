
import type { Metadata } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";

const inter = Inter({ subsets: ["latin"] });
const noto = Noto_Sans_Arabic({ subsets: ["arabic"], variable: '--font-noto', weight: ['400', '700'] });

export const metadata: Metadata = {
  title: "Ezekata - E-Z-Khata",
  description: "Manage your shop easily - Online Khata & Inventory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${noto.variable}`}>
        <ThemeProvider>
          <LanguageProvider>
            <main className="min-h-screen bg-background text-text-primary">
              {children}
            </main>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
