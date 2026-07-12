"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }
  return (
    <button type="button" className="logout-btn" onClick={logout}>
      <LogOut size={15} /> Выйти
    </button>
  );
}
