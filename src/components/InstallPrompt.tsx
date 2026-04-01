"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("pwa-dismissed")) { setDismissed(true); return; }
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e as BeforeInstallPromptEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-lg mx-auto">
      <div className="bg-gray-900 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3 shadow-lg shadow-black/50">
        <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Install Side Hustle Tracker</p>
          <p className="text-xs text-gray-400">Add to home screen for quick access</p>
        </div>
        <button onClick={async () => { await deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === "accepted") setDeferredPrompt(null); }} className="bg-amber-500 text-black font-semibold rounded-lg px-4 py-2 text-sm hover:bg-amber-400 transition-colors flex-shrink-0">Install</button>
        <button onClick={() => { setDismissed(true); sessionStorage.setItem("pwa-dismissed", "true"); }} className="text-gray-400 hover:text-white flex-shrink-0"><X className="w-4 h-4" /></button>
      </div>
    </div>
  );
}
