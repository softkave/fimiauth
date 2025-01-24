import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Mukta_Mahee } from "next/font/google";
import { Toaster } from "../components/ui/toaster.js";
import { kAppConstants } from "../definitions/appConstants.js";
import "./globals.css";

const font = Mukta_Mahee({ subsets: ["gurmukhi"], weight: "400" });

export const metadata: Metadata = {
  title: kAppConstants.name,
  description: kAppConstants.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={font.className}>
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
