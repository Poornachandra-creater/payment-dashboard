import { useState, useEffect, useCallback, useMemo } from "react";

const COLORS = {
  bg: "#0a0b0f",
  surface: "#111318",
  border: "#1e2028",
  accent: "#00e5ff",
  accentDim: "#00e5ff22",
  accentGlow: "#00e5ff44",
  success: "#00ff88",
  warning: "#ffb800",
  danger: "#ff4466",
  text: "#e8eaf0",
  textMuted: "#6b7280",
  purple: "#a855f7",
};

const mockTransactions = Array.from({ length: 40 }, (_, i) => {
  const statuses = ["SUCCESS", "FAILED", "PENDING", "REFUNDED"];
  const methods = ["UPI", "Card", "NetBanking", "Wallet", "BNPL"];
  const merchants = ["Swiggy", "Zomato", "Amazon", "Flipkart", "Myntra", "BigBasket", "PhonePe", "Ola"];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const date = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
  return {
    id: `TXN${String(1000 + i).padStart(6, "0")}`,
    merchant: merchants[Math.floor(Math.random() * merchants.length)],
    amount: +(Math.random() * 9900 + 100).toFixed(2),
    status,
    method: methods[Math.floor(Math.random() * methods.length)],
    date,
    dateStr: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
  };
});

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${String(i).padStart(2, "0")}:00`,
  volume: Math.floor(Math.random() * 800 + 100),
  success: Math.floor(Math.random() * 700 + 80),
}));

const weekData = [
  { day: "Mon", txn: 1240, revenue: 284000 },
  { day: "Tue", txn: 1890, revenue: 412000 },
  { day: "Wed", txn: 1560, revenue: 335000 },
  { day: "Thu", txn: 2100, revenue: 489000 },
  { day: "Fri", txn: 2450, revenue: 563000 },
  { day: "Sat", txn: 3200, revenue: 712000 },
  { day: "Sun", txn: 2800, revenue: 634000 },
];

const statusColor = (s) =>
  s === "SUCCESS" ? COLORS.success : s === "FAILED" ? COLORS.danger : s === "PENDING" ? COLORS.warning : COLORS.purple;

function MiniSparkline({ data, color = COLORS.accent, width = 80, height = 30 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${pts.join(" ")} ${width},${height}`}
        fill={`url(#sg-${color.replace("#", "")})`}
      />
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BarChart({ data, valueKey, colorKey = COLORS.accent }) {
  const max = Math.max(...data.map((d) => d[valueKey]));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div
            style={{
              width: "100%",
              background: `linear-gradient(to top, ${colorKey}, ${colorKey}88)`,
              height: `${(d[valueKey] / max) * 70}px`,
              borderRadius: "3px 3px 0 0",
              transition: "height 0.5s ease",
              position: "relative",
              cursor: "pointer",
            }}
            title={`${d.day}: ${d[valueKey].toLocaleString()}`}
          />
          <span style={{ fontSize: 9, color: COLORS.textMuted, fontFamily: "monospace" }}>{d.day}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const size = 100;
  const r = 35;
  const cx = size / 2;
  const cy = size / 2;
  const segments = data.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z` };
  });
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={100} height={100}>
      {segments.map((s, i) => (
        <path key={i} d={s.path} fill={s.color} opacity={0.9} stroke={COLORS.bg} strokeWidth={1} />
      ))}
      <circle cx={cx} cy={cy} r={22} fill={COLORS.surface} />
      <text x={cx} y={cy + 4} textAnchor="middle" fill={COLORS.text} fontSize={10} fontWeight="bold">
        {total.toLocaleString()}
      </text>
    </svg>
  );
}

function StatCard({ label, value, sub, sparkData, color = COLORS.accent, prefix = "" }) {
  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 12,
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, right: 0, width: 80, height: 80,
        background: `radial-gradient(circle at top right, ${color}15, transparent 70%)`,
      }} />
      <span style={{ fontSize: 11, color: COLORS.textMuted, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.5px" }}>
        {prefix}{typeof value === "number" ? value.toLocaleString() : value}
      </span>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, color: color }}>{sub}</span>
        {sparkData && <MiniSparkline data={sparkData} color={color} />}
      </div>
    </div>
  );
}

function TransactionRow({ txn, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "1.5fr 1fr 0.8fr 0.8fr 1fr",
        gap: 16,
        padding: "12px 20px",
        borderBottom: `1px solid ${COLORS.border}`,
        background: hovered ? `${COLORS.border}55` : "transparent",
        transition: "background 0.15s",
        cursor: "pointer",
        alignItems: "center",
        animation: `fadeIn 0.3s ease ${index * 0.03}s both`,
      }}
    >
      <div>
        <div style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{txn.merchant}</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace" }}>{txn.id}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, fontFamily: "monospace" }}>
        ₹{txn.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </div>
      <div>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
          color: statusColor(txn.status),
          background: `${statusColor(txn.status)}18`,
          padding: "3px 8px", borderRadius: 4,
          border: `1px solid ${statusColor(txn.status)}44`,
        }}>{txn.status}</span>
      </div>
      <div style={{ fontSize: 12, color: COLORS.textMuted }}>{txn.method}</div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace" }}>{txn.dateStr}</div>
    </div>
  );
}

export default function PaymentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterMethod, setFilterMethod] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [liveRate, setLiveRate] = useState(98.2);
  const [pulse, setPulse] = useState(false);
  const PER_PAGE = 8;

  useEffect(() => {
    const iv = setInterval(() => {
      setLiveRate((r) => +(r + (Math.random() - 0.5) * 0.3).toFixed(1));
      setPulse(true);
      setTimeout(() => setPulse(false), 500);
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  const filtered = useMemo(() => {
    return mockTransactions.filter((t) => {
      const matchSearch = t.id.includes(search.toUpperCase()) || t.merchant.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === "ALL" || t.status === filterStatus;
      const matchMethod = filterMethod === "ALL" || t.method === filterMethod;
      return matchSearch && matchStatus && matchMethod;
    });
  }, [search, filterStatus, filterMethod]);

  const paginated = useMemo(() => filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE), [filtered, currentPage]);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const stats = useMemo(() => {
    const total = mockTransactions.length;
    const success = mockTransactions.filter((t) => t.status === "SUCCESS").length;
    const revenue = mockTransactions.filter((t) => t.status === "SUCCESS").reduce((s, t) => s + t.amount, 0);
    const failed = mockTransactions.filter((t) => t.status === "FAILED").length;
    return { total, success, revenue, failed, rate: +((success / total) * 100).toFixed(1) };
  }, []);

  const methodDist = useMemo(() => {
    const map = {};
    mockTransactions.forEach((t) => { map[t.method] = (map[t.method] || 0) + 1; });
    const colors = [COLORS.accent, COLORS.success, COLORS.warning, COLORS.purple, COLORS.danger];
    return Object.entries(map).map(([k, v], i) => ({ label: k, value: v, color: colors[i % colors.length] }));
  }, []);

  const sparkSuccess = hourlyData.slice(0, 12).map((d) => d.success);
  const sparkVolume = hourlyData.slice(0, 12).map((d) => d.volume);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${COLORS.bg}; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: ${COLORS.surface}; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 2px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 0 0 ${COLORS.accent}44; } 50% { box-shadow: 0 0 0 6px transparent; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
        .nav-tab { cursor: pointer; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; letter-spacing: 0.04em; transition: all 0.2s; border: none; font-family: 'Syne', sans-serif; }
        .nav-tab.active { background: ${COLORS.accent}22; color: ${COLORS.accent}; border: 1px solid ${COLORS.accent}44; }
        .nav-tab.inactive { background: transparent; color: ${COLORS.textMuted}; border: 1px solid transparent; }
        .nav-tab.inactive:hover { color: ${COLORS.text}; background: ${COLORS.border}; }
        select { appearance: none; cursor: pointer; }
      `}</style>
      <div style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily: "'Syne', sans-serif",
        padding: "24px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.purple})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900,
            }}>⚡</div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px" }}>HyperPay Analytics</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace" }}>Payment Intelligence Platform</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8,
              padding: "8px 14px", display: "flex", alignItems: "center", gap: 8,
              animation: pulse ? "pulseGlow 0.5s ease" : "none",
            }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: COLORS.success, animation: "blink 2s infinite" }} />
              <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.success, fontWeight: 600 }}>
                {liveRate}% SR
              </span>
              <span style={{ fontSize: 10, color: COLORS.textMuted }}>LIVE</span>
            </div>
            <div style={{
              background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8,
              padding: "8px 14px", fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace",
            }}>
              {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["overview", "transactions", "analytics"].map((tab) => (
            <button key={tab} className={`nav-tab ${activeTab === tab ? "active" : "inactive"}`} onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            {/* Stat Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard label="Total Transactions" value={stats.total} sub="↑ 12.4% vs yesterday" sparkData={sparkVolume} prefix="" />
              <StatCard label="Revenue" value={`₹${(stats.revenue / 100000).toFixed(2)}L`} sub="↑ 8.7% this week" sparkData={sparkSuccess} color={COLORS.success} />
              <StatCard label="Success Rate" value={`${stats.rate}%`} sub="Target: 98.5%" sparkData={sparkVolume.map(v => v / 10)} color={COLORS.warning} />
              <StatCard label="Failed Txns" value={stats.failed} sub="↓ 3.2% vs yesterday" sparkData={sparkVolume.map(v => 20 - v / 50)} color={COLORS.danger} />
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: COLORS.textMuted }}>Weekly Transaction Volume</span>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.accent }}>Last 7 Days</span>
                </div>
                <BarChart data={weekData} valueKey="txn" colorKey={COLORS.accent} />
              </div>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: COLORS.textMuted, marginBottom: 16 }}>Payment Methods</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <DonutChart data={methodDist} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {methodDist.map((m) => (
                      <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: COLORS.textMuted }}>{m.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, marginLeft: "auto", fontFamily: "monospace" }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions Preview */}
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: COLORS.textMuted }}>Recent Transactions</span>
                <button onClick={() => setActiveTab("transactions")} style={{ background: "none", border: "none", color: COLORS.accent, fontSize: 12, cursor: "pointer", fontFamily: "Syne" }}>View All →</button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.8fr 0.8fr 1fr", gap: 16, padding: "10px 20px 10px", borderBottom: `1px solid ${COLORS.border}` }}>
                {["Merchant", "Amount", "Status", "Method", "Time"].map((h) => (
                  <span key={h} style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>{h}</span>
                ))}
              </div>
              {mockTransactions.slice(0, 5).map((t, i) => <TransactionRow key={t.id} txn={t} index={i} />)}
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search merchant or TXN ID..."
                style={{
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8,
                  padding: "10px 16px", color: COLORS.text, fontSize: 13, fontFamily: "JetBrains Mono", flex: 1, outline: "none",
                }}
              />
              {["ALL", "SUCCESS", "FAILED", "PENDING", "REFUNDED"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setFilterStatus(s); setCurrentPage(1); }}
                  style={{
                    background: filterStatus === s ? `${statusColor(s) || COLORS.accent}22` : COLORS.surface,
                    border: `1px solid ${filterStatus === s ? (statusColor(s) || COLORS.accent) + "66" : COLORS.border}`,
                    color: filterStatus === s ? (statusColor(s) || COLORS.accent) : COLORS.textMuted,
                    borderRadius: 8, padding: "8px 14px", fontSize: 11, fontWeight: 700,
                    cursor: "pointer", fontFamily: "Syne", letterSpacing: "0.05em",
                  }}
                >{s}</button>
              ))}
              <select
                value={filterMethod}
                onChange={(e) => { setFilterMethod(e.target.value); setCurrentPage(1); }}
                style={{
                  background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 8,
                  padding: "8px 14px", color: COLORS.text, fontSize: 12, fontFamily: "Syne",
                }}
              >
                {["ALL", "UPI", "Card", "NetBanking", "Wallet", "BNPL"].map((m) => (
                  <option key={m} value={m} style={{ background: COLORS.surface }}>{m}</option>
                ))}
              </select>
            </div>

            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
                <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "monospace" }}>{filtered.length} transactions found</span>
                <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "monospace" }}>Page {currentPage}/{totalPages}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 0.8fr 0.8fr 1fr", gap: 16, padding: "10px 20px", borderBottom: `1px solid ${COLORS.border}` }}>
                {["Merchant", "Amount", "Status", "Method", "Time"].map((h) => (
                  <span key={h} style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace" }}>{h}</span>
                ))}
              </div>
              {paginated.length > 0 ? paginated.map((t, i) => <TransactionRow key={t.id} txn={t} index={i} />) : (
                <div style={{ padding: 40, textAlign: "center", color: COLORS.textMuted, fontSize: 14 }}>No transactions match your filters</div>
              )}
              {totalPages > 1 && (
                <div style={{ display: "flex", gap: 8, padding: 16, justifyContent: "center" }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      style={{
                        width: 32, height: 32, borderRadius: 6, border: `1px solid ${p === currentPage ? COLORS.accent : COLORS.border}`,
                        background: p === currentPage ? COLORS.accentDim : COLORS.surface,
                        color: p === currentPage ? COLORS.accent : COLORS.textMuted,
                        cursor: "pointer", fontSize: 12, fontFamily: "monospace",
                      }}
                    >{p}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: COLORS.textMuted, letterSpacing: "0.08em", marginBottom: 20 }}>Hourly Transaction Volume</div>
                <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 100 }}>
                  {hourlyData.map((d, i) => {
                    const max = Math.max(...hourlyData.map((h) => h.volume));
                    const h = (d.volume / max) * 90;
                    const isNow = i === new Date().getHours();
                    return (
                      <div key={i} title={`${d.hour}: ${d.volume} txns`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <div style={{
                          width: "100%", height: h, borderRadius: "2px 2px 0 0",
                          background: isNow ? COLORS.accent : `${COLORS.accent}55`,
                          border: isNow ? `1px solid ${COLORS.accent}` : "none",
                          transition: "all 0.3s",
                        }} />
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: COLORS.textMuted, fontFamily: "monospace" }}>00:00</span>
                  <span style={{ fontSize: 9, color: COLORS.textMuted, fontFamily: "monospace" }}>12:00</span>
                  <span style={{ fontSize: 9, color: COLORS.textMuted, fontFamily: "monospace" }}>23:00</span>
                </div>
              </div>

              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: COLORS.textMuted, letterSpacing: "0.08em", marginBottom: 20 }}>Status Distribution</div>
                {["SUCCESS", "FAILED", "PENDING", "REFUNDED"].map((s) => {
                  const count = mockTransactions.filter((t) => t.status === s).length;
                  const pct = (count / mockTransactions.length) * 100;
                  return (
                    <div key={s} style={{ marginBottom: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                        <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "monospace" }}>{s}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: statusColor(s), fontFamily: "monospace" }}>{pct.toFixed(1)}%</span>
                      </div>
                      <div style={{ height: 6, background: COLORS.border, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${pct}%`, background: statusColor(s),
                          borderRadius: 3, transition: "width 1s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: COLORS.textMuted, letterSpacing: "0.08em", marginBottom: 16 }}>Top Merchants by Volume</div>
                {["Swiggy", "Zomato", "Amazon", "Flipkart", "BigBasket"].map((m, i) => {
                  const count = mockTransactions.filter((t) => t.merchant === m).length;
                  return (
                    <div key={m} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <span style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "monospace", width: 14 }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: COLORS.text, flex: 1 }}>{m}</span>
                      <span style={{ fontSize: 12, fontFamily: "monospace", color: COLORS.accent }}>{count} txns</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", color: COLORS.textMuted, letterSpacing: "0.08em", marginBottom: 16 }}>Performance KPIs</div>
                {[
                  { label: "Avg Transaction Value", value: `₹${(stats.revenue / stats.success).toFixed(0)}`, color: COLORS.accent },
                  { label: "Authorization Rate", value: `${liveRate}%`, color: COLORS.success },
                  { label: "Refund Rate", value: `${((mockTransactions.filter(t => t.status === "REFUNDED").length / stats.total) * 100).toFixed(1)}%`, color: COLORS.warning },
                  { label: "Peak Hour Volume", value: `${Math.max(...hourlyData.map(h => h.volume))} txns`, color: COLORS.purple },
                ].map((k) => (
                  <div key={k.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                    <span style={{ fontSize: 12, color: COLORS.textMuted }}>{k.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: k.color, fontFamily: "monospace" }}>{k.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
