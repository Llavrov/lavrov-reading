"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/me";
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push(from);
      router.refresh();
    } else {
      setStatus("error");
    }
  }

  return (
    <form className="login" onSubmit={submit}>
      <div className="login__icon">
        <Lock size={22} />
      </div>
      <h1 className="login__title">Личный вход</h1>
      <p className="login__hint">Только для владельца читальни.</p>
      <input
        type="password"
        className="login__input"
        placeholder="Пароль"
        value={password}
        autoFocus
        onChange={(e) => {
          setPassword(e.target.value);
          if (status === "error") setStatus("idle");
        }}
      />
      {status === "error" && <p className="login__error">Неверный пароль</p>}
      <button type="submit" className="login__btn" disabled={status === "loading"}>
        {status === "loading" ? <Loader2 className="spin" size={16} /> : "Войти"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="wrap login-wrap">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
