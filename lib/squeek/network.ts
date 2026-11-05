export type NetworkKind = 'mainnet' | 'testnet' | 'unknown'

export interface NetworkInfo {
  kind: NetworkKind
  name: string
  chainId: string | null
  explorer: string | null
}

const KNOWN_CHAINS: Record<string, Omit<NetworkInfo, 'chainId'>> = {
  '1': { kind: 'mainnet', name: 'Ethereum Mainnet', explorer: 'https://etherscan.io' },
  '11155111': { kind: 'testnet', name: 'Sepolia Testnet', explorer: 'https://sepolia.etherscan.io' },
  '17000': { kind: 'testnet', name: 'Holesky Testnet', explorer: 'https://holesky.etherscan.io' },
  '560048': { kind: 'testnet', name: 'Hoodi Testnet', explorer: 'https://hoodi.etherscan.io' },
}

const TESTNET_HINT = /sepolia|holesky|hoodi|goerli|test|dev|staging/i

/** Classifies the network from what the API reports. Never assumes mainnet without an explicit chain ID of 1. */
export function resolveNetwork(chain?: { chainId?: string; target?: string } | null): NetworkInfo {
  const chainId = chain?.chainId ?? null
  if (chainId && KNOWN_CHAINS[chainId]) return { ...KNOWN_CHAINS[chainId], chainId }
  if (chain?.target && TESTNET_HINT.test(chain.target)) {
    return { kind: 'testnet', name: chain.target, chainId, explorer: null }
  }
  return { kind: 'unknown', name: chain?.target ?? 'Unverified network', chainId, explorer: null }
}

export function explorerTx(network: NetworkInfo, hash?: string | null) {
  return network.explorer && hash ? `${network.explorer}/tx/${hash}` : null
}

export function explorerAddress(network: NetworkInfo, address?: string | null) {
  return network.explorer && address ? `${network.explorer}/address/${address}` : null
}

export function explorerBlock(network: NetworkInfo, block?: string | null) {
  return network.explorer && block ? `${network.explorer}/block/${block}` : null
}
