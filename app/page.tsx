'use client'

import { useEffect, useState } from 'react'

import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { NetworkStatus } from '@/components/dashboard/network-status'
import { WheelActivity } from '@/components/dashboard/wheel-activity'
import { BlockStats } from '@/components/dashboard/block-stats'
import { TokenEconomy } from '@/components/dashboard/token-economy'
import { RecentEvents } from '@/components/dashboard/recent-events'
import { MiningCharts } from '@/components/dashboard/mining-charts'
import { WalletExplorer } from '@/components/dashboard/wallet-explorer'
import { TransactionExplorer } from '@/components/dashboard/transaction-explorer'

type View = string

const menuGroups = [
  {
    title: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', active: true },
      { id: 'network-health', label: 'Network Health Monitor' },
      { id: 'network-analytics', label: 'Network Analytics' },
    ],
  },
  {
    title: 'EXPLORERS',
    items: [
      { id: 'wallet', label: 'Wallet Explorer', active: true },
      { id: 'transaction', label: 'Transaction Explorer', active: true },
      { id: 'block', label: 'Block Explorer' },
      { id: 'nft', label: 'NFT Explorer' },
      { id: 'account', label: 'Account Explorer' },
      { id: 'squeek', label: 'Squeek Explorer' },
    ],
  },
  {
    title: 'NETWORK MONITORING',
    items: [
      { id: 'settlement', label: 'Settlement Monitor' },
      { id: 'oracle', label: 'Oracle Monitor' },
      { id: 'provisional', label: 'Provisional Blocks' },
      { id: 'wheel', label: 'Wheel Performance' },
      { id: 'measurement', label: 'Measurement History' },
    ],
  },
  {
    title: 'ECONOMY',
    items: [
      { id: 'economy', label: 'SQK Economy' },
      { id: 'staking', label: 'Staking Analytics' },
      { id: 'genesis', label: 'Genesis Launch Monitor' },
    ],
  },
  {
    title: 'ADVANCED ANALYTICS',
    items: [
      { id: 'nft-analytics', label: 'NFT Analytics' },
      { id: 'wallet-activity', label: 'Wallet Activity' },
      { id: 'transaction-analytics', label: 'Transaction Analytics' },
      { id: 'alerts', label: 'Real-Time Alerts' },
    ],
  },
]

export default function Page() {
  const [activeView, setActiveView] = useState<View>('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('squeekpulse-theme')

    const initialTheme =
      savedTheme === 'light' ? 'light' : 'dark'

    setTheme(initialTheme)
    document.documentElement.classList.toggle(
      'dark',
      initialTheme === 'dark'
    )

    setMounted(true)
  }, [])

  function changeTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'

    setTheme(nextTheme)

    document.documentElement.classList.toggle(
      'dark',
      nextTheme === 'dark'
    )

    localStorage.setItem('squeekpulse-theme', nextTheme)
  }

  function openView(view: View) {
    setActiveView(view)
    setMenuOpen(false)
  }

  const selectedItem = menuGroups
    .flatMap((group) => group.items)
    .find((item) => item.id === activeView)

  return (
    <div className="min-h-dvh">

      <DashboardHeader />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">

          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              SqueekPulse
            </h1>

            <p className="max-w-2xl text-sm text-muted-foreground">
              Independent Squeekchain Network Explorer and Analytics.
            </p>
          </div>

          {/* Theme Toggle */}
          {mounted && (
            <button
              onClick={changeTheme}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-accent"
            >
              {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
          )}

        </div>

        {/* Navigation */}
        <div className="relative">

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-4 text-sm font-semibold hover:bg-accent"
          >
            <span>☰ Navigation Menu</span>

            <span>{menuOpen ? '▲' : '▼'}</span>
          </button>

          {menuOpen && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-card p-3 shadow-xl">

              {menuGroups.map((group) => (
                <div key={group.title} className="mb-4 last:mb-0">

                  <h3 className="px-3 py-2 text-xs font-bold tracking-wider text-muted-foreground">
                    {group.title}
                  </h3>

                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => openView(item.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-accent ${
                        activeView === item.id
                          ? 'bg-accent font-semibold text-primary'
                          : ''
                      }`}
                    >
                      <span>{item.label}</span>

                      {activeView === item.id ? (
                        <span>✓</span>
                      ) : !item.active ? (
                        <span className="text-xs text-muted-foreground">
                          Soon
                        </span>
                      ) : null}
                    </button>
                  ))}

                </div>
              ))}

            </div>
          )}

        </div>

        {/* Dashboard */}
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
            <h2 className="text-xl font-bold">Wallet Explorer</h2>
            <WalletExplorer />
          </section>
        )}

        {/* Transaction Explorer */}
        {activeView === 'transaction' && (
          <section className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">Transaction Explorer</h2>
            <TransactionExplorer />
          </section>
        )}

        {/* Coming Soon */}
        {!['dashboard', 'wallet', 'transaction'].includes(activeView) && (
          <section className="flex min-h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card p-8 text-center">

            <div className="text-4xl">🚀</div>

            <h2 className="text-xl font-bold">
              {selectedItem?.label ?? 'Coming Soon'}
            </h2>

            <p className="max-w-md text-sm text-muted-foreground">
              This feature is planned for SqueekPulse.
              Live data integration will be added when the required
              public API data is available.
            </p>

            <button
              onClick={() => openView('dashboard')}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Back to Dashboard
            </button>

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
