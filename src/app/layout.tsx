// Root layout: html shell, Kotila fonts and global styles
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Signika } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Providers } from "@/app/providers";
import "./globals.css";

// Display font: headings and the wordmark
const signika = Signika({
  variable: "--font-signika",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

// Body font: text and figures
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Kotila Farm",
  description: "Daily records, sales and money for Kotila Farms",
};

export const viewport: Viewport = {
  themeColor: "#2f6410",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${signika.variable} ${jakarta.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
