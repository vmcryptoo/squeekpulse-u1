'use client'

import useSWR from 'swr'
import { resolveNetwork } from '@/lib/squeek/network'
import type {
  CoreResponse,
  EconomyResponse,
  EventsResponse,
  SettlementsResponse,
  StatusResponse,
} from '@/lib/squeek/types'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

const UPSTREAM = 'https://api.squeekchain.com/v1/'
const PROXY_PREFIX = '/api/squeek/'

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } })
  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(body?.error ? String(body.error) : `HTTP ${res.status}`, res.status)
  }
  if (!body) throw new ApiError('Empty or non-JSON response', res.status)
  return body as T
}

// The same-origin proxy is primary; the API also allows CORS, so a direct call is the fallback
// if the proxy itself is unreachable.
async function fetcher<T>(key: string): Promise<T> {
  try {
    return await request<T>(key)
  } catch (proxyError) {
    if (proxyError instanceof ApiError && proxyError.status > 0 && proxyError.status < 500) throw proxyError
    try {
      return await request<T>(UPSTREAM + key.slice(PROXY_PREFIX.length))
    } catch {
      throw proxyError instanceof ApiError ? proxyError : new ApiError('Network request failed', 0)
    }
  }
}

const swrOptions = { revalidateOnFocus: true, keepPreviousData: true, errorRetryCount: 3 }

export const useStatus = () =>
  useSWR<StatusResponse, ApiError>('/api/squeek/status', fetcher, { ...swrOptions, refreshInterval: 10_000 })

export const useCore = () =>
  useSWR<CoreResponse, ApiError>('/api/squeek/core', fetcher, { ...swrOptions, refreshInterval: 30_000 })

export const useEconomy = () =>
  useSWR<EconomyResponse, ApiError>('/api/squeek/economy/state', fetcher, { ...swrOptions, refreshInterval: 60_000 })

export const useEvents = () =>
  useSWR<EventsResponse, ApiError>('/api/squeek/events?limit=100', fetcher, { ...swrOptions, refreshInterval: 30_000 })

export const useSettlements = (range: '24h' | '7d' | '30d') =>
  useSWR<SettlementsResponse, ApiError>(`/api/squeek/settlements?range=${range}`, fetcher, {
    ...swrOptions,
    refreshInterval: 60_000,
  })

/** Network is derived from whichever chain-aware endpoint has answered first. */
export function useNetwork() {
  const core = useCore()
  const economy = useEconomy()
  const chain = core.data?.chain ?? economy.data?.chain ?? null
  return {
    network: resolveNetwork(chain),
    chain,
    isLoading: !chain && (core.isLoading || economy.isLoading),
  }
}
