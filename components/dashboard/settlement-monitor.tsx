"use client";

import { useState } from "react";
import { useSettlements } from "@/hooks/use-squeek";
import {
  Activity,
  Blocks,
  Clock,
  Coins,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

type Range = "24h" | "7d" | "30d";

function formatNumber(value: number | string | undefined | null) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) return "0";

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(number);
}

function formatToken(
  value: string | number | undefined | null,
  decimals = 18,
  symbol = "SQK"
) {
  const amount = Number(value ?? 0) / Math.pow(10, decimals);

  if (!Number.isFinite(amount)) return `0 ${symbol}`;

  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
  }).format(amount)} ${symbol}`;
}

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString();
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

      <h3 className="mt-3 text-2xl font-semibold text-white">
        {value}
      </h3>

      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}

export default function SettlementMonitor() {
  const [range, setRange] = useState<Range>("24h");

  const { data, error, isLoading, mutate } = useSettlements(range);

  const response = data as any;
  const summary = response?.summary;
  const buckets = response?.buckets ?? [];
  const mining = response?.mining;
  const checkpoints = mining?.recentCheckpoints ?? [];

  const decimals = mining?.economy?.decimals ?? 18;
  const symbol = mining?.economy?.symbol ?? "SQK";

  const maxSettlements = Math.max(
    1,
    ...buckets.map((bucket: any) =>
      Number(bucket.settlementCount ?? 0)
    )
  );

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">
              Settlement Monitor
            </h2>
          </div>

          <p className="mt-1 text-sm text-gray-400">
            Monitor settlement activity and mining checkpoints.
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

      {/* Time Range */}
      <div className="flex gap-2">
        {(["24h", "7d", "30d"] as Range[]).map((item) => (
          <button
            key={item}
            onClick={() => setRange(item)}
            className={`rounded-lg px-4 py-2 text-sm transition ${
              range === item
                ? "bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && !response && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-cyan-400" />
          <p className="mt-3 text-sm text-gray-400">
            Loading settlement data...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !response && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="font-medium text-red-400">
            Unable to load settlement data
          </p>
          <p className="mt-1 text-sm text-gray-400">
            The API may be temporarily unavailable. Try refreshing.
          </p>
        </div>
      )}

      {/* Statistics */}
      {response && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Settlements"
              value={formatNumber(summary?.settlementCount)}
              description={`Activity during ${range}`}
              icon={Activity}
            />

            <StatCard
              title="Active Rounds"
              value={formatNumber(summary?.activeRoundCount)}
              description="Active settlement rounds"
              icon={Clock}
            />

            <StatCard
              title="Completed Blocks"
              value={formatNumber(summary?.completedBlockCount)}
              description="Completed during selected range"
              icon={Blocks}
            />

            <StatCard
              title="Work Added"
              value={formatNumber(summary?.workAdded)}
              description="Total recorded work"
              icon={TrendingUp}
            />
          </div>

          {/* Settlement Activity */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5 flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-400" />
              <h3 className="font-semibold text-white">
                Settlement Activity
              </h3>
            </div>

            {buckets.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No settlement activity available for this period.
              </p>
            ) : (
              <div className="space-y-4">
                {buckets.map((bucket: any, index: number) => {
                  const count = Number(bucket.settlementCount ?? 0);
                  const width = (count / maxSettlements) * 100;

                  return (
                    <div key={bucket.startAt ?? index}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="text-gray-400">
                          {formatDate(bucket.startAt)}
                        </span>

                        <span className="font-medium text-white">
                          {formatNumber(count)} settlements
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-cyan-400 transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span>
                          Blocks: {formatNumber(bucket.completedBlockCount)}
                        </span>
                        <span>
                          Rounds: {formatNumber(bucket.activeRoundCount)}
                        </span>
                        <span>
                          Work: {formatNumber(bucket.workAdded)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mining Overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-cyan-400" />
                <h3 className="font-semibold text-white">
                  Mining Overview
                </h3>
              </div>

              <p className="mt-5 text-sm text-gray-400">
                Minted in selected period
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {formatToken(
                  mining?.rangeMintedBaseUnits,
                  decimals,
                  symbol
                )}
              </p>

              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-sm text-gray-400">
                  Checkpoint Count
                </p>
                <p className="mt-1 text-lg font-medium text-white">
                  {formatNumber(mining?.rangeCheckpointCount)}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                <h3 className="font-semibold text-white">
                  Next Mining Round
                </h3>
              </div>

              {mining?.nextRound ? (
                <div className="mt-5 space-y-3">
                  {Object.entries(mining.nextRound).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between gap-3 border-b border-white/5 pb-2 text-sm"
                      >
                        <span className="capitalize text-gray-400">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="break-all text-right text-white">
                          {String(value ?? "N/A")}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="mt-5 text-sm text-gray-500">
                  No upcoming round information available.
                </p>
              )}
            </div>
          </div>

          {/* Recent Checkpoints */}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="border-b border-white/10 p-5">
              <h3 className="font-semibold text-white">
                Recent Mining Checkpoints
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Latest checkpoint records from the network.
              </p>
            </div>

            {checkpoints.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500">
                No recent checkpoints available.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/[0.02] text-gray-400">
                    <tr>
                      <th className="px-5 py-3 font-medium">Checkpoint</th>
                      <th className="px-5 py-3 font-medium">Time</th>
                      <th className="px-5 py-3 font-medium">Minted</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/5">
                    {checkpoints.map((checkpoint: any, index: number) => (
                      <tr key={checkpoint.id ?? index}>
                        <td className="px-5 py-4 text-white">
                          {checkpoint.id ??
                            checkpoint.checkpointId ??
                            `#${index + 1}`}
                        </td>

                        <td className="px-5 py-4 text-gray-400">
                          {formatDate(
                            checkpoint.createdAt ??
                              checkpoint.acceptedAt ??
                              checkpoint.timestamp
                          )}
                        </td>

                        <td className="px-5 py-4 text-cyan-400">
                          {formatToken(
                            checkpoint.sqkMintedBaseUnits ??
                              checkpoint.mintedBaseUnits,
                            decimals,
                            symbol
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
