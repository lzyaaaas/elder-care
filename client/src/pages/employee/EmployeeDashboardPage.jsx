import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { apiRequest } from "../../api/http";
import { Button } from "../../components/common/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { formatDate } from "../../utils/format";

export function EmployeeDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const result = await apiRequest("/employee-portal/dashboard", { authMode: "employee" });
        if (!active) return;
        setDashboard(result.data);
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    }

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const employee = dashboard?.employee;
  const schedules = dashboard?.upcomingSchedules || [];
  const taskSummary = dashboard?.taskSummary;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/70 bg-white/86 p-7 shadow-soft">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pine-800">
              My dashboard
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-ink-950">
              {employee?.name ? `Hello, ${employee.name}.` : "Loading your workspace..."}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-ink-900/68">
              See your next shifts, confirm what event support is coming up, and keep your personal
              details ready for the campaign team.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button as={Link} to="/employee/profile" variant="secondary">
              Edit profile
            </Button>
            <Button as={Link} to="/employee/schedule" variant="accent">
              View schedule
            </Button>
          </div>
        </div>

        {error ? <p className="mt-6 text-sm font-medium text-terracotta-600">{error}</p> : null}

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { label: "Upcoming shifts", value: employee?._count?.schedules ?? "-" },
            { label: "Assigned events", value: taskSummary?.upcomingEventsCount ?? employee?._count?.events ?? "-" },
            { label: "Owned donations", value: employee?._count?.donations ?? "-" },
            { label: "Shipping or follow-ups", value: `${taskSummary?.shippingTasksCount ?? 0} / ${taskSummary?.followUpsCount ?? 0}` },
          ].map((item) => (
            <div key={item.label} className="rounded-[1.5rem] bg-cream-50 px-5 py-4">
              <p className="text-sm text-ink-900/52">{item.label}</p>
              <p className="mt-3 text-lg font-semibold text-ink-950">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <div className="rounded-[2rem] border border-white/70 bg-white/86 p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">
                Upcoming schedule
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-ink-950">
                Your next confirmed shifts
              </h3>
            </div>
            <Button as={Link} to="/employee/schedule" variant="ghost">
              See all
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            {schedules.length === 0 ? (
              <div className="rounded-[1.6rem] bg-cream-50 px-5 py-8 text-sm text-ink-900/60">
                No shifts are scheduled yet. When the operations team assigns a shift, it will
                appear here.
              </div>
            ) : (
              schedules.map((shift) => (
                <div
                  key={shift.id}
                  className="rounded-[1.6rem] border border-ink-950/8 bg-cream-50 px-5 py-4"
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
                    <StatusBadge tone={shift.status === "CANCELLED" ? "danger" : shift.status === "COMPLETED" ? "neutral" : "warning"}>
                      {shift.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-3 text-sm text-ink-900/70">
                    {shift.notes || "No extra notes yet for this shift."}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white/86 p-6 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">
            At a glance
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-ink-950">Your current team profile</h3>

          <div className="mt-6 space-y-3 text-sm text-ink-900/70">
            <p>Email: {employee?.email || "-"}</p>
            <p>Role: {employee?.role || "-"}</p>
            <p>Position: {employee?.position || "-"}</p>
            <p>Contact: {employee?.contact || "-"}</p>
          </div>

          <div className="mt-8 rounded-[1.6rem] bg-cream-50 px-5 py-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-900/45">
              Today’s reminder
            </p>
            <p className="mt-3 text-base leading-7 text-ink-900/72">
              Keep your contact details current so event and operations updates reach you without
              delay.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button as={Link} to="/employee/events" variant="secondary" className="w-full">
              My events
            </Button>
            <Button as={Link} to="/employee/donations" variant="secondary" className="w-full">
              Donation tasks
            </Button>
            <Button as={Link} to="/employee/shipping" variant="secondary" className="w-full">
              Shipping tasks
            </Button>
            <Button as={Link} to="/employee/follow-ups" variant="secondary" className="w-full">
              Follow-ups
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
