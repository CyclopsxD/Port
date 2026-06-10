import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { 
  Eye, 
  MousePointerClick, 
  Mail, 
  Activity, 
  Search, 
  ShieldAlert, 
  Clock, 
  TrendingUp, 
  Database,
  RefreshCw
} from "lucide-react";
import { AnalyticsMetric, AuditLog, TeamMember } from "../types";

interface AnalyticsPanelProps {
  analytics: AnalyticsMetric[];
  logs: AuditLog[];
  team: TeamMember[];
}

export default function AnalyticsPanel({ analytics, logs, team }: AnalyticsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMetricTab, setActiveMetricTab] = useState<"views" | "clicks" | "contacts">("views");

  // Sum total metrics for the quick-stats row
  const totalViews = (analytics || []).reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalClicks = (analytics || []).reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const totalContacts = (analytics || []).reduce((acc, curr) => acc + (curr.contacts || 0), 0);

  // Filter logs based on search term
  const filteredLogs = (logs || [])
    .filter((log) => {
      const q = searchTerm.toLowerCase();
      return (
        log.user?.toLowerCase().includes(q) ||
        log.action?.toLowerCase().includes(q) ||
        log.role?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Format date helper for the chart
  const formattedChartData = (analytics || []).map((m) => {
    try {
      const parts = m.date.split("-");
      if (parts.length === 3) {
        // e.g. "2026-06-07" -> "06/07"
        return {
          ...m,
          shortDate: `${parts[1]}/${parts[2]}`,
        };
      }
    } catch (e) {}
    return { ...m, shortDate: m.date };
  });

  const getMetricColor = () => {
    if (activeMetricTab === "clicks") return "#8b5cf6"; // Purple
    if (activeMetricTab === "contacts") return "#10b981"; // Emerald
    return "#6366f1"; // Indigo
  };

  const getMetricGlow = () => {
    if (activeMetricTab === "clicks") return "rgba(139, 92, 246, 0.1)";
    if (activeMetricTab === "contacts") return "rgba(16, 185, 129, 0.1)";
    return "rgba(99, 102, 241, 0.1)";
  };

  return (
    <div className="space-y-8 text-left">
      {/* Overview Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white font-sans flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>Interactive Operational Telemetry</span>
          </h3>
          <p className="text-slate-400 text-xs mt-1 font-mono">
            Direct database diagnostics • Core transactional telemetry limits
          </p>
        </div>
        <div className="text-slate-500 text-xs font-mono bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg flex items-center space-x-2">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Active Datastore Session: Real-Time Stream</span>
        </div>
      </div>

      {/* Numerical Bento Grid Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Card 1: Views */}
        <button
          onClick={() => setActiveMetricTab("views")}
          className={`p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer ${
            activeMetricTab === "views"
              ? "bg-indigo-600/10 border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
              : "bg-[#0c0c16]/80 border-white/[0.04] hover:bg-slate-900/60"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-indigo-400">Page Impressions</span>
            <div className={`p-2 rounded-xl border ${activeMetricTab === "views" ? "bg-indigo-600/20 border-indigo-500/20 text-indigo-400" : "bg-white/5 border-white/5 text-slate-400"}`}>
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-white tracking-tight font-sans">{totalViews.toLocaleString()}</h4>
            <p className="text-[10.5px] text-slate-400 mt-1 font-sans">Total Guest Visits logged</p>
          </div>
        </button>

        {/* Metric Card 2: Clicks */}
        <button
          onClick={() => setActiveMetricTab("clicks")}
          className={`p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer ${
            activeMetricTab === "clicks"
              ? "bg-purple-600/10 border-purple-500/40 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
              : "bg-[#0c0c16]/80 border-white/[0.04] hover:bg-slate-900/60"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-purple-400">Interaction Events</span>
            <div className={`p-2 rounded-xl border ${activeMetricTab === "clicks" ? "bg-purple-600/20 border-purple-500/20 text-purple-400" : "bg-white/5 border-white/5 text-slate-400"}`}>
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-white tracking-tight font-sans">{totalClicks.toLocaleString()}</h4>
            <p className="text-[10.5px] text-slate-400 mt-1 font-sans">Projects Launch clicks counter</p>
          </div>
        </button>

        {/* Metric Card 3: Contacts */}
        <button
          onClick={() => setActiveMetricTab("contacts")}
          className={`p-5 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer ${
            activeMetricTab === "contacts"
              ? "bg-emerald-600/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              : "bg-[#0c0c16]/80 border-white/[0.04] hover:bg-slate-900/60"
          }`}
        >
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-emerald-400">Inbound Letters</span>
            <div className={`p-2 rounded-xl border ${activeMetricTab === "contacts" ? "bg-emerald-600/20 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/5 text-slate-400"}`}>
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-white tracking-tight font-sans">{totalContacts.toLocaleString()}</h4>
            <p className="text-[10.5px] text-slate-400 mt-1 font-sans">Inbound visitor communications</p>
          </div>
        </button>

        {/* Metric Card 4: Operational SLA */}
        <div className="p-5 rounded-2xl border bg-[#0c0c16]/80 border-white/[0.04] flex flex-col justify-between relative overflow-hidden select-none">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-amber-500">Node Status SLA</span>
            <div className="p-2 rounded-xl border bg-white/5 border-white/5 text-amber-500">
              <TrendingUp className="w-4 h-4 animate-bounce" style={{ animationDuration: "3s" }} />
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-3xl font-bold text-white tracking-tight font-sans">99.98%</h4>
            <p className="text-[10.5px] text-slate-400 mt-1 font-sans">Simulated SLA reliability targets</p>
          </div>
        </div>
      </div>

      {/* Recharts Graphical Trends */}
      {formattedChartData.length > 0 ? (
        <div className="bg-[#0b0b14]/90 border border-white/[0.04] rounded-2xl p-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Telemetry Analytics Log: {activeMetricTab.toUpperCase()}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">Showing historical metrics mapped by date sequence</p>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-white/5">
              {(["views", "clicks", "contacts"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMetricTab(tab)}
                  className={`px-3 py-1 text-[10.5px] font-mono tracking-wider uppercase rounded-lg cursor-pointer transition-all ${
                    activeMetricTab === tab
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMetricColor()} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={getMetricColor()} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="shortDate" 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  fontFamily="monospace"
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  fontFamily="monospace"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#080811",
                    borderColor: "rgba(255,255,255,0.08)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontFamily: "monospace",
                    fontSize: "11px",
                    textAlign: "left"
                  }}
                  itemStyle={{ color: getMetricColor() }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                  cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }}
                />
                <Area
                  type="monotone"
                  dataKey={activeMetricTab}
                  stroke={getMetricColor()}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#chartGlow)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="bg-[#0b0b14]/90 border border-white/[0.04] rounded-2xl h-60 flex flex-col items-center justify-center text-center p-6 space-y-2 select-none">
          <TrendingUp className="w-10 h-10 text-slate-700 animate-pulse" />
          <p className="text-slate-400 font-mono text-xs">No analytics data recorded yet in the database.</p>
        </div>
      )}

      {/* Audit Logs System Track Block */}
      <div className="bg-[#0b0b14]/90 border border-white/[0.04] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/[0.04] pb-4">
          <div>
            <h4 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Direct Audit Log Terminal</span>
            </h4>
            <p className="text-[11px] text-slate-400 mt-1">Live record tracking admin & manager actions in the database</p>
          </div>

          {/* Search Terminal filter */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter audit entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-9 bg-slate-950 border border-white/5 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 font-mono"
            />
          </div>
        </div>

        {/* Logs List terminal-style */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => {
              const isAdmin = log.role === "Admin";
              return (
                <div 
                  key={log.id} 
                  className="p-3 bg-slate-950/80 border border-white/[0.02] rounded-xl flex items-start gap-3 text-xs leading-relaxed font-mono transition-all hover:bg-slate-950"
                >
                  <div className={`p-1.5 rounded-lg border flex-shrink-0 mt-0.5 ${
                    isAdmin 
                      ? "bg-red-500/10 border-red-500/20 text-red-400" 
                      : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                  }`}>
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-left text-slate-350">
                      <span className="font-semibold text-white">{log.user}</span>{" "}
                      <span className={`px-1.5 py-0.5 text-[8.5px] font-bold rounded uppercase tracking-wider ${
                        isAdmin ? "bg-red-500/10 text-red-400" : "bg-indigo-500/10 text-indigo-400"
                      }`}>{log.role}</span>{" "}
                      — {log.action}
                    </p>
                    <p className="text-left text-[10px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 text-slate-500 select-none">
              <Search className="w-8 h-8 text-slate-700 animate-pulse" />
              <p className="font-mono text-xs">No matching system audit events found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
