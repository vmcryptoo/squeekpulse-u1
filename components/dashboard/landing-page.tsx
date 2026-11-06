"use client";

import React from "react";

type LandingPageProps = {
  onInteract?: () => void;
  onExplore?: () => void;
  onConnectWallet?: () => void;
};

const exploreItems = [
  { icon: "▤", title: "Transactions", desc: "Explore network transactions" },
  { icon: "▦", title: "Blocks", desc: "View blockchain blocks" },
  { icon: "◉", title: "Wallets", desc: "Explore wallet addresses" },
  { icon: "◇", title: "NFTs", desc: "Discover NFT activity" },
  { icon: "⌘", title: "Network", desc: "Monitor network activity" },
];

export default function LandingPage({
  onInteract,
  onExplore,
  onConnectWallet,
}: LandingPageProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f0e5] text-[#29213b]">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#ded1f4] opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#e8d9c5] opacity-50 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#d9cdbb] py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#7652b5] text-2xl font-black text-white shadow-[0_5px_0_#4e347e]">
              S
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight">
                SqueekPulse
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-[2px] text-[#8c7c9f]">
                Squeekchain Explorer
              </p>
            </div>
          </div>

          <button
            onClick={onConnectWallet}
            className="rounded-xl border border-[#7652b5] bg-[#7652b5] px-4 py-3 text-sm font-bold text-white shadow-[0_5px_0_#4e347e] transition-all hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
          >
            Connect Wallet
          </button>
        </header>

        {/* Hero section */}
        <section className="mx-auto max-w-4xl py-20 text-center sm:py-28">

          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d5c5eb] bg-[#eee6f8] px-4 py-2 text-xs font-bold text-[#7652b5]">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            YOUR GATEWAY TO SQUEEKCHAIN
          </div>

          <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Explore.
            <span className="block text-[#7652b5]">Interact.</span>
            Experience Squeekchain.
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#786e7f] sm:text-lg">
            One place to explore the Squeekchain network, interact with
            blockchain tools, and discover what's happening on-chain.
          </p>

          {/* Main action cards */}
          <div className="mx-auto mt-14 grid max-w-3xl gap-7 sm:grid-cols-2">

            {/* Interact */}
            <button
              onClick={onInteract}
              className="group rounded-3xl border border-[#7652b5] bg-[#7652b5] p-8 text-left text-white shadow-[0_10px_0_#4e347e,0_18px_30px_rgba(65,42,100,0.15)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_0_#4e347e,0_22px_35px_rgba(65,42,100,0.2)] active:translate-y-2 active:shadow-none"
            >
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-4xl">
                ⚡
              </div>

              <h3 className="text-3xl font-black">Interact</h3>

              <p className="mt-3 text-sm leading-6 text-white/75">
                Connect your wallet and use blockchain tools to interact
                with Squeekchain.
              </p>

              <div className="mt-9 flex items-center justify-between">
                <span className="text-sm font-bold">Explore Tools</span>
                <span className="text-2xl transition-transform group-hover:translate-x-2">
                  →
                </span>
              </div>
            </button>

            {/* Explore */}
            <button
              onClick={onExplore}
              className="group rounded-3xl border border-[#d4c5e8] bg-[#eee6f8] p-8 text-left shadow-[0_10px_0_#c9b7df,0_18px_30px_rgba(65,42,100,0.08)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_0_#c9b7df,0_22px_35px_rgba(65,42,100,0.12)] active:translate-y-2 active:shadow-none"
            >
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7652b5] text-4xl text-white">
                ◈
              </div>

              <h3 className="text-3xl font-black text-[#7652b5]">Explore</h3>

              <p className="mt-3 text-sm leading-6 text-[#786e7f]">
                Discover blocks, transactions, wallets, NFTs, and network
                information.
              </p>

              <div className="mt-9 flex items-center justify-between text-[#7652b5]">
                <span className="text-sm font-bold">Explore Network</span>
                <span className="text-2xl transition-transform group-hover:translate-x-2">
                  →
                </span>
              </div>
            </button>

          </div>
        </section>

        {/* Explore preview */}
        <section className="pb-20">
          <div className="mb-9 text-center">
            <p className="text-xs font-black uppercase tracking-[3px] text-[#967db7]">
              Discover the ecosystem
            </p>
            <h3 className="mt-3 text-3xl font-black sm:text-4xl">
              Everything On-Chain
            </h3>
            <p className="mt-3 text-sm text-[#786e7f]">
              Explore the essential parts of the Squeekchain network.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {exploreItems.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#e0d5c5] bg-[#fffaf1] p-5 shadow-[0_5px_0_#e2d6c5] transition-all hover:-translate-y-1 hover:shadow-[0_8px_0_#e2d6c5]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#eee6f8] text-2xl font-black text-[#7652b5]">
                  {item.icon}
                </div>

                <h4 className="mt-5 font-black">{item.title}</h4>
                <p className="mt-2 text-xs leading-5 text-[#8b8190]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Founder */}
        <section className="border-t border-[#d9cdbb] py-12">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[3px] text-[#967db7]">
              Built with passion
            </p>

            <div className="mt-6 flex flex-col items-center">
              <img
                src="/6ZPjsZ9v.jpg"
                alt="Founder"
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-[0_5px_0_#c9b7df]"
              />

              <h4 className="mt-5 text-lg font-black tracking-wider">
                BAYAZID HOSSAIN
              </h4>

              <p className="mt-2 text-sm text-[#8b8190]">
                Founder of SqueekPulse
              </p>

              <div className="mt-5 flex gap-3">
                <a
                  href="https://x.com/falahDrops"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-[#29213b] px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-1"
                >
                  Follow on X
                </a>

                <a
                  href="https://t.me/vm_cryptoo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-[#d4c5e8] bg-[#eee6f8] px-5 py-2.5 text-sm font-bold text-[#7652b5] transition-all hover:-translate-y-1"
                >
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#d9cdbb] py-6 text-center">
          <p className="text-xs text-[#968b9b]">
            © {new Date().getFullYear()} SqueekPulse. Built for the Squeekchain ecosystem.
          </p>
        </footer>

      </div>
    </main>
  );
}
