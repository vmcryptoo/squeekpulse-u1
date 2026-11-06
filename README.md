# SqueekPulse

Squeekchain community dashboard and interaction frontend.

## Network
- Ethereum Sepolia testnet (Chain ID `11155111`)
- SQK ERC-20: `0xd78a3956cF63164d1Fa1C622ad3c66623162Fa1e`
- Squeeks ERC-721: `0xC4C7982657f00509548F3a3a41db7FA439a6856B`
- Explorer: https://sepolia.etherscan.io

Contract addresses and deployment details should always be re-verified against https://docs.squeekchain.com/developers/ before a release. The documentation describes a Sepolia test deployment, not a mainnet deployment.

## Implemented in this package
- Existing SqueekPulse dashboard and Squeekchain public API proxy.
- Injected EVM wallet connection (MetaMask/OKX/Trust Wallet when their EVM provider is exposed as `window.ethereum`).
- Account and chain change detection.
- SQK ERC-20 balance read and SQK transfer transaction on Sepolia.
- Transaction hash link to Sepolia Etherscan.

## Not yet implemented
Swap, marketplace buying/selling, NFT minting, and staking transactions are not enabled. The frontend must not pretend these work: a swap requires a verified DEX/router and liquidity; a marketplace requires a deployed marketplace contract; NFT minting and staking require exact current contract ABIs, permissions and launch state. Check the official developer docs before implementing those actions.

## Run locally

```bash
npm install
npm run dev
```

## Deploy
Import the repository into Vercel and deploy as a Next.js project. No private key or seed phrase is needed. Never add a wallet private key to environment variables or source code.

## Safety
This is a testnet application. SQK on Sepolia is a test token and has no guaranteed monetary value. Review every wallet transaction before signing.
