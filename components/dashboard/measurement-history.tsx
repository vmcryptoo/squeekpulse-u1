"use client";

import { useMemo } from "react";
import { useEvents } from "@/hooks/use-squeek";
import {
  Activity,
  Clock,
  RefreshCw,
  Radio,
  Ruler,
  Gauge,
  Database,
} from "lucide-react";

function formatDate(value: unknown) {
  if (!value) return "Not available";

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString();
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

      <p className="mt-3 break-words text-xl font-semibold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}

export default function MeasurementHistory() {
  const { data, error, isLoading, mutate } = useEvents();

  const response = data as any;

  const allEvents = Array.isArray(response)
    ? response
    : response?.events ?? response?.items ?? [];

  const measurementEvents = useMemo(() => {
    return allEvents
      .filter((event: any) =>
        String(event?.type ?? "")
          .toLowerCase()
          .startsWith("measurement.")
      )
      .sort((a: any, b: any) => {
        const dateA = new Date(
          a?.createdAt ?? a?.timestamp ?? a?.occurredAt ?? 0
        ).getTime();

        const dateB = new Date(
          b?.createdAt ?? b?.timestamp ?? b?.occurredAt ?? 0
        ).getTime();

        return dateB - dateA;
      });
  }, [allEvents]);

  const latestEvent = measurementEvents[0];
  const latestPayload = latestEvent?.payload ?? {};

  const measurementValues = [
    {
      title: "RPM",
      value: formatValue(latestPayload.rpmMilli),
      description: "Latest reported RPM value",
      icon: Gauge,
    },
    {
      title: "Speed",
      value: latestPayload.speedMmPerSecond != null
        ? `${formatValue(latestPayload.speedMmPerSecond)} mm/s`
        : "Not available",
      description: "Latest reported speed",
      icon: Activity,
    },
    {
      title: "Distance",
      value: latestPayload.distanceMm != null
        ? `${formatValue(latestPayload.distanceMm)} mm`
        : "Not available",
      description: "Latest reported distance",
      icon: Ruler,
    },
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">
              Measurement History
            </h2>
          </div>

          <p className="mt-1 text-sm text-gray-400">
            Explore historical measurement events from the network.
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
            Loading measurement history...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !data && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
          <p className="font-medium text-red-400">
            Unable to load measurement history
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Please try refreshing the data.
          </p>
        </div>
      )}

      {data && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              title="Measurement Events"
              value={String(measurementEvents.length)}
              description="Events available in the API response"
              icon={Database}
            />

            <StatCard
              title="Latest Measurement"
              value={formatDate(
                latestEvent?.createdAt ??
                  latestEvent?.timestamp ??
                  latestEvent?.occurredAt
              )}
              description="Time of the latest measurement event"
              icon={Clock}
            />
          </div>

          {/* Latest Values */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Radio className="h-5 w-5 text-cyan-400" />
              <h3 className="font-semibold text-white">
                Latest Measurement Values
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {measurementValues.map((item) => (
                <StatCard
                  key={item.title}
                  title={item.title}
                  value={item.value}
                  description={item.description}
                  icon={item.icon}
                />
              ))}
            </div>
          </div>

          {/* Event History */}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="border-b border-white/10 p-5">
              <h3 className="font-semibold text-white">
                Measurement Event History
              </h3>

              <p className="mt-1 text-sm text-gray-400">
                Historical measurement records received from the API.
              </p>
            </div>

            {measurementEvents.length === 0 ? (
              <div className="p-8 text-center">
                <Activity className="mx-auto h-8 w-8 text-gray-600" />

                <p className="mt-3 text-sm text-gray-400">
                  No measurement events available.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Measurement history will appear here when events are received.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {measurementEvents.map((event: any, index: number) => {
                  const payload = event.payload ?? {};

                  return (
                    <div
                      key={event.id ?? `${event.type}-${index}`}
                      className="p-5 transition hover:bg-white/[0.02]"
                    >
                      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-cyan-500/10 p-2">
                            <Activity className="h-5 w-5 text-cyan-400" />
                          </div>

                          <div>
                            <p className="font-medium text-white">
                              {formatLabel(String(event.type ?? "Measurement"))}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatDate(
                                event.createdAt ??
                                  event.timestamp ??
                                  event.occurredAt
                              )}
                            </p>
                          </div>
                        </div>

                        <span className="w-fit rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-400">
                          Measurement
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(payload).map(([key, value]) => (
                          <div
                            key={key}
                            className="rounded-lg bg-black/20 p-3"
                          >
                            <p className="text-xs text-gray-500">
                              {formatLabel(key)}
                            </p>

                            <p className="mt-1 break-all text-sm font-medium text-gray-200">
                              {formatValue(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
