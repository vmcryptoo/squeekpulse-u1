"use client";

import { useState } from "react";

type InteractPageProps = {
  onBack?: () => void;
  onConnectWallet?: () => void;
  onSelectTool?: (tool: string) => void;
};

const tools = [
  {
    id: "wallet",
    number: "01",
    icon: "◉",
    name: "Wallet Connect",
    description: "Connect your wallet to the Squeekchain ecosystem.",
    category: "WALLET",
  },
  {
    id: "send",
    number: "02",
    icon: "↗",
    name: "Send SQK",
    description: "Send SQK tokens to another wallet address.",
    category: "TRANSFER",
  },
  {
    id: "swap",
    number: "03",
    icon: "⇄",
    name: "Token Swap",
    description: "Swap supported tokens on the network.",
    category: "DEFI",
  },
  {
    id: "marketplace",
    number: "04",
    icon: "◇",
    name: "NFT Marketplace",
    description: "Explore and trade supported NFTs.",
    category: "NFT",
  },
  {
    id: "mint",
    number: "05",
    icon: "✧",
    name: "NFT Mint",
    description: "Create and mint your own NFTs.",
    category: "NFT",
  },
  {
    id: "staking",
    number: "06",
    icon: "◈",
    name: "Staking",
    description: "Stake supported tokens and manage positions.",
    category: "DEFI",
  },
  {
    id: "builder",
    number: "07",
    icon: "⌘",
    name: "Transaction Builder",
    description: "Build and prepare blockchain transactions.",
    category: "DEVELOPER",
  },
  {
    id: "contract",
    number: "08",
    icon: "</>",
    name: "Contract Interaction",
    description: "Interact with supported smart contracts.",
    category: "DEVELOPER",
  },
  {
    id: "approvals",
    number: "09",
    icon: "✓",
    name: "Token Approvals",
    description: "Review and manage token spending approvals.",
    category: "SECURITY",
  },
  {
    id: "portfolio",
    number: "10",
    icon: "▥",
    name: "My Portfolio",
    description: "View your wallet assets and activity.",
    category: "WALLET",
  },
];

export default function InteractPage({
  onBack,
  onConnectWallet,
  onSelectTool,
}: InteractPageProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedTool(id);
    onSelectTool?.(id);
  };

  return (
    <main className="min-h-screen bg-[#f6f0e5] px-5 py-8 text-[#29213b] sm:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d9cdbb] pb-6">

          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d9cdbb] bg-[#fffaf1] text-xl shadow-[0_4px_0_#e2d6c5] transition-all active:translate-y-1 active:shadow-none"
            >
              ←
            </button>

            <div>
              <h1 className="text-xl font-black">SqueekPulse</h1>
              <p className="text-xs text-[#8b8190]">Interact Center</p>
            </div>
          </div>

          <button
            onClick={onConnectWallet}
            className="rounded-xl bg-[#7652b5] px-5 py-3 text-sm font-bold text-white shadow-[0_5px_0_#4e347e] transition-all hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
          >
            Connect Wallet
          </button>

        </header>

        {/* Hero */}
        <section className="py-12 sm:py-16">

          <div className="inline-flex items-center gap-2 rounded-full border border-[#d5c5eb] bg-[#eee6f8] px-4 py-2 text-xs font-black tracking-wider text-[#7652b5]">
            <span className="h-2 w-2 rounded-full bg-[#7652b5]" />
            BLOCKCHAIN INTERACTION
          </div>

          <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-6xl">
            Interact with
            <span className="block text-[#7652b5]">Squeekchain.</span>
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#786e7f] sm:text-base">
            Access blockchain tools from one place. Connect your wallet
            and choose an action to get started.
          </p>

        </section>

        {/* Tool heading */}
        <section>

          <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[3px] text-[#967db7]">
                Available tools
              </p>
              <h3 className="mt-2 text-2xl font-black sm:text-3xl">
                Choose an Action
              </h3>
            </div>

            <span className="rounded-full border border-[#d5c5eb] bg-[#eee6f8] px-4 py-2 text-xs font-bold text-[#7652b5]">
              10 Tools
            </span>
          </div>

          {/* Tools grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {tools.map((tool) => {
              const isSelected = selectedTool === tool.id;

              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelect(tool.id)}
                  className={`group rounded-2xl border p-6 text-left transition-all duration-200 active:translate-y-1 ${
                    isSelected
                      ? "border-[#7652b5] bg-[#eee6f8] shadow-[0_4px_0_#7652b5]"
                      : "border-[#e0d5c5] bg-[#fffaf1] shadow-[0_5px_0_#e2d6c5] hover:-translate-y-1 hover:border-[#c5b1e0] hover:shadow-[0_8px_0_#e2d6c5]"
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eee6f8] text-2xl font-black text-[#7652b5] transition-transform group-hover:scale-105">
                      {tool.icon}
                    </div>

                    <span className="text-xs font-black tracking-wider text-[#b4a8bb]">
                      {tool.number}
                    </span>

                  </div>

                  <div className="mt-6">

                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-black">
                        {tool.name}
                      </h4>

                      {isSelected && (
                        <span className="rounded-full bg-[#7652b5] px-2 py-1 text-[9px] font-bold text-white">
                          SELECTED
                        </span>
                      )}
                    </div>

                    <p className="min-h-[48px] text-sm leading-6 text-[#8b8190]">
                      {tool.description}
                    </p>

                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#e8dfd2] pt-4">

                    <span className="text-[10px] font-black tracking-[2px] text-[#967db7]">
                      {tool.category}
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

        {/* Selected tool information */}
        {selectedTool && (
          <section className="mt-10 rounded-2xl border border-[#d5c5eb] bg-[#eee6f8] p-6">

            <p className="text-xs font-black uppercase tracking-[2px] text-[#967db7]">
              Selected Tool
            </p>

            <h3 className="mt-2 text-xl font-black">
              {tools.find((tool) => tool.id === selectedTool)?.name}
            </h3>

            <p className="mt-2 text-sm leading-6 text-[#786e7f]">
              This tool has been selected. Its blockchain functionality
              will be connected after verifying the required Squeekchain
              wallet, API, and contract support.
            </p>

          </section>
        )}

        {/* Footer */}
        <footer className="mt-16 border-t border-[#d9cdbb] py-7 text-center">
          <p className="text-xs text-[#968b9b]">
            SqueekPulse · Squeekchain Interaction Center
          </p>
        </footer>

      </div>
    </main>
  );
}
