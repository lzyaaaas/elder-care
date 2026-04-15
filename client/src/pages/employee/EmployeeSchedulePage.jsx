import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "../../api/http";
import { StatusBadge } from "../../components/common/StatusBadge";
import { formatDate } from "../../utils/format";

const filterOptions = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function badgeTone(status) {
  if (status === "CANCELLED") return "danger";
  if (status === "COMPLETED") return "neutral";
  return "warning";
}

export function EmployeeSchedulePage() {
  const [filter, setFilter] = useState("all");
  const [schedules, setSchedules] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadSchedule() {
      try {
        const result = await apiRequest(`/employee-portal/schedule?filter=${filter}`, {
          authMode: "employee",
        });
        if (!active) return;
        setSchedules(result.data);
        setSelectedId((currentId) =>
          result.data.some((item) => item.id === currentId) ? currentId : result.data[0]?.id || null,
        );
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
          setSchedules([]);
        }
      }
    }

    loadSchedule();
    return () => {
      active = false;
    };
  }, [filter]);

  const selectedSchedule = useMemo(
    () => schedules.find((item) => item.id === selectedId) || schedules[0] || null,
    [schedules, selectedId],
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/86 p-7 shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pine-800">
              My schedule
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-ink-950">Shift visibility, without the clutter.</h2>
            <p className="mt-4 text-base leading-8 text-ink-900/68">
              Review your assigned dates, see whether a shift belongs to an event, and keep track
              of what is upcoming or already completed.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === item.value
                    ? "bg-ink-950 text-white"
                    : "bg-cream-50 text-ink-900/70 hover:bg-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error ? <p className="mt-6 text-sm font-medium text-terracotta-600">{error}</p> : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/86 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">
            Shift list
          </p>

          <div className="mt-6 space-y-4">
            {schedules.length === 0 ? (
              <div className="rounded-[1.6rem] bg-cream-50 px-5 py-8 text-sm text-ink-900/60">
                No shifts match this filter yet.
              </div>
            ) : (
              schedules.map((shift) => (
                <button
                  key={shift.id}
                  type="button"
                  onClick={() => setSelectedId(shift.id)}
                  className={`block w-full rounded-[1.6rem] border px-5 py-4 text-left transition ${
                    selectedSchedule?.id === shift.id
                      ? "border-ink-950/18 bg-cream-50"
                      : "border-ink-950/8 bg-white hover:bg-cream-50"
                  }`}
                >
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto] lg:items-start">
                    <div>
                      <p className="text-lg font-semibold text-ink-950">
                        {shift.event?.eventName || "Campaign support shift"}
                      </p>
                      <p className="mt-2 text-sm text-ink-900/65">
                        {shift.event?.city || shift.event?.country || "General operations support"}
                      </p>
                    </div>
                    <div className="grid gap-2 text-sm text-ink-900/68 sm:grid-cols-2 lg:grid-cols-1">
                      <p>
                        <span className="font-medium text-ink-950">Date:</span> {formatDate(shift.shiftDate)}
                      </p>
                      <p>
                        <span className="font-medium text-ink-950">Time:</span> {shift.startTime} - {shift.endTime}
                      </p>
                    </div>
                    <StatusBadge tone={badgeTone(shift.status)}>{shift.status}</StatusBadge>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/86 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">
            Shift detail
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-ink-950">
            {selectedSchedule?.event?.eventName || "Select a shift"}
          </h3>

          {selectedSchedule ? (
            <div className="mt-6 space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Date", formatDate(selectedSchedule.shiftDate)],
                  ["Time", `${selectedSchedule.startTime} - ${selectedSchedule.endTime}`],
                  ["Status", selectedSchedule.status],
                  ["Event", selectedSchedule.event?.eventName || "No linked event"],
                  ["Location", selectedSchedule.event?.city || selectedSchedule.event?.country || "-"],
                  ["Type", selectedSchedule.event ? "Event-linked shift" : "General support shift"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[1.35rem] bg-cream-50 px-4 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-900/45">{label}</p>
                    <p className="mt-2 text-sm leading-7 text-ink-900/76">{value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.5rem] bg-cream-50 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-900/45">Notes</p>
                <p className="mt-3 text-sm leading-7 text-ink-900/72">
                  {selectedSchedule.notes || "No extra notes for this shift."}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[1.6rem] bg-cream-50 px-5 py-8 text-sm text-ink-900/60">
              Choose a shift from the list to view its details.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
