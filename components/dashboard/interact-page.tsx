"use client";

import { useState } from "react";
import { WalletConnect } from "./wallet-connect";

type InteractPageProps = {
  onBack?: () => void;
  onSelectTool?: (tool: string) => void;
};

const COMING_SOON_TOOLS = new Set(["token-swap", "nft-marketplace"]);

const tools = [
  {
    id: "wallet-connect",
    number: "01",
    icon: "▣",
    name: "Wallet Connect",
    description: "Connect your wallet to Squeekchain.",
  },
  {
    id: "send-sqk",
    number: "02",
    icon: "➤",
    name: "Send SQK",
    description: "Send SQK to another wallet address.",
  },
  {
    id: "token-swap",
    number: "03",
    icon: "⇄",
    name: "Token Swap",
    description: "Swap tokens on Squeekchain.",
  },
  {
    id: "nft-marketplace",
    number: "04",
    icon: "▤",
    name: "NFT Marketplace",
    description: "Browse, buy and sell Squeekchain NFTs.",
  },
  {
    id: "nft-mint",
    number: "05",
    icon: "▧",
    name: "NFT Mint",
    description: "Create and mint your own NFT.",
  },
  {
    id: "staking",
    number: "06",
    icon: "◉",
    name: "Staking",
    description: "Stake SQK and earn rewards.",
  },
  {
    id: "transaction-builder",
    number: "07",
    icon: "⬡",
    name: "Transaction Builder",
    description: "Create and customize transactions.",
  },
  {
    id: "contract-interaction",
    number: "08",
    icon: "</>",
    name: "Contract Interaction",
    description: "Interact with smart contracts.",
  },
  {
    id: "token-approvals",
    number: "09",
    icon: "⬡",
    name: "Token Approvals",
    description: "Manage token spending approvals.",
  },
  {
    id: "my-portfolio",
    number: "10",
    icon: "▥",
    name: "My Portfolio",
    description: "View your assets, NFTs, and activity.",
  },
];

export default function InteractPage({
  onBack,
  onSelectTool,
}: InteractPageProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleSelect(id: string) {
    setSelected(id);
    onSelectTool?.(id);
  }

  const selectedTool = tools.find(
    (tool) => tool.id === selected
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
              aria-label="Go back"
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
            INTERACT
          </span>

        </header>

        {/* Hero */}
        <section className="border-b border-[#e5dacb] py-12 sm:py-16">

          <div className="inline-flex items-center gap-2 rounded-full border border-[#dfd0ee] bg-[#eee6f8] px-4 py-2 text-[10px] font-black tracking-wider text-[#7652b5]">

            <span className="h-2 w-2 rounded-full bg-[#7652b5]" />

            ON-CHAIN ACTIONS

          </div>

          <h2 className="mt-6 text-4xl font-black leading-tight sm:text-6xl">

            Interact with

            <span className="block text-[#7652b5]">
              Squeekchain.
            </span>

          </h2>

          <p className="mt-4 max-w-xl text-sm leading-7 text-[#85798b]">
            Use essential tools to manage assets, interact with
            protocols, NFTs, and more on Squeekchain.
          </p>

        </section>

        {/* Tools */}
        <section className="py-9">

          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">

            <div>
              <p className="text-[10px] font-black tracking-[3px] text-[#967db7]">
                SQUEEKCHAIN TOOLS
              </p>

              <h3 className="mt-2 text-2xl font-black">
                Interaction Tools
              </h3>
            </div>

            <span className="rounded-full border border-[#dfd0ee] bg-[#eee6f8] px-4 py-2 text-xs font-bold text-[#7652b5]">
              10 Tools
            </span>

          </div>

          {/* 3 columns desktop, 2 tablet, 1 mobile */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {tools.map((tool) => {
              const isSelected = selected === tool.id;

              return (
                <button
                  key={tool.id}
                  onClick={() => handleSelect(tool.id)}
                  className={`group flex min-h-[145px] flex-col rounded-2xl border p-5 text-left transition-all duration-200 active:translate-y-1 ${
                    isSelected
                      ? "border-[#7652b5] bg-[#eee6f8] shadow-[0_4px_0_#7652b5]"
                      : "border-[#e4d8c9] bg-[#fffaf1] shadow-[0_4px_0_#e2d6c5] hover:-translate-y-1 hover:border-[#c9b4e5] hover:shadow-[0_7px_0_#e2d6c5]"
                  }`}
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eee6f8] text-lg font-black text-[#7652b5]">
                      {tool.icon}
                    </div>

                    <span className="text-[10px] font-black tracking-wider text-[#b4a8bb]">
                      {tool.number}
                    </span>

                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">

                    <h4 className="text-sm font-black">
                      {tool.name}
                    </h4>

                    <span className="flex items-center gap-2">
                      {COMING_SOON_TOOLS.has(tool.id) ? (
                        <span className="rounded-full border border-[#e6d7b8] bg-[#fff1cf] px-2 py-1 text-[9px] font-black tracking-wider text-[#9a6a16]">
                          COMING SOON
                        </span>
                      ) : null}
                      <span className="text-lg font-bold text-[#7652b5] transition-transform group-hover:translate-x-1">
                        →
                      </span>
                    </span>

                  </div>

                  <p className="mt-2 text-xs leading-5 text-[#8b8190]">
                    {tool.description}
                  </p>

                </button>
              );
            })}

          </div>

        </section>

        {/* Selected Tool Information */}
        {selectedTool && (
          <section className="mt-4 rounded-2xl border border-[#d5c5eb] bg-[#eee6f8] p-6">

            <div className="flex items-center justify-between gap-3">

              <div>
                <p className="text-[10px] font-black tracking-[2px] text-[#967db7]">
                  SELECTED TOOL
                </p>

                <h3 className="mt-2 text-xl font-black">
                  {selectedTool.name}
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
              {selectedTool.description}
            </p>

            {COMING_SOON_TOOLS.has(selected) ? (
              <div className="mt-5 rounded-xl border border-[#e6d7b8] bg-[#fff7e5] p-5">
                <span className="inline-flex rounded-full bg-[#f4e2b8] px-3 py-1 text-[10px] font-black tracking-[2px] text-[#956516]">
                  COMING SOON
                </span>
                <h4 className="mt-3 text-lg font-black text-[#5d4726]">
                  This feature is not available yet.
                </h4>
                <p className="mt-2 text-sm leading-6 text-[#806d50]">
                  Squeekchain documentation does not currently provide a verified live {selectedTool.name.toLowerCase()} integration. We will enable this tool when the required protocol contracts and integration details are available.
                </p>
              </div>
            ) : selected === "wallet-connect" ? (
              <div className="mt-5"><WalletConnect /></div>
            ) : selected === "send-sqk" ? (
              <div className="mt-5"><WalletConnect /><p className="mt-3 text-xs text-[#786e7f]">Connect on Sepolia first. The Send SQK action is available in the wallet panel after connection.</p></div>
            ) : (
              <p className="mt-2 text-xs leading-6 text-[#786e7f]">
                This feature is not enabled for live transactions yet. Swap and marketplace require deployed liquidity/pair and marketplace contracts; staking and NFT actions require the verified contract ABI and launch permissions. No fake transaction buttons are shown.
              </p>
            )}

          </section>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-[#e2d7c8] py-6 text-center">

          <p className="text-[10px] text-[#a095a3]">
            SqueekPulse · Squeekchain Interaction Tools
          </p>

        </footer>

      </div>
    </main>
  );
}
