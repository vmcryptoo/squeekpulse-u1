import https from 'node:https'
import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UPSTREAM = 'https://api.squeekchain.com/v1'

// Cloudflare in front of the API rejects undici's (global fetch) TLS fingerprint with a 403,
// but accepts Node's https client with the same honest User-Agent.
function getJson(url: string): Promise<{ status: number; contentType: string; text: string }> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: { Accept: 'application/json', 'User-Agent': 'SqueekPulse/1.0 (+independent analytics)' },
        timeout: 10_000,
      },
      (res) => {
        const chunks: Buffer[] = []
        res.on('data', (c: Buffer) => chunks.push(c))
        res.on('end', () =>
          resolve({
            status: res.statusCode ?? 502,
            contentType: String(res.headers['content-type'] ?? ''),
            text: Buffer.concat(chunks).toString('utf8'),
          }),
        )
        res.on('error', reject)
      },
    )
    req.on('timeout', () => req.destroy(Object.assign(new Error('timeout'), { name: 'TimeoutError' })))
    req.on('error', reject)
  })
}

const ALLOWED: Record<string, (params: URLSearchParams) => URLSearchParams> = {
  status: () => new URLSearchParams(),
  core: () => new URLSearchParams(),
  'economy/state': () => new URLSearchParams(),
  events: (p) => {
    const out = new URLSearchParams()
    const limit = Number(p.get('limit'))
    if (Number.isInteger(limit) && limit > 0 && limit <= 100) out.set('limit', String(limit))
    return out
  },
  settlements: (p) => {
    const range = p.get('range')
    return new URLSearchParams({ range: range === '7d' || range === '30d' ? range : '24h' })
  },
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const key = path.join('/')
  const buildQuery = ALLOWED[key]

  if (!buildQuery) {
    return NextResponse.json({ error: 'unknown_endpoint' }, { status: 404 })
  }

  const query = buildQuery(request.nextUrl.searchParams).toString()
  const url = `${UPSTREAM}/${key}${query ? `?${query}` : ''}`

  try {
    const res = await getJson(url)

    if (!res.contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'upstream_not_json', upstreamStatus: res.status },
        { status: 502 },
      )
    }

    const body = JSON.parse(res.text)
    const ok = res.status >= 200 && res.status < 300
    return NextResponse.json(body, {
      status: ok ? 200 : res.status >= 500 ? 502 : res.status,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    const timedOut = error instanceof Error && error.name === 'TimeoutError'
    return NextResponse.json(
      { error: timedOut ? 'upstream_timeout' : 'upstream_unreachable' },
      { status: timedOut ? 504 : 502 },
    )
  }
}
