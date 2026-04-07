import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);

      const res = await fetch("http://127.0.0.1:8000/admin/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch dashboard");

      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Dashboard error:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        Loading dashboard...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">
        Failed to load dashboard
      </div>
    );
  }

  const {
    overview = {},
    most_borrowed_books = [],
    monthly_issues = [],
  } = data;

  const fineData = [
    { name: "Collected", value: overview.collected_fines ?? 0 },
    { name: "Pending", value: overview.pending_fines ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-10 py-10">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* HEADER */}
        <header>
          <h1 className="text-3xl font-semibold text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Library system overview and analytics
          </p>
        </header>

        {/* KPI SECTION */}
        <section>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">

            <PrimaryCard
              title="Active Issues"
              value={overview.active_issues}
            />

            <StatCard title="Total Books" value={overview.total_books} />
            <StatCard title="Total Students" value={overview.total_students} />
            <StatCard title="Overdue Books" value={overview.overdue_books} />
            <StatCard title="Total Fines" value={`₹ ${overview.total_fines ?? 0}`} />

          </div>
        </section>

        {/* ANALYTICS SECTION */}
        <section className="grid gap-8 lg:grid-cols-2">

          {/* Monthly Issues */}
          <ChartCard title="Monthly Issues">
            {monthly_issues.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={monthly_issues}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#475569" />
                  <YAxis stroke="#475569" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Fine Breakdown */}
          <ChartCard title="Fine Breakdown">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={fineData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Most Borrowed Books */}
          <ChartCard title="Most Borrowed Books">
            {most_borrowed_books.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={most_borrowed_books}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="title" stroke="#475569" />
                  <YAxis stroke="#475569" />
                  <Tooltip />
                  <Bar
                    dataKey="borrow_count"
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

        </section>

      </div>
    </div>
  );
}

/* COMPONENTS */

function PrimaryCard({ title, value }) {
  return (
    <div className="bg-emerald-500 text-white rounded-2xl p-6 shadow-sm">
      <p className="text-sm opacity-80 mb-2">{title}</p>
      <p className="text-3xl font-bold">{value ?? 0}</p>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-slate-500 mb-2">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value ?? 0}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800 mb-6">
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-[280px] text-slate-400 text-sm">
      No data available
    </div>
  );
}

export default AdminDashboard;