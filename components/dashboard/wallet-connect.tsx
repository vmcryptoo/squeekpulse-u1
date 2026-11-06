'use client'

import { useCallback, useEffect, useState } from 'react'

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
  on?: (event: string, handler: (...args: unknown[]) => void) => void
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void
  isMetaMask?: boolean
  isOkxWallet?: boolean
  isTrust?: boolean
}

declare global { interface Window { ethereum?: EthereumProvider & { providers?: EthereumProvider[] } } }

const SEPOLIA = 11155111
const SQK = '0xd78a3956cf63164d1fa1c622ad3c66623162fa1e'
const BALANCE_OF = '0x70a08231'

function short(address: string) { return `${address.slice(0, 6)}…${address.slice(-4)}` }
function hexAddress(address: string) { return address.toLowerCase().replace(/^0x/, '').padStart(64, '0') }

export function WalletConnect({ compact = false }: { compact?: boolean }) {
  const [provider, setProvider] = useState<EthereumProvider | null>(null)
  const [account, setAccount] = useState('')
  const [chainId, setChainId] = useState<number | null>(null)
  const [sqkBalance, setSqkBalance] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const refresh = useCallback(async (p: EthereumProvider, address?: string) => {
    const accounts = address ? [address] : await p.request({ method: 'eth_accounts' }) as string[]
    const chain = await p.request({ method: 'eth_chainId' }) as string
    setAccount(accounts?.[0] ?? '')
    setChainId(Number.parseInt(chain, 16))
    if (accounts?.[0] && Number.parseInt(chain, 16) === SEPOLIA) {
      try {
        const data = await p.request({ method: 'eth_call', params: [{ to: SQK, data: BALANCE_OF + hexAddress(accounts[0]) }, 'latest'] }) as string
        const raw = BigInt(data || '0x0')
        const whole = raw / 10n ** 18n
        const fraction = (raw % 10n ** 18n).toString().padStart(18, '0').slice(0, 4)
        setSqkBalance(`${whole}.${fraction}`)
      } catch { setSqkBalance(null) }
    } else setSqkBalance(null)
  }, [])

  useEffect(() => {
    const injected = window.ethereum
    if (!injected) return
    const p = injected.providers?.find((x) => x.isMetaMask) ?? injected.providers?.[0] ?? injected
    setProvider(p)
    const onAccounts = (...args: unknown[]) => setAccount((args[0] as string[] | undefined)?.[0] ?? '')
    const onChain = (...args: unknown[]) => { const id = args[0] as string; setChainId(Number.parseInt(id, 16)); setSqkBalance(null) }
    p.on?.('accountsChanged', onAccounts); p.on?.('chainChanged', onChain)
    void refresh(p)
    return () => { p.removeListener?.('accountsChanged', onAccounts); p.removeListener?.('chainChanged', onChain) }
  }, [refresh])

  async function connect() {
    if (!provider) { setMessage('No injected wallet found. Open this site inside MetaMask, OKX Wallet or Trust Wallet browser.'); return }
    setBusy(true); setMessage('')
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[]
      await refresh(provider, accounts[0])
      setMessage('Wallet connected.')
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Wallet connection was rejected.') }
    finally { setBusy(false) }
  }

  async function switchNetwork() {
    if (!provider) return
    try {
      await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0xaa36a7' }] })
      await refresh(provider)
      setMessage('Switched to Sepolia.')
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Could not switch network.') }
  }

  async function sendSqk() {
    if (!provider || !account) return
    const to = window.prompt('Recipient wallet address (0x...)')?.trim()
    const amount = window.prompt('Amount of testnet SQK to send')?.trim()
    if (!to || !/^0x[a-fA-F0-9]{40}$/.test(to) || !amount || !/^\d+(\.\d{1,18})?$/.test(amount) || Number(amount) <= 0) { setMessage('Enter a valid recipient and positive SQK amount.'); return }
    const [whole, fraction = ''] = amount.split('.')
    const value = BigInt(whole) * 10n ** 18n + BigInt((fraction + '0'.repeat(18)).slice(0, 18))
    const encoded = '0xa9059cbb' + hexAddress(to) + value.toString(16).padStart(64, '0')
    setBusy(true)
    try {
      const hash = await provider.request({ method: 'eth_sendTransaction', params: [{ from: account, to: SQK, data: encoded }] })
      setMessage(`Transaction submitted: ${String(hash)}`)
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Transaction failed.') }
    finally { setBusy(false) }
  }

  return <section className="rounded-2xl border border-[#dfd0ee] bg-white/80 p-5 text-[#29213b] shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-widest text-[#7652b5]">EVM wallet</p><h3 className="mt-1 text-lg font-black">{account ? short(account) : 'Wallet not connected'}</h3><p className="mt-1 text-xs text-[#81758b]">Sepolia testnet · Chain ID 11155111</p></div>
      <button onClick={account ? () => { setAccount(''); setSqkBalance(null); setMessage('Disconnected in this app. You can revoke site access in your wallet.') } : connect} disabled={busy} className="rounded-xl bg-[#7652b5] px-5 py-3 text-sm font-bold text-white shadow-[0_4px_0_#4e347e] disabled:opacity-60">{busy ? 'Please wait…' : account ? 'Disconnect' : 'Connect Wallet'}</button>
    </div>
    {account && <div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-[#f6f0e5] p-4"><p className="text-xs text-[#81758b]">Network</p><p className="mt-1 font-bold">{chainId === SEPOLIA ? 'Sepolia ✓' : `Wrong network (${chainId ?? 'unknown'})`}</p>{chainId !== SEPOLIA && <button onClick={switchNetwork} className="mt-2 text-xs font-bold text-[#7652b5]">Switch to Sepolia</button>}</div><div className="rounded-xl bg-[#f6f0e5] p-4"><p className="text-xs text-[#81758b]">SQK balance</p><p className="mt-1 font-bold">{sqkBalance === null ? 'Connect to Sepolia to read' : `${sqkBalance} SQK`}</p></div></div>}
    {account && chainId === SEPOLIA && <button onClick={sendSqk} disabled={busy} className="mt-4 rounded-xl border border-[#7652b5] px-4 py-2 text-sm font-bold text-[#7652b5] disabled:opacity-50">Send SQK</button>}
    {message && <p role="status" className="mt-3 break-all text-xs text-[#665777]">{message}</p>}
    {!provider && <p className="mt-3 text-xs text-[#81758b]">Open the website inside your wallet app browser to connect. A normal mobile browser may not expose an injected wallet.</p>}
  </section>
}
