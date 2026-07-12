"use client";

import { useEffect, useRef } from "react";

/**
 * Пишет одно событие чтения для владельца: фиксирует, что статья открыта,
 * и максимальный доскролл. Отправляет один раз — при доскролле до 90%
 * или через 15с пребывания, что раньше.
 */
export function ReadTracker({ slug }: { slug: string }) {
  const sent = useRef(false);
  const maxPct = useRef(0);

  useEffect(() => {
    function send() {
      if (sent.current) return;
      sent.current = true;
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, scroll_pct: maxPct.current }),
        keepalive: true,
      }).catch(() => {});
    }

    function onScroll() {
      const el = document.documentElement;
      const scrollable = el.scrollHeight - el.clientHeight;
      const pct = scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 100;
      maxPct.current = Math.max(maxPct.current, Math.round(pct));
      if (maxPct.current >= 90) send();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    const timer = setTimeout(send, 15000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
      send();
    };
  }, [slug]);

  return null;
}
