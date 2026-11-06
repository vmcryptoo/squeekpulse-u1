'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  Activity, AlertCircle, ArrowDownLeft, ArrowLeftRight, ArrowRight, ArrowUpRight,
  Check, CircleDollarSign, Clock3, Copy, ExternalLink, FileText,
  Home, Image as ImageIcon, Layers3, LoaderCircle, LockKeyhole, Menu, Plus,
  RefreshCw, Send, ShieldCheck, Sparkles, Wallet, X,
} from 'lucide-react'
import {
  CONTRACTS, SEPOLIA_CHAIN_ID, SEPOLIA_DECIMAL_CHAIN_ID, SEPOLIA_EXPLORER,
  addressWord, connectWallet, decodeAddress, decodeBool, decodeWords, decodeString,
  encodeAddressArrayCall, encodeCall, ensureSepolia, formatUnits18,
  getExplorerTx, getNetworkId, getWalletProvider, isAddress, parseUnits18, readContract,
  rpc, sendNativeBatch, sendTransaction, shortAddress, waitForReceipt,
} from '@/lib/squeek/web3'

type PageId = 'overview' | 'pay' | 'multisend' | 'vault' | 'nft' | 'swap' | 'portfolio' | 'approvals'
type Notice = { kind: 'success' | 'error' | 'info'; text: string; hash?: string }
type AccountToken = { tokenId: string; custody: 'wallet' | 'staking'; level?: number; basePower?: string; metadata?: any }
type ActivityItem = { type?: string; event?: string; txHash?: string; transactionHash?: string; timestamp?: string; blockNumber?: string | number; [key: string]: any }

const NAV: Array<{ id: PageId; label: string; icon: any; group: string }> = [
  { id: 'overview', label: 'Overview', icon: Home, group: 'Workspace' },
  { id: 'pay', label: 'SqueekPay', icon: Send, group: 'Products' },
  { id: 'multisend', label: 'SqueekMultisend', icon: Layers3, group: 'Products' },
  { id: 'vault', label: 'SqueekVault', icon: LockKeyhole, group: 'Products' },
  { id: 'nft', label: 'SqueekNFT', icon: ImageIcon, group: 'Products' },
  { id: 'swap', label: 'SqueekSwap', icon: ArrowLeftRight, group: 'Products' },
  { id: 'portfolio', label: 'Portfolio & Activity', icon: Activity, group: 'Account' },
  { id: 'approvals', label: 'Approvals', icon: ShieldCheck, group: 'Account' },
]

function formatError(error: any): string {
  const message = String(error?.shortMessage || error?.message || 'Something went wrong.')
  if (error?.code === 4001 || /user rejected|user denied/i.test(message)) return 'You rejected the request in your wallet.'
  if (/insufficient funds/i.test(message)) return 'Your wallet does not have enough Sepolia ETH for gas.'
  if (/execution reverted/i.test(message)) return 'The contract rejected this action. Check the amount, approvals, and contract requirements.'
  return message.replace(/^Error:\s*/, '').slice(0, 280)
}

