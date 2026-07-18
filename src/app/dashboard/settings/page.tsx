"use client";
import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [form, setForm] = useState({ classroomName: "", maxFileSizeMb: 50, uploadDeadline: "" });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setSettings(data.settings);
    setForm({
      classroomName: data.settings.classroomName || "",
      maxFileSizeMb: data.settings.maxFileSizeMb || 50,
      uploadDeadline: data.settings.uploadDeadline ? new Date(data.settings.uploadDeadline).toISOString().slice(0, 16) : "",
    });
    setLoading(false);
  };

  useEffect(() => { fetchSettings(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      body: JSON.stringify({
        classroomName: form.classroomName,
        maxFileSizeMb: form.maxFileSizeMb,
        uploadDeadline: form.uploadDeadline ? new Date(form.uploadDeadline).toISOString() : null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Settings updated", "success");
      fetchSettings();
    } else {
      showToast(data.error || "Failed", "error");
    }
  };

  if (loading) return <div className="p-8">Loading settings…</div>;

  return (
    <div className="p-5 lg:p-8 space-y-6 max-w-[720px]">
      <div>
        <h1 className="font-display text-[26px] font-bold">Application Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Super Admin only • Controls upload behavior for entire classroom.</p>
      </div>

      <form onSubmit={save} className="rounded-[20px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-6 space-y-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Classroom Name</label>
          <input value={form.classroomName} onChange={(e) => setForm({ ...form, classroomName: e.target.value })} placeholder="ECE 3A - Computer Networks Lab" className="mt-2 w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-sm" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Max File Size (MB)</label>
          <input type="number" value={form.maxFileSizeMb} onChange={(e) => setForm({ ...form, maxFileSizeMb: parseInt(e.target.value) })} min={1} max={200} className="mt-2 w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-sm" />
          <p className="mt-1.5 text-xs text-slate-500">Applied to all future uploads • Cloudinary handles storage</p>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Upload Deadline (optional)</label>
          <input type="datetime-local" value={form.uploadDeadline} onChange={(e) => setForm({ ...form, uploadDeadline: e.target.value })} className="mt-2 w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-sm" />
          <p className="mt-1.5 text-xs text-slate-500">After this time, student uploads will be blocked with “Deadline passed” error. Leave empty for no deadline.</p>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 text-xs space-y-1">
          <p><b>Storage Used:</b> {settings.storageUsed ? (settings.storageUsed / 1024 / 1024).toFixed(2) + " MB" : "0 MB"}</p>
          <p><b>Cloudinary Folder Structure:</b> ClassShare/Department/Year/Section/Subject/</p>
          <p><b>Allowed Types:</b> {settings.allowedFileTypes}</p>
        </div>

        <button type="submit" className="w-full h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-semibold">Save Settings</button>
      </form>

      <div className="rounded-[20px] bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-5">
        <p className="font-semibold text-sm text-amber-900 dark:text-amber-200">Render Deployment Notes</p>
        <ul className="mt-2 text-xs text-amber-800 dark:text-amber-300 list-disc list-inside leading-6">
          <li>Frontend: Render Static Site → Build: npm run build → Publish: .next or out (Next.js)</li>
          <li>Backend: Render Web Service → Build: npm install → Start: npm start → Env: DATABASE_URL, JWT_SECRET, CLOUDINARY_*, CLIENT_URL</li>
          <li>Enable CORS in backend for CLIENT_URL • Use Postgres connection string from Render</li>
          <li>Cloudinary: create account, get cloud_name/api_key/api_secret, set folders auto-creation</li>
        </ul>
      </div>
    </div>
  );
}
