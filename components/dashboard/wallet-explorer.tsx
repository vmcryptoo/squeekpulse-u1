'use client'

import { useMemo, useState } from 'react'
import { Search, Wallet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCore, useEconomy, useEvents, useNetwork } from '@/hooks/use-squeek'
import { humanize, shortHash } from '@/lib/squeek/format'
import { explorerAddress } from '@/lib/squeek/network'
import { EventRow } from './recent-events'
import { ExternalLink, Section, StatusPill } from './primitives'

const ADDRESS_RE = /^0x[a-fA-F0-9]{40}$/

function collectAddresses(value: unknown, path: string, out: Map<string, string>) {
  if (typeof value === 'string' && ADDRESS_RE.test(value)) {
    const key = value.toLowerCase()
    if (!out.has(key)) out.set(key, path)
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) collectAddresses(v, path ? `${path}.${k}` : k, out)
  }
}

export function WalletExplorer() {
  const events = useEvents()
  const core = useCore()
  const economy = useEconomy()
  const { network } = useNetwork()
  const [input, setInput] = useState('')
  const [query, setQuery] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const protocolRoles = useMemo(() => {
    const map = new Map<string, string>()
    collectAddresses(
      { identities: core.data?.identities, configuration: core.data?.configuration, implementation: core.data?.implementation },
      '',
      map,
    )
    collectAddresses({ asset: economy.data?.asset, authMinter: economy.data?.authMinter, capabilities: economy.data?.capabilities }, '', map)
    return map
  }, [core.data, economy.data])

  const activeAccounts = useMemo(() => {
    const seen = new Set<string>()
    for (const e of events.data?.events ?? []) {
      const account = e.payload.account
      if (typeof account === 'string' && ADDRESS_RE.test(account)) seen.add(account.toLowerCase())
    }
    return [...seen].slice(0, 6)
  }, [events.data])

  const normalized = query?.toLowerCase() ?? null
  const matches = useMemo(() => {
    if (!normalized) return []
    return (events.data?.events ?? []).filter((e) => {
      const found = new Map<string, string>()
      collectAddresses(e.payload, '', found)
      return found.has(normalized) || e.source.contractAddress?.toLowerCase() === normalized
    })
  }, [events.data, normalized])

  function lookup(address: string) {
    const value = address.trim()
    if (!ADDRESS_RE.test(value)) {
      setError('Enter a 42-character hex address starting with 0x.')
      setQuery(null)
      return
    }
    setError(null)
    setInput(value)
    setQuery(value)
  }

  const role = normalized ? protocolRoles.get(normalized) : undefined

  return (
    <Section
      id="wallet"
      index={7}
      icon={Wallet}
      title="Wallet Address Explorer"
      description="Look up any address against the indexed event window and known protocol contracts."
      network={network}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          lookup(input)
        }}
        className="flex flex-col gap-2 sm:flex-row"
        noValidate
      >
        <label htmlFor="wallet-address" className="sr-only">
          Wallet or contract address
        </label>
        <Input
          id="wallet-address"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="0x…"
          spellCheck={false}
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'wallet-error' : undefined}
          className="h-10 font-mono text-sm"
        />
        <Button type="submit" className="h-10">
          <Search className="size-4" aria-hidden="true" />
          Look up
        </Button>
      </form>
      {error ? (
        <p id="wallet-error" role="alert" className="-mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}

      {activeAccounts.length ? (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Recently active:</span>
          {activeAccounts.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => lookup(a)}
              className="rounded-full bg-muted/50 px-2.5 py-1 font-mono ring-1 ring-border transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-ring"
            >
              {shortHash(a)}
            </button>
          ))}
        </div>
      ) : null}

      {query ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/40 p-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="break-all font-mono text-sm">{query}</p>
            <ExternalLink href={explorerAddress(network, query)} className="text-xs">
              Open in block explorer
            </ExternalLink>
          </div>
          <div className="flex flex-wrap gap-2">
            {role ? <StatusPill tone="accent">Protocol address · {humanize(role.split('.').pop())}</StatusPill> : null}
            <StatusPill tone={matches.length ? 'good' : 'neutral'}>
              {matches.length} matching {matches.length === 1 ? 'event' : 'events'}
            </StatusPill>
          </div>
          {matches.length ? (
            <ul className="divide-y divide-border/60">
              {matches.map((e) => (
                <EventRow key={e.id} event={e} network={network} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {events.isLoading
                ? 'Loading events…'
                : 'This address does not appear in the most recent indexed events.'}
            </p>
          )}
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        The public API does not expose per-wallet balances or full history, so lookups cover only the latest{' '}
        {events.data?.events?.length ?? '—'} indexed events. Use the block explorer link for complete on-chain history.
      </p>
    </Section>
  )
}
