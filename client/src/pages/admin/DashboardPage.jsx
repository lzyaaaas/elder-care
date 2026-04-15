import { useEffect, useState } from "react";

import { apiRequest } from "../../api/http";
import { AlertList } from "../../components/admin/AlertList";
import { AnalyticsPanel } from "../../components/admin/AnalyticsPanel";
import { HorizontalBarList } from "../../components/admin/HorizontalBarList";
import { LineTrendChart } from "../../components/admin/LineTrendChart";
import { MetricStrip } from "../../components/admin/MetricStrip";
import { SummaryCard } from "../../components/admin/SummaryCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import { adminHighlights } from "../../data/site-content";
import { formatCurrency } from "../../utils/format";

const initialAnalytics = {
  summary: {
    totalDonors: 0,
    totalDonations: 0,
    totalDonationValue: 0,
    totalFeedback: 0,
    totalEvents: 0,
    openPayables: 0,
    totalInvoices: 0,
    outstandingPayablesAmount: 0,
    averageFeedbackRating: 0,
  },
  donationTrend: [],
  donorDemographics: {
    byGender: [],
    byLanguage: [],
    byCountry: [],
  },
  shippingStatus: [],
  feedbackSummary: {
    averageRating: 0,
    byRating: [],
    byStatus: [],
  },
  inventoryAlerts: [],
  eventSummary: {
    totalEvents: 0,
    activeEvents: 0,
    upcomingEvents: 0,
  },
  financeOverview: {
    totalInvoiceAmount: 0,
    outstandingPayablesAmount: 0,
    donationValue: 0,
    revenueVsCost: [],
    payableStatuses: [],
  },
};

export function DashboardPage() {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      try {
        const result = await apiRequest("/dashboard/analytics");
        if (isMounted) {
          setAnalytics(result.data);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  const { summary } = analytics;
  const trendData = analytics.donationTrend.map((item) => ({
    label: item.month,
    value: item.donationValue,
  }));

  return (
    <div className="space-y-8">
      <section className="rounded-[2.2rem] bg-ink-950 px-6 py-7 text-white shadow-panel sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-300">
              Analytics overview
            </p>
            <h2 className="mt-3 font-display text-4xl leading-tight">
              A cleaner campaign dashboard for presentation and operations.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/75">
              This screen now combines live backend totals with trend analysis, donor segmentation,
              fulfillment visibility, inventory risks, and finance signals.
            </p>
          </div>
          <StatusBadge tone={error ? "danger" : "success"}>
            {error ? "Needs attention" : isLoading ? "Loading data" : "Analytics ready"}
          </StatusBadge>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total donors"
          value={summary.totalDonors}
          helper="Current donor records available in the system."
        />
        <SummaryCard
          label="Donation records"
          value={summary.totalDonations}
          helper="Receivables currently tracked for the campaign."
        />
        <SummaryCard
          label="Donation value"
          value={formatCurrency(summary.totalDonationValue)}
          helper="Total pledged or received value across donations."
        />
        <SummaryCard
          label="Open payables"
          value={summary.openPayables}
          helper="Finance items still waiting for full settlement."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AnalyticsPanel
          eyebrow="Donation trends"
          title="Donation value over time"
          aside={<StatusBadge tone="neutral">{summary.totalDonations} total records</StatusBadge>}
        >
          <LineTrendChart data={trendData} />
        </AnalyticsPanel>

        <AnalyticsPanel eyebrow="Campaign quality" title="Feedback and event snapshot">
          <MetricStrip
            items={[
              { label: "Average feedback", value: `${summary.averageFeedbackRating} / 5` },
              { label: "Total feedback", value: summary.totalFeedback },
              { label: "Upcoming events", value: analytics.eventSummary.upcomingEvents },
            ]}
          />
          <div className="mt-6 space-y-4">
            {adminHighlights.map((item) => (
              <div key={item} className="rounded-2xl bg-cream-50 px-5 py-4 text-sm leading-7 text-ink-900/72">
                {item}
              </div>
            ))}
          </div>
          {error ? <p className="mt-6 text-sm font-medium text-terracotta-600">{error}</p> : null}
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <AnalyticsPanel eyebrow="Donor mix" title="Preferred language">
          <HorizontalBarList items={analytics.donorDemographics.byLanguage} accent="bg-pine-700" />
        </AnalyticsPanel>
        <AnalyticsPanel eyebrow="Donor mix" title="Gender distribution">
          <HorizontalBarList items={analytics.donorDemographics.byGender} accent="bg-terracotta-500" />
        </AnalyticsPanel>
        <AnalyticsPanel eyebrow="Fulfillment" title="Shipping status summary">
          <HorizontalBarList items={analytics.shippingStatus} accent="bg-gold-400" />
        </AnalyticsPanel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <AnalyticsPanel
          eyebrow="Inventory alerts"
          title="Low-stock items needing attention"
          aside={<StatusBadge tone={analytics.inventoryAlerts.length ? "warning" : "success"}>{analytics.inventoryAlerts.length} alerts</StatusBadge>}
        >
          <AlertList items={analytics.inventoryAlerts} />
        </AnalyticsPanel>

        <AnalyticsPanel eyebrow="Finance view" title="Revenue vs cost overview">
          <MetricStrip
            items={[
              { label: "Total invoices", value: summary.totalInvoices },
              { label: "Invoice cost", value: formatCurrency(analytics.financeOverview.totalInvoiceAmount) },
              {
                label: "Outstanding payables",
                value: formatCurrency(summary.outstandingPayablesAmount),
              },
            ]}
          />
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.5rem] bg-cream-50 p-5">
              <p className="text-sm font-semibold text-ink-950">Revenue vs cost</p>
              <div className="mt-5 space-y-4">
                {analytics.financeOverview.revenueVsCost.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-900/70">{item.label}</span>
                      <span className="font-semibold text-ink-950">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="mt-2 h-3 rounded-full bg-white">
                      <div
                        className="h-3 rounded-full bg-pine-700"
                        style={{
                          width: `${(item.value / Math.max(...analytics.financeOverview.revenueVsCost.map((entry) => entry.value), 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-cream-50 p-5">
              <p className="text-sm font-semibold text-ink-950">Payable status mix</p>
              <div className="mt-5">
                <HorizontalBarList items={analytics.financeOverview.payableStatuses} accent="bg-terracotta-500" />
              </div>
            </div>
          </div>
        </AnalyticsPanel>
      </section>
    </div>
  );
}
