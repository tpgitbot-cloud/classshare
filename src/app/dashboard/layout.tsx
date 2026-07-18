"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import ToastContainer from "@/components/Toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) throw new Error("unauthorized");
        return r.json();
      })
      .then((d) => {
        setAdmin(d.admin);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbff] dark:bg-[#050508]">
        <div className="text-center">
          <div className="h-10 w-10 rounded-full border-2 border-slate-200 border-t-violet-600 animate-spin mx-auto" />
          <p className="mt-3 text-sm text-slate-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const nav = [
    { href: "/dashboard", label: "Overview", icon: "◧", active: pathname === "/dashboard" },
    { href: "/dashboard/files", label: "Files Manager", icon: "◨", active: pathname.includes("/files") },
    { href: "/dashboard/qr", label: "QR Display", icon: "◪", active: pathname.includes("/qr") },
    ...(admin?.role === "super_admin" ? [{ href: "/dashboard/admins", label: "Admins", icon: "◫", active: pathname.includes("/admins") }] : []),
    ...(admin?.role === "super_admin" ? [{ href: "/dashboard/settings", label: "Settings", icon: "⚙", active: pathname.includes("/settings") }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#f8f9ff] dark:bg-[#050508] text-slate-900 dark:text-white flex">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-[280px] shrink-0 flex-col border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0a0f]">
        <div className="h-[72px] flex items-center gap-3 px-6 border-b border-slate-200 dark:border-white/5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold">C</div>
          <div className="flex-1">
            <p className="font-display font-bold leading-none">ClassShare</p>
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Classroom OS</p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${admin.role === "super_admin" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300"}`}>{admin.role === "super_admin" ? "SUPER" : "ADMIN"}</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${n.active ? "bg-slate-900 dark:bg-white text-white dark:text-black shadow" : "hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400"}`}>
              <span className="text-base">{n.icon}</span> {n.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/5">
          <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">{admin.name[0]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{admin.name}</p>
              <p className="text-xs text-slate-500 truncate">{admin.email}</p>
            </div>
          </div>
          <button onClick={logout} className="mt-3 w-full h-9 rounded-full border border-slate-200 dark:border-white/10 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-white/5">Sign out</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden h-[64px] flex items-center justify-between px-5 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a0a0f] sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="h-9 w-9 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center">☰</button>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold">C</div>
            <span className="font-display font-bold">ClassShare</span>
          </div>
          <button onClick={logout} className="h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black px-3 text-xs font-semibold">Logout</button>
        </header>

        {/* Mobile sidebar drawer */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="w-[280px] bg-white dark:bg-[#0a0a0f] border-r border-slate-200 dark:border-white/5 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold">Menu</span>
                <button onClick={() => setSidebarOpen(false)} className="h-8 w-8 rounded-full border flex items-center justify-center">✕</button>
              </div>
              <nav className="space-y-1 flex-1">
                {nav.map((n) => (
                  <Link key={n.href} onClick={() => setSidebarOpen(false)} href={n.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${n.active ? "bg-slate-900 text-white" : "text-slate-600"}`}>
                    {n.label}
                  </Link>
                ))}
              </nav>
              <div className="pt-4 border-t text-xs text-slate-500">{admin.email} • {admin.role}</div>
            </div>
            <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
