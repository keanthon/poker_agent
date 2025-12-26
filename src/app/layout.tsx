import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Poker Arena",
  description: "Watch AI agents play poker with transparent reasoning visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
