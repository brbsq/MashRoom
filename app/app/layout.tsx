import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/components/mashroom/provider";

export const metadata: Metadata = {
  title: "MashRoom | Your little world",
  description:
    "Care for your pet, explore the class plaza, and learn together.",
  icons: {
    icon: { url: "/favicon.png", type: "image/png" },
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
