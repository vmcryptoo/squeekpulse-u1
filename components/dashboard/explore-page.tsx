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
    description: "Explore blocks and their on-chain data.",
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
  {
    id: "rewards",
    number: "06",
    icon: "✧",
    name: "Rewards Hub",
    description: "Discover rewards, campaigns, points and benefits.",
    category: "REWARDS",
  },
];

export default function ExplorePage({
  onBack,
  onSelectExplorer,
}: ExplorePageProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleSelect(id: string) {
    setSelected(id);
    onSelectExplorer?.(id);
  }

  const selectedItem = explorers.find(
    (item) => item.id === selected
  );

  return (
    <main className="min-h-screen bg-[#f6f0e5] px-4 py-6 text-[#29213b] sm:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="flex items-center justify-between rounded-2xl border border-[#e4d8c9] bg-[#fffaf1] px-4 py-4 shadow-[0_4px_0_#e2d6c5]">

          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e2d6c5] bg-[#fffaf1] text-xl shadow-[0_3px_0_#e2d6c5] active:translate-y-1 active:shadow-none"
            >
              ←
            </button>

            <div>
              <h1 className="text-lg font-black">
                SqueekPulse
              </h1>
              <p className="text-[11px] text-[#8b8190]">
                Squeekchain Dashboard
              </p>
            </div>
          </div>

          <span className="rounded-xl bg-[#7652b5] px-4 py-2 text-xs font-black text-white shadow-[0_4px_0_#4e347e]">
            EXPLORE
          </span>

        </header>

        {/* Hero */}
        <section className="border-b border-[#e5dacb] py-12 sm:py-16">

          <div className="inline-flex items-center gap-2 rounded-full border border-[#dfd0ee] bg-[#eee6f8] px-4 py-2 text-[10px] font-black tracking-wider text-[#7652b5]">
            <span className="h-2 w-2 rounded-full bg-[#7652b5]" />
            SQUEEKCHAIN DATA
          </div>

          <h2 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">
            Explore the
            <span className="block text-[#7652b5]">
              Blockchain.
            </span>
          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#85798b]">
            Discover public blockchain information. Explore transactions,
            blocks, wallets, NFTs, rewards and network activity.
          </p>

        </section>

        {/* Explorer heading */}
        <section className="py-9">

          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black tracking-[3px] text-[#967db7]">
                DISCOVER SQUEEKCHAIN
              </p>

              <h3 className="mt-2 text-2xl font-black">
                Choose an Explorer
              </h3>
            </div>

            <span className="rounded-full border border-[#dfd0ee] bg-[#eee6f8] px-4 py-2 text-xs font-bold text-[#7652b5]">
              6 Features
            </span>
          </div>

          {/* 3 cards desktop, 2 tablet, 1 mobile */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {explorers.map((item) => {
              const isSelected = selected === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`group flex min-h-[155px] flex-col rounded-2xl border p-5 text-left transition-all duration-200 active:translate-y-1 ${
                    isSelected
                      ? "border-[#7652b5] bg-[#eee6f8] shadow-[0_4px_0_#7652b5]"
                      : "border-[#e4d8c9] bg-[#fffaf1] shadow-[0_4px_0_#e2d6c5] hover:-translate-y-1 hover:border-[#c9b4e5] hover:shadow-[0_7px_0_#e2d6c5]"
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eee6f8] text-xl font-black text-[#7652b5]">
                      {item.icon}
                    </div>

                    <span className="text-[10px] font-black tracking-wider text-[#b4a8bb]">
                      {item.number}
                    </span>

                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">

                    <h4 className="text-sm font-black">
                      {item.name}
                    </h4>

                    <span className="text-lg font-bold text-[#7652b5] transition-transform group-hover:translate-x-1">
                      →
                    </span>

                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#8b8190]">
                    {item.description}
                  </p>

                </button>
              );
            })}

          </div>
        </section>

        {/* Selection information */}
        {selectedItem && (
          <section className="mt-4 rounded-2xl border border-[#d5c5eb] bg-[#eee6f8] p-6">

            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black tracking-[2px] text-[#967db7]">
                  SELECTED FEATURE
                </p>

                <h3 className="mt-2 text-xl font-black">
                  {selectedItem.name}
                </h3>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-[#7652b5]"
              >
                Close
              </button>
            </div>

            <p className="mt-3 text-xs leading-6 text-[#786e7f]">
              {selected === "rewards"
                ? "Something exciting is cooking for the Squeekchain community. Rewards, campaigns and benefits will be announced when available. Stay tuned!"
                : `${selectedItem.name} selected. Live blockchain data will be displayed when the required Squeekchain API support is verified.`}
            </p>

          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-[#e2d7c8] py-6 text-center">
          <p className="text-[10px] text-[#a095a3]">
            SqueekPulse · Squeekchain Network Explorer
          </p>
        </footer>

      </div>
    </main>
  );
}
