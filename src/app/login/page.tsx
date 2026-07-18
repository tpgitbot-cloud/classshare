"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ToastContainer, { showToast } from "@/components/Toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // if already logged in
    fetch("/api/auth/me")
      .then((r) => {
        if (r.ok) router.push("/dashboard");
      })
      .catch(() => {});
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token);
      showToast("Login successful • Redirecting to dashboard", "success");
      setTimeout(() => router.push("/dashboard"), 600);
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbff] dark:bg-[#050508] flex">
      <div className="flex-1 hidden lg:flex relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-indigo-700 to-fuchsia-700 opacity-90" />
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute -top-24 -left-24 h-[500px] w-[500px] rounded-full bg-white/10 blur-[60px]" />
        <div className="absolute -bottom-24 -right-24 h-[600px] w-[600px] rounded-full bg-violet-400/20 blur-[80px]" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">C</div>
              <div>
                <p className="font-display font-bold text-lg leading-none">ClassShare</p>
                <p className="text-[10px] uppercase tracking-widest opacity-70">Classroom OS</p>
              </div>
            </Link>
          </div>
          <div>
            <h2 className="font-display text-[44px] font-bold leading-[0.95] tracking-tight">Manage every classroom presentation <span className="text-violet-200">from one place.</span></h2>
            <div className="mt-8 space-y-4">
              <div className="flex gap-3">
                <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">✓</span>
                <p className="text-sm leading-6 opacity-80">RBAC Super Admin / Admin • JWT + bcrypt • Protected routes • Rate limiting</p>
              </div>
              <div className="flex gap-3">
                <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">✓</span>
                <p className="text-sm leading-6 opacity-80">Real-time Socket.IO dashboard updates when students upload</p>
              </div>
              <div className="flex gap-3">
                <span className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">✓</span>
                <p className="text-sm leading-6 opacity-80">Cloudinary folders: ClassShare/Dept/Year/Section/Subject with purge on delete</p>
              </div>
            </div>
            <div className="mt-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
              <div>
                <p className="text-sm font-semibold">“ClassShare removed USB chaos completely. Our 3rd year ECE now runs 12 presentations per day with zero friction.”</p>
                <p className="text-xs opacity-60 mt-1">Prof. Kumar • ECE Dept, 2024</p>
              </div>
            </div>
          </div>
          <div className="text-xs opacity-50">© {new Date().getFullYear()} ClassShare • Render deployment ready</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold">C</div>
            <span className="font-display font-bold text-xl">ClassShare</span>
          </div>

          <div>
            <h1 className="font-display text-[30px] font-bold tracking-tight">Admin login</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Secure access for Teachers & Class Representatives. Super Admin can manage admins.</p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Username or Email</label>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username or email" className="mt-2 w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" required />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Password</label>
                <button type="button" onClick={() => setShow(!show)} className="text-xs text-violet-600 dark:text-violet-400 font-semibold">{show ? "Hide" : "Show"}</button>
              </div>
              <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="mt-2 w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20" required />
            </div>

            <button disabled={loading} type="submit" className="w-full h-[48px] rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-sm shadow-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white dark:border-black/20 dark:border-t-black animate-spin" /> Signing in…</> : "Sign in to dashboard →"}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Secure • JWT • bcrypt • Helmet • CORS</span>
              <Link href="/" className="font-semibold text-slate-900 dark:text-white hover:underline">Back Home</Link>
            </div>
          </form>

          <div className="mt-8 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3">
              <p className="font-display font-bold text-lg">RBAC</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Super / Admin</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3">
              <p className="font-display font-bold text-lg">JWT</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Secure Auth</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 p-3">
              <p className="font-display font-bold text-lg">Live</p>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Socket.IO</p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
