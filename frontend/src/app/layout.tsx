import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solar Panel Auto Layout Tool",
  description: "Plan, layout, and export solar panel installations."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
