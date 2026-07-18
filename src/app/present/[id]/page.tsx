"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { showToast } from "@/components/Toast";

export default function PresentPage() {
  const { id } = useParams<{ id: string }>();
  const [upload, setUpload] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/uploads/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.upload) setUpload(d.upload);
        setLoading(false);
      });
  }, [id]);

  const markCompleted = async () => {
    const res = await fetch(`/api/uploads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
      body: JSON.stringify({ presentationStatus: "completed" }),
    });
    if (res.ok) {
      showToast("Marked as completed", "success");
      setUpload({ ...upload, presentationStatus: "completed" });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading presentation…</div>;
  if (!upload) return <div className="min-h-screen flex items-center justify-center bg-black text-white">File not found • <Link href="/dashboard" className="ml-2 underline">Back</Link></div>;

  const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(upload.fileType.toLowerCase());
  const isPdf = upload.fileType.toLowerCase() === "pdf";

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col">
      <header className="h-[64px] border-b border-white/10 flex items-center justify-between px-6 bg-black/50 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10">←</Link>
          <div>
            <p className="font-semibold text-sm">{upload.displayFileName}</p>
            <p className="text-xs opacity-60">{upload.studentName} • {upload.registerNumber} • {upload.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${upload.presentationStatus === "completed" ? "bg-emerald-500 text-white" : "bg-amber-500 text-black"}`}>{upload.presentationStatus.toUpperCase()}</span>
          <a href={upload.cloudinaryUrl} target="_blank" className="h-9 rounded-full bg-white text-black px-4 text-xs font-bold flex items-center">Open Original ↗</a>
          <button onClick={markCompleted} className="h-9 rounded-full bg-violet-600 px-4 text-xs font-bold">Mark Completed</button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-[1200px] h-[calc(100vh-96px)] rounded-[20px] bg-white dark:bg-[#12121a] overflow-hidden shadow-2xl border border-white/10">
          {isImage ? (
            <img src={upload.cloudinaryUrl} alt={upload.displayFileName} className="h-full w-full object-contain bg-[#0a0a0f]" />
          ) : isPdf ? (
            <iframe src={upload.cloudinaryUrl} className="h-full w-full" title={upload.displayFileName} />
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-[#0f0f16] text-slate-900 dark:text-white">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">{upload.fileType.toUpperCase()}</div>
              <h2 className="font-display text-[28px] font-bold mt-6">{upload.displayFileName}</h2>
              <p className="text-sm text-slate-500 mt-2 max-w-[480px]">This file type ({upload.fileType.toUpperCase()}) cannot be previewed inline. Download to present using PowerPoint / Word, or open original in Cloudinary.</p>
              <div className="mt-6 flex gap-3">
                <a href={upload.cloudinaryUrl} download={upload.originalFileName} className="h-11 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black px-6 text-sm font-semibold flex items-center">Download {upload.originalFileName} ⬇</a>
                <button onClick={() => window.open(upload.cloudinaryUrl, "_blank")} className="h-11 rounded-full border border-slate-200 dark:border-white/10 px-6 text-sm font-semibold">Open in new tab</button>
              </div>
              <p className="mt-8 text-[11px] text-slate-400">Cloudinary URL: {upload.cloudinaryUrl} • Public ID: {upload.cloudinaryPublicId} • Size: {(upload.fileSize / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
      </main>

      <div className="h-[48px] border-t border-white/10 flex items-center justify-between px-6 text-xs opacity-60">
        <span>ClassShare Presentation Mode • Press ESC or ← to go back • Stored in Cloudinary folder: ClassShare/{upload.department}/{upload.year}/{upload.section}/{upload.subject}</span>
        <span>{new Date(upload.uploadDate).toLocaleString()} • {upload.fileType.toUpperCase()}</span>
      </div>
    </div>
  );
}
