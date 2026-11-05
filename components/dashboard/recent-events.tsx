'use client'

import { useState } from 'react'
import { ListTree } from 'lucide-react'
import { useEvents, useNetwork } from '@/hooks/use-squeek'
import { formatDateTime, formatInt, formatToken, humanize, relativeTime, shortHash } from '@/lib/squeek/format'
import { explorerAddress, explorerTx, type NetworkInfo } from '@/lib/squeek/network'
import type { ChainEvent } from '@/lib/squeek/types'
import { cn } from '@/lib/utils'
import { DataBoundary, ExternalLink, Section, StatusPill, type Tone } from './primitives'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'system', label: 'Settlement' },
  { key: 'account', label: 'Accounts' },
  { key: 'nft', label: 'NFTs' },
  { key: 'measurement', label: 'Wheel' },
] as const

const CATEGORY_TONE: Record<string, Tone> = {
  system: 'accent',
  account: 'good',
  nft: 'warn',
  measurement: 'neutral',
}

const SKIP_KEYS = new Set([
  'cumulativeBlockUnits',
  'previousSettledThroughRound',
  'firstCompletedBlock',
  'lastCompletedBlock',
])

const PAGE_SIZE = 21

function isAddress(value: unknown): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value)
}

export function PayloadValue({
  field,
  value,
  network,
  event,
}: {
  field: string
  value: unknown
  network: NetworkInfo
  event: ChainEvent
}) {
  if (isAddress(value)) {
    return (
      <ExternalLink href={explorerAddress(network, value)} className="font-mono">
        {shortHash(value)}
      </ExternalLink>
    )
  }

  if (field.endsWith('BaseUnits') && typeof value === 'string') {
    const asset = event.payload.asset as { decimals?: number; symbol?: string } | undefined
    return <span>{`${formatToken(value, asset?.decimals ?? 18)} ${asset?.symbol ?? 'SQK'}`}</span>
  }

  if (field.endsWith('MmPerSecond') && typeof value === 'string') {
    return <span>{`${(Number(value) / 1000).toFixed(2)} m/s`}</span>
  }

  if (field.endsWith('Mm') && typeof value === 'string') {
    return <span>{`${(Number(value) / 1000).toFixed(1)} m`}</span>
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return <span>{formatInt(value)}</span>
  }

  if (typeof value === 'boolean') {
    return <span>{value ? 'Yes' : 'No'}</span>
  }

  return <span>{String(value)}</span>
}

export function EventRow({
  event,
  network,
}: {
  event: ChainEvent
  network: NetworkInfo
}) {
  const [category, name] = event.type.split('.')

  const fields = Object.entries(event.payload).filter(
    ([k, v]) =>
      v !== null &&
      typeof v !== 'object' &&
      !SKIP_KEYS.has(k) &&
      !(k === 'amountBaseUnits' && v === '0' && false),
  )

  return (
    <li className="flex flex-col gap-2 py-3.5 md:flex-row md:items-start md:gap-4">
      <div className="flex shrink-0 items-center gap-2 md:w-56">
        <StatusPill tone={CATEGORY_TONE[category] ?? 'neutral'}>
          {humanize(category)}
        </StatusPill>

        <span className="text-sm font-medium">
          {humanize(name)}
        </span>
      </div>

      <dl className="flex min-w-0 flex-1 flex-wrap gap-x-4 gap-y-1 text-xs">
        {fields.slice(0, 5).map(([k, v]) => (
          <div key={k} className="flex gap-1.5">
            <dt className="text-muted-foreground">
              {humanize(k)}
            </dt>

            <dd className="font-mono tabular-nums">
              <PayloadValue
                field={k}
                value={v}
                network={network}
                event={event}
              />
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex shrink-0 items-center gap-3 text-xs md:flex-col md:items-end md:gap-0.5">
        <time
          dateTime={event.occurredAt}
          title={formatDateTime(event.occurredAt)}
          className="text-muted-foreground"
        >
          {relativeTime(event.occurredAt)}
        </time>

        {event.source.transactionHash ? (
          <ExternalLink
            href={explorerTx(network, event.source.transactionHash)}
            className="font-mono"
          >
            {shortHash(event.source.transactionHash)}
          </ExternalLink>
        ) : (
          <span className="font-mono text-muted-foreground">
            {humanize(event.source.kind)}
          </span>
        )}
      </div>
    </li>
  )
}

export function RecentEvents() {
  const events = useEvents()
  const { network } = useNetwork()

  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]['key']>('all')
  const [limit, setLimit] = useState(PAGE_SIZE)

  return (
    <Section
      id="events"
      index={5}
      icon={ListTree}
      title="Recent Events"
      description="Settlements, checkpoints, staking, NFT and wheel milestones as indexed by the API."
      network={network}
    >
      <DataBoundary
        label="Recent events"
        data={events.data}
        error={events.error}
        isLoading={events.isLoading}
        onRetry={() => events.mutate()}
        rows={4}
      >
        {(d) => {
          const all = d.events ?? []

          const visible =
            filter === 'all'
              ? all
              : all.filter((e) => e.type.startsWith(`${filter}.`))

          const displayed = visible.slice(0, limit)

          return (
            <div className="flex flex-col gap-3">

              {/* Category Filters */}
              <div
                role="group"
                aria-label="Filter events by category"
                className="flex flex-wrap gap-1.5"
              >
                {CATEGORIES.map((c) => {
                  const count =
                    c.key === 'all'
                      ? all.length
                      : all.filter((e) => e.type.startsWith(`${c.key}.`)).length

                  return (
                    <button
                      key={c.key}
                      type="button"
                      aria-pressed={filter === c.key}
                      onClick={() => {
                        setFilter(c.key)
                        setLimit(PAGE_SIZE)
                      }}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                        filter === c.key
                          ? 'bg-primary text-primary-foreground ring-primary'
                          : 'bg-muted/40 text-muted-foreground ring-border hover:text-foreground',
                      )}
                    >
                      {c.label}{' '}
                      <span className="font-mono opacity-70">
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Event List */}
              {displayed.length ? (
                <ul
                  className="divide-y divide-border/60 rounded-xl border border-border bg-background/40 px-4"
                  aria-live="polite"
                >
                  {displayed.map((e) => (
                    <EventRow
                      key={e.id}
                      event={e}
                      network={network}
                    />
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No events in this category within the latest indexed window.
                </p>
              )}

              {/* See More Button */}
              {visible.length > limit && (
                <button
                  type="button"
                  onClick={() => setLimit((prev) => prev + PAGE_SIZE)}
                  className="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm font-semibold transition-colors hover:bg-accent"
                >
                  See More ({visible.length - limit} remaining)
                </button>
              )}

              {/* Event Count */}
              <p className="text-xs text-muted-foreground">
                Showing {displayed.length} of {visible.length} matching events ·
                {` ${all.length} total events returned by the API · `}
                updated {relativeTime(d.generatedAt)}
              </p>

            </div>
          )
        }}
      </DataBoundary>
    </Section>
  )
}
