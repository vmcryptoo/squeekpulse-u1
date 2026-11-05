const intFormat = new Intl.NumberFormat('en-US')
const compactFormat = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 })

export function toBigInt(value: string | number | null | undefined): bigint | null {
  if (value === null || value === undefined || value === '') return null
  try {
    return BigInt(value)
  } catch {
    return null
  }
}

export function formatInt(value: string | number | null | undefined): string {
  const n = toBigInt(value)
  return n === null ? '—' : intFormat.format(n)
}

/** Converts on-chain base units to a decimal number. Precision beyond ~15 digits is only used for display. */
export function baseUnitsToNumber(value: string | null | undefined, decimals: number): number | null {
  const n = toBigInt(value)
  if (n === null) return null
  let scale = BigInt(1)
  for (let i = 0; i < decimals; i++) scale *= BigInt(10)
  const whole = n / scale
  const fraction = n % scale
  return Number(whole) + Number(fraction) / Number(scale)
}

export function formatToken(value: string | null | undefined, decimals: number, compact = false): string {
  const n = baseUnitsToNumber(value, decimals)
  if (n === null) return '—'
  if (compact) return compactFormat.format(n)
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: n < 1 && n > 0 ? 6 : 2 }).format(n)
}

export function ratioPercent(part: string | null | undefined, whole: string | null | undefined): number | null {
  const p = toBigInt(part)
  const w = toBigInt(whole)
  if (p === null || w === null || w === BigInt(0)) return null
  return Number((p * BigInt(1_000_000)) / w) / 10_000
}

export function formatPercent(value: number | null, digits = 2): string {
  return value === null ? '—' : `${value.toFixed(digits)}%`
}

export function shortHash(value: string | null | undefined, lead = 6, tail = 4): string {
  if (!value) return '—'
  return value.length <= lead + tail + 2 ? value : `${value.slice(0, lead)}…${value.slice(-tail)}`
}

export function parseTimestamp(value: string | null | undefined): Date | null {
  if (!value) return null
  const asNumber = Number(value)
  const date = Number.isFinite(asNumber) && /^\d+$/.test(value) ? new Date(asNumber * 1000) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

export function relativeTime(value: string | null | undefined, now = Date.now()): string {
  const date = parseTimestamp(value)
  if (!date) return '—'
  const seconds = Math.round((date.getTime() - now) / 1000)
  const abs = Math.abs(seconds)
  if (abs < 60) return rtf.format(seconds, 'second')
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour')
  return rtf.format(Math.round(seconds / 86400), 'day')
}

export function formatDateTime(value: string | null | undefined): string {
  const date = parseTimestamp(value)
  if (!date) return '—'
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
}

export function humanize(value: string | null | undefined): string {
  if (!value) return '—'
  return value
    .replace(/[._]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}
