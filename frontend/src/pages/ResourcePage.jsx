import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, RefreshCw, Leaf, CircleAlert, Eye, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { resourceApi } from "../app/redux/api/resources";
import { resourceDefinitions } from "../app/resources";
import { useRole } from "../app/hooks/useRole";
import { useToast } from "../components/Toast";
import ResourceForm from "../components/ResourceForm";
import ConfirmModal from "../components/ConfirmModal";

const resolveValue = (row, path) => path.split(".").reduce((value, part) => value?.[part], row);
const humanize = (value) => value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
const formatValue = (column, value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (["amount", "dailyWage", "cost"].includes(column)) {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(Number(value));
  }
  if (column === "timestamp") return new Date(value).toLocaleString();
  if (column === "healthScore") return `${value}%`;
  return String(value);
};

function StatusBadge({ value }) {
  const normalized = String(value || "").toLowerCase().replace(/\s+/g, "-");
  return <span className={`status-badge status-${normalized}`}><span />{value}</span>;
}

function RecordDetails({ definition, record, onClose }) {
  const fields = definition.fields || definition.columns.map((name) => ({ name: name.split(".").pop(), label: humanize(name.split(".").pop()) }));
  const valueFor = (field) => {
    const relation = field.name === "cropId" ? record.Crop?.name : field.name === "workerId" ? record.Worker?.fullName : field.name === "equipmentId" ? record.Equipment?.name : undefined;
    const value = relation || record[field.name];
    return field.name === "status" || field.name === "action" ? <StatusBadge value={value} /> : formatValue(field.name, value);
  };
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="modal details-modal" role="dialog" aria-modal="true" aria-labelledby="details-title">
        <header className="modal-header"><div><p className="eyebrow">RECORD DETAILS</p><h2 id="details-title">{record.name || record.fullName || record.title || definition.singular}</h2></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button></header>
        <dl className="details-grid">{fields.map((field) => <div key={field.name}><dt>{field.label}</dt><dd>{valueFor(field)}</dd></div>)}</dl>
        <div className="modal-actions"><button className="button button-secondary" onClick={onClose}>Close</button></div>
      </section>
    </div>
  );
}

