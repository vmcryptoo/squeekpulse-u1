"use client";

import { useStatus } from "@/hooks/use-squeek";
import {
  Blocks,
  Clock,
  Layers,
  RefreshCw,
  Activity,
  Database,
} from "lucide-react";

function formatNumber(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) return String(value);

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(number);
}

function formatDate(value: unknown) {
  if (!value) return "Not available";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString();
}

function InfoCard({
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

function ProjectionCard({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown> | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center gap-2">
        <Database className="h-5 w-5 text-cyan-400" />
        <h3 className="font-semibold text-white">{title}</h3>
      </div>

      {!data || Object.keys(data).length === 0 ? (
        <p className="py-5 text-center text-sm text-gray-500">
          No projection data available.
        </p>
      ) : (
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col justify-between gap-1 border-b border-white/5 pb-3 sm:flex-row sm:items-center"
            >
              <span className="text-sm capitalize text-gray-400">
                {key.replace(/([A-Z])/g, " $1")}
              </span>

              <span className="break-all text-sm font-medium text-white sm:text-right">
                {typeof value === "object" && value !== null
                  ? JSON.stringify(value)
                  : String(value ?? "Not available")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProvisionalBlocks() {
  const { data, error, isLoading, mutate } = useStatus();

  const builder = (data as any)?.builder;

  const queue = builder?.queued;
  const anchor = builder?.anchor;
  const projected = builder?.projected;

  const builderStatus = builder?.status ?? "Not available";

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Blocks className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">
              Provisional Blocks
            </h2>
          </div>

          <p className="mt-1 text-sm text-gray-400">
            Monitor block builder status, queued work and projections.
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
            Loading provisional block data...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !data && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="font-medium text-red-400">
            Unable to load block builder information
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Please try refreshing the data.
          </p>
        </div>
      )}

      {data && (
        <>
          {/* Builder Status */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm text-gray-400">
                  Block Builder Status
                </p>

                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {String(builderStatus)}
                </h3>
              </div>

              <span className="w-fit rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                Builder Monitor
              </span>
            </div>
          </div>

          {/* Queue Statistics */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Layers className="h-5 w-5 text-cyan-400" />
              <h3 className="font-semibold text-white">
                Settlement Queue
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <InfoCard
                title="Closed Round Count"
                value={formatNumber(queue?.closedRoundCount)}
                description="Number of closed rounds"
                icon={Blocks}
              />

              <InfoCard
                title="Closed Work Units"
                value={formatNumber(queue?.closedWorkUnits)}
                description="Work from closed rounds"
                icon={Activity}
              />

              <InfoCard
                title="Open Round Work"
                value={formatNumber(queue?.openRoundWorkUnits)}
                description="Work in the current open round"
                icon={Clock}
              />
            </div>
          </div>

          {/* Anchor and Projected Blocks */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ProjectionCard
              title="Current Block Anchor"
              data={anchor}
            />

            <ProjectionCard
              title="Projected Block"
              data={projected}
            />
          </div>

          {/* Information */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-400" />
              <h3 className="font-semibold text-white">
                Builder Information
              </h3>
            </div>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              This monitor displays the current builder status, settlement
              queue and available block projections using live network API
              data. Provisional information may change as new rounds are
              processed.
            </p>
          </div>
        </>
      )}
    </section>
  );
}
