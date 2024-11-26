import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Tastrees AI Clone by Treasure Uzoma",
  description: "Upload a picture of the meal you want to know the recipe of the food all for free.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Onest:wght@300;400;500;600;700&amp;display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&amp;display=swap"
        />
      </head>

      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
