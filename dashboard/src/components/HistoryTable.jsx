
import React from "react";
import {
  GitCommit,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

export default function HistoryTable({
  builds = [],
  selectedBuild,
  onSelectBuild,
}) {
  const formatSize = (size) => {
    const value = Number(size);
    return Number.isFinite(value) ? value.toLocaleString("en-US") : "—";
  };

  return (
    <section className="overflow-hidden border border-[#D8D4C9] bg-[#FDFCF8]">
      {/* Section heading */}
      <div className="flex flex-col gap-4 border-b border-[#D8D4C9] px-5 py-6 sm:flex-row sm:items-end sm:justify-between md:px-8">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#697C55]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#697C55]">
              Repository / Audit trail
            </span>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-[#292B25]">
            Detailed build logs
          </h2>

          <p className="mt-2 text-sm text-[#77776C]">
            Select a record to inspect its image-size breakdown.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-[#77776C]">
          <span className="border border-[#D8D4C9] px-3 py-2 font-mono">
            {String(builds.length).padStart(2, "0")} RECORDS
          </span>
          <span className="hidden sm:block">Newest data from build history</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="bg-[#34372F] text-[#F5F2E9]">
              <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] md:px-8">
                Commit
              </th>
              <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em]">
                Author
              </th>
              <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em]">
                Image size
              </th>
              <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em]">
                Status
              </th>
              <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-[0.14em] md:px-8">
                Inspect
              </th>
            </tr>
          </thead>

          <tbody>
            {builds.map((build, index) => {
              const isSelected =
                selectedBuild?.commit_sha === build.commit_sha;

              return (
                <tr
                  key={build.commit_sha || index}
                  onClick={() => onSelectBuild?.(build)}
                  onKeyDown={(event) => {
                    if (
                      onSelectBuild &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      onSelectBuild(build);
                    }
                  }}
                  tabIndex={onSelectBuild ? 0 : undefined}
                  aria-selected={isSelected}
                  className={`
                    border-b border-[#E7E3D9]
                    transition-colors duration-150
                    ${
                      isSelected
                        ? "bg-[#E7EBDD] shadow-[inset_4px_0_0_#697C55]"
                        : "bg-[#FDFCF8] hover:bg-[#F1EFE6]"
                    }
                    ${onSelectBuild ? "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#697C55]" : ""}
                  `}
                >
                  <td className="px-5 py-5 md:px-8">
                    <div className="flex items-center gap-3">
                      <GitCommit
                        size={16}
                        strokeWidth={1.7}
                        className={
                          isSelected ? "text-[#697C55]" : "text-[#929184]"
                        }
                      />

                      <div>
                        <span className="font-mono text-sm text-[#292B25]">
                          {build.commit_sha || "Unknown"}
                        </span>

                        {isSelected && (
                          <span className="ml-2 text-[9px] font-semibold uppercase tracking-wider text-[#697C55]">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-5 text-sm text-[#55564D]">
                    {build.author || "Unknown"}
                  </td>

                  <td className="px-5 py-5">
                    <span
                      className={`font-mono text-sm ${
                        build.has_spike
                          ? "text-[#B75D40]"
                          : "text-[#697C55]"
                      }`}
                    >
                      {formatSize(build.size_mb)}
                    </span>
                    <span className="ml-1 text-[10px] text-[#929184]">
                      MB
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    {build.has_spike ? (
                      <span className="inline-flex items-center gap-2 text-xs font-medium text-[#B75D40]">
                        <AlertTriangle size={15} />
                        Bloat detected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 text-xs font-medium text-[#697C55]">
                        <CheckCircle2 size={15} />
                        Stable
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-5 text-right md:px-8">
                    <span
                      className={`inline-flex items-center justify-center ${
                        isSelected
                          ? "text-[#697C55]"
                          : "text-[#A5A195]"
                      }`}
                    >
                      <ArrowUpRight size={17} />
                    </span>
                  </td>
                </tr>
              );
            })}

            {builds.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-16 text-center text-sm text-[#77776C]"
                >
                  No build records are available yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D8D4C9] bg-[#F4F1E8] px-5 py-4 md:px-8">
        <p className="text-xs text-[#77776C]">
          Container image history
        </p>
        <p className="font-mono text-[10px] tracking-wider text-[#929184]">
          DOCKTRACE / BUILD AUDIT
        </p>
      </div>
    </section>
  );
}
