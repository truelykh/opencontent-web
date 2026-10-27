import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Opencontent.in",
  description:
    "Free public domain video streaming & publishing platform with targeted age profiles (Kids, Teen, Adult 18+) and smart ad monetization.",
  icons: {
    icon: [
      { url: "/icon.svg?v=5", type: "image/svg+xml" },
      { url: "/favicon.ico?v=5", sizes: "any" },
      { url: "/logo.svg?v=5", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=5",
    apple: [{ url: "/apple-touch-icon.png?v=5", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg?v=5" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=5" />
        <link rel="shortcut icon" href="/favicon.ico?v=5" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=5" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
