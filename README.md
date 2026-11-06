# SqueekPulse

Squeekchain analytics and interaction dashboard.

## Wallet integration

The app includes an injected EVM wallet connection for wallet browsers/providers such as MetaMask, OKX Wallet and Trust Wallet. Open the deployed site inside the wallet's in-app browser if the regular mobile browser does not expose `window.ethereum`.

- Network: Ethereum Sepolia (chain ID `11155111`)
- SQK token: `0xd78a3956cf63164d1fa1c622ad3c66623162fa1e`
- Connect/disconnect in-app, account/network change listeners, SQK balance read and ERC-20 transfer.
- This is an injected-provider integration, not WalletConnect QR/deep-link protocol.

## Deploy

Install dependencies with `pnpm install`, then run `pnpm build` and deploy the repository root to Vercel.

## Important contract scope

The Sepolia network and contract addresses are sourced from Squeekchain's developer documentation. The project does not fabricate swap, marketplace, or custom staking contracts. Those tools remain marked as not enabled until their deployed contract addresses, published ABIs, liquidity/marketplace configuration and permissions are verified. Testnet assets have no monetary value. Never enter a seed phrase or private key into this site.
