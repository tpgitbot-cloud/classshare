"use client";
import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";
export type ToastMsg = { id: number; message: string; type: ToastType };

let toastCounter = 0;
let listeners: ((toasts: ToastMsg[]) => void)[] = [];
let toasts: ToastMsg[] = [];

function notifyListeners() {
  listeners.forEach((l) => l([...toasts]));
}

export function showToast(message: string, type: ToastType = "success") {
  const id = ++toastCounter;
  toasts = [...toasts, { id, message, type }];
  notifyListeners();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  }, 3500);
}

export default function ToastContainer() {
  const [items, setItems] = useState<ToastMsg[]>([]);
  useEffect(() => {
    const fn = (t: ToastMsg[]) => setItems(t);
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto animate-slide-in flex items-center gap-3 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-xl border text-sm font-medium min-w-[300px]
            ${t.type === "success" ? "bg-emerald-600 text-white border-emerald-500" : ""}
            ${t.type === "error" ? "bg-red-600 text-white border-red-500" : ""}
            ${t.type === "info" ? "bg-slate-900 dark:bg-white text-white dark:text-black border-slate-800 dark:border-white" : ""}
          `}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs">
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "i"}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
