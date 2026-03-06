import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TBR Studio | Team Blue Rising",
  description:
    "Content studio for Team Blue Rising - E1 World Championship",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
