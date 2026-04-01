import type { Metadata } from "next";
import { QueryProvider } from "@/providers/query-provider";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "PocketFlow — Financial Planner",
  description:
    "Track daily spending, save with one tap, and see where your money goes.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
