'use client'

import { useState } from 'react'

import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { NetworkStatus } from '@/components/dashboard/network-status'
import { WheelActivity } from '@/components/dashboard/wheel-activity'
import { BlockStats } from '@/components/dashboard/block-stats'
import { TokenEconomy } from '@/components/dashboard/token-economy'
import { RecentEvents } from '@/components/dashboard/recent-events'
import { MiningCharts } from '@/components/dashboard/mining-charts'
import { WalletExplorer } from '@/components/dashboard/wallet-explorer'
import { TransactionExplorer } from '@/components/dashboard/transaction-explorer'

type View = 'dashboard' | 'wallet' | 'transaction'

const menuItems: { id: View; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'wallet', label: 'Wallet Explorer' },
  { id: 'transaction', label: 'Transaction Explorer' },
]

export default function Page() {
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)

  function openView(view: View) {
    setActiveView(view)
    setMenuOpen(false)
  }

  return (
    <div className="min-h-dvh">
      <DashboardHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">

        {/* Page Heading */}
        <div className="flex flex-col gap-1.5">
          <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Squeekchain, measured one wheel turn at a time
          </h1>

          <p className="max-w-2xl text-pretty text-sm text-muted-foreground">
            An independent, read-only view of the Squeekchain public API.
            Nothing here is estimated or simulated.
          </p>
        </div>

        {/* Navigation Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-accent"
          >
            <span>
              ☰ Menu
            </span>

            <span>
              {menuOpen ? '▲' : '▼'}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl">

              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openView(item.id)}
                  className={`block w-full border-b border-border px-4 py-4 text-left text-sm font-medium last:border-0 hover:bg-accent ${
                    activeView === item.id
                      ? 'bg-accent text-primary'
                      : ''
                  }`}
                >
                  {item.label}
                  {activeView === item.id ? '  ✓' : ''}
                </button>
              ))}

            </div>
          )}
        </div>

        {/* Default Dashboard */}
        {activeView === 'dashboard' && (
          <div className="flex flex-col gap-6">
            <NetworkStatus />
            <WheelActivity />
            <BlockStats />
            <TokenEconomy />
            <MiningCharts />
            <RecentEvents />
          </div>
        )}

        {/* Wallet Explorer */}
        {activeView === 'wallet' && (
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">
              Wallet Explorer
            </h2>

            <WalletExplorer />
          </section>
        )}

        {/* Transaction Explorer */}
        {activeView === 'transaction' && (
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">
              Transaction Explorer
            </h2>

            <TransactionExplorer />
          </section>
        )}

        {/* Footer */}
        <footer className="py-6 text-center text-xs text-muted-foreground">
          Data from{' '}
          <a
            href="https://api.squeekchain.com/v1/status"
            className="underline underline-offset-4 hover:text-foreground"
          >
            api.squeekchain.com
          </a>
          {' '}· SqueekPulse is not affiliated with Squeekchain.
        </footer>

        {/* Founder */}
        <div className="flex flex-col items-center gap-3 py-6">
          <img
            src="/6ZPjsZ9v.jpg"
            alt="Bayazid Hossain"
            className="h-32 w-32 rounded-full object-cover"
          />

          <h2 className="text-xl font-bold">
            BAYAZID HOSSAIN
          </h2>

          <div className="flex gap-5">
            <a
              href="https://x.com/falahDrops"
              target="_blank"
              rel="noreferrer"
            >
              X
            </a>

            <a
              href="https://t.me/vm_cryptoo"
              target="_blank"
              rel="noreferrer"
            >
              Telegram
            </a>
          </div>
        </div>

      </main>
    </div>
  )
}
