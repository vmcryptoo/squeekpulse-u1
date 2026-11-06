# SqueekHub integration status

This file records exactly what the source implements so the project is not misrepresented during review.

| Feature | Status | Notes |
|---|---|---|
| Wallet connect | Implemented | EIP-1193 injected wallets; Sepolia switch/add flow |
| SQK send | Implemented | Standard ERC-20 transfer from the connected wallet |
| Payment request | Implemented | Builds an EIP-681 SQK transfer request URI |
| Multisend | Implemented with wallet capability | Uses EIP-5792 batching when supported; otherwise sends separate transactions |
| SQK staking | Implemented | Exact token allowance followed by official `stake(amount)` |
| SQK reward claim | Implemented | Checks claim recipient and calls official `claim(account)` |
| SQK unstake | Implemented | Reads `quoteUnstake` and submits fee-capped `unstake` |
| Squeek collection | Implemented | Lists account-held and deposited Squeeks using public account API |
| Squeek transfer | Implemented | Calls ERC-721 `transferFrom` after checking ownership |
| Wallet-held Squeek merge | Implemented | Checks direct ownership and merge gate; donor NFT is burned by the official contract |
| Deposited Squeek merge | Implemented | Checks recorded depositor and merge gate; official staking contract performs merge |
| Squeek deposit/withdraw | Implemented | Uses official SqueekStaking custody functions |
| SQK/NFT approvals | Implemented | Exact SQK allowance and NFT operator approval/revoke controls |
| Portfolio/activity | Implemented | On-chain balances plus official account/activity API |
| SQK token swap | Disabled | No canonical SQK swap router/pool is published in the official deployment table |
| NFT direct mint | Disabled | Fixed-supply collection; caller-directed mint requires the Community authorization flow |
| NFT marketplace | Not included | No official marketplace deployment is published in the official contract graph |

No button in the app creates fake transaction hashes or simulates a successful on-chain transaction. The Sepolia network is test-only.
