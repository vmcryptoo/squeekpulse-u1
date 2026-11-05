'use client'

import { Gauge } from 'lucide-react'
import { useEvents, useNetwork, useStatus } from '@/hooks/use-squeek'
import { formatDateTime, formatInt, humanize, relativeTime } from '@/lib/squeek/format'
import { DataBoundary, KeyValue, Section, Stat, StatusPill } from './primitives'

const numberFmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })

export function WheelActivity() {
  const status = useStatus()
  const events = useEvents()
  const { network } = useNetwork()

  const milestones = (events.data?.events ?? []).filter((e) => e.type.startsWith('measurement.')).slice(0, 5)

  return (
    <Section
      id="wheel"
      index={2}
      icon={Gauge}
      title="Hamster Wheel Activity"
      description="Latest hardware measurement reported by the wheel sensor and its signed module."
      network={network}
    >
      <DataBoundary
        label="Wheel telemetry"
        data={status.data}
        error={status.error}
        isLoading={status.isLoading}
        onRetry={() => status.mutate()}
      >
        {(s) => {
          const m = s.measurement
          if (!m) return <p className="text-sm text-muted-foreground">No measurement has been reported yet.</p>
          const ageSeconds = (Date.now() - new Date(m.observedAt).getTime()) / 1000
          const stale = ageSeconds > m.staleAfterSeconds
          const freshness = stale && m.freshness === 'online' ? 'stale' : m.freshness
          const tone = freshness === 'online' ? 'good' : freshness === 'stale' ? 'warn' : 'bad'
          const isRunning = m.rpmMilli > 0
          return (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={tone} pulse={freshness === 'online'}>
                  Sensor {humanize(freshness)}
                </StatusPill>
                <StatusPill tone={isRunning ? 'accent' : 'neutral'}>Wheel {humanize(m.coreStatus)}</StatusPill>
                <StatusPill tone="neutral">Provenance: {humanize(m.provenance)}</StatusPill>
                <span className="text-xs text-muted-foreground">
                  Observed {relativeTime(m.observedAt)} · stale after {m.staleAfterSeconds}s
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Wheel speed" value={numberFmt.format(m.rpmMilli / 1000)} unit="RPM" emphasis />
                <Stat
                  label="Ground speed"
                  value={numberFmt.format(m.speedMmPerSecond / 1000)}
                  unit="m/s"
                  emphasis
                  hint={`${numberFmt.format((m.speedMmPerSecond / 1_000_000) * 3600)} km/h`}
                />
                <Stat
                  label="Distance (counter epoch)"
                  value={numberFmt.format(m.distanceMm / 1000)}
                  unit="m"
                  emphasis
                />
                <Stat label="Cumulative work" value={formatInt(m.cumulativeWorkUnits)} unit="units" emphasis />
              </dl>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <h3 className="mb-2 text-sm font-medium">Sensor modules</h3>
                  {s.modules?.length ? (
                    <ul className="flex flex-col gap-2">
                      {s.modules.map((mod) => (
                        <li
                          key={mod.instanceId}
                          className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2 text-sm"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-medium">{humanize(mod.moduleType)}</p>
                            <p className="truncate font-mono text-xs text-muted-foreground">
                              {mod.driverId} · v{mod.moduleVersion}
                            </p>
                          </div>
                          <StatusPill tone={mod.state.toLowerCase().includes('fault') ? 'bad' : 'good'}>
                            {humanize(mod.state)}
                          </StatusPill>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No modules reported.</p>
                  )}
                  {s.signer ? (
                    <dl className="mt-3">
                      <KeyValue label="Signer">{`${s.signer.kind} · ${s.signer.algorithm}`}</KeyValue>
                      <KeyValue label="Last verified">{relativeTime(s.signer.lastVerifiedAt)}</KeyValue>
                    </dl>
                  ) : null}
                </div>

                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <h3 className="mb-2 text-sm font-medium">Recent wheel milestones</h3>
                  {milestones.length ? (
                    <ul className="flex flex-col divide-y divide-border/60">
                      {milestones.map((e) => (
                        <li key={e.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                          <span>{humanize(e.type.replace('measurement.', ''))}</span>
                          <time dateTime={e.occurredAt} className="font-mono text-xs text-muted-foreground" title={formatDateTime(e.occurredAt)}>
                            {relativeTime(e.occurredAt)}
                          </time>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {events.isLoading ? 'Loading…' : 'No measurement milestones in the recent event window.'}
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
