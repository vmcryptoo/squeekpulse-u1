"use client";

import { useStatus } from "@/hooks/use-squeek";
import {
  Activity,
  Clock,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  Radio,
} from "lucide-react";

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString();
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  return String(value);
}

function InfoCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">{title}</p>
        <Icon className="h-5 w-5 text-cyan-400" />
      </div>

      <p className="mt-3 break-words text-xl font-semibold text-white">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
}

export default function OracleMonitor() {
  const { data, error, isLoading, mutate } = useStatus();

  const oracle = (data as any)?.oracle;
  const closure = oracle?.latestClosure;

  const state = formatValue(oracle?.state);
  const isHealthy =
    typeof oracle?.state === "string" &&
    /healthy|active|online|ready|operational/i.test(oracle.state);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">
              Oracle Monitor
            </h2>
          </div>

          <p className="mt-1 text-sm text-gray-400">
            Monitor oracle status and accepted round information.
          </p>
        </div>

        <button
          onClick={() => mutate()}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 disabled:opacity-50"
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
            Loading oracle information...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !data && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="font-medium text-red-400">
            Unable to load oracle information
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Please try refreshing the data.
          </p>
        </div>
      )}

      {data && (
        <>
          {/* Oracle Status */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-xl p-3 ${
                    isHealthy
                      ? "bg-emerald-500/10"
                      : "bg-amber-500/10"
                  }`}
                >
                  {isHealthy ? (
                    <ShieldCheck className="h-7 w-7 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="h-7 w-7 text-amber-400" />
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-400">
                    Current Oracle State
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-white">
                    {state}
                  </h3>
                </div>
              </div>

              <span
                className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${
                  isHealthy
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}
              >
                {isHealthy ? "Operational" : "Check Status"}
              </span>
            </div>

            {oracle?.reason && (
              <div className="mt-5 rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-xs text-gray-500">Status Reason</p>
                <p className="mt-1 break-words text-sm text-gray-300">
                  {oracle.reason}
                </p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <InfoCard
              title="Latest Accepted"
              value={formatDate(oracle?.latestAcceptedAt)}
              description="Latest accepted oracle update"
              icon={Clock}
            />

            <InfoCard
              title="First Round"
              value={formatValue(closure?.firstRound)}
              description="Latest accepted closure"
              icon={Activity}
            />

            <InfoCard
              title="Last Round"
              value={formatValue(closure?.lastRound)}
              description="Latest accepted closure"
              icon={Radio}
            />
          </div>

          {/* Latest Closure */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-cyan-400" />
              <h3 className="font-semibold text-white">
                Latest Accepted Closure
              </h3>
            </div>

            {closure ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-white/[0.03] p-4">
                  <p className="text-sm text-gray-400">Round Count</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatValue(closure.roundCount)}
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.03] p-4">
                  <p className="text-sm text-gray-400">Accepted At</p>
                  <p className="mt-2 break-words text-sm font-medium text-white">
                    {formatDate(closure.acceptedAt)}
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.03] p-4">
                  <p className="text-sm text-gray-400">First Round</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatValue(closure.firstRound)}
                  </p>
                </div>

                <div className="rounded-lg bg-white/[0.03] p-4">
                  <p className="text-sm text-gray-400">Last Round</p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    {formatValue(closure.lastRound)}
                  </p>
                </div>
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-gray-500">
                No accepted closure information available.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
