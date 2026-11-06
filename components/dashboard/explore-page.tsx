"use client";

import { useState } from "react";

type ExplorePageProps = {
  onBack?: () => void;
  onSelectExplorer?: (explorer: string) => void;
};

const explorers = [
  {
    id: "transactions",
    number: "01",
    icon: "▤",
    name: "Transaction Explorer",
    description: "Search and inspect blockchain transactions.",
    category: "TRANSACTIONS",
  },
  {
    id: "blocks",
    number: "02",
    icon: "▦",
    name: "Block Explorer",
    description: "Explore blocks and their on-chain information.",
    category: "BLOCKCHAIN",
  },
  {
    id: "wallets",
    number: "03",
    icon: "◉",
    name: "Wallet Explorer",
    description: "Look up wallet addresses and their activity.",
    category: "WALLETS",
  },
  {
    id: "nfts",
    number: "04",
    icon: "◇",
    name: "NFT Explorer",
    description: "Discover NFT collections and on-chain activity.",
    category: "NFT",
  },
  {
    id: "network",
    number: "05",
    icon: "⌘",
    name: "Network Explorer",
    description: "Explore Squeekchain network information.",
    category: "NETWORK",
  },
];

export default function ExplorePage({
  onBack,
  onSelectExplorer,
}: ExplorePageProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelected(id);
    onSelectExplorer?.(id);
  };

  return (
    <main className="min-h-screen bg-[#f6f0e5] px-5 py-8 text-[#29213b] sm:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#d9cdbb] pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d9cdbb] bg-[#fffaf1] text-xl shadow-[0_4px_0_#e2d6c5] transition-all active:translate-y-1 active:shadow-none"
            >
              ←
            </button>

            <div>
              <h1 className="text-xl font-black">SqueekPulse</h1>
              <p className="text-xs text-[#8b8190]">Network Explorer</p>
            </div>
          </div>

          <span className="rounded-xl border border-[#d5c5eb] bg-[#eee6f8] px-4 py-3 text-xs font-bold text-[#7652b5]">
            EXPLORE
          </span>
        </header>

        {/* Hero */}
        <section className="py-14 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d5c5eb] bg-[#eee6f8] px-4 py-2 text-xs font-black tracking-wider text-[#7652b5]">
            <span className="h-2 w-2 rounded-full bg-[#7652b5]" />
            SQUEEKCHAIN DATA
          </div>

          <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
            Explore the
            <span className="block text-[#7652b5]">Blockchain.</span>
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#786e7f] sm:text-base">
            Discover public blockchain information. Explore transactions,
            blocks, wallets, NFTs, and network activity in one place.
          </p>
        </section>

        {/* Explorer cards */}
        <section>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[3px] text-[#967db7]">
                Public data
              </p>
              <h3 className="mt-2 text-2xl font-black sm:text-3xl">
                Choose an Explorer
              </h3>
            </div>

            <span className="rounded-full border border-[#d5c5eb] bg-[#eee6f8] px-4 py-2 text-xs font-bold text-[#7652b5]">
              5 Explorers
            </span>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {explorers.map((item) => {
              const isSelected = selected === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`group rounded-2xl border p-6 text-left transition-all duration-200 active:translate-y-1 ${
                    isSelected
                      ? "border-[#7652b5] bg-[#eee6f8] shadow-[0_4px_0_#7652b5]"
                      : "border-[#e0d5c5] bg-[#fffaf1] shadow-[0_5px_0_#e2d6c5] hover:-translate-y-1 hover:border-[#c5b1e0] hover:shadow-[0_8px_0_#e2d6c5]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee6f8] text-2xl font-black text-[#7652b5] transition-transform group-hover:scale-105">
                      {item.icon}
                    </div>

                    <span className="text-xs font-black tracking-wider text-[#b4a8bb]">
                      {item.number}
                    </span>
                  </div>

                  <h4 className="mt-6 text-lg font-black">
                    {item.name}
                  </h4>

                  <p className="mt-3 min-h-[48px] text-sm leading-6 text-[#8b8190]">
                    {item.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-[#e8dfd2] pt-4">
                    <span className="text-[10px] font-black tracking-[2px] text-[#967db7]">
                      {item.category}
                    </span>

                    <span className="text-xl font-bold text-[#7652b5] transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected explorer */}
        {selected && (
          <section className="mt-10 rounded-2xl border border-[#d5c5eb] bg-[#eee6f8] p-6">
            <p className="text-xs font-black uppercase tracking-[2px] text-[#967db7]">
              Selected Explorer
            </p>

            <h3 className="mt-2 text-xl font-black">
              {explorers.find((item) => item.id === selected)?.name}
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#786e7f]">
              Explorer selected. The live blockchain data view will be
              connected through the verified Squeekchain API.
            </p>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-[#d9cdbb] py-7 text-center">
          <p className="text-xs text-[#968b9b]">
            SqueekPulse · Squeekchain Network Explorer
          </p>
        </footer>

      </div>
    </main>
  );
}
