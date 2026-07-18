import Link from "next/link";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbfbff] dark:bg-[#050508] text-slate-900 dark:text-white">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-violet-400/30 via-fuchsia-400/20 to-indigo-400/30 blur-[80px]" />
        <div className="absolute top-1/2 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-400/20 via-cyan-400/20 to-violet-400/30 blur-[80px]" />
        <div className="absolute -bottom-32 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-t from-violet-100/50 to-transparent dark:from-violet-950/20 blur-[60px]" />
      </div>
      <div className="absolute inset-0 grid-pattern opacity-[0.4] dark:opacity-[0.2]" />

      {/* Nav */}
      <header className="relative z-50 border-b border-slate-200/50 dark:border-white/5 backdrop-blur-xl bg-white/60 dark:bg-black/20">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/20">
              <span className="font-display text-[18px] font-bold text-white">C</span>
            </div>
            <div>
              <p className="font-display text-[17px] font-bold leading-none tracking-tight">ClassShare</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Classroom OS</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#how" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">How it works</a>
            <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">Features</a>
            <a href="#security" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition">Security</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden md:inline-flex h-10 items-center justify-center rounded-full px-5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition">
              Admin Login
            </Link>
            <Link href="/upload" className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-slate-900 dark:bg-white px-5 text-sm font-semibold text-white dark:text-black shadow-lg hover:opacity-90 transition">
              <span className="hidden sm:inline">Student Upload</span>
              <span className="sm:hidden">Upload</span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 dark:bg-black/10 text-[12px]">↗</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10">
        <section className="mx-auto max-w-[1280px] px-6 lg:px-8 pt-14 lg:pt-20 pb-16">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-6 items-center">
            {/* Left */}
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-900/50 bg-violet-50 dark:bg-violet-950/30 px-3 py-1 text-xs font-semibold text-violet-700 dark:text-violet-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-600"></span>
                </span>
                Live classroom sync enabled — Socket.IO real-time
              </div>
              <h1 className="font-display mt-6 text-[42px] sm:text-[54px] lg:text-[68px] font-[800] leading-[0.9] tracking-[-0.03em]">
                <span className="block">Presentations</span>
                <span className="block bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">without chaos.</span>
              </h1>
              <p className="mt-6 max-w-[560px] text-[17px] leading-7 text-slate-600 dark:text-slate-400 font-[450]">
                Students scan a QR code from the projector and upload instantly. Teachers manage, preview and present from one dashboard. No emails. No USB sticks. No lost files.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/upload?src=qr" className="group inline-flex h-[48px] items-center gap-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-7 text-[15px] font-semibold text-white shadow-[0_12px_24px_rgba(124,58,237,0.3)] hover:shadow-[0_16px_32px_rgba(124,58,237,0.4)] transition-all hover:translate-y-[-1px]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M17 14v3h3M14 17h3M21 14v3M21 21v-3M14 21h3"/></svg>
                  </span>
                  Scan & Upload as Student
                  <span className="transition group-hover:translate-x-0.5">→</span>
                </Link>
                <Link href="/login" className="inline-flex h-[48px] items-center justify-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-7 text-[15px] font-semibold hover:bg-slate-50 dark:hover:bg-white/10 transition">
                  Open Admin Dashboard
                </Link>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6 max-w-[520px] border-t border-slate-200 dark:border-white/10 pt-8">
                <div>
                  <p className="font-display text-[28px] font-bold leading-none">2.4s</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500">Avg upload</p>
                </div>
                <div>
                  <p className="font-display text-[28px] font-bold leading-none">Zero</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500">USB needed</p>
                </div>
                <div>
                  <p className="font-display text-[28px] font-bold leading-none">100%</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500">On projector</p>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 rounded-full border-2 border-white dark:border-black bg-gradient-to-br from-amber-400 to-orange-500" />
                  <div className="h-8 w-8 rounded-full border-2 border-white dark:border-black bg-gradient-to-br from-violet-400 to-indigo-500" />
                  <div className="h-8 w-8 rounded-full border-2 border-white dark:border-black bg-gradient-to-br from-emerald-400 to-cyan-500" />
                </div>
                <span><b className="text-slate-900 dark:text-white font-semibold">1,200+</b> classrooms trust ClassShare</span>
              </div>
            </div>

            {/* Right visual - Mock dashboard & QR */}
            <div className="relative lg:h-[640px]">
              {/* Projector screen mock */}
              <div className="relative mx-auto w-full max-w-[520px] lg:absolute lg:right-0 lg:top-0 lg:w-[110%]">
                <div className="relative rounded-[24px] border border-slate-200 dark:border-white/10 bg-white dark:bg-[#12121a] p-3 shadow-[0_24px_64px_rgba(0,0,0,0.12)]">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 px-3 pb-3">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-red-400" />
                      <span className="h-3 w-3 rounded-full bg-yellow-400" />
                      <span className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="ml-3 flex items-center gap-2 text-xs text-slate-500">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Presentation — ECE 3A — CN Lab
                    </div>
                  </div>

                  <div className="grid grid-cols-[1.3fr_0.7fr] gap-3 p-3">
                    <div className="rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Uploaded files (12)</p>
                        <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">LIVE</span>
                      </div>
                      <div className="mt-3 space-y-2.5">
                        {[
                          { name: "CN_Notes_Rajesh.pdf", status: "pending", color: "from-red-500 to-orange-500" },
                          { name: "OS_PPT_Anu.pptx", status: "completed", color: "from-orange-400 to-amber-500" },
                          { name: "DBMS_Assignment.docx", status: "pending", color: "from-violet-500 to-indigo-500" },
                          { name: "Network_Diagram.png", status: "pending", color: "from-emerald-500 to-cyan-500" },
                        ].map((f, i) => (
                          <div key={i} className="flex items-center gap-3 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/5 p-2.5">
                            <div className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${f.color} flex items-center justify-center text-white font-bold text-xs`}>{f.name[0]}</div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[13px] font-medium">{f.name}</p>
                              <p className="text-[11px] text-slate-500">E203 • 2 min ago</p>
                            </div>
                            <span className={`h-2 w-2 rounded-full ${f.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-black p-4 text-center">
                        <p className="text-[11px] font-bold uppercase tracking-widest opacity-70">Scan to upload</p>
                        <div className="mx-auto mt-3 h-[110px] w-[110px] rounded-xl bg-white dark:bg-black p-2">
                          <div className="h-full w-full rounded-lg bg-[radial-gradient(#000_1px,transparent_1px)] dark:bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:8px_8px] opacity-80" />
                        </div>
                        <p className="mt-2 font-display text-[13px] font-semibold leading-tight">classshare.app/u</p>
                        <p className="text-[10px] opacity-60 mt-0.5">No login required</p>
                      </div>
                      <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white">
                        <p className="text-[11px] font-semibold uppercase tracking-widest opacity-80">Storage used</p>
                        <p className="font-display mt-1 text-[22px] font-bold">4.2 GB</p>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-white/20"><div className="h-full w-[68%] rounded-full bg-white" /></div>
                        <p className="mt-1.5 text-[10px] opacity-70">68% of 6GB • Auto-cleanup off</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute -left-6 top-[40%] hidden lg:flex items-center gap-2 rounded-full bg-white dark:bg-[#1e1e2a] border border-slate-200 dark:border-white/10 px-3 py-2 shadow-xl animate-float">
                  <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">✓</div>
                  <div>
                    <p className="text-xs font-semibold leading-none">Upload received</p>
                    <p className="text-[10px] text-slate-500">Rajesh • E203</p>
                  </div>
                </div>
                <div className="absolute -right-4 bottom-[18%] hidden lg:flex items-center gap-2 rounded-full bg-white dark:bg-[#1e1e2a] border border-slate-200 dark:border-white/10 px-3 py-2 shadow-xl animate-float" style={{ animationDelay: '1.5s' }}>
                  <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs">▶</div>
                  <div>
                    <p className="text-xs font-semibold leading-none">Presenting now</p>
                    <p className="text-[10px] text-slate-500">CN_Notes.pdf</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-16">
          <div className="rounded-[32px] border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-white/[0.02] backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <div className="p-8 lg:p-12">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Workflow built for classrooms</p>
                <h2 className="font-display mt-3 text-[30px] leading-[1.1] font-bold tracking-tight">From QR scan to projection <br />in under 5 seconds.</h2>
                <div className="mt-8 space-y-6">
                  {[
                    { n: "01", title: "Teacher opens dashboard", desc: "Projector shows QR code automatically. No setup. Link never expires but can be rotated." },
                    { n: "02", title: "Student scans & uploads", desc: "Mobile-first upload page. Drag & drop, progress bar, file validation. Zero account needed." },
                    { n: "03", title: "Live sync & present", desc: "Socket.IO pushes file instantly to classroom PC. Preview, present fullscreen, mark done." },
                  ].map((s) => (
                    <div key={s.n} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-display font-bold text-sm">{s.n}</div>
                      <div>
                        <p className="font-semibold text-[15px]">{s.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex items-center gap-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4">
                  <div className="h-9 w-9 rounded-full bg-amber-500 flex items-center justify-center text-white">⚡</div>
                  <p className="text-[13px] leading-5 text-amber-900 dark:text-amber-200"><b>Deadline enforcement:</b> Uploads auto-lock after deadline. Duplicate detection prevents overwriting unless allowed.</p>
                </div>
              </div>
              <div className="relative bg-slate-50 dark:bg-[#0d0d14] p-8 lg:p-12 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-white/10">
                <div className="absolute inset-0 grid-pattern opacity-30" />
                <div className="relative">
                  <p className="font-display text-sm font-bold uppercase tracking-widest">Student Upload Experience</p>
                  <div className="mt-5 rounded-[20px] bg-white dark:bg-[#16161f] border border-slate-200 dark:border-white/10 shadow-xl p-4 max-w-[380px] mx-auto">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" /> Upload Portal • ECE 3A
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3">
                          <p className="text-[10px] uppercase tracking-widest text-slate-500">Full Name</p>
                          <p className="mt-1 text-sm font-medium">Rajesh Kumar</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 dark:border-white/10 p-3">
                          <p className="text-[10px] uppercase tracking-widest text-slate-500">Reg No</p>
                          <p className="mt-1 text-sm font-medium">20ECE305</p>
                        </div>
                      </div>
                      <div className="rounded-xl border-2 border-dashed border-violet-300 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20 p-6 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white">↑</div>
                        <p className="mt-3 text-sm font-semibold">Drop your presentation here</p>
                        <p className="text-xs text-slate-500 mt-1">PDF, PPTX, DOCX, ZIP up to 50MB</p>
                        <div className="mt-4 h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden"><div className="h-full w-[78%] rounded-full bg-violet-600" /></div>
                        <p className="mt-2 text-xs font-medium">Uploading... 78%</p>
                      </div>
                      <div className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black p-3 flex items-center justify-between">
                        <span className="text-sm font-medium">CN_Presentation_Final.pptx</span>
                        <span className="text-xs opacity-70">12.4 MB</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-center gap-2 text-[11px] font-medium text-slate-500">
                    <span className="rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-1">Drag & Drop</span>
                    <span className="rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-1">Replace before deadline</span>
                    <span className="rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 px-3 py-1">Dark mode</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-[1280px] px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { title: "No student account — just scan", desc: "Frictionless mobile upload with validation, duplicate detection, and rename before deadline.", icon: "📱", grad: "from-violet-600 to-indigo-600" },
              { title: "Teacher controls everything", desc: "Preview, present fullscreen, download original name, rename, delete with Cloudinary purge, mark completed.", icon: "🎓", grad: "from-fuchsia-600 to-pink-600" },
              { title: "Built for real classrooms", desc: "RBAC Super Admin / Admin, deadlines, storage meters, real-time Socket.IO, secure JWT + bcrypt.", icon: "🏫", grad: "from-blue-600 to-cyan-600" },
            ].map((f) => (
              <div key={f.title} className="group relative rounded-[20px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-6 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.grad} text-white text-xl shadow-lg`}>{f.icon}</div>
                <h3 className="font-display mt-4 text-[16px] font-bold">{f.title}</h3>
                <p className="mt-2 text-[13px] leading-6 text-slate-600 dark:text-slate-400">{f.desc}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500">Learn more <span className="group-hover:translate-x-0.5 transition">→</span></div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-[1280px] px-6 lg:px-8 py-16">
          <div className="relative overflow-hidden rounded-[28px] bg-slate-900 dark:bg-white text-white dark:text-black p-8 lg:p-12">
            <div className="absolute -right-20 -top-20 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-violet-600/40 to-indigo-600/40 blur-[60px]" />
            <div className="relative grid lg:grid-cols-[1.2fr_0.8fr] gap-8 items-center">
              <div>
                <h3 className="font-display text-[28px] lg:text-[36px] font-bold leading-[1.1] tracking-tight">Ready to fix classroom file chaos for good?</h3>
                <p className="mt-3 text-[15px] leading-6 opacity-70 max-w-[520px]">Deploy in 2 minutes. Frontend on Render Static, Backend on Render Web Service. Cloudinary folders auto-organized by Dept/Year/Section/Subject.</p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link href="/upload?src=qr" className="inline-flex h-12 items-center justify-center rounded-full bg-white dark:bg-black text-black dark:text-white px-7 text-sm font-bold shadow-xl hover:opacity-90 transition">Start Uploading →</Link>
                <Link href="/login" className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-sm font-semibold hover:bg-white/10 transition">Admin Login</Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200/70 dark:border-white/5 py-8 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ClassShare • Built with Next.js, PostgreSQL, Cloudinary, Socket.IO • Production-ready MVC</p>
          <p className="mt-1">Secure classroom file management • No demo credentials displayed</p>
        </footer>
      </main>
    </div>
  );
}
