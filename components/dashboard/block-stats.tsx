'use client'

import { Boxes } from 'lucide-react'
import { useCore, useNetwork, useStatus } from '@/hooks/use-squeek'
import { formatDateTime, formatInt, formatPercent, ratioPercent } from '@/lib/squeek/format'
import { DataBoundary, KeyValue, Section, Stat } from './primitives'

export function BlockStats() {
  const core = useCore()
  const status = useStatus()
  const { network } = useNetwork()

  return (
    <Section
      id="blocks"
      index={3}
      icon={Boxes}
      title="Squeek Block Statistics"
      description="Wheel work is converted into block units; a Squeek block completes every time the unit threshold is reached."
      network={network}
    >
      <DataBoundary label="Block statistics" data={core.data} error={core.error} isLoading={core.isLoading} onRetry={() => core.mutate()}>
        {(c) => {
          const cfg = c.configuration
          const progress = ratioPercent(c.core?.blockProgress, cfg?.blockUnitsPerBlock)
          const queued = status.data?.builder?.queued
          const projected = status.data?.builder?.projected
          return (
            <div className="flex flex-col gap-5">
              <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Block height" value={formatInt(c.core?.blockHeight)} emphasis />
                <Stat label="Cumulative work" value={formatInt(c.core?.cumulativeWork)} unit="units" emphasis />
                <Stat
                  label="Difficulty"
                  value={formatInt(c.core?.workPerThousandBlocks)}
                  unit="work / 1k blocks"
                  emphasis
                />
                <Stat label="Settled through round" value={formatInt(c.core?.settledThroughRound)} emphasis />
              </dl>

              <div className="rounded-xl border border-border bg-background/40 p-4">
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-medium">Progress to block #{formatInt(String(Number(c.core?.blockHeight ?? 0) + 1))}</h3>
                  <span className="font-mono text-sm tabular-nums text-primary">{formatPercent(progress)}</span>
                </div>
                <div
                  role="progressbar"
                  aria-label="Progress to next Squeek block"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress ?? 0}
                  className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-700"
                    style={{ width: `${Math.min(progress ?? 0, 100)}%` }}
                  />
                </div>
                <p className="mt-2 font-mono text-xs text-muted-foreground">
                  {formatInt(c.core?.blockProgress)} / {formatInt(cfg?.blockUnitsPerBlock)} block units
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <h3 className="mb-1 text-sm font-medium">Protocol parameters</h3>
                  <dl>
                    <KeyValue label="Round duration">{cfg ? `${formatInt(cfg.roundDuration)} s` : '—'}</KeyValue>
                    <KeyValue label="Target blocks / active round">{formatInt(cfg?.targetBlocksPerActiveRound)}</KeyValue>
                    <KeyValue label="Max work / round">{formatInt(cfg?.maxWorkPerRound)}</KeyValue>
                    <KeyValue label="Difficulty smoothing">{cfg ? `${formatInt(cfg.difficultySmoothingRounds)} rounds` : '—'}</KeyValue>
                    <KeyValue label="Genesis">{formatDateTime(cfg?.genesisTimestamp)}</KeyValue>
                  </dl>
                </div>
                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <h3 className="mb-1 text-sm font-medium">Builder queue (off-chain, unsettled)</h3>
                  {queued || projected ? (
                    <dl>
                      <KeyValue label="Closed rounds awaiting settlement">{formatInt(queued?.closedRoundCount)}</KeyValue>
                      <KeyValue label="Closed work units">{formatInt(queued?.closedWorkUnits)}</KeyValue>
                      <KeyValue label="Open round work units">{formatInt(queued?.openRoundWorkUnits)}</KeyValue>
                      <KeyValue label="Projected height">{formatInt(projected?.blockHeight)}</KeyValue>
                      <KeyValue label="Projected cumulative work">{formatInt(projected?.cumulativeWork)}</KeyValue>
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {status.isLoading ? 'Loading…' : 'Builder data not reported by the status endpoint.'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )
        }}
      </DataBoundary>
    </Section>
  )
}