export default function ResourcePage({ resource }) {
  const definition = resourceDefinitions[resource];
  const { isAdmin } = useRole();
  const notify = useToast();
  const [searchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [lookups, setLookups] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filterValue, setFilterValue] = useState("all");
  const [editor, setEditor] = useState(null);
  const [viewingRow, setViewingRow] = useState(null);
  const [deletingRow, setDeletingRow] = useState(null);

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(await resourceApi.list(resource));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not load records. Check the API connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [resource]);

  useEffect(() => { loadRows(); }, [loadRows]);
  useEffect(() => { setSearch(searchParams.get("search") || ""); }, [searchParams]);
  useEffect(() => { setPage(0); }, [resource, search]);
  useEffect(() => { setFilterValue("all"); }, [resource]);
  useEffect(() => {
    const dependencies = [...new Set(definition.fields?.filter((field) => field.type === "relation").map((field) => field.resource) || [])];
    if (!dependencies.length) return undefined;
    let active = true;
    Promise.all(dependencies.map(async (name) => [name, await resourceApi.list(name)]))
      .then((entries) => { if (active) setLookups(Object.fromEntries(entries)); })
      .catch((requestError) => { if (active) notify(requestError.response?.data?.message || "Could not load form options", "error"); });
    return () => { active = false; };
  }, [definition, notify]);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filterField = resource === "expenses" ? "category" : ["crops", "orders", "tasks", "workers", "attendance", "equipment", "users"].includes(resource) ? "status" : null;
    return rows.filter((row) => {
      const matchesSearch = !needle || Object.values(row).some((value) =>
        (typeof value === "object" ? Object.values(value || {}).join(" ") : String(value ?? "")).toLowerCase().includes(needle)
      );
      return matchesSearch && (!filterField || filterValue === "all" || row[filterField] === filterValue);
    });
  }, [rows, search, resource, filterValue]);
  const filterField = resource === "expenses" ? "category" : ["crops", "orders", "tasks", "workers", "attendance", "equipment", "users"].includes(resource) ? "status" : null;
  const filterOptions = useMemo(
    () => filterField ? [...new Set(rows.map((row) => row[filterField]).filter(Boolean))].sort() : [],
    [rows, filterField]
  );
  const visibleRows = useMemo(
    () => filteredRows.slice(page * pageSize, (page + 1) * pageSize),
    [filteredRows, page, pageSize]
  );

  const save = async (payload) => {
    setSaving(true);
    try {
      await resourceApi.save(resource, payload, editor.record?.id);
      notify(`${definition.singular[0].toUpperCase()}${definition.singular.slice(1)} ${editor.record ? "updated" : "added"} successfully`);
      setEditor(null);
      await loadRows();
      return true;
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Could not save this record";
      notify(message, "error");
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await resourceApi.remove(resource, deletingRow.id);
      notify(`${definition.singular[0].toUpperCase()}${definition.singular.slice(1)} deleted`);
      setDeletingRow(null);
      await loadRows();
    } catch (requestError) {
      notify(requestError.response?.data?.message || "Could not delete this record", "error");
    } finally {
      setDeleting(false);
    }
  };

  const canCreate = resource !== "activity" && (resource !== "users" || isAdmin);
  const canModify = isAdmin;
  const titleCase = definition.title;

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <p className="eyebrow">FARM OPERATIONS</p>
          <h1>{titleCase}</h1>
          <p className="page-subtitle">A clear view of your {definition.title.toLowerCase()} and the work happening across your farm.</p>
        </div>
        {canCreate && <button className="button button-primary" onClick={() => setEditor({ record: null })}><Plus size={18} /> Add {definition.singular}</button>}
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="table-count"><strong>{rows.length}</strong><span> {rows.length === 1 ? "record" : "records"}</span></div>
          <div className="toolbar-actions">
            <label className="search-field"><Search size={17} /><input aria-label={`Search ${titleCase.toLowerCase()}`} placeholder={`Search ${titleCase.toLowerCase()}…`} value={search} onChange={(event) => setSearch(event.target.value)} /></label>
            {filterField && filterOptions.length > 0 && <select className="filter-select" aria-label={`Filter by ${filterField}`} value={filterValue} onChange={(event) => setFilterValue(event.target.value)}><option value="all">All {filterField === "status" ? "statuses" : "categories"}</option>{filterOptions.map((option) => <option key={option}>{option}</option>)}</select>}
            <button className="button button-secondary button-compact" onClick={loadRows} aria-label="Refresh records"><RefreshCw size={16} /><span>Refresh</span></button>
          </div>
        </div>

        {error && <div className="inline-alert" role="alert"><CircleAlert size={18} /><span>{error}</span><button className="button button-secondary button-compact" onClick={loadRows}>Retry</button></div>}

        <div className="table-scroll">
          <table>
            <thead><tr>{definition.columns.map((column) => <th key={column}>{humanize(column.split(".").pop())}</th>)}<th className="actions-heading">Actions</th></tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }, (_, index) => (
                <tr key={`skeleton-${index}`}><td colSpan={definition.columns.length + 1}><span className="skeleton-line" /></td></tr>
              )) : visibleRows.map((row) => (
                <tr key={row.id}>
                  {definition.columns.map((column) => {
                    const value = resolveValue(row, column);
                    return <td key={column}>
                      {column === "status" || column === "action"
                        ? <StatusBadge value={value} />
                        : column === "healthScore"
                          ? <div className="health-cell"><span className="health-track"><span style={{ width: `${Math.min(100, Number(value) || 0)}%` }} /></span><span>{formatValue(column, value)}</span></div>
                          : column === "timestamp" ? formatValue(column, value)
                            : formatValue(column, value)}
                    </td>;
                  })}
                  <td className="row-actions">
                    <button className="icon-button" aria-label={`View ${definition.singular}`} title="View" onClick={() => setViewingRow(row)}><Eye size={16} /></button>
                    {canModify && resource !== "activity" && <button className="icon-button" aria-label={`Edit ${definition.singular}`} title="Edit" onClick={() => setEditor({ record: row })}><Pencil size={16} /></button>}
                    {canModify && <button className="icon-button danger-icon" aria-label={`Delete ${definition.singular}`} title="Delete" onClick={() => setDeletingRow(row)}><Trash2 size={16} /></button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredRows.length > 0 && <div className="pagination">
          <label>Rows per page
            <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }}>
              {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <span>{page * pageSize + 1}–{Math.min((page + 1) * pageSize, filteredRows.length)} of {filteredRows.length}</span>
          <button className="button button-secondary button-compact" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0}>Previous</button>
          <button className="button button-secondary button-compact" onClick={() => setPage((current) => Math.min(Math.ceil(filteredRows.length / pageSize) - 1, current + 1))} disabled={(page + 1) * pageSize >= filteredRows.length}>Next</button>
        </div>}

        {!loading && !error && filteredRows.length === 0 && (
          <div className="empty-state"><div className="empty-icon"><Leaf size={24} /></div><h3>{search ? "No matching records" : `No ${titleCase.toLowerCase()} yet`}</h3><p>{search ? "Try a different search term." : "Your farm data will appear here once you add the first record."}</p>{canCreate && !search && <button className="button button-primary" onClick={() => setEditor({ record: null })}><Plus size={17} /> Add your first {definition.singular}</button>}</div>
        )}
      </div>

      {editor && definition.fields && <ResourceForm
        definition={definition}
        record={editor.record}
        lookups={resource === "buyers" ? { ...lookups, buyers: rows } : lookups}
        onCancel={() => setEditor(null)}
        onSubmit={save}
        saving={saving}
      />}
      {viewingRow && <RecordDetails definition={definition} record={viewingRow} onClose={() => setViewingRow(null)} />}
      {deletingRow && <ConfirmModal
        title={`Delete ${definition.singular}?`}
        name={deletingRow.name || deletingRow.fullName || deletingRow.title || deletingRow.id}
        onCancel={() => setDeletingRow(null)}
        onConfirm={remove}
        loading={deleting}
      />}
    </section>
  );
}
