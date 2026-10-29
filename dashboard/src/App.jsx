
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import {
  Box,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  GitCommit,
  User,
  HardDrive,
  RefreshCw,
  Activity,
  ArrowUpRight,
} from "lucide-react";

import { fetchBuildHistory } from "./api";
import HistoryTable from "./components/HistoryTable";

const REPOSITORY_URL = "https://github.com/amber-vyom/Dock_Trace.git";

const COLORS = {
  page: "#F4F2EA",
  paper: "#FDFCF8",
  ink: "#292B25",
  muted: "#77776C",
  line: "#D8D4C9",
  olive: "#697C55",
  oliveLight: "#E7EBDD",
  orange: "#B75D40",
  orangeLight: "#F5E7DE",
  grid: "#E7E3D9",
};

const formatSize = (size) => {
  const value = Number(size);
  return Number.isFinite(value) ? value.toLocaleString("en-US") : "—";
};

export default function App() {
  const [builds, setBuilds] = useState([]);
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBuilds() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchBuildHistory();

        if (cancelled) return;

        const history = Array.isArray(data) ? data : [];
        setBuilds(history);

        if (history.length > 0) {
          const spikeBuild = history.find((build) => build.has_spike);
          setSelectedBuild(spikeBuild || history[history.length - 1]);
        } else {
          setSelectedBuild(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load build history."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBuilds();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectBuild = (build) => {
    setSelectedBuild(build);
  };

  const selectedIndex = builds.findIndex(
    (build) => build.commit_sha === selectedBuild?.commit_sha
  );

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center gap-3"
        style={{ backgroundColor: COLORS.page, color: COLORS.ink }}
      >
        <RefreshCw size={18} className="animate-spin" />
        <span className="text-sm">Loading build telemetry...</span>
      </div>
    );
  }

  if (error) {
    return (
      <main
        className="flex min-h-screen items-center justify-center p-6"
        style={{ backgroundColor: COLORS.page }}
      >
        <div className="max-w-lg border border-[#D8B7A8] bg-[#FDFCF8] p-6">
          <AlertTriangle className="mb-3 text-[#B75D40]" />
          <h1 className="text-lg font-semibold text-[#292B25]">
            Build history unavailable
          </h1>
          <p className="mt-2 text-sm text-[#77776C]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 border border-[#292B25] px-4 py-2 text-sm text-[#292B25] hover:bg-[#E7EBDD]"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  const hasBuilds = Boolean(selectedBuild);
  const currentSize = hasBuilds ? Number(selectedBuild.size_mb) : 0;

  const previousBuild =
    selectedIndex > 0 ? builds[selectedIndex - 1] : null;

  const sizeDelta =
    previousBuild && Number.isFinite(Number(previousBuild.size_mb))
      ? currentSize - Number(previousBuild.size_mb)
      : null;

  const chartData = builds.map((build, index) => ({
    ...build,
    chartLabel: build.timestamp || `Build ${index + 1}`,
  }));

  return (
    <div
      className="min-h-screen font-sans antialiased"
      style={{ backgroundColor: COLORS.page, color: COLORS.ink }}
    >
      {/* Navigation */}
      <nav
        className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 md:px-10"
        style={{ backgroundColor: COLORS.paper, borderColor: COLORS.line }}
      >
        <a
          href={REPOSITORY_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3"
        >
          <span
            className="flex h-10 w-10 items-center justify-center"
            style={{ backgroundColor: COLORS.ink, color: COLORS.paper }}
          >
            <Box size={21} strokeWidth={1.7} />
          </span>

          <span className="text-sm font-semibold tracking-tight">
            Docktrace
          </span>

          <span style={{ color: COLORS.line }}>/</span>

          <span
            className="font-mono text-xs"
            style={{ color: COLORS.muted }}
          >
            marshmallows/docktrace
          </span>
        </a>

        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs text-[#697C55]">
            <span className="h-2 w-2 rounded-full bg-[#697C55]" />
            Monitoring
          </span>
          <span
            className="font-mono text-xs"
            style={{ color: COLORS.muted }}
          >
            v1.0.0
          </span>
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-[1800px] flex-col gap-8 px-4 py-8 sm:px-6 md:px-10 md:py-10">
        {/* Page introduction */}
        <header className="flex flex-col justify-between gap-5 border-b pb-7 md:flex-row md:items-end" style={{ borderColor: COLORS.line }}>
          <div>
            <p
              className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em]"
              style={{ color: COLORS.olive }}
            >
              Container intelligence / Overview
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Image build monitor
            </h1>
            <p
              className="mt-3 max-w-xl text-sm leading-6"
              style={{ color: COLORS.muted }}
            >
              Track image growth across commits and identify changes
              that make container builds unexpectedly heavy.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: COLORS.muted }}>
            <Activity size={15} />
            <span>{builds.length} recorded builds</span>
          </div>
        </header>

        {/* Summary metrics: same row */}
        <section className="grid grid-cols-1 gap-0 border-y sm:grid-cols-3" style={{ borderColor: COLORS.line }}>
          <Metric
            label="Current image size"
            value={hasBuilds ? formatSize(selectedBuild.size_mb) : "—"}
            unit={hasBuilds ? "MB" : ""}
            icon={<HardDrive size={17} />}
            accent={selectedBuild?.has_spike ? COLORS.orange : COLORS.olive}
          />

          <Metric
            label="Active commit"
            value={selectedBuild?.commit_sha || "No commit"}
            icon={<GitCommit size={17} />}
            mono
            accent={COLORS.olive}
          />

          <Metric
            label="Build status"
            value={
              !hasBuilds
                ? "No data"
                : selectedBuild.has_spike
                ? "Size spike"
                : "Within range"
            }
            icon={
              selectedBuild?.has_spike ? (
                <AlertTriangle size={17} />
              ) : (
                <CheckCircle2 size={17} />
              )
            }
            accent={selectedBuild?.has_spike ? COLORS.orange : COLORS.olive}
            status
          />
        </section>

        {!hasBuilds ? (
          <div
            className="border p-10 text-center"
            style={{ backgroundColor: COLORS.paper, borderColor: COLORS.line }}
          >
            <HardDrive size={28} className="mx-auto mb-3" style={{ color: COLORS.olive }} />
            <h2 className="font-semibold">No build records found</h2>
            <p className="mt-2 text-sm" style={{ color: COLORS.muted }}>
              Once your API returns build history, the dashboard will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Full-width commit investigation */}
            <section
              className="border"
              style={{ backgroundColor: COLORS.paper, borderColor: COLORS.line }}
            >
              <div
                className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-5 md:px-8"
                style={{ borderColor: COLORS.line }}
              >
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: COLORS.olive }}
                  >
                    Selected record / Investigation
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    Commit details
                  </h2>
                </div>

                <span
                  className="font-mono text-xs"
                  style={{ color: COLORS.muted }}
                >
                  {selectedBuild.commit_sha}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Author and commit message */}
                <div className="space-y-7 border-b p-5 md:col-span-5 md:border-b-0 md:border-r md:p-8" style={{ borderColor: COLORS.line }}>
                  <DetailField label="Author">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E7EBDD] text-[#697C55]">
                        <User size={17} />
                      </span>
                      <span className="text-sm font-medium">
                        {selectedBuild.author || "Unknown"}
                      </span>
                    </div>
                  </DetailField>

                  <DetailField label="Commit message">
                    <p className="text-sm leading-6">
                      {selectedBuild.message || "No commit message provided."}
                    </p>
                  </DetailField>

                  <a
                    href={`${REPOSITORY_URL}/commit/${encodeURIComponent(selectedBuild.commit_sha)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 border-b border-[#697C55] pb-1 text-xs font-medium text-[#697C55] hover:text-[#45533A]"
                  >
                    Open commit in repository
                    <ArrowUpRight size={14} />
                  </a>
                </div>

                {/* Root cause analysis */}
                <div className="p-5 md:col-span-7 md:p-8">
                  <DetailField label="Root cause analysis">
                    <div
                      className="border-l-[3px] px-5 py-5"
                      style={{
                        borderColor: selectedBuild.has_spike
                          ? COLORS.orange
                          : COLORS.olive,
                        backgroundColor: selectedBuild.has_spike
                          ? COLORS.orangeLight
                          : "#F0F1E9",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {selectedBuild.has_spike ? (
                          <AlertTriangle
                            size={19}
                            className="mt-0.5 shrink-0 text-[#B75D40]"
                          />
                        ) : (
                          <CheckCircle2
                            size={19}
                            className="mt-0.5 shrink-0 text-[#697C55]"
                          />
                        )}

                        <div>
                          <h3 className="text-sm font-semibold">
                            {selectedBuild.has_spike
                              ? "Unusual image growth detected"
                              : "No size spike detected"}
                          </h3>

                          <p
                            className="mt-2 text-sm leading-6"
                            style={{ color: COLORS.muted }}
                          >
                            {selectedBuild.diff_summary ||
                              "No root-cause summary is available for this commit."}
                          </p>

                          {sizeDelta !== null && (
                            <p className="mt-4 font-mono text-xs">
                              Change from preceding record:{" "}
                              <span
                                style={{
                                  color:
                                    sizeDelta > 0
                                      ? COLORS.orange
                                      : COLORS.olive,
                                }}
                              >
                                {sizeDelta > 0 ? "+" : ""}
                                {formatSize(sizeDelta)} MB
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </DetailField>

                  <div className="mt-6 flex flex-wrap items-center gap-3 text-xs" style={{ color: COLORS.muted }}>
                    <span>Image size</span>
                    <span className="font-mono text-lg font-semibold" style={{ color: COLORS.ink }}>
                      {formatSize(selectedBuild.size_mb)} MB
                    </span>
                    {selectedBuild.has_spike && (
                      <span className="border border-[#D8B7A8] px-2 py-1 text-[#B75D40]">
                        Requires review
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Full-width graph */}
            <section
              className="border"
              style={{ backgroundColor: COLORS.paper, borderColor: COLORS.line }}
            >
              <div
                className="flex flex-col justify-between gap-4 border-b px-5 py-5 sm:flex-row sm:items-end md:px-8"
                style={{ borderColor: COLORS.line }}
              >
                <div>
                  <p
                    className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: COLORS.olive }}
                  >
                    Historical telemetry
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    Image size over time
                  </h2>
                  <p className="mt-2 text-sm" style={{ color: COLORS.muted }}>
                    Select a point to inspect the corresponding commit.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs" style={{ color: COLORS.muted }}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#697C55]" />
                    Normal
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#B75D40]" />
                    Spike
                  </span>
                  <span className="font-mono">MB</span>
                </div>
              </div>

              <div className="h-[340px] w-full px-3 py-6 sm:h-[430px] sm:px-6 md:px-8">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 12, right: 20, left: 0, bottom: 8 }}
                    onClick={(event) => {
                      const payload = event?.activePayload?.[0]?.payload;
                      if (payload) selectBuild(payload);
                    }}
                  >
                    <CartesianGrid
                      stroke={COLORS.grid}
                      strokeDasharray="2 5"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="chartLabel"
                      tick={{ fill: COLORS.muted, fontSize: 11 }}
                      axisLine={{ stroke: COLORS.line }}
                      tickLine={false}
                      tickMargin={12}
                    />

                    <YAxis
                      width={58}
                      tick={{ fill: COLORS.muted, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) =>
                        Number(value).toLocaleString("en-US")
                      }
                    />

                    <Tooltip
                      cursor={{
                        stroke: "#B9B5A8",
                        strokeDasharray: "3 4",
                      }}
                      contentStyle={{
                        backgroundColor: COLORS.paper,
                        border: `1px solid ${COLORS.line}`,
                        borderRadius: "2px",
                        boxShadow: "0 4px 14px rgba(41,43,37,0.08)",
                        fontSize: "12px",
                      }}
                      labelStyle={{
                        color: COLORS.muted,
                        marginBottom: "6px",
                      }}
                      formatter={(value) => [`${formatSize(value)} MB`, "Image size"]}
                    />

                    <Line
                      type="monotone"
                      dataKey="size_mb"
                      name="Image size"
                      stroke={COLORS.olive}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      activeDot={{
                        r: 7,
                        fill: COLORS.orange,
                        stroke: COLORS.paper,
                        strokeWidth: 2,
                        cursor: "pointer",
                        onClick: (_, payload) => {
                          if (payload?.payload) {
                            selectBuild(payload.payload);
                          }
                        },
                      }}
                      dot={(props) => {
                        const { cx, cy, payload, index } = props;
                        if (
                          !Number.isFinite(cx) ||
                          !Number.isFinite(cy)
                        ) {
                          return null;
                        }

                        const isSelected =
                          payload.commit_sha === selectedBuild.commit_sha;

                        return (
                          <circle
                            key={payload.commit_sha || index}
                            cx={cx}
                            cy={cy}
                            r={isSelected ? 6 : 3.5}
                            fill={
                              payload.has_spike
                                ? COLORS.orange
                                : COLORS.olive
                            }
                            stroke={COLORS.paper}
                            strokeWidth={isSelected ? 2 : 1}
                            style={{ cursor: "pointer" }}
                          />
                        );
                      }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div
                className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-4 text-xs md:px-8"
                style={{ borderColor: COLORS.line, color: COLORS.muted }}
              >
                <span>
                  {selectedBuild.commit_sha} is currently selected
                </span>
                <span className="font-mono">
                  {builds.length} DATA POINTS
                </span>
              </div>
            </section>

            {/* Build history — last section */}
            <HistoryTable
              builds={builds}
              selectedBuild={selectedBuild}
              onSelectBuild={selectBuild}
            />
          </>
        )}

        <footer
          className="flex flex-wrap items-center justify-between gap-3 border-t py-5 text-xs"
          style={{ borderColor: COLORS.line, color: COLORS.muted }}
        >
          <span>Docktrace / Container image observability</span>

          <a
            href={REPOSITORY_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 hover:text-[#697C55]"
          >
            View repository <ExternalLink size={13} />
          </a>
        </footer>
      </main>
    </div>
  );
}

function Metric({ label, value, unit, icon, accent, mono, status }) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-5 border-b px-5 py-6 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 md:px-7 md:py-7" style={{ borderColor: COLORS.line }}>
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.17em]"
          style={{ color: COLORS.muted }}
        >
          {label}
        </span>
        <span style={{ color: accent }}>{icon}</span>
      </div>

      <div className="flex min-w-0 flex-wrap items-baseline gap-2">
        <span
          className={`break-all text-2xl font-semibold tracking-tight sm:text-3xl ${
            mono ? "font-mono text-xl sm:text-2xl" : ""
          }`}
          style={{ color: accent }}
        >
          {value}
        </span>

        {unit && (
          <span className="text-xs" style={{ color: COLORS.muted }}>
            {unit}
          </span>
        )}
      </div>

      {status && (
        <p className="text-xs" style={{ color: COLORS.muted }}>
          Build image assessment
        </p>
      )}
    </div>
  );
}

function DetailField({ label, children }) {
  return (
    <div>
      <p
        className="mb-3 text-[10px] font-semibold uppercase tracking-[0.17em]"
        style={{ color: COLORS.muted }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}
