"use client";

import { useState } from "react";
import { Share2, Check, Loader2 } from "lucide-react";

type State = "idle" | "loading" | "copied" | "error";

/** Кнопка для владельца: берёт секретную ссылку на статью и копирует в буфер. */
export function ShareButton({ slug }: { slug: string }) {
  const [state, setState] = useState<State>("idle");
  const [url, setUrl] = useState("");

  async function share() {
    setState("loading");
    try {
      const res = await fetch(`/api/share?slug=${encodeURIComponent(slug)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUrl(data.url);
      await navigator.clipboard.writeText(data.url).catch(() => {});
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  return (
    <div className="share">
      <button type="button" className="share__btn" onClick={share} disabled={state === "loading"}>
        {state === "loading" ? (
          <Loader2 className="spin" size={14} />
        ) : state === "copied" ? (
          <Check size={14} />
        ) : (
          <Share2 size={14} />
        )}
        {state === "copied" ? "ссылка скопирована" : "Поделиться без пароля"}
      </button>
      {url && state === "copied" && <span className="share__url">{url}</span>}
    </div>
  );
}