function formatDate(value?: string) {
  if (!value) return 'Recent'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

async function apiGet(url: string) {
  const response = await fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(body?.error || `Squeekchain API error (${response.status})`)
  return body
}

export default function SqueekHub() {
  const [page, setPage] = useState<PageId>('overview')
  const [menuOpen, setMenuOpen] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [sqkBalance, setSqkBalance] = useState<bigint>(0n)
  const [ethBalance, setEthBalance] = useState<bigint>(0n)
  const [stakePrincipal, setStakePrincipal] = useState<bigint>(0n)
  const [freshPrincipal, setFreshPrincipal] = useState<bigint>(0n)
  const [claimable, setClaimable] = useState<bigint>(0n)
  const [claimRecipient, setClaimRecipient] = useState<string | null>(null)
  const [tokenAllowance, setTokenAllowance] = useState<bigint>(0n)
  const [nftApproved, setNftApproved] = useState(false)
  const [tokens, setTokens] = useState<AccountToken[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [apiStatus, setApiStatus] = useState<'idle' | 'online' | 'offline'>('idle')
  const [verified, setVerified] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [sendTo, setSendTo] = useState('')
  const [sendAmount, setSendAmount] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentRequest, setPaymentRequest] = useState('')
  const [batchText, setBatchText] = useState('')
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [unstakeQuote, setUnstakeQuote] = useState<{ fee: bigint; net: bigint } | null>(null)
  const [nftId, setNftId] = useState('')
  const [nftTo, setNftTo] = useState('')
  const [depositId, setDepositId] = useState('')
  const [withdrawId, setWithdrawId] = useState('')
  const [mergeSurvivor, setMergeSurvivor] = useState('')
  const [mergeDonor, setMergeDonor] = useState('')
  const [vaultMergeSurvivor, setVaultMergeSurvivor] = useState('')
  const [vaultMergeDonor, setVaultMergeDonor] = useState('')
  const [searchAddress, setSearchAddress] = useState('')
  const [explorerAccount, setExplorerAccount] = useState<any>(null)
  const [explorerActivity, setExplorerActivity] = useState<ActivityItem[]>([])

  const onSepolia = chainId?.toLowerCase() === SEPOLIA_CHAIN_ID
  const activePage = NAV.find((item) => item.id === page)

  const refresh = useCallback(async (walletAddress = address) => {
    if (!walletAddress) return
    setRefreshing(true)
    try {
      const [balanceData, nativeData, stakeData, claimData, recipientData, allowanceData, approvedData] = await Promise.all([
        readContract(CONTRACTS.token, 'balanceOf(address)', [walletAddress]),
        rpc('eth_getBalance', [walletAddress, 'latest']),
        readContract(CONTRACTS.staking, 'stakeOf(address)', [walletAddress]),
        readContract(CONTRACTS.staking, 'claimable(address)', [walletAddress]),
        readContract(CONTRACTS.staking, 'claimRecipient(address)', [walletAddress]),
        readContract(CONTRACTS.token, 'allowance(address,address)', [walletAddress, CONTRACTS.staking]),
        readContract(CONTRACTS.nft, 'isApprovedForAll(address,address)', [walletAddress, CONTRACTS.staking]),
      ])
      const stakeWords = decodeWords(stakeData)
      setSqkBalance(decodeWords(balanceData)[0] ?? 0n)
      setEthBalance(BigInt(nativeData || '0x0'))
      setStakePrincipal(stakeWords[0] ?? 0n)
      setFreshPrincipal(stakeWords[1] ?? 0n)
      setClaimable(decodeWords(claimData)[0] ?? 0n)
      const recipient = decodeAddress(recipientData)
      setClaimRecipient(/^0x0{40}$/i.test(recipient) ? null : recipient)
      setTokenAllowance(decodeWords(allowanceData)[0] ?? 0n)
      setNftApproved(decodeBool(approvedData))
      try {
        const account = await apiGet(`https://api.squeekchain.com/v1/accounts/${walletAddress}?limit=100`)
        setTokens(Array.isArray(account?.tokens) ? account.tokens.map((t: any) => ({ ...t, tokenId: String(t.tokenId) })) : [])
        setApiStatus(account?.status === 'available' ? 'online' : 'offline')
      } catch {
        setApiStatus('offline')
        setTokens([])
      }
      try {
        const history = await apiGet(`https://api.squeekchain.com/v1/accounts/${walletAddress}/activity?limit=20`)
        const list = history?.items || history?.activity || history?.events || history?.entries || []
        setActivity(Array.isArray(list) ? list : [])
      } catch {
        setActivity([])
      }
    } catch (error) {
      setNotice({ kind: 'error', text: `Could not read wallet data: ${formatError(error)}` })
    } finally {
      setRefreshing(false)
    }
  }, [address])

  const verifyContracts = useCallback(async () => {
    const network = String(await rpc('eth_chainId')).toLowerCase()
    if (network !== SEPOLIA_CHAIN_ID) throw new Error('The connected/read network is not Sepolia.')
    const [tokenCode, nftCode, stakingCode, tokenSymbol, nftSymbol, boundToken, boundNft, boundMining, boundCore, nftCore, tokenMining, miningBindings] = await Promise.all([
      rpc('eth_getCode', [CONTRACTS.token, 'latest']),
      rpc('eth_getCode', [CONTRACTS.nft, 'latest']),
      rpc('eth_getCode', [CONTRACTS.staking, 'latest']),
      readContract(CONTRACTS.token, 'symbol()').then(decodeString),
      readContract(CONTRACTS.nft, 'symbol()').then(decodeString),
      readContract(CONTRACTS.staking, 'token()').then(decodeAddress),
      readContract(CONTRACTS.staking, 'genesis()').then(decodeAddress),
      readContract(CONTRACTS.staking, 'mining()').then(decodeAddress),
      readContract(CONTRACTS.staking, 'core()').then(decodeAddress),
      readContract(CONTRACTS.nft, 'sqkCore()').then(decodeAddress),
      readContract(CONTRACTS.token, 'mining()').then(decodeAddress),
      readContract(CONTRACTS.mining, 'bindings()').then(decodeWords),
    ])
    const bindingAddress = (index: number) => `0x${(miningBindings[index] ?? 0n).toString(16).padStart(64, '0').slice(24)}`
    const valid = tokenCode !== '0x' && nftCode !== '0x' && stakingCode !== '0x'
      && tokenSymbol === 'SQK' && nftSymbol === 'SQUEEK'
      && boundToken.toLowerCase() === CONTRACTS.token.toLowerCase()
      && boundNft.toLowerCase() === CONTRACTS.nft.toLowerCase()
      && boundMining.toLowerCase() === CONTRACTS.mining.toLowerCase()
      && boundCore.toLowerCase() === CONTRACTS.core.toLowerCase()
      && nftCore.toLowerCase() === CONTRACTS.core.toLowerCase()
      && tokenMining.toLowerCase() === CONTRACTS.mining.toLowerCase()
      && bindingAddress(0).toLowerCase() === CONTRACTS.core.toLowerCase()
      && bindingAddress(1).toLowerCase() === CONTRACTS.token.toLowerCase()
      && bindingAddress(2).toLowerCase() === CONTRACTS.staking.toLowerCase()
    setVerified(valid)
    return valid
  }, [])

  const connect = async () => {
    setConnecting(true)
    setNotice(null)
    try {
      const result = await connectWallet()
      setAddress(result.address)
      setChainId(result.chainId)
      if (result.chainId.toLowerCase() !== SEPOLIA_CHAIN_ID) {
        setNotice({ kind: 'info', text: 'Wallet connected. Switch to Sepolia to use Squeekchain transactions.' })
      } else {
        const valid = await verifyContracts()
        setNotice({ kind: valid ? 'success' : 'error', text: valid ? 'Wallet connected and Squeekchain contracts checked.' : 'Wallet connected, but the contract identity check did not pass. Transactions are disabled for safety.' })
        if (valid) await refresh(result.address)
      }
    } catch (error) {
      setNotice({ kind: 'error', text: formatError(error) })
    } finally {
      setConnecting(false)
    }
  }

  const switchNetwork = async () => {
    try {
      await ensureSepolia()
      const id = await getNetworkId()
      setChainId(id)
      const valid = await verifyContracts()
      setVerified(valid)
      if (address && valid) await refresh(address)
      setNotice({ kind: valid ? 'success' : 'error', text: valid ? 'Connected to Sepolia. Contract checks passed.' : 'The contract identity check did not pass. Transaction actions are disabled.' })
    } catch (error) {
      setNotice({ kind: 'error', text: formatError(error) })
    }
  }

  useEffect(() => {
    let mounted = true
    const provider = typeof window !== 'undefined' ? window.ethereum : undefined
    if (!provider) return
    provider.request({ method: 'eth_accounts' }).then(async (accounts: string[]) => {
      if (!mounted || !accounts?.[0]) return
      setAddress(accounts[0])
      const id = await provider.request({ method: 'eth_chainId' }) as string
      if (!mounted) return
      setChainId(id)
      if (id.toLowerCase() === SEPOLIA_CHAIN_ID) {
        const valid = await verifyContracts().catch(() => false)
        if (mounted) setVerified(valid)
        if (mounted && valid) await refresh(accounts[0])
      }
    }).catch(() => undefined)
    const onAccounts = (accounts: string[]) => {
      setAddress(accounts?.[0] || null)
      setVerified(false)
      setTokens([]); setActivity([])
      if (accounts?.[0]) {
        provider.request({ method: 'eth_chainId' }).then((id: string) => {
          setChainId(id)
          if (id.toLowerCase() === SEPOLIA_CHAIN_ID) verifyContracts().then((ok) => { setVerified(ok); if (ok) refresh(accounts[0]) }).catch(() => setVerified(false))
        }).catch(() => undefined)
      }
    }
    const onChain = (id: string) => {
      setChainId(id); setVerified(false)
      if (id.toLowerCase() === SEPOLIA_CHAIN_ID) verifyContracts().then((ok) => { setVerified(ok); if (ok && address) refresh(address) }).catch(() => setVerified(false))
    }
    provider.on?.('accountsChanged', onAccounts)
    provider.on?.('chainChanged', onChain)
    return () => {
      mounted = false
      provider.removeListener?.('accountsChanged', onAccounts)
      provider.removeListener?.('chainChanged', onChain)
    }
  }, [refresh, verifyContracts, address])

  const runAction = async (key: string, action: () => Promise<void>) => {
    setBusy(key); setNotice(null)
    try { await action() } catch (error) { setNotice({ kind: 'error', text: formatError(error) }) }
    finally { setBusy(null) }
  }

  const requireWallet = () => {
    if (!address) throw new Error('Connect your wallet first.')
    if (!onSepolia) throw new Error('Switch your wallet to Sepolia first.')
    if (!verified) throw new Error('Squeekchain contract identity checks have not passed. Refresh or reconnect before transacting.')
    return address
  }

  const submitSend = () => runAction('send', async () => {
    const from = requireWallet()
    if (!isAddress(sendTo)) throw new Error('Enter a valid recipient wallet address.')
    const amount = parseUnits18(sendAmount)
    if (amount <= 0n) throw new Error('Amount must be greater than zero.')
    if (amount > sqkBalance) throw new Error('Not enough SQK balance.')
    const hash = await sendTransaction(CONTRACTS.token, encodeCall('transfer(address,uint256)', sendTo, amount), from)
    setNotice({ kind: 'info', text: 'SQK transfer submitted. Waiting for confirmation…', hash })
    await waitForReceipt(hash)
    setSendAmount(''); await refresh(from)
    setNotice({ kind: 'success', text: 'SQK transfer confirmed on Sepolia.', hash })
  })

  const makePaymentRequest = () => {
    if (!address) { setNotice({ kind: 'error', text: 'Connect a wallet to create a payment request.' }); return }
    try {
      const amount = parseUnits18(paymentAmount)
      if (amount <= 0n) throw new Error('Enter a payment amount greater than zero.')
      const uri = `ethereum:${CONTRACTS.token}@${SEPOLIA_DECIMAL_CHAIN_ID}/transfer?address=${address}&uint256=${amount.toString()}`
      setPaymentRequest(uri)
      setNotice({ kind: 'success', text: 'Payment request created. Copy and share the request link.' })
    } catch (error) { setNotice({ kind: 'error', text: formatError(error) }) }
  }

  const copyText = async (value: string, label: string) => {
    try { await navigator.clipboard.writeText(value); setNotice({ kind: 'success', text: `${label} copied.` }) }
    catch { setNotice({ kind: 'info', text: `${label}: ${value}` }) }
  }

  const submitMultisend = () => runAction('multisend', async () => {
    const from = requireWallet()
    const rows = batchText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.split(/[ ,;\t]+/).filter(Boolean))
    if (rows.length < 2) throw new Error('Add at least two recipients, one per line: 0xAddress, amount')
    if (rows.length > 10) throw new Error('For safety, this form supports up to 10 recipients per batch.')
    const calls: Array<{ to: string; data: string }> = []
    let total = 0n
    for (const row of rows) {
      const [recipient, rawAmount] = row
      if (row.length !== 2 || !recipient || !rawAmount || !isAddress(recipient)) throw new Error(`Invalid row: ${recipient || 'missing address'}, ${rawAmount || 'missing amount'}`)
      const amount = parseUnits18(rawAmount)
      if (amount <= 0n) throw new Error('Every recipient amount must be greater than zero.')
      total += amount
      calls.push({ to: CONTRACTS.token, data: encodeCall('transfer(address,uint256)', recipient, amount) })
    }
    if (total > sqkBalance) throw new Error(`Batch needs ${formatUnits18(total)} SQK, but your balance is ${formatUnits18(sqkBalance)} SQK.`)
    try {
      const result = await sendNativeBatch(calls, from)
      const callId = typeof result === 'string' ? result : result?.id || result?.bundleId || 'Wallet batch request accepted'
      setNotice({ kind: 'success', text: `Wallet accepted the batch request (${String(callId).slice(0, 80)}). Check your wallet for its execution status.` })
      setBatchText('')
      await refresh(from)
    } catch (error: any) {
      if (error?.code === 4001 || /user rejected|user denied/i.test(String(error?.message))) throw error
      if (!(error?.code === -32601 || /unsupported|not supported|method not found|unknown method|wallet_sendCalls/i.test(String(error?.message)))) throw error
      setNotice({ kind: 'info', text: 'This wallet does not support atomic transaction batching. Sending individually, one wallet confirmation per recipient…' })
      const hashes: string[] = []
      for (const call of calls) {
        const hash = await sendTransaction(call.to, call.data, from)
        hashes.push(hash)
        await waitForReceipt(hash)
      }
      setBatchText(''); await refresh(from)
      setNotice({ kind: 'success', text: `All ${hashes.length} SQK transfers confirmed. This wallet used separate transactions, not one atomic transaction.`, hash: hashes[hashes.length - 1] })
    }
  })

  const stake = () => runAction('stake', async () => {
    const from = requireWallet()
    const amount = parseUnits18(stakeAmount)
    if (amount <= 0n) throw new Error('Enter a stake amount greater than zero.')
    if (amount > sqkBalance) throw new Error('Not enough SQK balance.')
    const paused = decodeBool(await readContract(CONTRACTS.staking, 'paused()'))
    if (paused) throw new Error('SqueekStaking intake is currently paused. You cannot add new stake.')
    if (tokenAllowance < amount) {
      const approval = await sendTransaction(CONTRACTS.token, encodeCall('approve(address,uint256)', CONTRACTS.staking, amount), from)
      setNotice({ kind: 'info', text: 'SQK approval submitted. Waiting for confirmation…', hash: approval })
      await waitForReceipt(approval)
    }
    const hash = await sendTransaction(CONTRACTS.staking, encodeCall('stake(uint256)', amount), from)
    setNotice({ kind: 'info', text: 'Stake submitted. Waiting for confirmation…', hash })
    await waitForReceipt(hash)
    setStakeAmount(''); await refresh(from)
    setNotice({ kind: 'success', text: 'SQK successfully staked in the official SqueekStaking contract.', hash })
  })

  const claimRewards = () => runAction('claim', async () => {
    const from = requireWallet()
    if (claimable <= 0n) throw new Error('There are no whole SQK rewards available to claim right now.')
    if (claimRecipient && claimRecipient.toLowerCase() !== from.toLowerCase()) throw new Error(`Only the configured claim recipient (${shortAddress(claimRecipient)}) can claim these rewards. Connect that wallet.`)
    const hash = await sendTransaction(CONTRACTS.staking, encodeCall('claim(address)', from), from)
    setNotice({ kind: 'info', text: 'Reward claim submitted. Waiting for confirmation…', hash })
    await waitForReceipt(hash); await refresh(from)
    setNotice({ kind: 'success', text: 'Staking rewards claimed.', hash })
  })

  const quoteUnstake = async () => {
    try {
      const from = requireWallet()
      const amount = parseUnits18(unstakeAmount)
      if (amount <= 0n) throw new Error('Enter an amount greater than zero.')
      const mature = stakePrincipal - freshPrincipal
      if (amount > mature) throw new Error(`Only ${formatUnits18(mature)} SQK is mature and currently available to unstake.`)
      const data = await readContract(CONTRACTS.staking, 'quoteUnstake(address,uint256)', [from, amount])
      const words = decodeWords(data)
      setUnstakeQuote({ fee: words[0] ?? 0n, net: words[1] ?? 0n })
    } catch (error) { setNotice({ kind: 'error', text: formatError(error) }); setUnstakeQuote(null) }
  }

  const unstake = () => runAction('unstake', async () => {
    const from = requireWallet()
    const amount = parseUnits18(unstakeAmount)
    if (!unstakeQuote) throw new Error('Get a fresh unstake quote first.')
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 300)
    const hash = await sendTransaction(CONTRACTS.staking, encodeCall('unstake(uint256,uint256,uint64)', amount, unstakeQuote.fee, deadline), from)
    setNotice({ kind: 'info', text: 'Unstake submitted. The quoted exit fee is the maximum accepted by this transaction.', hash })
    await waitForReceipt(hash); setUnstakeAmount(''); setUnstakeQuote(null); await refresh(from)
    setNotice({ kind: 'success', text: 'SQK unstake confirmed. The contract deducted its quoted exit fee.', hash })
  })

  const transferNft = () => runAction('nft-transfer', async () => {
    const from = requireWallet()
    if (!isAddress(nftTo)) throw new Error('Enter a valid recipient wallet address.')
    if (!/^\d+$/.test(nftId) || BigInt(nftId) < 1n || BigInt(nftId) > 9999n) throw new Error('Enter a Squeek token ID from 1 to 9,999.')
    const owner = decodeAddress(await readContract(CONTRACTS.nft, 'ownerOf(uint256)', [BigInt(nftId)]))
    if (owner.toLowerCase() !== from.toLowerCase()) throw new Error('The connected wallet does not own this Squeek NFT.')
    const hash = await sendTransaction(CONTRACTS.nft, encodeCall('transferFrom(address,address,uint256)', from, nftTo, BigInt(nftId)), from)
    setNotice({ kind: 'info', text: `Squeek #${nftId} transfer submitted. Waiting for confirmation…`, hash })
    await waitForReceipt(hash); setNftId(''); setNftTo(''); await refresh(from)
    setNotice({ kind: 'success', text: `Squeek #${nftId} transferred successfully.`, hash })
  })

  const mergeOwnedNfts = () => runAction('nft-merge', async () => {
    const from = requireWallet()
    if (!/^\d+$/.test(mergeSurvivor) || !/^\d+$/.test(mergeDonor)) throw new Error('Enter both Squeek token IDs.')
    const survivor = BigInt(mergeSurvivor); const donor = BigInt(mergeDonor)
    if (survivor < 1n || donor < 1n || survivor > 9999n || donor > 9999n || survivor === donor) throw new Error('Choose two different Squeek IDs from 1 to 9,999.')
    const [ownerA, ownerB, open] = await Promise.all([
      readContract(CONTRACTS.nft, 'ownerOf(uint256)', [survivor]).then(decodeAddress),
      readContract(CONTRACTS.nft, 'ownerOf(uint256)', [donor]).then(decodeAddress),
      readContract(CONTRACTS.nft, 'mergesOpen()').then(decodeBool),
    ])
    if (ownerA.toLowerCase() !== from.toLowerCase() || ownerB.toLowerCase() !== from.toLowerCase()) throw new Error('Your wallet must own both Squeeks directly. Use Vault Merge for deposited Squeeks.')
    if (!open) throw new Error('Squeekchain has currently closed NFT merges.')
    const hash = await sendTransaction(CONTRACTS.nft, encodeCall('merge(uint256,uint256)', survivor, donor), from)
    setNotice({ kind: 'info', text: 'Squeek merge submitted. The donor NFT will be burned if the contract accepts it.', hash })
    await waitForReceipt(hash); setMergeSurvivor(''); setMergeDonor(''); await refresh(from)
    setNotice({ kind: 'success', text: `Squeek #${donor} merged into #${survivor}. The survivor gained one level.`, hash })
  })

  const mergeDepositedNfts = () => runAction('vault-merge', async () => {
    const from = requireWallet()
    if (!/^\d+$/.test(vaultMergeSurvivor) || !/^\d+$/.test(vaultMergeDonor)) throw new Error('Enter both deposited Squeek token IDs.')
    const survivor = BigInt(vaultMergeSurvivor); const donor = BigInt(vaultMergeDonor)
    if (survivor < 1n || donor < 1n || survivor > 9999n || donor > 9999n || survivor === donor) throw new Error('Choose two different Squeek IDs from 1 to 9,999.')
    const [depositorA, depositorB, open] = await Promise.all([
      readContract(CONTRACTS.staking, 'depositor(address,uint256)', [CONTRACTS.nft, survivor]).then(decodeAddress),
      readContract(CONTRACTS.staking, 'depositor(address,uint256)', [CONTRACTS.nft, donor]).then(decodeAddress),
      readContract(CONTRACTS.nft, 'mergesOpen()').then(decodeBool),
    ])
    if (depositorA.toLowerCase() !== from.toLowerCase() || depositorB.toLowerCase() !== from.toLowerCase()) throw new Error('Your wallet must be the recorded depositor of both Squeeks.')
    if (!open) throw new Error('Squeekchain has currently closed NFT merges.')
    const hash = await sendTransaction(CONTRACTS.staking, encodeCall('mergeDeposited(address,uint256,uint256)', CONTRACTS.nft, survivor, donor), from)
    setNotice({ kind: 'info', text: 'Vault Squeek merge submitted. The donor NFT will be burned if the contract accepts it.', hash })
    await waitForReceipt(hash); setVaultMergeSurvivor(''); setVaultMergeDonor(''); await refresh(from)
    setNotice({ kind: 'success', text: `Deposited Squeek #${donor} merged into #${survivor}.`, hash })
  })

  const approveNfts = () => runAction('nft-approve', async () => {
    const from = requireWallet()
    const hash = await sendTransaction(CONTRACTS.nft, encodeCall('setApprovalForAll(address,bool)', CONTRACTS.staking, 1n), from)
    setNotice({ kind: 'info', text: 'NFT approval submitted. Waiting for confirmation…', hash })
    await waitForReceipt(hash); await refresh(from)
    setNotice({ kind: 'success', text: 'SqueekStaking is now approved to receive your Squeeks. Deposit only the IDs you choose.', hash })
  })

  const revokeNftApproval = () => runAction('nft-revoke', async () => {
    const from = requireWallet()
    const hash = await sendTransaction(CONTRACTS.nft, encodeCall('setApprovalForAll(address,bool)', CONTRACTS.staking, 0n), from)
    setNotice({ kind: 'info', text: 'NFT approval revoke submitted…', hash })
    await waitForReceipt(hash); await refresh(from)
    setNotice({ kind: 'success', text: 'SqueekStaking NFT operator approval revoked.', hash })
  })

  const depositNft = () => runAction('nft-deposit', async () => {
    const from = requireWallet()
    if (!/^\d+$/.test(depositId) || BigInt(depositId) < 1n || BigInt(depositId) > 9999n) throw new Error('Enter a Squeek token ID from 1 to 9,999.')
    const id = BigInt(depositId)
    const owner = decodeAddress(await readContract(CONTRACTS.nft, 'ownerOf(uint256)', [id]))
    if (owner.toLowerCase() !== from.toLowerCase()) throw new Error('You do not own this Squeek NFT.')
    const approved = decodeBool(await readContract(CONTRACTS.nft, 'isApprovedForAll(address,address)', [from, CONTRACTS.staking]))
    if (!approved) throw new Error('Approve SqueekStaking first. Use the Approve button, confirm it, then deposit.')
    const paused = decodeBool(await readContract(CONTRACTS.staking, 'paused()'))
    if (paused) throw new Error('SqueekStaking intake is paused. NFT deposits are unavailable.')
    const hash = await sendTransaction(CONTRACTS.staking, encodeAddressArrayCall('deposit(address,uint256[])', CONTRACTS.nft, [id]), from)
    setNotice({ kind: 'info', text: `Squeek #${depositId} deposit submitted…`, hash })
    await waitForReceipt(hash); setDepositId(''); await refresh(from)
    setNotice({ kind: 'success', text: `Squeek #${depositId} deposited. Its power now contributes to your staking account.`, hash })
  })

  const withdrawNft = () => runAction('nft-withdraw', async () => {
    const from = requireWallet()
    if (!/^\d+$/.test(withdrawId) || BigInt(withdrawId) < 1n || BigInt(withdrawId) > 9999n) throw new Error('Enter a Squeek token ID from 1 to 9,999.')
    const id = BigInt(withdrawId)
    const depositor = decodeAddress(await readContract(CONTRACTS.staking, 'depositor(address,uint256)', [CONTRACTS.nft, id]))
    if (depositor.toLowerCase() !== from.toLowerCase()) throw new Error('This wallet is not the registered depositor for that Squeek.')
    const hash = await sendTransaction(CONTRACTS.staking, encodeAddressArrayCall('withdraw(address,uint256[])', CONTRACTS.nft, [id]), from)
    setNotice({ kind: 'info', text: `Squeek #${withdrawId} withdrawal submitted…`, hash })
    await waitForReceipt(hash); setWithdrawId(''); await refresh(from)
    setNotice({ kind: 'success', text: `Squeek #${withdrawId} withdrawn to your wallet.`, hash })
  })

  const revokeTokenApproval = () => runAction('revoke-token', async () => {
    const from = requireWallet()
    const hash = await sendTransaction(CONTRACTS.token, encodeCall('approve(address,uint256)', CONTRACTS.staking, 0n), from)
    setNotice({ kind: 'info', text: 'SQK allowance revoke submitted…', hash })
    await waitForReceipt(hash); await refresh(from)
    setNotice({ kind: 'success', text: 'SQK approval for SqueekStaking set to zero.', hash })
  })

  const lookupAccount = () => runAction('lookup', async () => {
    if (!isAddress(searchAddress)) throw new Error('Enter a valid wallet address.')
    const [account, history] = await Promise.all([
      apiGet(`https://api.squeekchain.com/v1/accounts/${searchAddress}?limit=100`),
      apiGet(`https://api.squeekchain.com/v1/accounts/${searchAddress}/activity?limit=20`).catch(() => null),
    ])
    setExplorerAccount(account)
    setExplorerActivity(history?.items || history?.activity || history?.events || [])
  })

  const batchPreview = useMemo(() => batchText.split(/\r?\n/).map((s) => s.trim()).filter(Boolean).length, [batchText])
  const ownedNfts = tokens.filter((item) => item.custody === 'wallet')
  const depositedNfts = tokens.filter((item) => item.custody === 'staking')

  const nav = (id: PageId) => { setPage(id); setMenuOpen(false); setNotice(null); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <main className="hub-shell">
      <header className="hub-topbar">
        <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20} /></button>
        <button className="brand" onClick={() => nav('overview')}>
          <span className="brand-mark">S</span>
          <span><b>SqueekHub</b><small>On-chain tools for Squeekchain</small></span>
        </button>
        <div className="topbar-right">
          <span className="network-chip"><span className="live-dot" /> Sepolia Testnet</span>
          {address ? (
            <div className="wallet-area">
              {!onSepolia && <button className="button button-warn" onClick={switchNetwork}>Switch network</button>}
              <button className="button button-primary wallet-button" onClick={() => copyText(address, 'Wallet address')}><Wallet size={16} /> {shortAddress(address)} <Copy size={13} /></button>
            </div>
          ) : <button className="button button-primary" onClick={connect} disabled={connecting}>{connecting ? <LoaderCircle className="spin" size={16} /> : <Wallet size={16} />} Connect wallet</button>}
        </div>
      </header>

      <div className={`hub-layout ${menuOpen ? 'nav-open' : ''}`}>
        <aside className="hub-sidebar">
          {['Workspace', 'Products', 'Account'].map((group) => (
            <div className="nav-group" key={group}>
              <p className="nav-caption">{group}</p>
              {NAV.filter((item) => item.group === group).map((item) => {
                const Icon = item.icon
                return <button key={item.id} onClick={() => nav(item.id)} className={`nav-link ${page === item.id ? 'active' : ''}`}><Icon size={17} /><span>{item.label}</span>{page === item.id && <span className="nav-active-dot" />}</button>
              })}
            </div>
          ))}
          <div className="sidebar-note"><ShieldCheck size={18} /><b>Self-custody</b><p>Your wallet signs every transaction. SqueekHub never asks for your seed phrase or private key.</p></div>
          <div className="sidebar-footer">SqueekHub · Built for Squeekchain</div>
        </aside>

        <section className="hub-content">
          <div className="content-heading">
            <div><p className="eyebrow">SQUEEKCHAIN · SEPOLIA</p><h1>{activePage?.label || 'Overview'}</h1><p className="heading-sub">Real wallet actions, not a read-only dashboard.</p></div>
            {address && <button className="button button-soft" onClick={() => refresh()} disabled={refreshing}><RefreshCw size={15} className={refreshing ? 'spin' : ''} /> Refresh</button>}
          </div>

          {notice && <div className={`notice notice-${notice.kind}`}><span>{notice.kind === 'success' ? <Check size={18} /> : notice.kind === 'error' ? <AlertCircle size={18} /> : <Clock3 size={18} />}</span><div><p>{notice.text}</p>{notice.hash && <a href={getExplorerTx(notice.hash)} target="_blank" rel="noreferrer">View transaction <ExternalLink size={13} /></a>}</div><button aria-label="Dismiss" onClick={() => setNotice(null)}><X size={16} /></button></div>}

          {address && !onSepolia && <div className="warning-panel"><AlertCircle size={18} /><div><b>Wrong network</b><p>Switch your connected wallet to Sepolia before using Squeekchain features.</p></div><button className="button button-warn" onClick={switchNetwork}>Switch to Sepolia</button></div>}
          {address && onSepolia && !verified && <div className="warning-panel"><ShieldCheck size={18} /><div><b>Contract check required</b><p>The app checks the published SQK token, Squeek NFT and Staking bindings before enabling transactions.</p></div><button className="button button-warn" onClick={() => verifyContracts().then((ok) => { setVerified(ok); if (ok && address) refresh(address) }).catch((e) => setNotice({ kind: 'error', text: formatError(e) }))}>Verify</button></div>}

          {page === 'overview' && <>
            <div className="hero-panel"><div><span className="hero-tag"><Sparkles size={13} /> SQUEEKCHAIN TOOLKIT</span><h2>Make the hamster economy <em>useful.</em></h2><p>Pay, batch-send, stake SQK, manage Squeeks and follow your on-chain activity from one self-custody workspace.</p><div className="hero-actions"><button className="button button-primary" onClick={() => address ? nav('pay') : connect()}><Wallet size={16} /> {address ? 'Start with a payment' : 'Connect wallet'}</button><a className="button button-outline" href="https://docs.squeekchain.com/developers/" target="_blank" rel="noreferrer">Developer docs <ExternalLink size={14} /></a></div></div><div className="hero-graphic"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="hero-coin">SQK</div><span className="float-card float-a">Pay</span><span className="float-card float-b">Stake</span><span className="float-card float-c">Squeeks</span></div></div>
            <div className="stat-grid">
              <Stat label="SQK balance" value={address ? formatUnits18(sqkBalance) : '—'} hint="Wallet token balance" icon={<CircleDollarSign size={18} />} />
              <Stat label="SQK staked" value={address ? formatUnits18(stakePrincipal) : '—'} hint="Official SqueekStaking" icon={<LockKeyhole size={18} />} />
              <Stat label="Claimable rewards" value={address ? formatUnits18(claimable) : '—'} hint="Whole SQK available now" icon={<Sparkles size={18} />} />
              <Stat label="Squeek NFTs" value={address ? String(ownedNfts.length + depositedNfts.length) : '—'} hint="Wallet + deposited" icon={<ImageIcon size={18} />} />
            </div>
            <div className="section-title"><div><p className="eyebrow">YOUR TOOLKIT</p><h3>Choose an action</h3></div><span className="small-pill">5 modules</span></div>
            <div className="module-grid">
              <Module title="SqueekPay" body="Send SQK and create a payment request for your wallet." icon={<Send />} action={() => nav('pay')} badge="LIVE" />
              <Module title="SqueekMultisend" body="Prepare multiple SQK transfers and use wallet batch support when available." icon={<Layers3 />} action={() => nav('multisend')} badge="LIVE" />
              <Module title="SqueekVault" body="Stake SQK, claim rewards and deposit or withdraw Squeeks." icon={<LockKeyhole />} action={() => nav('vault')} badge="LIVE" />
              <Module title="SqueekNFT" body="View your Squeeks, transfer them and manage staking custody." icon={<ImageIcon />} action={() => nav('nft')} badge="LIVE" />
              <Module title="SqueekSwap" body="Swap is shown as unavailable until an official SQK pool is published." icon={<ArrowLeftRight />} action={() => nav('swap')} badge="POOL NEEDED" muted />
            </div>
            <div className="honesty-panel"><ShieldCheck size={19} /><div><b>Designed around real contract calls</b><p>Live actions target the official Sepolia deployment. Swap liquidity and wallet mint authorization are not invented or simulated.</p></div></div>
          </>}

          {page === 'pay' && <div className="two-col">
            <div className="panel"><PanelTitle icon={<Send />} title="Send SQK" caption="ERC-20 transfer · Sepolia" />
              <label className="field-label">Recipient wallet address</label><input className="field" placeholder="0x…" value={sendTo} onChange={(e) => setSendTo(e.target.value)} autoCapitalize="off" />
              <label className="field-label">Amount (SQK)</label><input className="field" inputMode="decimal" placeholder="0.0" value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} />
              <div className="balance-line"><span>Available balance</span><b>{address ? `${formatUnits18(sqkBalance)} SQK` : 'Connect wallet'}</b></div>
              <button className="button button-primary button-wide" onClick={submitSend} disabled={!address || !verified || busy === 'send'}>{busy === 'send' ? <LoaderCircle size={16} className="spin" /> : <Send size={16} />} Review & send SQK</button>
              <p className="microcopy">Your wallet will show the exact token contract, recipient and amount before signing. Sepolia ETH is needed for gas.</p>
            </div>
            <div className="panel"><PanelTitle icon={<ArrowDownLeft />} title="Request payment" caption="Create a shareable request" />
              <label className="field-label">Requested amount (SQK)</label><input className="field" inputMode="decimal" placeholder="0.0" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
              <button className="button button-secondary button-wide" onClick={makePaymentRequest} disabled={!address}><Plus size={16} /> Generate request</button>
              {paymentRequest && <div className="request-box"><p>Share this payment URI</p><code>{paymentRequest}</code><button className="button button-outline button-wide" onClick={() => copyText(paymentRequest, 'Payment request')}><Copy size={15} /> Copy payment request</button><a href={paymentRequest} className="text-link">Open in compatible wallet <ArrowUpRight size={13} /></a></div>}
              <p className="microcopy">The request URI follows the EIP-681 ERC-20 transfer format and targets Sepolia SQK. The payer must verify the amount and recipient in their wallet.</p>
            </div>
          </div>}

          {page === 'multisend' && <div className="two-col">
            <div className="panel"><PanelTitle icon={<Layers3 />} title="Send to multiple wallets" caption="Up to 10 recipients per batch" />
              <label className="field-label">Recipients · one per line</label><textarea className="field textarea" spellCheck={false} placeholder={'0x1234...abcd, 5\n0xabcd...1234, 2.5'} value={batchText} onChange={(e) => setBatchText(e.target.value)} />
              <div className="balance-line"><span>{batchPreview} recipient(s)</span><b>Balance: {formatUnits18(sqkBalance)} SQK</b></div>
              <button className="button button-primary button-wide" onClick={submitMultisend} disabled={!address || !verified || busy === 'multisend'}>{busy === 'multisend' ? <LoaderCircle size={16} className="spin" /> : <Layers3 size={16} />} Prepare multisend</button>
              <p className="microcopy">When your wallet supports EIP-5792 <code>wallet_sendCalls</code>, the app requests a wallet batch. Otherwise it sends separate transactions, each with its own wallet confirmation. No custom multisend contract is deployed.</p>
            </div>
            <div className="panel panel-soft"><PanelTitle icon={<ShieldCheck />} title="Before you send" caption="Batch safety" /><ul className="check-list"><li><Check /> Each address is validated before sending.</li><li><Check /> Total amount is checked against your SQK balance.</li><li><Check /> Maximum 10 recipients per batch.</li><li><Check /> Each transfer is a standard SQK ERC-20 transfer.</li><li><AlertCircle /> Atomic one-transaction execution depends on your wallet's batch support.</li></ul></div>
          </div>}

          {page === 'vault' && <>
            <div className="stat-grid"><Stat label="Staked principal" value={address ? `${formatUnits18(stakePrincipal)} SQK` : '—'} hint="Total principal" icon={<LockKeyhole />} /><Stat label="Mature principal" value={address ? `${formatUnits18(stakePrincipal - freshPrincipal)} SQK` : '—'} hint="Available to unstake" icon={<Clock3 />} /><Stat label="Fresh principal" value={address ? `${formatUnits18(freshPrincipal)} SQK` : '—'} hint="Wait until its round matures" icon={<Activity />} /><Stat label="Claimable rewards" value={address ? `${formatUnits18(claimable)} SQK` : '—'} hint="Current whole-token rewards" icon={<Sparkles />} /></div>
            <div className="two-col">
              <div className="panel"><PanelTitle icon={<Plus />} title="Stake SQK" caption="Approval then stake" /><label className="field-label">Amount to stake</label><input className="field" inputMode="decimal" placeholder="0.0 SQK" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} /><div className="balance-line"><span>Current SQK allowance</span><b>{formatUnits18(tokenAllowance)} SQK</b></div><button className="button button-primary button-wide" onClick={stake} disabled={!address || !verified || busy === 'stake'}>{busy === 'stake' ? <LoaderCircle size={16} className="spin" /> : <LockKeyhole size={16} />} Approve & stake</button><p className="microcopy">The app approves only the amount you enter, not an unlimited allowance. New stake is fresh until the next 10-minute Squeek round begins.</p></div>
              <div className="panel"><PanelTitle icon={<Sparkles />} title="Claim rewards" caption="Receive your claimable SQK" /><div className="big-number">{formatUnits18(claimable)} <small>SQK</small></div><div className="balance-line"><span>Claim recipient</span><b>{claimRecipient ? shortAddress(claimRecipient) : 'Your wallet (default)'}</b></div><button className="button button-secondary button-wide" onClick={claimRewards} disabled={!address || !verified || claimable <= 0n || busy === 'claim'}>{busy === 'claim' ? <LoaderCircle size={16} className="spin" /> : <Sparkles size={16} />} Claim rewards</button><p className="microcopy">The account's configured claim recipient must submit the claim. Rewards accrue to your wallet's staking account, not to an individual Squeek NFT.</p></div>
              <div className="panel panel-span"><PanelTitle icon={<ArrowDownLeft />} title="Unstake SQK" caption="Live exit-fee quote required" /><div className="inline-fields"><div><label className="field-label">Amount to unstake</label><input className="field" inputMode="decimal" placeholder="0.0 SQK" value={unstakeAmount} onChange={(e) => { setUnstakeAmount(e.target.value); setUnstakeQuote(null) }} /></div><button className="button button-outline quote-button" onClick={quoteUnstake} disabled={!address}>Get live quote</button></div>{unstakeQuote && <div className="quote-grid"><div><span>Exit fee (burned)</span><b>{formatUnits18(unstakeQuote.fee)} SQK</b></div><div><span>You receive</span><b>{formatUnits18(unstakeQuote.net)} SQK</b></div></div>}<button className="button button-primary" onClick={unstake} disabled={!address || !verified || !unstakeQuote || busy === 'unstake'}>{busy === 'unstake' ? <LoaderCircle size={16} className="spin" /> : <ArrowDownLeft size={16} />} Confirm unstake</button><p className="microcopy">Only mature principal can be unstaked. The contract burns a variable exit fee. The transaction enforces your latest quoted fee as the maximum.</p></div>
            </div>
            <div className="panel"><PanelTitle icon={<Layers3 />} title="Merge deposited Squeeks" caption="Merge two NFTs already in SqueekVault" /><div className="inline-fields"><div><label className="field-label">Survivor ID</label><input className="field" inputMode="numeric" placeholder="Keeps its ID" value={vaultMergeSurvivor} onChange={(e) => setVaultMergeSurvivor(e.target.value)} /></div><div><label className="field-label">Donor ID</label><input className="field" inputMode="numeric" placeholder="Will be burned" value={vaultMergeDonor} onChange={(e) => setVaultMergeDonor(e.target.value)} /></div></div><button className="button button-outline button-wide" onClick={mergeDepositedNfts} disabled={!address || !verified || busy === 'vault-merge'}>{busy === 'vault-merge' ? <LoaderCircle size={16} className="spin" /> : <Layers3 size={16} />} Merge deposited Squeeks</button><p className="microcopy">The contract requires both Squeeks to be deposited by this wallet, at the same level, eligible under the current merge gate and past their cooldown.</p></div>
          </>}

          {page === 'nft' && <>
            <div className="stat-grid"><Stat label="In wallet" value={address ? String(ownedNfts.length) : '—'} hint="Squeeks available to transfer" icon={<ImageIcon />} /><Stat label="Deposited in Vault" value={address ? String(depositedNfts.length) : '—'} hint="Squeeks earning staking power" icon={<LockKeyhole />} /><Stat label="Collection" value="SQUEEK" hint="Official Genesis ERC-721" icon={<Sparkles />} /><Stat label="Network" value="Sepolia" hint="Testnet only" icon={<ShieldCheck />} /></div>
            <div className="two-col">
              <div className="panel"><PanelTitle icon={<ImageIcon />} title="Your Squeek collection" caption="Wallet-held Genesis Squeeks" />{!address ? <Empty>Connect your wallet to load your Squeeks.</Empty> : apiStatus !== 'online' ? <Empty>Squeekchain account indexing is unavailable. Refresh later to load this collection.</Empty> : ownedNfts.length === 0 ? <Empty>No wallet-held Squeeks were returned for this account.</Empty> : <div className="nft-list">{ownedNfts.map((token) => <div className="nft-row" key={token.tokenId}><div className="nft-art"><ImageIcon size={20} /></div><div><b>Squeek #{token.tokenId}</b><small>Level {token.level ?? '—'} · Wallet</small></div><a href={`${SEPOLIA_EXPLORER}/nft/${CONTRACTS.nft}/${token.tokenId}`} target="_blank" rel="noreferrer"><ExternalLink size={15} /></a></div>)}</div>}<div className="divider" /><label className="field-label">Transfer Squeek ID</label><input className="field" inputMode="numeric" placeholder="Token ID" value={nftId} onChange={(e) => setNftId(e.target.value)} /><label className="field-label">Recipient address</label><input className="field" placeholder="0x…" value={nftTo} onChange={(e) => setNftTo(e.target.value)} /><button className="button button-primary button-wide" onClick={transferNft} disabled={!address || !verified || busy === 'nft-transfer'}>{busy === 'nft-transfer' ? <LoaderCircle size={16} className="spin" /> : <Send size={16} />} Transfer Squeek NFT</button></div>
              <div className="panel"><PanelTitle icon={<LockKeyhole />} title="Staking custody" caption="Deposit Squeeks to add NFT power" />{depositedNfts.length ? <div className="nft-list">{depositedNfts.map((token) => <div className="nft-row" key={token.tokenId}><div className="nft-art"><LockKeyhole size={18} /></div><div><b>Squeek #{token.tokenId}</b><small>Level {token.level ?? '—'} · Deposited</small></div><span className="small-pill">Vault</span></div>)}</div> : <Empty>No Squeeks are currently reported as deposited for this account.</Empty>}<div className="divider" /><div className="balance-line"><span>Staking operator approval</span><b>{nftApproved ? 'Approved' : 'Not approved'}</b></div><button className="button button-outline button-wide" onClick={approveNfts} disabled={!address || !verified || nftApproved || busy === 'nft-approve'}>{busy === 'nft-approve' ? <LoaderCircle size={16} className="spin" /> : <ShieldCheck size={16} />} Approve Staking for NFTs</button><button className="button button-ghost button-wide" onClick={revokeNftApproval} disabled={!address || !verified || !nftApproved || busy === 'nft-revoke'}>Revoke NFT approval</button><label className="field-label">Squeek ID to deposit</label><input className="field" inputMode="numeric" placeholder="Owned token ID" value={depositId} onChange={(e) => setDepositId(e.target.value)} /><button className="button button-secondary button-wide" onClick={depositNft} disabled={!address || !verified || busy === 'nft-deposit'}>Deposit in SqueekVault</button><label className="field-label">Deposited Squeek ID to withdraw</label><input className="field" inputMode="numeric" placeholder="Deposited token ID" value={withdrawId} onChange={(e) => setWithdrawId(e.target.value)} /><button className="button button-outline button-wide" onClick={withdrawNft} disabled={!address || !verified || busy === 'nft-withdraw'}>Withdraw to wallet</button></div>
            </div>
            <div className="panel"><PanelTitle icon={<Layers3 />} title="Merge wallet-held Squeeks" caption="Upgrade a Squeek by burning another of the same level" /><div className="inline-fields"><div><label className="field-label">Survivor ID</label><input className="field" inputMode="numeric" placeholder="Keeps its ID" value={mergeSurvivor} onChange={(e) => setMergeSurvivor(e.target.value)} /></div><div><label className="field-label">Donor ID</label><input className="field" inputMode="numeric" placeholder="Will be burned" value={mergeDonor} onChange={(e) => setMergeDonor(e.target.value)} /></div></div><button className="button button-secondary button-wide" onClick={mergeOwnedNfts} disabled={!address || !verified || busy === 'nft-merge'}>{busy === 'nft-merge' ? <LoaderCircle size={16} className="spin" /> : <Layers3 size={16} />} Merge Squeeks</button><p className="microcopy">You must own both NFTs directly. They must be the same level, merges must be open, and both cooldowns must have ended. The donor is permanently burned.</p></div>
            <div className="warning-panel"><AlertCircle size={18} /><div><b>Minting is eligibility-gated</b><p>The official SqueekNFT contract has a fixed 9,999-token supply. Its public <code>premint</code> sends tokens to the configured launch or protocol recipient, not to the caller. Personal community claims require a Squeekchain Community session and signed authorization. This app does not fake a mint button.</p><a href="https://docs.squeekchain.com/developers/api/#community-mint" target="_blank" rel="noreferrer">Read community mint requirements <ExternalLink size={13} /></a></div></div>
          </>}

          {page === 'swap' && <div className="panel empty-feature"><div className="feature-icon"><ArrowLeftRight size={28} /></div><p className="eyebrow">SQUEEKSWAP</p><h2>No verified SQK pool configured</h2><p>The published Squeekchain deployment documents SQK, SqueekNFT and Staking contracts, but does not publish a canonical SQK swap router or active liquidity pool. A real swap needs a verified router, token pair, pool liquidity and quote path. This screen stays disabled rather than sending funds to an unverified contract.</p><a className="button button-outline" href="https://docs.squeekchain.com/developers/" target="_blank" rel="noreferrer">Check official developer docs <ExternalLink size={14} /></a></div>}

          {page === 'portfolio' && <>
            <div className="stat-grid"><Stat label="SQK wallet balance" value={address ? `${formatUnits18(sqkBalance)} SQK` : '—'} hint="On-chain ERC-20 balance" icon={<CircleDollarSign />} /><Stat label="Sepolia ETH" value={address ? `${formatUnits18(ethBalance)} ETH` : '—'} hint="Used for gas fees" icon={<Wallet />} /><Stat label="SQK staked" value={address ? `${formatUnits18(stakePrincipal)} SQK` : '—'} hint="Staking principal" icon={<LockKeyhole />} /><Stat label="Squeeks" value={address ? String(ownedNfts.length + depositedNfts.length) : '—'} hint="Wallet and Vault custody" icon={<ImageIcon />} /></div>
            <div className="panel"><div className="panel-title-row"><PanelTitle icon={<Activity />} title="Recent account activity" caption={apiStatus === 'online' ? 'Squeekchain account API · live read' : 'Account API currently unavailable'} /><button className="button button-outline button-small" onClick={() => refresh()} disabled={!address || refreshing}><RefreshCw size={14} /> Refresh</button></div>{!address ? <Empty>Connect a wallet to view activity.</Empty> : apiStatus !== 'online' ? <Empty>Account indexing is unavailable right now. Refresh later to retry.</Empty> : activity.length === 0 ? <Empty>No indexed activity was returned for this wallet yet.</Empty> : <div className="activity-list">{activity.map((item, i) => { const hash = item.txHash || item.transactionHash || item.hash || item.source?.transactionHash; return <div className="activity-row" key={`${hash || i}-${i}`}><div className="activity-icon"><Activity size={16} /></div><div className="activity-main"><b>{String(item.kind || item.type || item.event || 'On-chain activity').replace(/_/g, ' ')}</b><small>{formatDate(item.timestamp || item.source?.blockTimestamp)} {item.source?.ethereumBlockNumber || item.blockNumber ? `· Block ${item.source?.ethereumBlockNumber || item.blockNumber}` : ''}</small></div>{hash ? <a href={getExplorerTx(hash)} target="_blank" rel="noreferrer">View <ExternalLink size={13} /></a> : <span className="small-pill">Indexed</span>}</div> })}</div>}</div>
            <div className="panel address-lookup"><PanelTitle icon={<FileText />} title="Public account lookup" caption="Explore another wallet's Squeekchain account" /><div className="inline-fields"><input className="field" placeholder="0x wallet address" value={searchAddress} onChange={(e) => setSearchAddress(e.target.value)} /><button className="button button-primary" onClick={lookupAccount} disabled={busy === 'lookup'}>{busy === 'lookup' ? <LoaderCircle size={16} className="spin" /> : 'Lookup'}</button></div>{explorerAccount && <pre className="json-view">{JSON.stringify({ status: explorerAccount.status, rewards: explorerAccount.rewards, stake: explorerAccount.stake, tokens: explorerAccount.tokens }, null, 2)}</pre>}</div>
          </>}

          {page === 'approvals' && <div className="two-col">
            <div className="panel"><PanelTitle icon={<ShieldCheck />} title="SQK token approval" caption="Allowance granted to official SqueekStaking" /><div className="big-number">{formatUnits18(tokenAllowance)} <small>SQK</small></div><p className="microcopy">SqueekVault approves only the exact amount needed for a new stake. You can revoke any remaining allowance below.</p><button className="button button-outline button-wide" onClick={revokeTokenApproval} disabled={!address || !verified || tokenAllowance === 0n || busy === 'revoke-token'}>{busy === 'revoke-token' ? <LoaderCircle size={16} className="spin" /> : <ShieldCheck size={16} />} Revoke SQK allowance</button></div>
            <div className="panel"><PanelTitle icon={<ImageIcon />} title="Squeek NFT operator approval" caption="Official SqueekStaking contract" /><div className="big-number">{nftApproved ? 'Enabled' : 'Disabled'}</div><p className="microcopy">This approval allows SqueekStaking to receive Squeeks you explicitly deposit. Revoke it any time. It does not grant the staking contract permission to move your SQK.</p><button className="button button-outline button-wide" onClick={revokeNftApproval} disabled={!address || !verified || !nftApproved || busy === 'nft-revoke'}>{busy === 'nft-revoke' ? <LoaderCircle size={16} className="spin" /> : <ShieldCheck size={16} />} Revoke NFT operator approval</button></div>
          </div>}

          <footer className="hub-footer"><span>SqueekHub · Independent community-built application</span><div><a href="https://docs.squeekchain.com/" target="_blank" rel="noreferrer">Docs <ExternalLink size={12} /></a><a href={`${SEPOLIA_EXPLORER}/address/${CONTRACTS.token}`} target="_blank" rel="noreferrer">SQK contract <ExternalLink size={12} /></a></div><p>Sepolia testnet only. Test tokens have no monetary value. Always verify transaction details in your wallet.</p></footer>
        </section>
      </div>
      {menuOpen && <button className="menu-backdrop" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
    </main>
  )
}

function Stat({ label, value, hint, icon }: { label: string; value: string; hint: string; icon: ReactNode }) {
  return <article className="stat-card"><div className="stat-icon">{icon}</div><p>{label}</p><b>{value}</b><small>{hint}</small></article>
}
function Module({ title, body, icon, action, badge, muted = false }: { title: string; body: string; icon: ReactNode; action: () => void; badge: string; muted?: boolean }) {
  return <button className={`module-card ${muted ? 'module-muted' : ''}`} onClick={action}><span className="module-icon">{icon}</span><span className={`module-badge ${muted ? 'badge-muted' : ''}`}>{badge}</span><b>{title}</b><p>{body}</p><span className="module-arrow"><ArrowRight size={18} /></span></button>
}
function PanelTitle({ icon, title, caption }: { icon: ReactNode; title: string; caption: string }) {
  return <div className="panel-title"><span className="panel-icon">{icon}</span><div><h3>{title}</h3><p>{caption}</p></div></div>
}
function Empty({ children }: { children: ReactNode }) { return <div className="empty-state">{children}</div> }
