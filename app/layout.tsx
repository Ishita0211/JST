import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JalSetu — Water Delivery",
  description: "Order water delivered to your door",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen relative z-10">{children}</body>
    </html>
  );
}
