import type { Metadata } from "next";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import "./globals.css";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "BoardRoom — Nonprofit Governance Portal",
  description: "Manage meetings, agendas, motions, voting, and organizational documents",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
