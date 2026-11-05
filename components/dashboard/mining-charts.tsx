'use client'

import { useState } from 'react'
import { Pickaxe } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { useNetwork, useSettlements } from '@/hooks/use-squeek'
import {
  baseUnitsToNumber,
  formatInt,
  formatToken,
  relativeTime,
  shortHash,
} from '@/lib/squeek/format'
import { explorerTx } from '@/lib/squeek/network'
import { cn } from '@/lib/utils'
import {
  DataBoundary,
  ExternalLink,
  Section,
  Stat,
} from './primitives'

const RANGES = ['24h', '7d', '30d'] as const
type Range = (typeof RANGES)[number]

const workConfig = {
  workAdded: { label: 'Work added', color: 'var(--chart-1)' },
} satisfies ChartConfig

const activityConfig = {
  settlementCount: { label: 'Settlements', color: 'var(--chart-2)' },
  completedBlockCount: {
    label: 'Blocks completed',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig

function bucketLabel(iso: string, bucketSeconds: number) {
  const d = new Date(iso)

  return bucketSeconds >= 86400
    ? d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : bucketSeconds >= 21600
      ? d.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          hour12: false,
        })
      : d.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
}

export function MiningCharts() {
  const [range, setRange] = useState<Range>('24h')
  const settlements = useSettlements(range)
  const { network } = useNetwork()

  const rangeToggle = (
    <div
      role="radiogroup"
      aria-label="Chart time range"
      className="flex rounded-lg bg-muted/50 p-0.5 ring-1 ring-border"
    >
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          role="radio"
          aria-checked={range === r}
          onClick={() => setRange(r)}
          className={cn(
            'rounded-md px-2.5 py-1 font-mono text-xs transition-colors focus-visible:outline-2 focus-visible:outline-ring',
            range === r
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {r}
        </button>
      ))}
    </div>
  )

  return (
    <Section
      id="mining"
      index={6}
      icon={Pickaxe}
      title="Mining Activity"
      description="Settled wheel work, completed blocks and SQK minted, bucketed by the API."
      network={network}
      action={rangeToggle}
    >
      <DataBoundary
        label="Mining activity"
        data={settlements.data}
        error={settlements.error}
        isLoading={settlements.isLoading}
        onRetry={() => settlements.mutate()}
      >
        {(d) => {
          const bucketSeconds = d.window?.bucketSeconds ?? 3600
          const decimals = d.mining?.economy?.decimals ?? 18
          const symbol = d.mining?.economy?.symbol ?? 'SQK'

          const rows = (d.buckets ?? []).map((b) => ({
            label: bucketLabel(b.startAt, bucketSeconds),
            workAdded: Number(b.workAdded),
            settlementCount: Number(b.settlementCount),
            completedBlockCount: Number(b.completedBlockCount),
            sqkMinted:
              baseUnitsToNumber(b.sqkMintedBaseUnits, decimals) ?? 0,
          }))

          const hasWork = rows.some((r) => r.workAdded > 0)

          return (
            <div
              className={cn(
                'flex min-w-0 flex-col gap-5 transition-opacity',
                settlements.isValidating && 'opacity-80',
              )}
            >
              {/* Statistics */}
              <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">
                <Stat
                  label="Settlements"
                  value={formatInt(d.summary?.settlementCount)}
                />

                <Stat
                  label="Active rounds"
                  value={formatInt(d.summary?.activeRoundCount)}
                />

                <Stat
                  label="Work added"
                  value={formatInt(d.summary?.workAdded)}
                  unit="units"
                />

                <Stat
                  label="Blocks completed"
                  value={formatInt(d.summary?.completedBlockCount)}
                />

                <Stat
                  label="SQK minted"
                  value={formatToken(
                    d.mining?.rangeMintedBaseUnits,
                    decimals,
                  )}
                  unit={symbol}
                  className="col-span-2 lg:col-span-1"
                />
              </dl>

              {/* Charts */}
              <div className="grid min-w-0 gap-4 lg:grid-cols-2">

                {/* Work Added Chart */}
                <figure className="min-w-0 overflow-hidden rounded-xl border border-border bg-background/40 p-4">
                  <figcaption className="mb-3 flex flex-wrap items-baseline justify-between gap-2 text-sm font-medium">
                    <span>Work added per bucket</span>

                    {!hasWork ? (
                      <span className="text-xs font-normal text-muted-foreground">
                        No work settled in range
                      </span>
                    ) : null}
                  </figcaption>

                  <ChartContainer
                    config={workConfig}
                    className="mx-auto h-36 w-[75%] min-w-0"
                  >
                    <AreaChart
                      data={rows}
                      margin={{ left: -16, right: 8, top: 8 }}
                      accessibilityLayer
                    >
                      <defs>
                        <linearGradient
                          id="fillWork"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--color-workAdded)"
                            stopOpacity={0.5}
                          />

                          <stop
                            offset="95%"
                            stopColor="var(--color-workAdded)"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        minTickGap={24}
                        fontSize={11}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        fontSize={11}
                      />

                      <ChartTooltip
                        content={<ChartTooltipContent />}
                      />

                      <Area
                        type="monotone"
                        dataKey="workAdded"
                        stroke="var(--color-workAdded)"
                        strokeWidth={2}
                        fill="url(#fillWork)"
                      />
                    </AreaChart>
                  </ChartContainer>
                </figure>

                {/* Settlements & Blocks Chart */}
                <figure className="min-w-0 overflow-hidden rounded-xl border border-border bg-background/40 p-4">
                  <figcaption className="mb-3 text-sm font-medium">
                    Settlements &amp; completed blocks
                  </figcaption>

                  <ChartContainer
                    config={activityConfig}
                    className="mx-auto h-36 w-[75%] min-w-0"
                  >
                    <BarChart
                      data={rows}
                      margin={{ left: -16, right: 8, top: 8 }}
                      accessibilityLayer
                    >
                      <CartesianGrid
                        vertical={false}
                        strokeDasharray="3 3"
                      />

                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        minTickGap={24}
                        fontSize={11}
                      />

                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        fontSize={11}
                      />

                      <ChartTooltip
                        content={<ChartTooltipContent />}
                      />

                      <Bar
                        dataKey="settlementCount"
                        fill="var(--color-settlementCount)"
                        radius={[3, 3, 0, 0]}
                      />

                      <Bar
                        dataKey="completedBlockCount"
                        fill="var(--color-completedBlockCount)"
                        radius={[3, 3, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </figure>
              </div>

              {/* Recent Mining Checkpoints */}
              <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-background/40 p-4">
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-medium">
                    Recent mining checkpoints
                  </h3>

                  {d.mining?.nextRound ? (
                    <p className="font-mono text-xs text-muted-foreground">
                      Next round{' '}
                      {formatInt(d.mining.nextRound.round)} ·{' '}
                      {d.mining.nextRound.state} · ends{' '}
                      {relativeTime(d.mining.nextRound.endsAt)}
                    </p>
                  ) : null}
                </div>

                {d.mining?.recentCheckpoints?.length ? (
                  <div className="w-full min-w-0 overflow-x-auto">
                    <table className="w-full min-w-[520px] text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground">
                          <th scope="col" className="py-2 font-normal">
                            Rounds
                          </th>

                          <th scope="col" className="py-2 font-normal">
                            Blocks
                          </th>

                          <th scope="col" className="py-2 font-normal">
                            Minted
                          </th>

                          <th scope="col" className="py-2 font-normal">
                            Status
                          </th>

                          <th scope="col" className="py-2 text-right font-normal">
                            Transaction
                          </th>
                        </tr>
                      </thead>

                      <tbody className="font-mono text-[13px] tabular-nums">
                        {d.mining.recentCheckpoints.map((cp) => (
                          <tr
                            key={cp.transactionHash + cp.throughRound}
                            className="border-t border-border/60"
                          >
                            <td className="py-2">
                              {`${formatInt(cp.afterRound)} → ${formatInt(cp.throughRound)}`}
                            </td>

                            <td className="py-2">
                              {formatInt(cp.completedBlockCount)}
                            </td>

                            <td className="py-2">
                              {`${formatToken(cp.amountBaseUnits, decimals)} ${symbol}`}
                            </td>

                            <td className="py-2 text-muted-foreground">
                              {cp.confirmationStatus}
                            </td>

                            <td className="py-2 text-right">
                              <ExternalLink
                                href={explorerTx(
                                  network,
                                  cp.transactionHash,
                                )}
                              >
                                {shortHash(cp.transactionHash)}
                              </ExternalLink>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No checkpoints recorded in this range.
                  </p>
                )}
              </div>
            </div>
          )
        }}
      </DataBoundary>
    </Section>
  )
}
