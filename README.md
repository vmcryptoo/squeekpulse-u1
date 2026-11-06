# SqueekHub

SqueekHub is a self-custody application for interacting with the official Squeekchain Sepolia deployment. It is designed as an actual utility, not a read-only chain dashboard.

## Included

- **SqueekPay:** standard SQK ERC-20 transfers and EIP-681 payment-request URIs.
- **SqueekMultisend:** validates multiple SQK transfers and requests an EIP-5792 `wallet_sendCalls` batch when supported by the user's wallet. If the wallet does not support batching, it falls back to separately signed transfers and tells the user that they are separate transactions.
- **SqueekVault:** exact-amount SQK approval, stake, live `quoteUnstake`, fee-capped unstake, and reward claim against the official SqueekStaking contract.
- **SqueekNFT:** reads a connected account's Squeeks, transfers owned Squeeks, merges eligible wallet-held Squeeks, approves SqueekStaking, and deposits/withdraws or merges deposited Squeeks through the official staking contract.
- **Portfolio and activity:** live SQK/ETH balances, staking position and public Squeekchain account activity.
- **Approval controls:** revoke SQK allowance and NFT operator approval.
- **Contract graph safety check:** confirms Sepolia, deployed bytecode, SQK/SQUEEK symbols, and the key token/core/NFT/mining/staking bindings before enabling write actions.

## What is intentionally not enabled

These are not fake buttons. The current official Squeekchain developer deployment record is a Sepolia test deployment and does not publish a canonical SQK swap router or active SQK liquidity pool. Therefore SqueekSwap is visibly unavailable until a verified pool/router and quote path are published.

The SqueekNFT collection has a fixed 9,999-token supply. Its public `premint(quantity)` sends the next IDs to the configured launch or protocol recipient, not to the caller. Personal community mint claims require a signed-in Squeekchain Community session and a server-issued authorization. This frontend does not pretend that a public mint-to-wallet action exists.

There is no official marketplace contract in the deployment graph. SqueekHub supports collection viewing, transfers, and contract-supported merge operations, but does not simulate buying or selling.

## Network and contracts

**Sepolia only (chain ID `11155111`).** These are testnet assets and have no guaranteed monetary value. The app uses the addresses published in the official [Squeekchain Developers deployment table](https://docs.squeekchain.com/developers/):

| Contract | Address |
|---|---|
| SqueekCore | `0xFD6C166D4B8E2962E65746a13e5a0797CD4dE0c4` |
| SqueekNFT | `0xC4C7982657f00509548F3a3a41db7FA439a6856B` |
| SqueekToken (SQK) | `0xd78a3956cF63164d1Fa1C622ad3c66623162Fa1e` |
| SqueekMining | `0x2dCcB11fcC2dEfdd188555e45aCb52231e82e218` |
| SqueekStaking | `0x50fd1780526c3186A0c037c7622203bC4fb611ca` |

Contract APIs and permission rules can change while Squeekchain is in active development. The frontend checks the main contract graph but does not replace the full runtime-hash, implementation, storage-layout and proxy-admin verification described in the official quickstart. Recheck the official deployment record before each release.

## Requirements

- Node.js 20.9 or newer
- pnpm (the repository includes `pnpm-lock.yaml`)
- An EVM wallet such as MetaMask, with Sepolia ETH for gas

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` in a wallet-enabled browser. Connect your wallet and switch to Sepolia when prompted.

## Production build

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

Deploy as a standard Next.js application (for example, Vercel). No private key, seed phrase, or server signing secret is required. The public Sepolia RPC URL is configured in `lib/squeek/web3.ts` and can be changed there if your RPC provider changes.

## Wallet behavior

- All writes are initiated by the connected wallet through EIP-1193 `eth_sendTransaction` or EIP-5792 `wallet_sendCalls`.
- The app never requests or stores a seed phrase or private key.
- SQK stake uses an exact approval amount, not an unlimited approval.
- Unstake requires a fresh on-chain fee quote. The quoted fee is passed as `maxFee` with a five-minute deadline.
- Multi-send is atomic only when the connected wallet supports EIP-5792 batching. Otherwise, transfers are submitted one by one with separate wallet confirmations. NFT merge permanently burns the donor Squeek; review both token IDs carefully before signing.

## Project verification

Squeekchain's Genesis Code board has a separate project attribution/verification flow. A new project entry must be created there to obtain its own project ID and exact DNS, HTML meta-tag and repository README proof instructions. Do not reuse an older SqueekPulse project ID for SqueekHub. Follow the current instructions on [Genesis Code](https://squeekchain.com/genesis/code).

## Source references

- [Developer deployments and contract graph](https://docs.squeekchain.com/developers/)
- [SQK token contract](https://docs.squeekchain.com/developers/token/)
- [SqueekNFT contract](https://docs.squeekchain.com/developers/nft/)
- [SqueekStaking contract](https://docs.squeekchain.com/developers/staking/)
- [Owner transaction preparation guide](https://docs.squeekchain.com/developers/owner-actions/)
- [Account and activity API](https://docs.squeekchain.com/developers/api/)
