import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { BackToTop } from "@/components/ui/BackToTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Code & Life",
  description: "A minimal & premium personal blog",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.className} bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 antialiased min-h-screen selection:bg-blue-100 selection:text-blue-900 dark:selection:bg-blue-900 dark:selection:text-blue-100`}>
        <Providers>
          <Header />
          <main className="flex-1 w-full mx-auto">
            {children}
          </main>
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}

