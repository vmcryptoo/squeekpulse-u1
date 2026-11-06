'use client'

import { useState } from 'react'
import { Activity, Blocks, Coins, TrendingUp } from 'lucide-react'
import { useNetwork, useSettlements } from '@/hooks/use-squeek'
import { formatDateTime, formatInt, formatToken, relativeTime } from '@/lib/squeek/format'
import { cn } from '@/lib/utils'
import { DataBoundary, Section, Stat } from './primitives'

type Range = '24h' | '7d' | '30d'

const RANGES: { key: Range; label: string }[] = [
{ key: '24h', label: '24 Hours' },
{ key: '7d', label: '7 Days' },
{ key: '30d', label: '30 Days' },
]

export function NetworkAnalytics() {
const [range, setRange] = useState<Range>('7d')
const { network } = useNetwork()
const analytics = useSettlements(range)

return (
<Section
id="network-analytics"
index={6}
icon={TrendingUp}
title="Network Analytics"
description="Settlement activity, completed blocks, network work and SQK issuance."
network={network}
>
<div className="flex flex-wrap gap-2">
{RANGES.map((item) => (
<button
key={item.key}
type="button"
aria-pressed={range === item.key}
onClick={() => setRange(item.key)}
className={cn(
'rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset transition-colors',
range === item.key
? 'bg-primary text-primary-foreground ring-primary'
: 'bg-muted/40 text-muted-foreground ring-border hover:text-foreground',
)}
>
{item.label}
</button>
))}
</div>

  <DataBoundary
    label="Network analytics"
    data={analytics.data}
    error={analytics.error}
    isLoading={analytics.isLoading}
    onRetry={() => analytics.mutate()}
    rows={4}
  >
    {(data) => {
      const summary = data.summary
      const buckets = data.buckets ?? []
      const mining = data.mining
      const decimals = mining?.economy?.decimals ?? 18
      const symbol = mining?.economy?.symbol ?? 'SQK'

      const maxBlocks = Math.max(
        1,
        ...buckets.map((bucket) => Number(bucket.completedBlockCount) || 0),
      )

      const totalMinted = mining?.rangeMintedBaseUnits ?? '0'

      return (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              label="Settlements"
              value={formatInt(summary?.settlementCount ?? '0')}
              icon={Activity}
            />
            <Stat
              label="Active Rounds"
              value={formatInt(summary?.activeRoundCount ?? '0')}
              icon={TrendingUp}
            />
            <Stat
              label="Completed Blocks"
              value={formatInt(summary?.completedBlockCount ?? '0')}
              icon={Blocks}
            />
            <Stat
              label="SQK Minted"
              value={`${formatToken(totalMinted, decimals)} ${symbol}`}
              icon={Coins}
            />
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold">Completed Blocks</h3>
                <p className="text-xs text-muted-foreground">
                  Block completion activity over time
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {buckets.length} data points
              </span>
            </div>

            {buckets.length > 0 ? (
              <div className="flex h-40 items-end gap-1.5">
                {buckets.map((bucket, index) => {
                  const value = Number(bucket.completedBlockCount) || 0
                  const height = Math.max(3, (value / maxBlocks) * 100)

                  return (
                    <div
                      key={`${bucket.startAt}-${index}`}
                      className="group flex h-full min-w-0 flex-1 flex-col justify-end"
                      title={`${formatDateTime(bucket.startAt)}: ${formatInt(bucket.completedBlockCount)} blocks`}
                    >
                      <div className="mb-1 text-center text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                        {formatInt(bucket.completedBlockCount)}
                      </div>
                      <div
                        className="w-full rounded-t-sm bg-primary/80 transition-all group-hover:bg-primary"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No block activity available for this period.
              </p>
            )}

            {buckets.length > 0 && (
              <div className="mt-3 flex justify-between gap-2 text-[10px] text-muted-foreground">
                <span>{formatDateTime(buckets[0].startAt)}</span>
                <span>{formatDateTime(buckets[buckets.length - 1].endAt)}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <h3 className="mb-3 text-sm font-semibold">Network Work</h3>
              <p className="text-2xl font-semibold tabular-nums">
                {formatInt(summary?.workAdded ?? '0')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Total work added in selected period
              </p>
            </div>

            <div className="rounded-xl border border-border bg-background/40 p-4">
              <h3 className="mb-3 text-sm font-semibold">Mining Checkpoints</h3>
              <p className="text-2xl font-semibold tabular-nums">
                {formatInt(mining?.rangeCheckpointCount ?? '0')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Checkpoints recorded in selected period
              </p>
            </div>
          </div>

          {mining?.nextRound && (
            <div className="rounded-xl border border-border bg-background/40 p-4">
              <h3 className="text-sm font-semibold">Next Mining Round</h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Round</p>
                  <p className="mt-1 font-mono text-sm">
                    {formatInt(mining.nextRound.round)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Starts</p>
                  <p className="mt-1 text-sm">
                    {formatDateTime(mining.nextRound.startsAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ends</p>
                  <p className="mt-1 text-sm">
                    {formatDateTime(mining.nextRound.endsAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
            <span>
              API range: {data.range}
            </span>
            <span>
              Updated {relativeTime(data.chain?.safeBlockTimestamp ?? data.window?.endAt ?? '')}
            </span>
          </div>
        </div>
      )
    }}
  </DataBoundary>
</Section>

)
}
