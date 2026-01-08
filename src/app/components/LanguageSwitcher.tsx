"use client";

import { useTransition } from "react";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();

  const switchLocale = (locale: string) => {
    startTransition(() => {
      document.cookie = `locale=${locale};path=/;max-age=31536000`;
      window.location.reload();
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Globe className="w-4 h-4 text-zinc-400" />
      <button
        onClick={() => switchLocale("fr")}
        disabled={isPending}
        className="px-2 py-1 text-sm text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-50"
      >
        FR
      </button>
      <span className="text-zinc-600">|</span>
      <button
        onClick={() => switchLocale("en")}
        disabled={isPending}
        className="px-2 py-1 text-sm text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-50"
      >
        EN
      </button>
    </div>
  );
}
