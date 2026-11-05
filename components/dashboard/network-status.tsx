'use client'

import { Activity } from 'lucide-react'
import { useCore, useNetwork, useStatus } from '@/hooks/use-squeek'
import { formatDateTime, formatInt, humanize, relativeTime, shortHash, toBigInt } from '@/lib/squeek/format'
import { explorerBlock, explorerTx } from '@/lib/squeek/network'
import { DataBoundary, ExternalLink, KeyValue, Section, Stat, StatusPill, type Tone } from './primitives'

function stateTone(state?: string | null): Tone {
  if (!state) return 'neutral'
  const s = state.toLowerCase()
  if (['healthy', 'idle', 'ok', 'ready', 'accepted', 'confirmed', 'succeeded', 'success', 'available', 'online'].some((k) => s.includes(k)))
    return 'good'
  if (['fail', 'error', 'blocked', 'incident', 'offline', 'paused'].some((k) => s.includes(k))) return 'bad'
  if (['stale', 'pending', 'degraded', 'waiting', 'lag'].some((k) => s.includes(k))) return 'warn'
  return 'accent'
}

export function NetworkStatus() {
  const status = useStatus()
  const core = useCore()
  const { network } = useNetwork()

  return (
    <Section
      id="network"
      index={1}
      icon={Activity}
      title="Live Network Status"
      description="Indexer, oracle and settlement pipeline health, refreshed every 10 seconds."
      network={network}
    >
      <DataBoundary
        label="Network status"
        data={core.data}
        error={core.error}
        isLoading={core.isLoading}
        onRetry={() => core.mutate()}
      >
        {(c) => {
          const chain = c.chain
          const indexed = toBigInt(chain?.indexedThroughBlock)
          const safe = toBigInt(chain?.safeThroughBlock)
          const lag = indexed !== null && safe !== null ? indexed - safe : null
          const s = status.data
          const queue = s?.settlementQueue
          return (
            <div className="flex flex-col gap-5">
              <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat
                  label="Indexed through block"
                  value={formatInt(chain?.indexedThroughBlock)}
                  hint={
                    <ExternalLink href={explorerBlock(network, chain?.indexedThroughBlock)}>View on explorer</ExternalLink>
                  }
                />
                <Stat
                  label="Safe (finalized) block"
                  value={formatInt(chain?.safeThroughBlock)}
                  hint={`${formatInt(chain?.confirmations)} confirmations required`}
                />
                <Stat
                  label="Confirmation lag"
                  value={lag === null ? '—' : formatInt(lag.toString())}
                  unit="blocks"
                  hint="Indexed minus safe head"
                />
                <Stat
                  label="Chain"
                  value={humanize(chain?.target)}
                  hint={`Chain ID ${chain?.chainId ?? '—'}`}
                />
              </dl>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Core contract</h3>
                    <StatusPill tone={c.core?.paused ? 'bad' : 'good'} pulse={!c.core?.paused}>
                      {c.core?.paused ? 'Paused' : 'Running'}
                    </StatusPill>
                  </div>
                  <dl>
                    <KeyValue label="Settled through round">{formatInt(c.core?.settledThroughRound)}</KeyValue>
                    <KeyValue label="Code version">{c.implementation?.codeVersion ?? '—'}</KeyValue>
                    <KeyValue label="Last event">{humanize(c.source?.eventName)}</KeyValue>
                    <KeyValue label="Event tx">
                      <ExternalLink href={explorerTx(network, c.source?.transactionHash)}>
                        {shortHash(c.source?.transactionHash)}
                      </ExternalLink>
                    </KeyValue>
                  </dl>
                </div>

                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Oracle</h3>
                    {s?.oracle ? <StatusPill tone={stateTone(s.oracle.state)}>{humanize(s.oracle.state)}</StatusPill> : null}
                  </div>
                  {s?.oracle ? (
                    <dl>
                      <KeyValue label="Last accepted">{relativeTime(s.oracle.latestAcceptedAt)}</KeyValue>
                      <KeyValue label="Latest closure rounds">
                        {s.oracle.latestClosure
                          ? `${s.oracle.latestClosure.firstRound}–${s.oracle.latestClosure.lastRound}`
                          : '—'}
                      </KeyValue>
                      <KeyValue label="Reason">{s.oracle.reason ?? 'None reported'}</KeyValue>
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{status.error ? 'Status endpoint unreachable.' : 'Loading…'}</p>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium">Settlement queue</h3>
                    {queue ? <StatusPill tone={stateTone(queue.incidentOpen ? 'incident' : queue.state)}>{humanize(queue.state)}</StatusPill> : null}
                  </div>
                  {queue ? (
                    <dl>
                      <KeyValue label="Settlement enabled">{queue.settlementEnabled ? 'Yes' : 'No'}</KeyValue>
                      <KeyValue label="Open incident">{queue.incidentOpen ? 'Yes' : 'No'}</KeyValue>
                      <KeyValue label="Last run">
                        {queue.lastRun ? `${humanize(queue.lastRun.result)} · ${relativeTime(queue.lastRun.finishedAt)}` : '—'}
                      </KeyValue>
                      <KeyValue label="Latest submission">
                        <ExternalLink href={explorerTx(network, queue.latestSubmission?.transactionHash)}>
                          {queue.latestSubmission ? `Round ${queue.latestSubmission.settledThroughRound}` : '—'}
                        </ExternalLink>
                      </KeyValue>
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-foreground">{status.error ? 'Status endpoint unreachable.' : 'Loading…'}</p>
                  )}
                </div>
              </div>

              <p className="font-mono text-xs text-muted-foreground">
                Status generated {formatDateTime(s?.generatedAt)} · installation {s?.installationId ?? c.installationId}
              </p>
            </div>
          )
        }}
      </DataBoundary>
    </Section>
  )
}
