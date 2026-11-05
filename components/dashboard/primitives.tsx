'use client'

import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, ArrowUpRight, CloudOff, RotateCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { NetworkInfo } from '@/lib/squeek/network'

export function Section({
  id,
  index,
  title,
  description,
  icon: Icon,
  network,
  action,
  className,
  children,
}: {
  id: string
  index: number
  title: string
  description?: string
  icon: LucideIcon
  network?: NetworkInfo
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const headingId = `${id}-heading`
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        'flex flex-col gap-5 rounded-2xl border border-border bg-card/80 p-5 shadow-[0_0_0_1px_oklch(1_0_0/0.02)_inset] md:p-6',
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-primary/25">
            <Icon className="size-4.5" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-0.5">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {String(index).padStart(2, '0')}
            </p>
            <h2 id={headingId} className="text-pretty text-base font-semibold tracking-tight md:text-lg">
              {title}
            </h2>
            {description ? <p className="text-pretty text-sm text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {action}
          {network ? <NetworkChip network={network} /> : null}
        </div>
      </header>
      {children}
    </section>
  )
}

export function NetworkChip({ network, size = 'sm' }: { network: NetworkInfo; size?: 'sm' | 'md' }) {
  const styles = {
    testnet: 'bg-warning/12 text-warning ring-warning/30',
    mainnet: 'bg-success/12 text-success ring-success/30',
    unknown: 'bg-muted text-muted-foreground ring-border',
  }[network.kind]
  const label = { testnet: 'Testnet', mainnet: 'Mainnet', unknown: 'Unverified' }[network.kind]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-mono font-medium uppercase ring-1 ring-inset',
        size === 'sm' ? 'px-2 py-0.5 text-[10px] tracking-wider' : 'px-2.5 py-1 text-xs tracking-wider',
        styles,
      )}
      title={`${network.name}${network.chainId ? ` · chain ${network.chainId}` : ''}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
      <span className="sr-only">
        {' '}
        data from {network.name}
        {network.chainId ? `, chain ID ${network.chainId}` : ''}
      </span>
    </span>
  )
}

export function Stat({
  label,
  value,
  unit,
  hint,
  emphasis = false,
  className,
}: {
  label: string
  value: React.ReactNode
  unit?: string
  hint?: React.ReactNode
  emphasis?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1 rounded-xl border border-border bg-background/40 p-4', className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="flex min-w-0 items-baseline gap-1.5">
        <span
          className={cn(
            'truncate font-mono tabular-nums tracking-tight',
            emphasis ? 'text-2xl font-semibold text-foreground md:text-3xl' : 'text-lg font-medium',
          )}
        >
          {value}
        </span>
        {unit ? <span className="shrink-0 text-xs text-muted-foreground">{unit}</span> : null}
      </dd>
      {hint ? <dd className="truncate text-xs text-muted-foreground">{hint}</dd> : null}
    </div>
  )
}

export type Tone = 'good' | 'warn' | 'bad' | 'neutral' | 'accent'

export function StatusPill({ tone, children, pulse = false }: { tone: Tone; children: React.ReactNode; pulse?: boolean }) {
  const styles: Record<Tone, string> = {
    good: 'bg-success/10 text-success ring-success/25',
    warn: 'bg-warning/10 text-warning ring-warning/25',
    bad: 'bg-destructive/10 text-destructive ring-destructive/25',
    neutral: 'bg-muted text-muted-foreground ring-border',
    accent: 'bg-primary/12 text-primary ring-primary/25',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        styles[tone],
      )}
    >
      <span className="relative flex size-1.5" aria-hidden="true">
        {pulse ? <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60" /> : null}
        <span className="relative inline-flex size-1.5 rounded-full bg-current" />
      </span>
      {children}
    </span>
  )
}

export function KeyValue({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/60 py-2.5 text-sm last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-mono text-[13px] tabular-nums">{children}</dd>
    </div>
  )
}

export function ExternalLink({ href, children, className }: { href: string | null; children: React.ReactNode; className?: string }) {
  if (!href) return <span className={className}>{children}</span>
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-sm text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring',
        className,
      )}
    >
      {children}
      <ArrowUpRight className="size-3 shrink-0" aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

export function LoadingState({ rows = 4, label }: { rows?: number; label: string }) {
  return (
    <div role="status" aria-live="polite" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <span className="sr-only">Loading {label}…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-[88px] rounded-xl bg-muted/60" />
      ))}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium">Could not reach the Squeekchain API</p>
          <p className="font-mono text-xs text-muted-foreground">{message}</p>
        </div>
      </div>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw className="size-3.5" aria-hidden="true" />
          Retry
        </Button>
      ) : null}
    </div>
  )
}

export function UnavailableState({ what }: { what: string }) {
  return (
    <div role="status" className="flex items-start gap-3 rounded-xl border border-warning/25 bg-warning/5 p-4">
      <CloudOff className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium">{what} is temporarily unavailable</p>
        <p className="text-xs text-muted-foreground">
          The API reported <code className="font-mono">status: unavailable</code>. No values are shown rather than
          guessing. This section refreshes automatically.
        </p>
      </div>
    </div>
  )
}

/** Renders loading / error / unavailable states and only calls children once real data exists. */
export function DataBoundary<T extends { status?: string }>({
  label,
  data,
  error,
  isLoading,
  onRetry,
  rows,
  children,
}: {
  label: string
  data: T | undefined
  error: { message: string } | undefined
  isLoading: boolean
  onRetry: () => void
  rows?: number
  children: (data: T) => React.ReactNode
}) {
  if (!data && isLoading) return <LoadingState label={label} rows={rows} />
  if (!data && error) return <ErrorState message={error.message} onRetry={onRetry} />
  if (!data) return <LoadingState label={label} rows={rows} />
  if (data.status && data.status !== 'available') return <UnavailableState what={label} />
  return (
    <>
      {error ? (
        <p role="status" className="-mt-2 text-xs text-warning">
          Showing last successful response — latest refresh failed ({error.message}).
        </p>
      ) : null}
      {children(data)}
    </>
  )
}
