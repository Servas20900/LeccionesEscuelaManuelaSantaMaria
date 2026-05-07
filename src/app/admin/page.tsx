import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";

export const metadata: Metadata = {
  title: "Panel de dirección",
};

export default function AdminPage() {
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-7xl flex-col gap-8">
        <header className="glass-panel rounded-[2rem] border border-slate-200/70 px-6 py-5 text-slate-900">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-900/60">Vista interna</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Panel de dirección</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Revise solicitudes, lea el detalle completo y registre la decisión con un comentario breve.</p>
        </header>

        <AdminDashboard />
      </div>
    </main>
  );
}
