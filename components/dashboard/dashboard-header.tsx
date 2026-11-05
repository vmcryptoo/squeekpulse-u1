'use client'

import { FlaskConical, ShieldCheck, HelpCircle } from 'lucide-react'
import { useNetwork, useStatus } from '@/hooks/use-squeek'
import { relativeTime } from '@/lib/squeek/format'
import { NetworkChip, StatusPill } from './primitives'

const NAV = [
  ['network', 'Network'],
  ['wheel', 'Wheel'],
  ['blocks', 'Blocks'],
  ['economy', 'Economy'],
  ['events', 'Events'],
  ['mining', 'Mining'],
  ['wallet', 'Wallet'],
] as const

export function DashboardHeader() {
  const { network, chain, isLoading } = useNetwork()
  const status = useStatus()
  const online = Boolean(status.data) && !status.error

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-mono text-sm font-bold text-primary-foreground">
            SP
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">SqueekPulse</p>
            <p className="text-[11px] text-muted-foreground">Squeekchain analytics</p>
          </div>
        </div>
        <nav aria-label="Dashboard sections" className="hidden lg:block">
          <ul className="flex items-center gap-1 text-sm">
            {NAV.map(([id, label]) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <StatusPill tone={online ? 'good' : status.error ? 'bad' : 'neutral'} pulse={online}>
            {online ? 'Live' : status.error ? 'API offline' : 'Connecting'}
          </StatusPill>
          {!isLoading ? <NetworkChip network={network} size="md" /> : null}
        </div>
      </div>
      {!isLoading ? <NetworkBanner kind={network.kind} name={network.name} chainId={network.chainId} hasChain={Boolean(chain)} updated={status.data?.generatedAt} /> : null}
    </header>
  )
}

function NetworkBanner({
  kind,
  name,
  chainId,
  hasChain,
  updated,
}: {
  kind: 'mainnet' | 'testnet' | 'unknown'
  name: string
  chainId: string | null
  hasChain: boolean
  updated?: string
}) {
  const config = {
    testnet: {
      Icon: FlaskConical,
      cls: 'bg-warning/10 text-warning border-warning/20',
      text: `Testnet data — every value on this dashboard comes from ${name}${chainId ? ` (chain ${chainId})` : ''}. Testnet SQK has no monetary value.`,
    },
    mainnet: {
      Icon: ShieldCheck,
      cls: 'bg-success/10 text-success border-success/20',
      text: `Mainnet data — values are read from ${name}${chainId ? ` (chain ${chainId})` : ''}.`,
    },
    unknown: {
      Icon: HelpCircle,
      cls: 'bg-muted text-muted-foreground border-border',
      text: hasChain
        ? `The API reported an unrecognised network${chainId ? ` (chain ${chainId})` : ''}. Treat values as unverified.`
        : 'Network not yet confirmed — the API has not returned chain information, so no data is shown.',
    },
  }[kind]
  const { Icon } = config
  return (
    <div role="note" className={`border-t ${config.cls}`}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-2 text-xs md:px-6">
        <p className="flex items-center gap-2 font-medium">
          <Icon className="size-3.5 shrink-0" aria-hidden="true" />
          {config.text}
        </p>
        {updated ? <p className="font-mono opacity-80">Last update {relativeTime(updated)}</p> : null}
      </div>
    </div>
  )
}
