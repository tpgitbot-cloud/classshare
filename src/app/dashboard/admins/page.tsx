"use client";
import { useEffect, useState } from "react";
import { showToast } from "@/components/Toast";

type Admin = {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  status: string;
  createdAt: string;
  lastLogin: string | null;
};

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", role: "admin" });
  const [editing, setEditing] = useState<string | null>(null);

  const fetchAdmins = async () => {
    const res = await fetch("/api/admins", { headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } });
    if (res.ok) {
      const data = await res.json();
      setAdmins(data.admins);
    } else {
      showToast("Forbidden - Super Admin only", "error");
    }
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/admins/${editing}` : "/api/admins";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      showToast(editing ? "Admin updated" : "Admin created", "success");
      setForm({ name: "", email: "", username: "", password: "", role: "admin" });
      setEditing(null);
      fetchAdmins();
    } else {
      showToast(data.error || "Failed", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this admin account?")) return;
    const res = await fetch(`/api/admins/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` } });
    if (res.ok) {
      showToast("Admin deleted", "success");
      fetchAdmins();
    } else {
      const data = await res.json();
      showToast(data.error || "Failed", "error");
    }
  };

  const toggleStatus = async (admin: Admin) => {
    const newStatus = admin.status === "active" ? "inactive" : "active";
    const res = await fetch(`/api/admins/${admin.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      showToast(`Status: ${newStatus}`, "success");
      fetchAdmins();
    }
  };

  return (
    <div className="p-5 lg:p-8 space-y-6">
      <div>
        <h1 className="font-display text-[26px] font-bold">Admin Management</h1>
        <p className="text-sm text-slate-500 mt-1">Super Admin can create, edit, delete, activate/deactivate, reset passwords.</p>
      </div>

      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <div className="rounded-[20px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-5 h-fit">
          <h3 className="font-semibold text-sm">{editing ? "Edit Admin" : "Create Admin"}</h3>
          <form onSubmit={handleCreate} className="mt-4 space-y-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-sm" required />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-sm" required />
            <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Username" className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-sm" required />
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editing ? "New password (leave empty to keep)" : "Password"} type="password" className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-sm" required={!editing} />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full h-11 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a23] px-4 text-sm">
              <option value="admin">Admin (Teacher / CR)</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <button type="submit" className="w-full h-11 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-sm">{editing ? "Update Admin" : "Create Admin"}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: "", email: "", username: "", password: "", role: "admin" }); }} className="w-full h-11 rounded-full border border-slate-200 dark:border-white/10 font-semibold text-sm">Cancel Edit</button>}
          </form>
          <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 text-xs text-amber-800 dark:text-amber-200">
            Passwords hashed with bcrypt (12 rounds) • JWT 7d expiry • Status active/inactive controls login.
          </div>
        </div>

        <div className="rounded-[20px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-white/10"><h3 className="font-semibold">Admins ({admins.length})</h3></div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-white/5 text-[11px] uppercase tracking-widest text-slate-500">
                <tr><th className="px-5 py-3">Admin</th><th className="px-3 py-3">Role</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Last Login</th><th className="px-5 py-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {loading ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading…</td></tr> : admins.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <p className="font-medium">{a.name}</p>
                      <p className="text-xs text-slate-500">{a.email} • @{a.username}</p>
                    </td>
                    <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${a.role === "super_admin" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}>{a.role}</span></td>
                    <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${a.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{a.status}</span></td>
                    <td className="px-3 py-3 text-xs text-slate-500">{a.lastLogin ? new Date(a.lastLogin).toLocaleString() : "Never"}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditing(a.id); setForm({ name: a.name, email: a.email, username: a.username, password: "", role: a.role }); }} className="h-7 w-7 rounded-full border flex items-center justify-center hover:bg-slate-50 text-xs">✎</button>
                        <button onClick={() => toggleStatus(a)} className="h-7 px-2 rounded-full border text-[10px] font-semibold hover:bg-slate-50">{a.status === "active" ? "Deactivate" : "Activate"}</button>
                        <button onClick={() => handleDelete(a.id)} className="h-7 w-7 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 text-xs">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
