'use client'

import { Coins } from 'lucide-react'
import { Pie, PieChart, Cell } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { useEconomy, useNetwork } from '@/hooks/use-squeek'
import { baseUnitsToNumber, formatInt, formatPercent, formatToken, humanize, ratioPercent } from '@/lib/squeek/format'
import { explorerAddress } from '@/lib/squeek/network'
import { DataBoundary, ExternalLink, KeyValue, Section, Stat, StatusPill } from './primitives'

const supplyConfig = {
  premint: { label: 'Premint', color: 'var(--chart-1)' },
  mined: { label: 'Mining minted', color: 'var(--chart-4)' },
  unminted: { label: 'Unminted capacity', color: 'var(--chart-5)' },
} satisfies ChartConfig

export function TokenEconomy() {
  const economy = useEconomy()
  const { network } = useNetwork()

  return (
    <Section
      id="economy"
      index={4}
      icon={Coins}
      title="SQK Token Economy"
      description="Supply, issuance schedule, staking and NFT collection state read from the economy contracts."
      network={network}
    >
      <DataBoundary label="Token economy" data={economy.data} error={economy.error} isLoading={economy.isLoading} onRetry={() => economy.mutate()}>
        {(e) => {
          const decimals = e.asset?.decimals ?? 18
          const symbol = e.asset?.symbol ?? 'SQK'
          const s = e.supply
          const chartData = s
            ? [
                { key: 'premint', value: baseUnitsToNumber(s.premintBaseUnits, decimals) ?? 0 },
                { key: 'mined', value: baseUnitsToNumber(s.miningMintedBaseUnits, decimals) ?? 0 },
                { key: 'unminted', value: baseUnitsToNumber(s.unmintedCapacityBaseUnits, decimals) ?? 0 },
              ]
            : []
          return (
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone={e.lifecycle?.paused ? 'bad' : 'accent'}>Stage: {humanize(e.lifecycle?.stage)}</StatusPill>
                <StatusPill tone="neutral">Round {formatInt(e.lifecycle?.currentRound)}</StatusPill>
                {e.asset ? (
                  <span className="font-mono text-xs text-muted-foreground">
                    {symbol} token{' '}
                    <ExternalLink href={explorerAddress(network, e.asset.address)}>{e.asset.address.slice(0, 10)}…</ExternalLink>
                  </span>
                ) : null}
              </div>

              <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label="Live supply" value={formatToken(s?.liveSupplyBaseUnits, decimals, true)} unit={symbol} emphasis hint={`${formatPercent(ratioPercent(s?.liveSupplyBaseUnits, s?.capBaseUnits))} of cap`} />
                <Stat label="Supply cap" value={formatToken(s?.capBaseUnits, decimals, true)} unit={symbol} emphasis />
                <Stat label="Mined by the wheel" value={formatToken(s?.miningMintedBaseUnits, decimals)} unit={symbol} emphasis />
                <Stat label="Burned" value={formatToken(s?.totalBurnedBaseUnits, decimals)} unit={symbol} emphasis />
              </dl>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="flex flex-col rounded-xl border border-border bg-background/40 p-4">
                  <h3 className="text-sm font-medium">Supply allocation</h3>
                  <ChartContainer config={supplyConfig} className="mx-auto aspect-square h-48">
                    <PieChart accessibilityLayer>
                      <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
                      <Pie data={chartData} dataKey="value" nameKey="key" innerRadius={52} outerRadius={80} strokeWidth={2} stroke="var(--card)">
                        {chartData.map((d) => (
                          <Cell key={d.key} fill={`var(--color-${d.key})`} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                  <ul className="mt-2 flex flex-col gap-1.5 text-xs">
                    {chartData.map((d) => (
                      <li key={d.key} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <span className="size-2 rounded-full" style={{ background: supplyConfig[d.key as keyof typeof supplyConfig].color }} aria-hidden="true" />
                          {supplyConfig[d.key as keyof typeof supplyConfig].label}
                        </span>
                        <span className="font-mono tabular-nums">{new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(d.value)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <h3 className="mb-1 text-sm font-medium">Issuance schedule</h3>
                  <dl>
                    <KeyValue label="Mining allowance">{formatToken(e.schedule?.allowanceBaseUnits, decimals, true)} {symbol}</KeyValue>
                    <KeyValue label="Issued so far">{formatToken(e.schedule?.issuedBaseUnits, decimals)} {symbol}</KeyValue>
                    <KeyValue label="Launch bonus">{formatToken(e.schedule?.launchBonusBaseUnits, decimals, true)} {symbol}</KeyValue>
                    <KeyValue label="Bonus period">{formatInt(e.schedule?.bonusBlocks)} blocks</KeyValue>
                    <KeyValue label="Halving every">{formatInt(e.schedule?.halvingBlocks)} blocks</KeyValue>
                    <KeyValue label="First-period rate">{formatToken(e.schedule?.firstPeriodRateBaseUnits, decimals)} {symbol}/block</KeyValue>
                    <KeyValue label="Funded blocks">{formatInt(e.mining?.fundedBlocks)}</KeyValue>
                  </dl>
                </div>

                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <h3 className="mb-1 text-sm font-medium">Staking &amp; NFTs</h3>
                  <dl>
                    <KeyValue label="Total staked">{formatToken(e.staking?.totalStakedBaseUnits, decimals)} {symbol}</KeyValue>
                    <KeyValue label="NFT power / SQK power">{`${formatInt(e.staking?.totalNftPower)} / ${formatInt(e.staking?.totalSqkPower)}`}</KeyValue>
                    <KeyValue label="Rewards paid">{formatToken(e.staking?.rewards?.paidBaseUnits, decimals)} {symbol}</KeyValue>
                    <KeyValue label="Rewards remaining">{formatToken(e.staking?.rewards?.remainingBaseUnits, decimals)} {symbol}</KeyValue>
                    <KeyValue label="NFTs live / cap">{`${formatInt(e.nft?.live)} / ${formatInt(e.nft?.collectionCap)}`}</KeyValue>
                    <KeyValue label="NFTs burned (merges)">{formatInt(e.nft?.burned)}</KeyValue>
                    <KeyValue label="Auth-minter claims">{`${formatInt(e.authMinter?.totalClaimed)} claimed · ${formatInt(e.authMinter?.remaining)} left`}</KeyValue>
                  </dl>
                </div>
              </div>
            </div>
          )
        }}
      </DataBoundary>
    </Section>
  )
}
