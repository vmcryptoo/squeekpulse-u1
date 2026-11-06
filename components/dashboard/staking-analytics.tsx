"use client";

import { useEconomy } from "@/hooks/use-squeek";
import {
  Coins,
  Lock,
  RefreshCw,
  TrendingUp,
  Wallet,
  Gift,
  Activity,
} from "lucide-react";

function formatNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) return String(value);

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
  }).format(number);
}

function formatToken(
  value: unknown,
  decimals: number,
  symbol: string
) {
  if (value === null || value === undefined) {
    return `Not available`;
  }

  const amount = Number(value) / Math.pow(10, decimals);

  if (!Number.isFinite(amount)) return "Not available";

  return `${formatNumber(amount)} ${symbol}`;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        <Icon className="h-5 w-5 text-cyan-400" />
      </div>

      <p className="mt-3 break-words text-2xl font-semibold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}

function ProgressBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage =
    total > 0 ? Math.min((value / total) * 100, 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-3 text-sm">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">
          {percentage.toFixed(2)}%
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function StakingAnalytics() {
  const { data, error, isLoading, mutate } = useEconomy();

  const response = data as any;
  const staking = response?.staking;
  const rewards = staking?.rewards;

  const decimals = response?.asset?.decimals ?? 18;
  const symbol = response?.asset?.symbol ?? "SQK";

  const funded = Number(rewards?.fundedBaseUnits ?? 0);
  const paid = Number(rewards?.paidBaseUnits ?? 0);
  const remaining = Number(rewards?.remainingBaseUnits ?? 0);

  const totalRewards = funded > 0 ? funded : paid + remaining;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">
              Staking Analytics
            </h2>
          </div>

          <p className="mt-1 text-sm text-gray-400">
            Monitor staking power, total staked tokens and reward distribution.
          </p>
        </div>

        <button
          onClick={() => mutate()}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Loading */}
      {isLoading && !data && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-cyan-400" />
          <p className="mt-3 text-sm text-gray-400">
            Loading staking analytics...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !data && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="font-medium text-red-400">
            Unable to load staking information
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Please try refreshing the data.
          </p>
        </div>
      )}

      {data && (
        <>
          {/* Staking Status */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-500/10 p-3">
                  <Lock className="h-7 w-7 text-cyan-400" />
                </div>

                <div>
                  <p className="text-sm text-gray-400">
                    Staking Status
                  </p>

                  <h3 className="mt-1 text-2xl font-semibold text-white">
                    {staking?.paused === true
                      ? "Paused"
                      : staking?.paused === false
                        ? "Active"
                        : "Not Available"}
                  </h3>
                </div>
              </div>

              <span
                className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${
                  staking?.paused === true
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                    : staking?.paused === false
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-white/10 bg-white/5 text-gray-400"
                }`}
              >
                {staking?.paused === true
                  ? "Paused"
                  : staking?.paused === false
                    ? "Operational"
                    : "Unknown"}
              </span>
            </div>
          </div>

          {/* Main Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              title="Total Staked"
              value={formatToken(
                staking?.totalStakedBaseUnits,
                decimals,
                symbol
              )}
              description="Total tokens currently staked"
              icon={Wallet}
            />

            <StatCard
              title="NFT Power"
              value={formatNumber(staking?.totalNftPower)}
              description="Total NFT staking power"
              icon={Activity}
            />

            <StatCard
              title="SQK Power"
              value={formatNumber(staking?.totalSqkPower)}
              description="Total SQK staking power"
              icon={TrendingUp}
            />
          </div>

          {/* Reward Distribution */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5 flex items-center gap-2">
              <Gift className="h-5 w-5 text-cyan-400" />
              <h3 className="font-semibold text-white">
                Reward Distribution
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-white/[0.03] p-4">
                <p className="text-sm text-gray-400">
                  Funded Rewards
                </p>

                <p className="mt-2 break-words text-lg font-semibold text-white">
                  {formatToken(funded, decimals, symbol)}
                </p>
              </div>

              <div className="rounded-lg bg-white/[0.03] p-4">
                <p className="text-sm text-gray-400">
                  Paid Rewards
                </p>

                <p className="mt-2 break-words text-lg font-semibold text-emerald-400">
                  {formatToken(paid, decimals, symbol)}
                </p>
              </div>

              <div className="rounded-lg bg-white/[0.03] p-4">
                <p className="text-sm text-gray-400">
                  Remaining Rewards
                </p>

                <p className="mt-2 break-words text-lg font-semibold text-cyan-400">
                  {formatToken(remaining, decimals, symbol)}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <ProgressBar
                label="Rewards Paid"
                value={paid}
                total={totalRewards}
              />

              <ProgressBar
                label="Rewards Remaining"
                value={remaining}
                total={totalRewards}
              />
            </div>
          </div>

          {/* Information */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              <h3 className="font-semibold text-white">
                Staking Overview
              </h3>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              This dashboard displays staking statistics and reward
              distribution from the Squeekchain economy API. All values
              are based on the available network data.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
