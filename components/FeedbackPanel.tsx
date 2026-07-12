"use client";

import { useCallback, useRef, useState } from "react";
import { Star, BookOpenCheck, Check, Loader2, Lock, Database } from "lucide-react";

export type PanelState = {
  rating: number | null;
  thoughts: string;
  answers: Record<number, string>;
  reads: { count: number; last: string | null };
};

type SaveState = "idle" | "saving" | "saved";

function formatLast(iso: string | null): string {
  if (!iso) return "ещё не читал";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function FeedbackPanel({
  slug,
  questions,
  initial,
  dbReady = true,
}: {
  slug: string;
  questions: string[];
  initial: PanelState;
  dbReady?: boolean;
}) {
  const [state, setState] = useState<PanelState>(initial);
  const [save, setSave] = useState<SaveState>("idle");
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const flash = useCallback(() => {
    setSave("saved");
    setTimeout(() => setSave("idle"), 1500);
  }, []);

  const post = useCallback(
    async (url: string, body: unknown) => {
      if (!dbReady) return; // база не подключена — не делаем вид, что сохранили
      setSave("saving");
      try {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        flash();
      } catch {
        setSave("idle");
      }
    },
    [flash],
  );

  const debounced = useCallback(
    (key: string, fn: () => void, ms = 800) => {
      clearTimeout(timers.current[key]);
      timers.current[key] = setTimeout(fn, ms);
    },
    [],
  );

  const saveFeedback = (next: Partial<Pick<PanelState, "rating" | "thoughts">>) => {
    const merged = { ...state, ...next };
    setState(merged);
    debounced("feedback", () =>
      post("/api/feedback", {
        slug,
        rating: merged.rating,
        thoughts: merged.thoughts,
      }),
    );
  };

  const saveAnswer = (idx: number, value: string) => {
    const answers = { ...state.answers, [idx]: value };
    setState({ ...state, answers });
    debounced(`answer-${idx}`, () =>
      post("/api/answers", { slug, question_idx: idx, answer: value }),
    );
  };

  return (
    <section className="panel" aria-label="Личные заметки">
      <header className="panel__head">
        <div className="panel__head-title">
          <Lock size={14} /> <span>Только ты видишь это</span>
        </div>
        <div className="panel__reads">
          <BookOpenCheck size={15} />
          {state.reads.count > 0
            ? `прочитано ${state.reads.count}× · ${formatLast(state.reads.last)}`
            : "первое чтение"}
        </div>
      </header>

      {!dbReady && (
        <div className="panel__banner">
          <Database size={15} />
          <span>
            База ещё не подключена — можно смотреть, но сохранение выключено.
            Подключи Neon на Vercel.
          </span>
        </div>
      )}

      <div className="panel__block">
        <label className="panel__label">Оценка</label>
        <div className="stars" role="radiogroup" aria-label="Оценка статьи">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`stars__btn ${state.rating && n <= state.rating ? "is-on" : ""}`}
              aria-label={`${n} из 5`}
              aria-checked={state.rating === n}
              role="radio"
              onClick={() => saveFeedback({ rating: n === state.rating ? null : n })}
            >
              <Star size={26} fill={state.rating && n <= state.rating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>

      <div className="panel__block">
        <label className="panel__label" htmlFor="thoughts">
          Твои мысли
        </label>
        <textarea
          id="thoughts"
          className="panel__textarea"
          placeholder="Что зацепило, с чем поспорил, что применишь…"
          value={state.thoughts}
          rows={3}
          onChange={(e) => saveFeedback({ thoughts: e.target.value })}
        />
      </div>

      {questions.length > 0 && (
        <div className="panel__block">
          <label className="panel__label">Вопросы на понимание</label>
          <ol className="questions">
            {questions.map((q, idx) => (
              <li key={idx} className="questions__item">
                <p className="questions__q">{q}</p>
                <textarea
                  className="panel__textarea"
                  placeholder="Твой ответ…"
                  value={state.answers[idx] ?? ""}
                  rows={2}
                  onChange={(e) => saveAnswer(idx, e.target.value)}
                />
              </li>
            ))}
          </ol>
        </div>
      )}

      <footer className="panel__foot">
        {save === "saving" && (
          <span className="panel__save">
            <Loader2 className="spin" size={14} /> сохраняю…
          </span>
        )}
        {save === "saved" && (
          <span className="panel__save panel__save--ok">
            <Check size={14} /> сохранено
          </span>
        )}
      </footer>
    </section>
  );
}
