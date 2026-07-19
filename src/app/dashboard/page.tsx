"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { showToast } from "@/components/Toast";

type Stats = {
  totalUploads: number;
  pending: number;
  completed: number;
  totalStorage: number;
  storageUsed: number;
  departments: number;
  todayUploads: number;
  maxFileSizeMb: number;
  uploadDeadline: string | null;
  classroomName: string;
};

type Upload = any;

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ department: "", year: "", section: "", subject: "", status: "", date: "" });
  const [sortBy, setSortBy] = useState("uploadDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState<string>("");
  const [lastEventTs, setLastEventTs] = useState<number>(Date.now());
  const [liveNotif, setLiveNotif] = useState<string | null>(null);

  const fetchStats = async () => {
    const res = await fetch("/api/dashboard/stats", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    });
    if (res.ok) {
      const data = await res.json();
      setStats(data.stats);
    }
  };

  const fetchUploads = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      department: filters.department,
      year: filters.year,
      section: filters.section,
      subject: filters.subject,
      status: filters.status,
      date: filters.date,
      sortBy,
      sortOrder,
      page: page.toString(),
      limit: "10",
    });
    const res = await fetch(`/api/uploads?${params.toString()}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUploads(data.uploads);
      setTotalPages(data.totalPages);
    }
    setLoading(false);
  };

  const fetchQR = async () => {
    try {
      const res = await fetch("/api/qr", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setQrData(data.qr);
      setQrUrl(data.url);
    } catch {}
  };

  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    fetchStats();
    fetchQR();
  }, []);

  useEffect(() => {
    fetchUploads();
  }, [search, filters, sortBy, sortOrder, page]);

  // Real-time polling (Socket.IO fallback with SSE-like polling)
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/realtime?since=${lastEventTs}`);
      if (res.ok) {
        const data = await res.json();
        if (data.events && data.events.length > 0) {
          const latest = data.events[data.events.length - 1];
          if (latest.type === "new_upload") {
            setLiveNotif(`New upload: ${latest.data.studentName} - ${latest.data.originalFileName}`);
            showToast(`New file uploaded: ${latest.data.studentName}`, "info");
            fetchUploads();
            fetchStats();
          }
          setLastEventTs(data.timestamp);
          setTimeout(() => setLiveNotif(null), 4000);
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [lastEventTs]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this file? It will be removed from Cloudinary and database.")) return;
    const res = await fetch(`/api/uploads/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
    });
    if (res.ok) {
      showToast("File deleted permanently", "success");
      fetchUploads();
      fetchStats();
    } else {
      showToast("Delete failed", "error");
    }
  };

  const handleMarkCompleted = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "pending" ? "completed" : "pending";
    const res = await fetch(`/api/uploads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      body: JSON.stringify({ presentationStatus: newStatus }),
    });
    if (res.ok) {
      showToast(`Marked as ${newStatus}`, "success");
      fetchUploads();
      fetchStats();
    }
  };

  const handleRename = async (id: string, currentName: string) => {
    const newName = prompt("Rename file:", currentName);
    if (!newName || newName === currentName) return;
    const res = await fetch(`/api/uploads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      body: JSON.stringify({ displayFileName: newName }),
    });
    if (res.ok) {
      showToast("Renamed successfully", "success");
      fetchUploads();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!stats) {
    return (
      <div className="p-6 lg:p-8">
        <div className="h-32 animate-pulse bg-slate-100 dark:bg-white/5 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-8 space-y-6">
      {liveNotif && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 animate-slide-in rounded-full bg-slate-900 dark:bg-white text-white dark:text-black px-5 py-2.5 text-sm font-medium shadow-2xl flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          {liveNotif}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-[26px] font-bold tracking-tight">Classroom Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stats.classroomName} • Live sync via Socket.IO • No refresh needed</p>
        </div>
        <div className="flex gap-2">
          <Link href="/upload?src=qr" target="_blank" className="h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black px-4 text-xs font-semibold flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-white/20 dark:bg-black/10 flex items-center justify-center">↗</span> Open Upload
          </Link>
          <Link href="/dashboard/qr" className="h-9 rounded-full border border-slate-200 dark:border-white/10 px-4 text-xs font-semibold bg-white dark:bg-white/5">QR View</Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-[20px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Total Uploads</p>
          <p className="font-display text-[32px] font-bold mt-2 leading-none">{stats.totalUploads}</p>
          <p className="text-xs text-slate-500 mt-2">{stats.todayUploads} today • {stats.departments} depts</p>
          <div className="mt-3 h-1 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden"><div className="h-full w-full bg-gradient-to-r from-violet-600 to-indigo-600" /></div>
        </div>
        <div className="rounded-[20px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Pending</p>
          <p className="font-display text-[32px] font-bold mt-2 leading-none text-amber-600">{stats.pending}</p>
          <p className="text-xs text-slate-500 mt-2">Awaiting presentation</p>
          <div className="mt-3 h-1 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${stats.totalUploads ? (stats.pending / stats.totalUploads) * 100 : 0}%` }} /></div>
        </div>
        <div className="rounded-[20px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Completed</p>
          <p className="font-display text-[32px] font-bold mt-2 leading-none text-emerald-600">{stats.completed}</p>
          <p className="text-xs text-slate-500 mt-2">{stats.totalUploads ? Math.round((stats.completed / stats.totalUploads) * 100) : 0}% done</p>
          <div className="mt-3 h-1 rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${stats.totalUploads ? (stats.completed / stats.totalUploads) * 100 : 0}%` }} /></div>
        </div>
        <div className="rounded-[20px] bg-gradient-to-br from-violet-600 to-indigo-600 p-5 text-white">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">Total Storage Used</p>
          <p className="font-display text-[28px] font-bold mt-2 leading-none">{formatBytes(stats.storageUsed)}</p>
          <p className="text-xs opacity-70 mt-2">Max file: {stats.maxFileSizeMb}MB • Cloudinary</p>
          <div className="mt-3 h-1 rounded-full bg-white/20"><div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, (stats.storageUsed / (25 * 1024 * 1024 * 1024)) * 100)}%` }} /></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        {/* Table */}
        <div className="rounded-[20px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-white/10 flex flex-wrap gap-3 items-center justify-between">
            <h3 className="font-display font-semibold">Uploaded Files</h3>
            <div className="flex flex-wrap gap-2">
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name, reg no..." className="h-9 w-[200px] rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 text-xs outline-none focus:border-violet-500" />
              <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })} className="h-9 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a23] px-3 text-xs">
                <option value="">All Dept</option>
                <option>CSE</option><option>ECE</option><option>EEE</option><option>MECH</option><option>IT</option>
              </select>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="h-9 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a23] px-3 text-xs">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-9 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a23] px-3 text-xs">
                <option value="uploadDate">Sort by Time</option>
                <option value="studentName">Name</option>
                <option value="subject">Subject</option>
                <option value="fileSize">Size</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-white/5 text-[11px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="px-3 py-3 font-semibold">File</th>
                  <th className="px-3 py-3 font-semibold">Meta</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-5 py-4"><div className="h-4 w-24 bg-slate-100 dark:bg-white/10 rounded" /></td>
                      <td className="px-3 py-4"><div className="h-4 w-32 bg-slate-100 dark:bg-white/10 rounded" /></td>
                      <td className="px-3 py-4"><div className="h-4 w-20 bg-slate-100 dark:bg-white/10 rounded" /></td>
                      <td className="px-3 py-4"><div className="h-4 w-12 bg-slate-100 dark:bg-white/10 rounded-full" /></td>
                      <td className="px-5 py-4"><div className="h-4 w-20 bg-slate-100 dark:bg-white/10 rounded" /></td>
                    </tr>
                  ))
                ) : uploads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">📭</div>
                      <p className="mt-3 font-semibold">No uploads yet</p>
                      <p className="text-xs text-slate-500 mt-1">Show QR on projector • Students will appear here live</p>
                    </td>
                  </tr>
                ) : (
                  uploads.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">{u.studentName[0]}</div>
                          <div className="min-w-0">
                            <p className="font-medium text-[13px] truncate max-w-[140px]">{u.studentName}</p>
                            <p className="text-[11px] text-slate-500">{u.registerNumber} • {u.department} {u.year} {u.section}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-[13px] truncate max-w-[160px]" title={u.displayFileName}>{u.displayFileName}</p>
                        <p className="text-[11px] text-slate-500">{u.fileType.toUpperCase()} • {formatBytes(u.fileSize)} • {u.subject}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-[11px] text-slate-500">{new Date(u.uploadDate).toLocaleDateString()}</p>
                        <p className="text-[11px] text-slate-500">{new Date(u.uploadDate).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-3 py-3">
                        <button onClick={() => handleMarkCompleted(u.id, u.presentationStatus)} className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${u.presentationStatus === "completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"}`}>
                          {u.presentationStatus}
                        </button>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100">
                          <a href={u.cloudinaryUrl} target="_blank" className="h-7 w-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-slate-200 text-xs" title="Preview">👁</a>
                          <Link href={`/present/${u.id}`} className="h-7 w-7 rounded-full bg-violet-600 text-white flex items-center justify-center hover:bg-violet-700 text-xs" title="Present">▶</Link>
                          <a href={`/api/download/${u.id}`} download={u.originalFileName} className="h-7 w-7 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center text-xs" title="Download">⬇</a>
                          <button onClick={() => handleRename(u.id, u.displayFileName)} className="h-7 w-7 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 text-xs">✎</button>
                          <button onClick={() => handleDelete(u.id)} className="h-7 w-7 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-100 text-xs">🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
            <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-8 rounded-full border px-3 text-xs font-semibold disabled:opacity-40">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-8 rounded-full border px-3 text-xs font-semibold disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>

        {/* Right column QR + recent */}
        <div className="space-y-4">
          <div className="rounded-[20px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm">Projector QR Code</h3>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold animate-pulse">LIVE</span>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-900 dark:bg-white p-4 flex flex-col items-center">
              {qrData ? <img src={qrData} alt="QR" className="h-[180px] w-[180px] rounded-xl bg-white p-2" /> : <div className="h-[180px] w-[180px] rounded-xl bg-white/10 animate-pulse" />}
              {qrUrl && <p className="mt-3 text-white dark:text-black font-mono text-[10px] font-bold break-all text-center px-2">{qrUrl}</p>}
              <p className="text-[10px] text-white/60 dark:text-black/60 mt-1">Students scan with phone camera</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={async () => {
                if (!qrData) return;
                const a = document.createElement("a");
                a.href = qrData;
                a.download = "ClassShare-QR.png";
                a.click();
                showToast("QR downloaded as PNG", "success");
              }} className="h-9 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-semibold">Download PNG</button>
              <Link href="/dashboard/qr" className="h-9 rounded-full border border-slate-200 dark:border-white/10 text-xs font-semibold flex items-center justify-center">Fullscreen</Link>
            </div>
            <p className="mt-3 text-[11px] text-slate-500 leading-5">• QR points to Student Upload page (no login) • Auto-generates with current domain • Display on projector for class.</p>
          </div>

          <div className="rounded-[20px] bg-gradient-to-br from-slate-900 to-black dark:from-white dark:to-slate-100 dark:text-black text-white p-5">
            <p className="font-semibold text-sm">How to present?</p>
            <ol className="mt-3 space-y-2 text-xs opacity-80 list-decimal list-inside leading-5">
              <li>Click ▶ Present to open fullscreen presentation mode</li>
              <li>Use Download to get original filename</li>
              <li>Mark Completed after presentation</li>
              <li>Delete purges from Cloudinary + DB</li>
            </ol>
            {stats.uploadDeadline && <div className="mt-4 rounded-xl bg-white/10 dark:bg-black/5 p-3 text-xs"><b>Deadline:</b> {new Date(stats.uploadDeadline).toLocaleString()}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
