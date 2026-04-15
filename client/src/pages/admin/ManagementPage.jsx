import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";

import { apiRequest } from "../../api/http";
import { AdvancedFilterPanel } from "../../components/admin/AdvancedFilterPanel";
import { HorizontalBarList } from "../../components/admin/HorizontalBarList";
import { LineTrendChart } from "../../components/admin/LineTrendChart";
import { Button } from "../../components/common/Button";
import { StatusBadge } from "../../components/common/StatusBadge";
import { getAdminModuleConfig } from "../../data/admin-module-data";
import { formatCurrency, formatDate } from "../../utils/format";

function toneFromStatus(status = "") {
  const normalized = status.toLowerCase();

  if (
    ["active", "healthy", "delivered", "issued", "posted", "registered", "in stock", "available", "responded"].includes(
      normalized,
    )
  ) {
    return "success";
  }

  if (
    ["low stock", "scheduled", "open", "partially paid", "shipped", "reviewed", "new", "pending", "preparing"].includes(
      normalized,
    )
  ) {
    return "warning";
  }

  if (["cancelled", "overdue", "void", "lost", "returned"].includes(normalized)) {
    return "danger";
  }

  return "neutral";
}

function displayValue(value, format) {
  if (format === "currency") {
    return formatCurrency(value);
  }

  if (format === "date") {
    return formatDate(value);
  }

  return value ?? "-";
}

function renderDetailValue(value) {
  if (Array.isArray(value)) {
    return (
      <div className="space-y-2">
        {value.map((entry, index) => (
          <p key={`${entry}-${index}`} className="text-sm leading-7 text-ink-900/72">
            {String(entry)}
          </p>
        ))}
      </div>
    );
  }

  return <p className="mt-2 text-sm leading-7 text-ink-900/72">{String(value)}</p>;
}

