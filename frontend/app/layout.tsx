import type { Metadata } from "next";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";

import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Lucky Dice Lottery",
  description: "Fully homomorphic encrypted dice lottery with private jackpot detection.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" translate="no">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <Providers>
          <div className="relative min-h-screen overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/50 via-slate-950 to-slate-950" />
            <div className="absolute inset-x-0 top-[-200px] h-[500px] blur-3xl opacity-30 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500" />

            <header className="relative z-10 border-b border-white/10 backdrop-blur-sm">
              <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
                <div className="flex items-center gap-3">
        <Image src="/logo.svg" alt="Lucky Dice" width={44} height={44} priority />
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-white">Lucky Dice Lottery</p>
                    <p className="text-sm text-white/60">Homomorphic privacy-first jackpot game</p>
                  </div>
                </div>
                <ConnectButton showBalance={false} chainStatus="icon" />
              </div>
            </header>

            <main className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-16 pt-10">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
