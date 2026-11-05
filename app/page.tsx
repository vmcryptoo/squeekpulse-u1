import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { NetworkStatus } from '@/components/dashboard/network-status'
import { WheelActivity } from '@/components/dashboard/wheel-activity'
import { BlockStats } from '@/components/dashboard/block-stats'
import { TokenEconomy } from '@/components/dashboard/token-economy'
import { RecentEvents } from '@/components/dashboard/recent-events'
import { MiningCharts } from '@/components/dashboard/mining-charts'
import { WalletExplorer } from '@/components/dashboard/wallet-explorer'

export default function Page() {
  return (
    <div className="min-h-dvh">
      <DashboardHeader />
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
            Squeekchain, measured one wheel turn at a time
          </h1>
          <p className="max-w-2xl text-pretty text-sm text-muted-foreground">
            An independent, read-only view of the Squeekchain public API. Nothing here is estimated or simulated — if the
            API cannot provide a value, the dashboard says so.
          </p>
        </div>
        <NetworkStatus />
        <WheelActivity />
        <BlockStats />
        <TokenEconomy />
        <MiningCharts />
        <RecentEvents />
        <WalletExplorer />
        <footer className="py-6 text-center text-xs text-muted-foreground">
          Data from{' '}
          <a href="https://api.squeekchain.com/v1/status" className="underline underline-offset-4 hover:text-foreground">
            api.squeekchain.com
          </a>{' '}
          · SqueekPulse is not affiliated with Squeekchain.
        </footer>
        <div className="flex flex-col items-center gap-3 py-6">
  <img
    src="/6ZPjsZ9v.jpg"
    alt="Bayazid Hossain"
    className="w-32 h-32 object-cover rounded-full"
  />
  <h2 className="text-xl font-bold">BAYAZID HOSSAIN</h2>
  <div className="flex gap-5">
    <a href="https://x.com/falahDrops" target="_blank" rel="noreferrer">X</a>
    <a href="https://t.me/vm_cryptoo" target="_blank" rel="noreferrer">Telegram</a>
  </div>
</div>
      </main>
    </div>
  )
}
