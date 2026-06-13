import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PTex Mô Phỏng Toán | Trực quan hóa Toán 10-11-12",
  description:
    "Nền tảng mô phỏng toán học trực quan cho chương trình Toán 10, 11, 12 — Kết nối tri thức. Tương tác, khám phá, hiểu bản chất.",
  keywords: ["toán học", "mô phỏng", "trực quan", "lớp 10", "lớp 11", "lớp 12", "kết nối tri thức"],
  authors: [{ name: "PTex Team" }],
  openGraph: {
    title: "PTex Mô Phỏng Toán",
    description: "Trực quan hóa Toán học 10-11-12 — Kết nối tri thức",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
