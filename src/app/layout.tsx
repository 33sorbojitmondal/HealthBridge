import "./globals.css";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

// Load fonts
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ["latin"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "AI HealthBridge - Localized Health Assistant",
  description: "AI-powered health assistant for underserved communities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100`}>
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-800 font-poppins">AI HealthBridge</h1>
          </div>
        </header>
        <main className="flex-grow z-10 relative">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
            <p>&copy; {new Date().getFullYear()} AI HealthBridge. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
