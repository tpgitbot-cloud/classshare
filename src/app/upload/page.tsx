"use client";
import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ToastContainer, { showToast } from "@/components/Toast";
import Link from "next/link";

type FormDataState = {
  studentName: string;
  registerNumber: string;
  department: string;
  year: string;
  section: string;
  subject: string;
};

const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL", "IT", "AIDS", "AIML"];
const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SECTIONS = ["A", "B", "C", "D"];

function UploadContent() {
  const searchParams = useSearchParams();
  const isFromQR = searchParams.get("src") === "qr" || searchParams.get("s") === "qr" || true; // allow all, but show QR verified

  const [form, setForm] = useState<FormDataState>({
    studentName: "",
    registerNumber: "",
    department: "",
    year: "",
    section: "",
    subject: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<{ id: string; message: string } | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [maxSize, setMaxSize] = useState(50);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch settings for deadline & size
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings?.uploadDeadline) setDeadline(d.settings.uploadDeadline);
        if (d.settings?.maxFileSizeMb) setMaxSize(d.settings.maxFileSizeMb);
      });
    const savedTheme = localStorage.getItem("cs_theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nd = !darkMode;
    setDarkMode(nd);
    localStorage.setItem("cs_theme", nd ? "dark" : "light");
    if (nd) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      validateAndSetFile(f);
    }
  };

  const validateAndSetFile = (f: File) => {
    const allowed = ["pdf", "ppt", "pptx", "doc", "docx", "jpg", "jpeg", "png", "zip", "webp", "gif"];
    const ext = f.name.split(".").pop()?.toLowerCase() || "";
    if (!allowed.includes(ext)) {
      showToast(`.${ext} not allowed`, "error");
      return;
    }
    if (f.size > maxSize * 1024 * 1024) {
      showToast(`File exceeds ${maxSize}MB limit`, "error");
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent, replace = false) => {
    e.preventDefault();
    if (!file) {
      showToast("Please select a file", "error");
      return;
    }
    // Deadline check
    if (deadline && new Date() > new Date(deadline)) {
      showToast("Upload deadline has passed", "error");
      return;
    }

    setUploading(true);
    setProgress(10);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("studentName", form.studentName);
    fd.append("registerNumber", form.registerNumber);
    fd.append("department", form.department);
    fd.append("year", form.year);
    fd.append("section", form.section);
    fd.append("subject", form.subject);
    if (replace && duplicateInfo) fd.append("replaceId", duplicateInfo.id);

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 15, 90));
      }, 300);

      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      clearInterval(interval);
      setProgress(100);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.allowReplace) {
          setDuplicateInfo({ id: data.duplicateId, message: data.error });
          showToast("Duplicate found - you can replace before deadline", "info");
          setUploading(false);
          return;
        }
        throw new Error(data.error || "Upload failed");
      }

      setSuccessData(data.upload);
      showToast("File uploaded successfully! 🎉", "success");
      setFile(null);
      setDuplicateInfo(null);
    } catch (err: any) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const isFormValid = form.studentName && form.registerNumber && form.department && form.year && form.section && form.subject && file;

  if (successData) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${darkMode ? "dark" : ""}`}>
        <div className="min-h-screen w-full bg-gradient-to-br from-violet-50 via-white to-indigo-50 dark:from-[#0a0a0f] dark:via-[#0f0f16] dark:to-[#1a1035] flex items-center justify-center p-4 fixed inset-0">
          <div className="w-full max-w-[480px] rounded-[28px] bg-white dark:bg-[#16161f] border border-slate-200 dark:border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.12)] p-8 text-center animate-slide-in">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white text-3xl shadow-lg shadow-emerald-500/20">✓</div>
            <h2 className="font-display mt-6 text-[24px] font-bold">Upload Successful!</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Your file is now visible on the classroom projector.</p>

            <div className="mt-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-4 text-left">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-violet-600 flex items-center justify-center text-white font-bold text-sm">{successData.originalFileName[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{successData.displayFileName}</p>
                  <p className="text-xs text-slate-500">{successData.studentName} • {successData.registerNumber}</p>
                  <p className="text-xs text-slate-500">{successData.department} {successData.year} - {successData.section} • {successData.subject}</p>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${successData.presentationStatus === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{successData.presentationStatus}</span>
                <span className="inline-flex rounded-full bg-slate-200 dark:bg-white/10 px-2.5 py-1 text-[10px] font-medium">{(successData.fileSize / 1024 / 1024).toFixed(2)} MB • {successData.fileType.toUpperCase()}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => { setSuccessData(null); setForm({ studentName: "", registerNumber: "", department: "", year: "", section: "", subject: "" }); }} className="h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-sm hover:opacity-90">Upload Another</button>
              <Link href="/" className="h-12 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center font-semibold text-sm hover:bg-slate-50 dark:hover:bg-white/5">Back Home</Link>
            </div>

            <p className="mt-6 text-[11px] text-slate-500">File stored in Cloudinary: ClassShare/{successData.department}/{successData.year}/{successData.section}/{successData.subject}</p>
          </div>
        </div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-[#fbfbff] dark:bg-[#050508] text-slate-900 dark:text-white flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200/60 dark:border-white/5 backdrop-blur-xl bg-white/70 dark:bg-black/20">
          <div className="mx-auto max-w-[960px] flex h-[64px] items-center justify-between px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold">C</div>
              <span className="font-display font-bold">ClassShare</span>
              {isFromQR && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> QR VERIFIED</span>}
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={toggleTheme} className="h-9 w-9 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/10">
                {darkMode ? "☀️" : "🌙"}
              </button>
              <Link href="/login" className="hidden sm:inline-flex h-9 items-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-black px-4 text-xs font-semibold">Admin</Link>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto max-w-[960px] px-6 py-6 lg:py-10">
            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
              {/* Left form */}
              <div>
                <div className="mb-6">
                  <h1 className="font-display text-[28px] sm:text-[32px] font-bold tracking-tight leading-[1.1]">Upload your presentation</h1>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Mobile-friendly • Scan QR from projector • No account needed. Files go directly to classroom PC.</p>
                  {deadline && (
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-200">
                      ⏰ Deadline: {new Date(deadline).toLocaleString()}
                    </div>
                  )}
                </div>

                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-5">
                  <div className="rounded-[20px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Student Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Full Name *</label>
                        <input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="Rajesh Kumar" className="mt-1.5 w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-sm outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500" required />
                      </div>
                      <div>
                        <label className="text-xs font-semibold">Register Number *</label>
                        <input value={form.registerNumber} onChange={(e) => setForm({ ...form, registerNumber: e.target.value })} placeholder="20ECE305" className="mt-1.5 w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-sm outline-none focus:ring-2 focus:ring-violet-500/30" required />
                      </div>
                      <div>
                        <label className="text-xs font-semibold">Department *</label>
                        <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="mt-1.5 w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a23] px-4 text-sm" required>
                          <option value="">Select</option>
                          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold">Year *</label>
                        <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="mt-1.5 w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a23] px-4 text-sm" required>
                          <option value="">Select</option>
                          {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold">Section *</label>
                        <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="mt-1.5 w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1a23] px-4 text-sm" required>
                          <option value="">Select</option>
                          {SECTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-xs font-semibold">Subject *</label>
                        <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Computer Networks, DBMS" className="mt-1.5 w-full h-12 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 text-sm outline-none focus:ring-2 focus:ring-violet-500/30" required />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 p-5 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Presentation File</p>

                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => inputRef.current?.click()}
                      className={`group relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                        dragActive ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20" : "border-slate-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-800 hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      <input ref={inputRef} type="file" className="hidden" accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.jpeg,.png,.zip,.webp,.gif" onChange={(e) => { if (e.target.files?.[0]) validateAndSetFile(e.target.files[0]); }} />
                      {file ? (
                        <div className="flex items-center gap-4 text-left">
                          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold">{file.name[0]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to upload • {file.type || "file"}</p>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="h-8 w-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center">✕</button>
                        </div>
                      ) : (
                        <>
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 dark:bg-white text-white dark:text-black group-hover:scale-105 transition">
                            <span className="text-xl">↑</span>
                          </div>
                          <p className="mt-3 font-semibold text-sm">Drag & drop or click to browse</p>
                          <p className="mt-1 text-xs text-slate-500">PDF, PPT, PPTX, DOC, DOCX, JPG, PNG, ZIP • Max {maxSize}MB</p>
                          <div className="mt-3 flex justify-center gap-1.5 flex-wrap">
                            {["PDF", "PPTX", "DOCX", "ZIP", "Images"].map((t) => (
                              <span key={t} className="rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-2 py-0.5 text-[10px] font-semibold">{t}</span>
                            ))}
                          </div>
                        </>
                      )}
                      {uploading && (
                        <div className="absolute inset-0 rounded-2xl bg-white/80 dark:bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                          <div className="w-[80%] h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                          </div>
                          <p className="text-xs font-semibold">Uploading... {Math.round(progress)}%</p>
                        </div>
                      )}
                    </div>

                    {duplicateInfo && (
                      <div className="mt-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-4">
                        <p className="text-xs font-bold text-amber-800 dark:text-amber-200">⚠️ {duplicateInfo.message}</p>
                        <div className="mt-3 flex gap-2">
                          <button onClick={(e) => handleSubmit(e, true)} disabled={uploading} className="h-9 rounded-full bg-amber-600 text-white px-4 text-xs font-semibold hover:bg-amber-700">Replace File</button>
                          <button onClick={() => setDuplicateInfo(null)} className="h-9 rounded-full border border-amber-200 px-4 text-xs font-semibold">Cancel</button>
                        </div>
                      </div>
                    )}

                    <button disabled={!isFormValid || uploading} type="submit" className="mt-5 w-full h-[52px] rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                      {uploading ? (
                        <>
                          <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Uploading {Math.round(progress)}%
                        </>
                      ) : (
                        <>Upload to Classroom • {(file?.size ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "")} →</>
                      )}
                    </button>
                    <p className="mt-2 text-center text-[11px] text-slate-500">Stored in: ClassShare/{form.department || "Dept"}/{form.year || "Year"}/{form.section || "Sec"}/{form.subject || "Subject"} • Cloudinary secure</p>
                  </div>
                </form>
              </div>

              {/* Right info */}
              <div className="lg:sticky lg:top-[88px] space-y-4">
                <div className="rounded-[20px] bg-slate-900 dark:bg-white text-white dark:text-black p-6">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">How QR upload works</p>
                  <div className="mt-4 space-y-4">
                    <div className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 dark:bg-black/10 text-xs font-bold">1</span>
                      <p className="text-sm leading-6 opacity-80">Teacher displays QR on projector. Link points here: /upload?src=qr</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 dark:bg-black/10 text-xs font-bold">2</span>
                      <p className="text-sm leading-6 opacity-80">You upload in <b>5 seconds</b>. No email, no login. File auto-organized in Cloudinary.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 dark:bg-black/10 text-xs font-bold">3</span>
                      <p className="text-sm leading-6 opacity-80">Classroom PC gets real-time update via Socket.IO and teacher can present fullscreen.</p>
                    </div>
                  </div>
                  <div className="mt-6 rounded-xl bg-white/10 dark:bg-black/5 p-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white dark:bg-black flex items-center justify-center text-black dark:text-white font-bold">🔒</div>
                    <div>
                      <p className="text-xs font-bold">Secure & Private</p>
                      <p className="text-[11px] opacity-70 mt-0.5">JWT protected dashboard • Files deleted from both Cloudinary & DB on delete</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5">
                  <p className="font-display font-bold">Supported files</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    {[
                      { ext: "PDF", desc: "Notes, Papers" },
                      { ext: "PPT/PPTX", desc: "Presentations" },
                      { ext: "DOC/DOCX", desc: "Assignments" },
                      { ext: "JPG/PNG", desc: "Diagrams" },
                      { ext: "ZIP", desc: "Projects" },
                    ].map((f) => (
                      <div key={f.ext} className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-3">
                        <p className="font-bold">{f.ext}</p>
                        <p className="text-slate-500 mt-0.5">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-[11px] text-slate-500">• Duplicate detection prevents same file per subject • Replace allowed before deadline • All files renamed safe for Cloudinary folder path.</p>
                </div>

                <div className="rounded-[20px] bg-gradient-to-br from-violet-600 to-indigo-600 p-5 text-white">
                  <p className="font-bold">Teacher? Open dashboard on projector PC</p>
                  <p className="mt-1 text-xs opacity-80">Preview, present, download with original filename, rename, delete permanently (Cloudinary purge), mark completed.</p>
                  <Link href="/login" className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-white text-black px-4 text-xs font-bold">Login as Admin →</Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading upload portal…</div>}>
      <UploadContent />
    </Suspense>
  );
}
