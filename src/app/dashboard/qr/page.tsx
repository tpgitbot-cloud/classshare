"use client";
import { useEffect, useState, useCallback } from "react";
import { showToast } from "@/components/Toast";

export default function QRPage() {
  const [qr, setQr] = useState("");
  const [url, setUrl] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);

  const loadQR = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/qr", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQr(data.qr);
      setUrl(data.url);
      setCountdown(data.ttl || 60);
      setAdminName(data.adminName || "");
    } catch {
      showToast("Failed to generate QR", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQR();
    const tick = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          loadQR();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [loadQR]);

  const download = () => {
    const a = document.createElement("a");
    a.href = qr;
    a.download = "ClassShare-QR.png";
    a.click();
    showToast("QR downloaded", "success");
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col lg:flex-row">
      <div className="flex-1 bg-white dark:bg-[#0a0a0f] flex flex-col items-center justify-center p-8 lg:p-16 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-600">Projector Display Mode</p>
        <h1 className="font-display text-[40px] lg:text-[56px] font-bold tracking-tight leading-[0.9] mt-4">Scan to upload<br />your file</h1>
        {adminName && <p className="mt-2 text-sm text-slate-500">Session by <span className="font-semibold">{adminName}</span></p>}
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-[420px]">No login required • Mobile friendly • PDF, PPT, DOC, ZIP supported</p>
        <div className="mt-6 rounded-[32px] bg-slate-900 dark:bg-white p-8 shadow-[0_24px_64px_rgba(0,0,0,0.2)] relative">
          {loading ? (
            <div className="h-[320px] w-[320px] lg:h-[420px] lg:w-[420px] animate-pulse bg-white/10 rounded-2xl" />
          ) : (
            <img src={qr} alt="QR" className="h-[320px] w-[320px] lg:h-[420px] lg:w-[420px] rounded-2xl bg-white p-4" />
          )}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/80 dark:bg-white/90 text-white dark:text-black px-4 py-1.5 text-xs font-mono font-bold shadow-lg">
            <span className={`h-2 w-2 rounded-full ${countdown <= 10 ? "bg-red-500 animate-pulse" : "bg-emerald-400"}`} />
            {countdown}s
          </div>
        </div>
        <p className="mt-8 font-mono text-sm font-bold tracking-tight bg-slate-100 dark:bg-white/10 px-4 py-2 rounded-full">{url}</p>
        <div className="mt-6 flex gap-3">
          <button onClick={download} className="h-11 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black px-6 text-sm font-semibold">Download PNG</button>
          <button onClick={loadQR} disabled={loading} className="h-11 rounded-full border border-slate-200 dark:border-white/10 px-6 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-white/5">Regenerate</button>
          <button onClick={() => window.print()} className="h-11 rounded-full border border-slate-200 dark:border-white/10 px-6 text-sm font-semibold">Print QR</button>
        </div>
      </div>
      <div className="lg:w-[380px] bg-slate-50 dark:bg-white/[0.02] border-l border-slate-200 dark:border-white/5 p-6 space-y-6">
        <div className="rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 p-5">
          <p className="font-semibold">Instructions for projector</p>
          <ol className="mt-3 space-y-3 text-sm list-decimal list-inside text-slate-600 dark:text-slate-400">
            <li>Open this page on classroom computer connected to projector</li>
            <li>Make QR fullscreen with F11</li>
            <li>Students scan with phone camera (no app needed)</li>
            <li>Uploads appear instantly on dashboard via Socket.IO</li>
            <li>Present files directly from dashboard → Present mode</li>
          </ol>
        </div>
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4">
          <p className="font-bold text-sm text-amber-800 dark:text-amber-200">⏱ Token expires in {countdown}s</p>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">QR auto-refreshes. Each token is valid for 5 minutes — students must scan while active.</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-5 text-white">
          <p className="font-bold">Tips for smooth class</p>
          <p className="text-xs opacity-80 mt-2 leading-5">• Set upload deadline in Settings to auto-lock after class start<br/>• Use filter by Section to present team wise<br/>• Rename files to standard format: RollNo_Subject<br/>• Delete permanently removes from Cloudinary + DB</p>
        </div>
      </div>
    </div>
  );
}
