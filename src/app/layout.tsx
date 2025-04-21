import type { Metadata } from "next";
import { Inter, Roboto, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

// Fontlarni yuklash
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const roboto = Roboto({ 
  weight: ['400', '500', '700'],
  subsets: ["latin"], 
  variable: "--font-roboto" 
});
const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "Dwella - Qurilish va uyni ta'mirlash xizmatlari platformasi",
  description: "Dwella - bu qurilish va ta'mirlash ishlari uchun ustalar va mijozlarni bog'lovchi zamonaviy platforma",
  keywords: ["qurilish", "ustalar", "ta'mirlash", "remont", "uy", "xizmatlar", "dwella"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className={`${inter.variable} ${roboto.variable} ${poppins.variable} font-sans`}>
        <Toaster position="top-center" />
        {children}
      </body>
    </html>
  );
}