function buildOverview(rows, config) {
  const statusKey = config.statusKey;
  const total = rows.length;
  const statuses = rows.reduce((accumulator, row) => {
    const key = row[statusKey] || "Unknown";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
  const topStatusEntry = Object.entries(statuses).sort((left, right) => right[1] - left[1])[0];

  return [
    { label: "Total records", value: total },
    { label: "Primary status", value: topStatusEntry ? `${topStatusEntry[0]} (${topStatusEntry[1]})` : "None" },
    { label: "Searchable fields", value: config.searchKeys.length },
  ];
}

function getGridTemplate(columns) {
  return columns.map((column) => column.width || "minmax(110px, 1fr)").join(" ");
}

function createFilterRow() {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    attribute: "",
    operator: "",
    value: "",
    valueTo: "",
  };
}

function isFilterReady(filter) {
  if (!filter.attribute || !filter.operator) {
    return false;
  }

  if (filter.operator === "between") {
    return filter.value !== "" && filter.valueTo !== "";
  }

  return filter.value !== "";
}

function buildFormValues(config, raw = {}) {
  return (config.formFields || []).reduce((accumulator, field) => {
    accumulator[field.key] = raw[field.key] ?? "";
    return accumulator;
  }, {});
}

function normalizePayload(formValues, fields) {
  return fields.reduce((accumulator, field) => {
    const value = formValues[field.key];

    if (field.type === "boolean") {
      if (value === "" || value === null || value === undefined) {
        if (field.required) {
          accumulator[field.key] = false;
        }
        return accumulator;
      }

      accumulator[field.key] = value === true || value === "true";
      return accumulator;
    }

    if (field.type === "number") {
      if (value === "" || value === null || value === undefined) {
        if (field.required) {
          accumulator[field.key] = 0;
        } else {
          return accumulator;
        }
      } else {
        accumulator[field.key] = Number(value);
      }
      return accumulator;
    }

    if (field.type === "date") {
      if (!value) {
        if (field.required) {
          accumulator[field.key] = null;
        }
        return accumulator;
      }

      accumulator[field.key] = value;
      return accumulator;
    }

    if (field.type === "textarea" || field.type === "text" || field.type === "select") {
      if (value === "") {
        if (field.required) {
          accumulator[field.key] = "";
        }
        return accumulator;
      }

      accumulator[field.key] = value;
      return accumulator;
    }

    accumulator[field.key] = value;
    return accumulator;
  }, {});
}

function FieldInput({ field, value, onChange }) {
  if (field.type === "textarea") {
    return (
      <textarea
        rows="4"
        value={value}
        onChange={(event) => onChange(field.key, event.target.value)}
        className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        value={value}
        onChange={(event) => onChange(field.key, event.target.value)}
        className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
      >
        <option value="">Select</option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "boolean") {
    return (
      <select
        value={String(value)}
        onChange={(event) => onChange(field.key, event.target.value)}
        className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
      >
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    );
  }

  return (
    <input
      type={field.type}
      value={value}
      min={field.min}
      max={field.max}
      step={field.step}
      onChange={(event) => onChange(field.key, event.target.value)}
      className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
    />
  );
}

export function ManagementPage() {
  const { moduleKey } = useParams();
  const config = useMemo(() => getAdminModuleConfig(moduleKey), [moduleKey]);
  const [rows, setRows] = useState(config?.scaffoldRows || []);
  const [isLoading, setIsLoading] = useState(Boolean(config?.live));
  const [error, setError] = useState("");
  const [analyticsMetadata, setAnalyticsMetadata] = useState([]);
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [analyticsCharts, setAnalyticsCharts] = useState([]);
  const [advancedFilters, setAdvancedFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedId, setSelectedId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formValues, setFormValues] = useState({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const analyticsEnabled = Boolean(config?.analytics?.enabled && config?.live);
  const activeAdvancedFilters = useMemo(
    () => advancedFilters.filter(isFilterReady),
    [advancedFilters],
  );
  const serializedAnalyticsFilters = JSON.stringify(activeAdvancedFilters);

  async function loadRows(activeConfig = config, filterSet = activeAdvancedFilters) {
    if (!activeConfig) {
      return;
    }

    if (!activeConfig.live) {
      setRows(activeConfig.scaffoldRows || []);
      setSelectedId(activeConfig.scaffoldRows?.[0]?.id || null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = analyticsEnabled
        ? await apiRequest(`/admin-analytics/${moduleKey}/query`, {
            method: "POST",
            body: JSON.stringify({ filters: filterSet }),
          })
        : await apiRequest(activeConfig.live.endpoint);
      const mappedRows = activeConfig.live.mapData(result.data);
      setRows(mappedRows);
      setAnalyticsSummary(result.data.summary || null);
      setAnalyticsCharts(result.data.charts || []);
      setSelectedId((currentSelectedId) => currentSelectedId || mappedRows[0]?.id || null);
    } catch (requestError) {
      setError(requestError.message);
      setRows(activeConfig.emptyRows || []);
      setAnalyticsSummary(null);
      setAnalyticsCharts([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!config) {
      return;
    }

    setSearch("");
    setStatusFilter("All");
    setIsFormOpen(false);
    setFormError("");
    setAdvancedFilters([]);
    setAnalyticsSummary(null);
    setAnalyticsCharts([]);

    async function bootstrapAdminModule() {
      if (config.analytics?.enabled) {
        try {
          const result = await apiRequest(`/admin-analytics/${moduleKey}/metadata`);
          setAnalyticsMetadata(result.data.attributes || []);
        } catch (requestError) {
          setAnalyticsMetadata([]);
          setError(requestError.message);
        }
      } else {
        setAnalyticsMetadata([]);
      }

      loadRows(config, []);
    }

    bootstrapAdminModule();
  }, [config]);

  useEffect(() => {
    if (!config || !analyticsEnabled) {
      return;
    }

    loadRows(config, activeAdvancedFilters);
  }, [config, analyticsEnabled, serializedAnalyticsFilters]);

  if (!config) {
    return <Navigate to="/admin" replace />;
  }

  const availableStatuses = ["All", ...new Set(rows.map((row) => row[config.statusKey]).filter(Boolean))];
  const normalizedSearch = deferredSearch.trim().toLowerCase();
  const canMutate = Boolean(config.live?.createEndpoint && config.formFields?.length);
  const tableGridTemplate = getGridTemplate(config.columns);

  const filteredRows = rows.filter((row) => {
    const matchesStatus = statusFilter === "All" || row[config.statusKey] === statusFilter;
    const matchesSearch =
      !normalizedSearch ||
      config.searchKeys.some((key) => String(row[key] || "").toLowerCase().includes(normalizedSearch));

    return matchesStatus && matchesSearch;
  });

  const selectedRow = filteredRows.find((row) => row.id === selectedId) || filteredRows[0] || null;
  const overview = buildOverview(filteredRows, config);
  const summaryCards = analyticsSummary
    ? [
        { label: "Filtered total", value: analyticsSummary.filteredTotal },
        { label: "Source total", value: analyticsSummary.sourceTotal },
        { label: "Active conditions", value: analyticsSummary.activeFilters },
        { label: "Available attributes", value: analyticsSummary.availableAttributes },
      ]
    : [];

  function handleFieldChange(key, value) {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openCreateForm() {
    setFormMode("create");
    setFormValues(buildFormValues(config));
    setFormError("");
    setIsFormOpen(true);
  }

  function openEditForm() {
    if (!selectedRow) {
      return;
    }

    setFormMode("edit");
    setFormValues(buildFormValues(config, selectedRow.raw || {}));
    setFormError("");
    setIsFormOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!config.formFields || !config.live) {
      return;
    }

    setIsSubmitting(true);
    setFormError("");

    try {
      const payload = normalizePayload(formValues, config.formFields);
      const endpoint =
        formMode === "create" ? config.live.createEndpoint : config.live.updateEndpoint(selectedRow.id);
      const method = formMode === "create" ? "POST" : "PATCH";

      await apiRequest(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      setIsFormOpen(false);
      await loadRows(config);
    } catch (requestError) {
      setFormError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedRow || !config.live?.deleteEndpoint) {
      return;
    }

    const confirmed = window.confirm(`Delete ${selectedRow.code || selectedRow.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(config.live.deleteEndpoint(selectedRow.id), {
        method: "DELETE",
      });
      setSelectedId(null);
      await loadRows(config);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function addAdvancedFilter() {
    setAdvancedFilters((current) => [...current, createFilterRow()]);
  }

  function removeAdvancedFilter(id) {
    setAdvancedFilters((current) => current.filter((item) => item.id !== id));
  }

  function updateAdvancedFilter(id, field, value) {
    setAdvancedFilters((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (field === "attribute") {
          const attribute = analyticsMetadata.find((entry) => entry.key === value);
          return {
            ...item,
            attribute: value,
            operator: attribute?.operators?.[0] || "",
            value: "",
            valueTo: "",
          };
        }

        if (field === "operator") {
          return {
            ...item,
            operator: value,
            value: "",
            valueTo: "",
          };
        }

        return {
          ...item,
          [field]: value,
        };
      }),
    );
  }

  function clearAdvancedFilters() {
    setAdvancedFilters([]);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white/85 p-7 shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pine-800">{config.eyebrow}</p>
            <h2 className="mt-3 text-4xl font-semibold text-ink-950">{config.title}</h2>
            <p className="mt-4 text-base leading-8 text-ink-900/68">{config.description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => loadRows(config)}>
              Refresh data
            </Button>
            {canMutate ? (
              <Button variant="accent" onClick={openCreateForm}>
                New record
              </Button>
            ) : null}
            <StatusBadge tone={config.live ? "success" : "neutral"}>
              {config.live ? "API-connected" : "UI scaffold"}
            </StatusBadge>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {overview.map((item) => (
            <div key={item.label} className="rounded-[1.5rem] bg-cream-50 px-5 py-4">
              <p className="text-sm text-ink-900/52">{item.label}</p>
              <p className="mt-3 text-lg font-semibold text-ink-950">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      {analyticsEnabled ? (
        <>
          <AdvancedFilterPanel
            attributes={analyticsMetadata}
            filters={advancedFilters}
            onAddFilter={addAdvancedFilter}
            onRemoveFilter={removeAdvancedFilter}
            onUpdateFilter={updateAdvancedFilter}
            onClearFilters={clearAdvancedFilters}
          />

          <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">Result summary</p>
              <h3 className="mt-3 text-2xl font-semibold text-ink-950">Filtered record snapshot</h3>
              <p className="mt-3 text-sm leading-7 text-ink-900/62">
                These totals update from the same active conditions used by the table and charts, so the count view
                and the list stay in sync.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {summaryCards.map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border border-cream-200/70 bg-cream-50 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-900/42">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-ink-950">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">Charts</p>
              <h3 className="mt-3 text-2xl font-semibold text-ink-950">Attribute groupings and trends</h3>
              <p className="mt-3 text-sm leading-7 text-ink-900/62">
                Use these visual summaries to explain distribution, volume, and momentum without leaving the current
                management page.
              </p>
              {analyticsCharts.length ? (
                <div className="mt-5 grid gap-5">
                  {analyticsCharts.map((chart) => (
                    <div key={chart.key} className="rounded-[1.5rem] border border-cream-200/65 bg-cream-50/80 p-5">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pine-800/78">
                            Chart view
                          </p>
                          <h3 className="mt-2 text-lg font-semibold text-ink-950">{chart.title}</h3>
                        </div>
                        <StatusBadge tone="neutral">
                          {chart.kind === "line" ? "Trend" : "Distribution"}
                        </StatusBadge>
                      </div>
                      <div className="mt-4">
                        {chart.kind === "line" ? (
                          <LineTrendChart data={chart.data} />
                        ) : (
                          <HorizontalBarList items={chart.data} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] bg-cream-50 px-5 py-9 text-sm text-ink-900/55">
                  No chart data available for the current filter combination.
                </div>
              )}
            </div>
          </section>
        </>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-4 sm:flex-row">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={`Search ${config.title.toLowerCase()}`}
                className="w-full rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-ink-950/10 bg-cream-50 px-4 py-3 outline-none transition focus:border-pine-700"
              >
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <StatusBadge tone={error ? "danger" : "neutral"}>
              {error ? "Load issue" : `${filteredRows.length} visible`}
            </StatusBadge>
          </div>

          <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-ink-950/8">
            <div
              className="grid bg-cream-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-900/48"
              style={{ gridTemplateColumns: tableGridTemplate }}
            >
              {config.columns.map((column) => (
                <span key={column.key} className="pr-4">
                  {column.label}
                </span>
              ))}
            </div>

            {isLoading ? (
              <div className="px-5 py-10 text-sm text-ink-900/55">Loading records...</div>
            ) : filteredRows.length === 0 ? (
              <div className="px-5 py-10 text-sm text-ink-900/55">
                No records match the current search and filter.
              </div>
            ) : (
              filteredRows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                  className={`grid items-center border-t border-ink-950/8 px-5 py-4 text-left text-sm transition hover:bg-cream-50 ${
                    selectedRow?.id === row.id ? "bg-cream-50/85" : "bg-white"
                  }`}
                  style={{ gridTemplateColumns: tableGridTemplate }}
                >
                  {config.columns.map((column) => {
                    const value = row[column.key];

                    return (
                      <span key={column.key} className="truncate pr-4 text-ink-900/72">
                        {column.isStatus ? (
                          <StatusBadge tone={toneFromStatus(value)}>{value}</StatusBadge>
                        ) : (
                          displayValue(value, column.format)
                        )}
                      </span>
                    );
                  })}
                </button>
              ))
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">Record detail</p>
                <h3 className="mt-3 text-2xl font-semibold text-ink-950">
                  {selectedRow?.code || selectedRow?.name || "No selection"}
                </h3>
              </div>
              {selectedRow?.[config.statusKey] ? (
                <StatusBadge tone={toneFromStatus(selectedRow[config.statusKey])}>
                  {selectedRow[config.statusKey]}
                </StatusBadge>
              ) : null}
            </div>

            {selectedRow ? (
              <div className="mt-6 space-y-3">
                {Object.entries(selectedRow.detail || {}).map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-cream-50 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-900/45">{label}</p>
                    {renderDetailValue(value)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl bg-cream-50 px-5 py-8 text-sm text-ink-900/55">
                Select a row to review its operational details.
              </div>
            )}

            {canMutate && selectedRow ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="secondary" onClick={openEditForm}>
                  Edit selected
                </Button>
                <Button variant="ghost" onClick={handleDelete}>
                  Delete selected
                </Button>
              </div>
            ) : null}
          </div>

          {canMutate ? (
            <div className="rounded-[2rem] border border-white/60 bg-white/85 p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pine-800">
                    {formMode === "create" ? "Create record" : "Edit record"}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-ink-950">
                    {isFormOpen ? "CRUD form" : "Form closed"}
                  </h3>
                </div>
                <StatusBadge tone="success">Live CRUD</StatusBadge>
              </div>

              {isFormOpen ? (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  {config.formFields.map((field) => (
                    <label key={field.key} className="block">
                      <span className="mb-2 block text-sm font-semibold text-ink-900">{field.label}</span>
                      <FieldInput
                        field={field}
                        value={formValues[field.key] ?? ""}
                        onChange={handleFieldChange}
                      />
                    </label>
                  ))}

                  {formError ? <p className="text-sm font-medium text-terracotta-600">{formError}</p> : null}

                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button type="submit" variant="accent" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : formMode === "create" ? "Create" : "Save changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsFormOpen(false);
                        setFormError("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="mt-6 rounded-2xl bg-cream-50 px-5 py-8 text-sm text-ink-900/55">
                  Open a create or edit action to manage records from this module.
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[2rem] bg-ink-950 px-5 py-5 text-white">
              <p className="text-xs uppercase tracking-[0.22em] text-gold-300">Module note</p>
              <p className="mt-3 text-sm leading-7 text-white/76">
                This module is presentation-ready in the admin UI and prepared to be connected to dedicated backend CRUD endpoints in the next pass.
              </p>
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}
