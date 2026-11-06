"use client";

import { useState } from "react";

import LandingPage from "@/components/dashboard/landing-page";
import InteractPage from "@/components/dashboard/interact-page";
import ExplorePage from "@/components/dashboard/explore-page";

import { NetworkStatus } from "@/components/dashboard/network-status";
import { BlockStats } from "@/components/dashboard/block-stats";
import { WalletExplorer } from "@/components/dashboard/wallet-explorer";
import { TransactionExplorer } from "@/components/dashboard/transaction-explorer";
import { RecentEvents } from "@/components/dashboard/recent-events";

type PageView = "home" | "interact" | "explore";

type ExplorerView =
  | "transactions"
  | "blocks"
  | "wallets"
  | "nfts"
  | "network"
  | null;

export default function Page() {
  const [page, setPage] = useState<PageView>("home");
  const [selectedExplorer, setSelectedExplorer] =
    useState<ExplorerView>(null);

  function goHome() {
    setPage("home");
    setSelectedExplorer(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openInteract() {
    setPage("interact");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openExplore() {
    setPage("explore");
    setSelectedExplorer(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectExplorer(explorer: string) {
    setSelectedExplorer(explorer as ExplorerView);

    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden">

      {/* HOME PAGE */}
      {page === "home" && (
        <LandingPage
          onInteract={openInteract}
          onExplore={openExplore}
        />
      )}

      {/* INTERACT PAGE */}
      {page === "interact" && (
        <InteractPage
          onBack={goHome}
          onSelectTool={(tool) => {
            console.log("Selected interaction tool:", tool);
          }}
        />
      )}

      {/* EXPLORE PAGE */}
      {page === "explore" && (
        <>
          <ExplorePage
            onBack={goHome}
            onSelectExplorer={selectExplorer}
          />

          {/* TRANSACTION EXPLORER */}
          {selectedExplorer === "transactions" && (
            <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-black">
                  Transaction Explorer
                </h2>

                <button
                  onClick={() => setSelectedExplorer(null)}
                  className="rounded-xl bg-[#7652b5] px-4 py-2 text-sm font-bold text-white shadow-[0_4px_0_#4e347e] active:translate-y-1 active:shadow-none"
                >
                  Close
                </button>
              </div>

              <TransactionExplorer />
            </section>
          )}

          {/* BLOCK EXPLORER */}
          {selectedExplorer === "blocks" && (
            <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">
                  Block Explorer
                </h2>

                <button
                  onClick={() => setSelectedExplorer(null)}
                  className="rounded-xl bg-[#7652b5] px-4 py-2 text-sm font-bold text-white"
                >
                  Close
                </button>
              </div>

              <BlockStats />
            </section>
          )}

          {/* WALLET EXPLORER */}
          {selectedExplorer === "wallets" && (
            <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">
                  Wallet Explorer
                </h2>

                <button
                  onClick={() => setSelectedExplorer(null)}
                  className="rounded-xl bg-[#7652b5] px-4 py-2 text-sm font-bold text-white"
                >
                  Close
                </button>
              </div>

              <WalletExplorer />
            </section>
          )}

          {/* NETWORK EXPLORER */}
          {selectedExplorer === "network" && (
            <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 pb-12 sm:px-8">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black">
                  Network Explorer
                </h2>

                <button
                  onClick={() => setSelectedExplorer(null)}
                  className="rounded-xl bg-[#7652b5] px-4 py-2 text-sm font-bold text-white"
                >
                  Close
                </button>
              </div>

              <NetworkStatus />
              <RecentEvents />
            </section>
          )}

          {/* NFT EXPLORER */}
          {selectedExplorer === "nfts" && (
            <section className="mx-auto w-full max-w-7xl px-5 pb-12 sm:px-8">
              <div className="rounded-2xl border border-[#d5c5eb] bg-[#eee6f8] p-8 text-center">
                <h2 className="text-2xl font-black text-[#7652b5]">
                  NFT Explorer
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#786e7f]">
                  NFT data integration is pending verification of
                  the available Squeekchain API.
                </p>
              </div>
            </section>
          )}
        </>
      )}

    </div>
  );
}
