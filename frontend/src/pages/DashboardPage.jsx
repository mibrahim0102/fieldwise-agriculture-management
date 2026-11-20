import { useEffect, useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import { ArrowDownRight, ArrowUpRight, CalendarDays, CircleAlert, Droplets, Leaf, Package, Tractor, UsersRound, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { resourceApi } from "../app/redux/api/resources";

const colors = ["var(--primary)", "var(--harvest)", "var(--danger)", "var(--water)", "var(--soil)", "var(--muted)"];
const dateOnly = (value) => value ? new Date(`${value}T00:00:00`) : null;
const formatMoney = (value) => new Intl.NumberFormat(undefined, { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(value || 0);

function MetricCard({ title, value, note, icon: Icon, tone = "green", trend }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon metric-${tone}`}><Icon size={20} /></div>
      <span className="metric-label">{title}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-note">{trend && <span className="metric-trend"><ArrowUpRight size={13} /> {trend}</span>}{note}</span>
    </article>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all(["crops", "orders", "buyers", "tasks", "expenses", "inventory", "workers", "attendance", "equipment", "activity"]
      .map((resource) => resourceApi.list(resource)))
      .then((values) => {
        if (active) setData(Object.fromEntries(["crops", "orders", "buyers", "tasks", "expenses", "inventory", "workers", "attendance", "equipment", "activity"].map((key, index) => [key, values[index]])));
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "Could not load your farm overview.");
      });
    return () => { active = false; };
  }, []);

  const derived = useMemo(() => {
    if (!data) return null;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueCrops = data.crops.filter((crop) => {
      const cutting = dateOnly(crop.cuttingDate);
      return cutting && cutting >= today && (cutting - today) / 86400000 <= 7;
    });
    const monthlyExpenses = data.expenses.filter((item) => {
      const date = dateOnly(item.date);
      return date && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const presentToday = data.attendance.filter((row) => row.date === localDate && row.status === "Present").length;
    const serviceDue = data.equipment.filter((item) => {
      if (!item.lastServiceDate || !item.serviceIntervalDays) return false;
      const due = dateOnly(item.lastServiceDate);
      due.setDate(due.getDate() + Number(item.serviceIntervalDays));
      return (due - today) / 86400000 <= 7;
    }).length;
    const expensesByCategory = Object.values(data.expenses.reduce((groups, item) => {
      const category = item.category || "Other";
      groups[category] ||= { name: category, total: 0 };
      groups[category].total += Number(item.amount || 0);
      return groups;
    }, {}));
    const cropHealth = [
      { name: "Healthy", value: data.crops.filter((crop) => crop.status === "Healthy").length },
      { name: "Needs attention", value: data.crops.filter((crop) => crop.status === "Needs Attention").length },
      { name: "Critical", value: data.crops.filter((crop) => crop.status === "Critical").length }
    ];
    const harvestData = data.crops.map((crop) => ({
      name: crop.name, harvest: Number(crop.harvestQty || 0),
      sold: data.buyers.filter((buyer) => buyer.cropId === crop.id).reduce((sum, buyer) => sum + Number(buyer.quantity || 0), 0)
    }));
    return {
      dueCrops, monthlyExpenses, presentToday, serviceDue,
      lowStock: data.inventory.filter((item) => Number(item.qty) <= Number(item.minQty)),
      critical: data.crops.filter((crop) => crop.status === "Critical"),
      cropHealth, expensesByCategory, harvestData
    };
  }, [data]);

  if (error) return <section className="page-section"><div className="inline-alert page-alert"><CircleAlert size={20} /><span>{error}</span><button className="button button-secondary" onClick={() => window.location.reload()}>Retry</button></div></section>;
  if (!data || !derived) return <section className="page-section"><div className="page-heading"><div><p className="eyebrow">YOUR FARM, AT A GLANCE</p><h1>Good morning.</h1></div></div><div className="metrics-grid">{Array.from({ length: 7 }, (_, index) => <div className="metric-card skeleton-card" key={index}><span className="skeleton-line" /><span className="skeleton-line short" /></div>)}</div></section>;

  return (
    <section className="page-section">
      <div className="page-heading dashboard-heading">
        <div><p className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).toUpperCase()}</p><h1>Good morning.</h1><p className="page-subtitle">Here’s what’s happening across your farm today.</p></div>
        <Link className="button button-secondary" to="/crops"><Leaf size={17} /> View crops</Link>
      </div>

      <div className="metrics-grid">
        <MetricCard title="Total crops" value={data.crops.length} note="Across all fields" icon={Leaf} />
        <MetricCard title="Harvest due soon" value={derived.dueCrops.length} note="Next 7 days" icon={CalendarDays} tone="gold" />
        <MetricCard title="Critical crops" value={derived.critical.length} note="Need attention" icon={CircleAlert} tone="red" />
        <MetricCard title="Low stock items" value={derived.lowStock.length} note="At or below minimum" icon={Package} tone="blue" />
        <MetricCard title="Monthly expenses" value={formatMoney(derived.monthlyExpenses)} note="This month" icon={Wallet} />
        <MetricCard title="Workers present" value={derived.presentToday} note="Today" icon={UsersRound} tone="soil" />
        <MetricCard title="Service due" value={derived.serviceDue} note="Within 7 days" icon={Tractor} tone="gold" />
      </div>

      <div className="dashboard-grid">
        <article className="chart-card chart-large">
          <div className="card-heading"><div><h2>Harvest vs. sold</h2><p>Available produce by crop</p></div><span className="chart-key"><i className="key-green" /> Harvest <i className="key-gold" /> Sold</span></div>
          <div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={derived.harvestData} barGap={8}><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} /><Tooltip formatter={(value) => [`${value} kg`, ""]} contentStyle={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: 12 }} /><Bar dataKey="harvest" name="Harvest" fill="var(--primary)" radius={[5, 5, 0, 0]} /><Bar dataKey="sold" name="Sold" fill="var(--harvest)" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>
        </article>
        <article className="chart-card">
          <div className="card-heading"><div><h2>Crop health</h2><p>Current growing conditions</p></div></div>
          <div className="donut-wrap">
            {data.crops.length ? <ResponsiveContainer width="100%" height={185}><PieChart><Pie data={derived.cropHealth} dataKey="value" nameKey="name" innerRadius={56} outerRadius={78} paddingAngle={4} stroke="none">{derived.cropHealth.map((entry, index) => <Cell key={entry.name} fill={colors[[0, 1, 2][index]]} />)}</Pie><Tooltip contentStyle={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: 12 }} /></PieChart></ResponsiveContainer> : <div className="chart-empty">Add crops to see their health breakdown.</div>}
            <div className="donut-legend">{derived.cropHealth.map((item, index) => <div key={item.name}><span><i style={{ background: colors[index] }} />{item.name}</span><strong>{item.value}</strong></div>)}</div>
          </div>
        </article>
        <article className="chart-card">
          <div className="card-heading"><div><h2>Expenses by category</h2><p>All recorded expenses</p></div></div>
          <div className="chart-area chart-short">{derived.expensesByCategory.length ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={derived.expensesByCategory}><defs><linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.24} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--border)" vertical={false} /><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} /><Tooltip formatter={(value) => formatMoney(value)} contentStyle={{ background: "var(--surface)", borderColor: "var(--border)", borderRadius: 12 }} /><Area type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2.5} fill="url(#expenseFill)" /></AreaChart></ResponsiveContainer> : <div className="chart-empty">Expenses will be charted as they are recorded.</div>}</div>
        </article>
        <article className="chart-card activity-card">
          <div className="card-heading"><div><h2>Recent activity</h2><p>Latest updates from the team</p></div><Link to="/activity">View all <ArrowDownRight size={14} /></Link></div>
          {data.activity.length ? <ul className="activity-list">{data.activity.slice(0, 5).map((activity) => <li key={activity.id}><span className={`activity-dot dot-${activity.action}`}><Droplets size={14} /></span><div><strong>{activity.user}</strong><span>{activity.action} {activity.entity}</span><time>{new Date(activity.timestamp).toLocaleDateString()}</time></div></li>)}</ul> : <div className="activity-empty">Activity will show here as your team works.</div>}
        </article>
      </div>
      {(derived.lowStock.length > 0 || derived.dueCrops.length > 0) && <div className="attention-strip"><CircleAlert size={18} /><p><strong>A little attention goes a long way.</strong> {derived.lowStock.length ? `${derived.lowStock.length} stock item${derived.lowStock.length === 1 ? "" : "s"} need replenishing. ` : ""}{derived.dueCrops.length ? `${derived.dueCrops.length} crop${derived.dueCrops.length === 1 ? " is" : "s are"} nearing harvest.` : ""}</p><Link to={derived.lowStock.length ? "/inventory" : "/crops"}>Review now <ArrowUpRight size={15} /></Link></div>}
    </section>
  );
}
