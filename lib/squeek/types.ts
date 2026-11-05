export type Availability = 'available' | 'unavailable' | (string & {})

export interface ChainInfo {
  target: string
  chainId: string
  confirmations: string
  deploymentBlock: string
  indexedThroughBlock: string
  safeThroughBlock: string
  safeBlockTimestamp?: string
}

export interface BlockProjection {
  cumulativeWork: string
  cumulativeBlockUnits: string
  blockHeight: string
  blockProgress: string
  workPerThousandBlocks: string
  completedBlockCount?: string
  lifecycle?: string
}

export interface StatusResponse {
  schemaVersion: number
  installationId: string
  generatedAt: string
  status?: Availability
  measurement?: {
    freshness: string
    observedAt: string
    receivedAt: string
    staleAfterSeconds: number
    cumulativeWorkUnits: string
    provenance: string
    coreStatus: string
    rpmMilli: number
    speedMmPerSecond: number
    distanceMm: number
  }
  builder?: {
    status: Availability
    anchor?: BlockProjection & { settledThroughRound: string; confirmedAt: string; transactionHash: string }
    queued?: { closedRoundCount: string; closedWorkUnits: string; openRoundWorkUnits: string }
    projected?: BlockProjection
  }
  oracle?: {
    state: string
    reason: string | null
    latestAcceptedAt: string | null
    latestClosure?: { firstRound: string; lastRound: string; roundCount: string; acceptedAt: string }
  }
  settlementQueue?: {
    status: Availability
    state: string
    settlementEnabled: boolean
    incidentOpen: boolean
    blockedReason: string | null
    lastRun?: { startedAt: string; finishedAt: string; result: string }
    latestSubmission?: { settledThroughRound: string; lifecycle: string; transactionHash: string; submittedAt: string }
  }
  signer?: { kind: string; algorithm: string; enrolledAt: string; lastVerifiedAt: string }
  modules?: Array<{
    instanceId: string
    moduleType: string
    driverId: string
    moduleVersion: string
    state: string
    observedAt: string
    provenance: string
  }>
}

export interface CoreResponse {
  status: Availability
  installationId: string
  chain?: ChainInfo
  identities?: Record<string, string>
  configuration?: {
    genesisTimestamp: string
    roundDuration: string
    maxWorkPerRound: string
    maxRoundsPerBatch: string
    guardian: string
    reporter: string
    initialWorkPerThousandBlocks: string
    targetBlocksPerActiveRound: string
    difficultySmoothingRounds: string
    blockUnitsPerBlock: string
  }
  core?: BlockProjection & { settledThroughRound: string; authorizationNonce: string; paused: boolean }
  implementation?: { codeAddress: string; codeVersion: string }
  source?: { eventName: string; blockNumber: string; blockTimestamp: string; transactionHash: string }
}

export interface Capability {
  status: string
  paused?: boolean
  [key: string]: unknown
}

export interface EconomyResponse {
  status: Availability
  generatedAt: string
  release?: { id: string; protocolRevision: string; rewardModelRevision: string }
  chain?: ChainInfo
  capabilities?: Record<string, Capability | unknown>
  asset?: { address: string; symbol: string; decimals: number }
  lifecycle?: { stage: string; startRound: string; currentRound: string; paused: boolean }
  supply?: {
    capBaseUnits: string
    premintBaseUnits: string
    miningMintedBaseUnits: string
    totalMintedBaseUnits: string
    totalBurnedBaseUnits: string
    liveSupplyBaseUnits: string
    unmintedCapacityBaseUnits: string
  }
  schedule?: {
    allowanceBaseUnits: string
    launchBonusBaseUnits: string
    bonusBlocks: string
    halvingBlocks: string
    firstPeriodRateBaseUnits: string
    issuedBaseUnits: string
  }
  mining?: { processedThroughRound: string; fundedBlocks: string }
  staking?: {
    paused: boolean
    totalStakedBaseUnits: string
    totalNftPower: string
    totalSqkPower: string
    rewards?: { fundedBaseUnits: string; paidBaseUnits: string; remainingBaseUnits: string }
  }
  nft?: { collectionCap: string; issued: string; burned: string; live: string; mergesOpen: boolean; maximumLevel: number }
  authMinter?: { address: string; claimsOpen: boolean; totalClaimed: string; remaining: string }
}

export interface ChainEvent {
  id: string
  type: string
  occurredAt: string
  source: {
    kind: string
    chainId?: string
    target?: string
    contractAddress?: string
    blockNumber?: string
    transactionHash?: string
    confirmationStatus?: string
  }
  payload: Record<string, unknown>
}

export interface EventsResponse {
  status: Availability
  generatedAt: string
  chain?: ChainInfo
  activeEventTypes?: string[]
  events?: ChainEvent[]
}

export interface SettlementBucket {
  startAt: string
  endAt: string
  settlementCount: string
  activeRoundCount: string
  workAdded: string
  completedBlockCount: string
  sqkMintedBaseUnits: string
}

export interface SettlementsResponse {
  status: Availability
  range: string
  chain?: ChainInfo
  window?: { startAt: string; endAt: string; bucketSeconds: number }
  summary?: { settlementCount: string; activeRoundCount: string; workAdded: string; completedBlockCount: string }
  buckets?: SettlementBucket[]
  mining?: {
    status: Availability
    economy?: { symbol: string; decimals: number }
    rangeMintedBaseUnits: string
    rangeCheckpointCount: string
    nextRound?: { state: string; round: string; startsAt: string; endsAt: string }
    recentCheckpoints?: Array<{
      afterRound: string
      throughRound: string
      completedBlockCount: string
      amountBaseUnits: string
      transactionHash: string
      blockTimestamp: string
      confirmationStatus: string
    }>
  }
}
