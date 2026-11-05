'use client'

import { useState } from 'react'
import { Search, ExternalLink, Copy, CheckCircle2 } from 'lucide-react'

type Transaction = {
  hash: string
  from: string
  to: string | null
  value: string
  blockNumber: string
  gas: string
  gasPrice: string
  status: string
}

export function TransactionExplorer() {
  const [hash, setHash] = useState('')
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function searchTransaction(e: React.FormEvent) {
    e.preventDefault()

    const value = hash.trim()

    if (!/^0x[a-fA-F0-9]{64}$/.test(value)) {
      setError('Please enter a valid transaction hash.')
      setTransaction(null)
      return
    }

    setLoading(true)
    setError('')
    setTransaction(null)

    try {
      const rpc = 'https://ethereum-sepolia-rpc.publicnode.com'

      const [txResponse, receiptResponse] = await Promise.all([
        fetch(rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionByHash',
            params: [value],
            id: 1,
          }),
        }),
        fetch(rpc, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'eth_getTransactionReceipt',
            params: [value],
            id: 2,
          }),
        }),
      ])

      if (!txResponse.ok || !receiptResponse.ok) {
        throw new Error('Network request failed. Please try again.')
      }

      const txData = await txResponse.json()
      const receiptData = await receiptResponse.json()

      if (txData.error || receiptData.error) {
        throw new Error('Unable to retrieve transaction data.')
      }

      const tx = txData.result
      const receipt = receiptData.result

      if (!tx) {
        throw new Error('Transaction not found on Sepolia.')
      }

      setTransaction({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: (Number(BigInt(tx.value)) / 1e18).toString(),
        blockNumber: tx.blockNumber
          ? BigInt(tx.blockNumber).toString()
          : 'Pending',
        gas: BigInt(tx.gas).toString(),
        gasPrice: tx.gasPrice
          ? (Number(BigInt(tx.gasPrice)) / 1e9).toFixed(4) + ' Gwei'
          : 'N/A',
        status: receipt
          ? receipt.status === '0x1'
            ? 'Success'
            : 'Failed'
          : 'Pending',
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function copyHash() {
    if (!transaction) return

    await navigator.clipboard.writeText(transaction.hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-5">
      <div>
        <h2 className="text-lg font-bold text-white">
          Transaction Explorer
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Search and inspect any transaction on Sepolia Testnet.
        </p>
      </div>

      <form onSubmit={searchTransaction} className="flex flex-col sm:flex-row gap-3">
        <input
          value={hash}
          onChange={(e) => setHash(e.target.value)}
          placeholder="Enter transaction hash (0x...)"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Search size={17} />
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {transaction && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-semibold text-white">
              Transaction Details
            </span>

            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              transaction.status === 'Success'
                ? 'bg-green-500/10 text-green-400'
                : transaction.status === 'Failed'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-yellow-500/10 text-yellow-400'
            }`}>
              {transaction.status}
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs text-gray-500 mb-2">Transaction Hash</p>
            <div className="flex items-center gap-2">
              <p className="min-w-0 flex-1 break-all text-xs text-blue-300">
                {transaction.hash}
              </p>
              <button onClick={copyHash} type="button" className="text-gray-400">
                {copied ? <CheckCircle2 size={17} /> : <Copy size={17} />}
              </button>
            </div>
          </div>

          {[
            ['From', transaction.from],
            ['To', transaction.to || 'Contract Creation'],
            ['Value', `${transaction.value} ETH`],
            ['Block Number', transaction.blockNumber],
            ['Gas Limit', transaction.gas],
            ['Gas Price', transaction.gasPrice],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col gap-1 border-b border-white/5 py-2 sm:flex-row sm:justify-between"
            >
              <span className="text-sm text-gray-400">{label}</span>
              <span className="break-all text-sm text-white sm:max-w-[65%] sm:text-right">
                {value}
              </span>
            </div>
          ))}

          <a
            href={`https://sepolia.etherscan.io/tx/${transaction.hash}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 py-3 text-sm font-semibold text-blue-400"
          >
            View on Etherscan <ExternalLink size={16} />
          </a>
        </div>
      )}
    </section>
  )
}
