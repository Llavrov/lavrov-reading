"use client";

import { useEffect, useState } from "react";
import { ReadTracker } from "./ReadTracker";
import { FeedbackPanel, type PanelState } from "./FeedbackPanel";

type Status = "checking" | "owner" | "guest";

/**
 * Гейт личного слоя на клиенте: дёргает /api/panel. 401 → гость (ничего не
 * показываем, страница остаётся публичной и статической). 200 → владелец.
 */
export function OwnerZone({
  slug,
  questions,
}: {
  slug: string;
  questions: string[];
}) {
  const [status, setStatus] = useState<Status>("checking");
  const [initial, setInitial] = useState<PanelState | null>(null);
  const [dbReady, setDbReady] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch(`/api/panel?slug=${encodeURIComponent(slug)}`)
      .then(async (r) => {
        if (!alive) return;
        if (r.status === 401) {
          setStatus("guest");
          return;
        }
        const data = await r.json();
        setDbReady(data.dbReady !== false);
        setInitial({
          rating: data.rating,
          thoughts: data.thoughts ?? "",
          answers: data.answers ?? {},
          reads: data.reads ?? { count: 0, last: null },
        });
        setStatus("owner");
      })
      .catch(() => alive && setStatus("guest"));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (status !== "owner" || !initial) return null;

  return (
    <>
      <ReadTracker slug={slug} />
      <FeedbackPanel
        slug={slug}
        questions={questions}
        initial={initial}
        dbReady={dbReady}
      />
    </>
  );
}
