"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Loader2, LogOut, ShieldAlert, CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { formatDateForDisplay, formatDateTimeForDisplay, teacherFullName, type SubmissionRecord } from "@/lib/schemas";

type LoginResponse = { success: true } | { success: false; error: string };

type SubmissionResponse = { success: true; submissions: SubmissionRecord[] } | { success: false; error: string };

export function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [selected, setSelected] = useState<SubmissionRecord | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  async function fetchSubmissions() {
    const response = await fetch("/api/submissions", { cache: "no-store" });
    const payload = (await response.json()) as SubmissionResponse;

    if (!response.ok || !payload.success) {
      throw new Error("No fue posible cargar las solicitudes.");
    }

    return payload.submissions;
  }

  useEffect(() => {
    void fetchSubmissions()
      .then((items) => {
        setSubmissions(items);
        setIsLoggedIn(true);
      })
      .catch(() => {
        setIsLoggedIn(false);
      });
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json()) as LoginResponse;
      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : "No fue posible iniciar sesión.");
      }

      setPassword("");
      const items = await fetchSubmissions();
      setSubmissions(items);
      setIsLoggedIn(true);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No fue posible iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  }

  async function reloadData() {
    setError(null);
    try {
      const items = await fetchSubmissions();
      setSubmissions(items);
      setIsLoggedIn(true);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar las solicitudes.");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLoggedIn(false);
    setSubmissions([]);
    setSelected(null);
  }

  async function handleDecision(decision: "Aprobada" | "Rechazada") {
    if (!selected) {
      return;
    }

    const comment = window.prompt("Ingrese un comentario breve para la decisión:", selected.comentarioDirectora ?? "") ?? "";

    startTransition(async () => {
      const response = await fetch("/api/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: selected.cedula,
          rowIndex: selected.rowIndex,
          decision,
          comment,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "No fue posible registrar la decisión.");
        return;
      }

      setSelected(null);
      await reloadData();
    });
  }

  const pendingCount = useMemo(() => submissions.filter((submission) => submission.estado === "Pendiente").length, [submissions]);

  if (!isLoggedIn) {
    return (
      <section className="glass-panel rounded-[2rem] border border-white/60 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-900">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">Acceso de dirección</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Ingrese la contraseña privada para revisar, aprobar o rechazar solicitudes de horas acumuladas.</p>

          <form className="mx-auto mt-8 flex max-w-md flex-col gap-3" onSubmit={handleLogin}>
            <input
              className="w-full rounded-2xl border border-slate-300 bg-slate-50/90 px-4 py-3 outline-none ring-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              type="password"
              placeholder="Contraseña de dirección"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Ingresar
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="glass-panel rounded-[2rem] border border-white/60 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-[1.5rem] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-700 px-5 py-5 text-white lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-100/70">Panel privado</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Solicitudes recibidas</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Las solicitudes se agrupan por cédula en Google Sheets y se actualizan desde esta vista.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Pendientes</p>
              <p className="mt-1 text-xl font-semibold">{pendingCount}</p>
            </div>
            <button onClick={reloadData} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 font-medium transition hover:bg-white/10">
              <RefreshCcw className="h-4 w-4" />
              Recargar
            </button>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 font-medium transition hover:bg-white/10">
              <LogOut className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>

        {error ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}

        <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/90">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Docente</th>
                  <th className="px-4 py-3 font-semibold">Cédula</th>
                  <th className="px-4 py-3 font-semibold">Fecha acumulada</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Registro</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((submission) => (
                  <tr key={`${submission.sheetTitle}-${submission.rowIndex}`} className="align-top">
                    <td className="px-4 py-4 font-medium text-slate-900">{teacherFullName(submission)}</td>
                    <td className="px-4 py-4 text-slate-600">{submission.cedula}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDateForDisplay(submission.fechaAcumulada)}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] bg-slate-100 text-slate-700">
                        {submission.estado}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{formatDateTimeForDisplay(submission.timestamp)}</td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setSelected(submission)}
                        className="rounded-full bg-blue-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-blue-800"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
                {submissions.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                      No hay solicitudes registradas todavía.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected ? (
        <div className="glass-panel rounded-[2rem] border border-white/60 px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-semibold text-slate-950">Detalle de solicitud</h2>
              <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <Detail label="Docente" value={teacherFullName(selected)} />
                <Detail label="Cédula" value={selected.cedula} />
                <Detail label="Correo" value={selected.correoInstitucional} />
                <Detail label="Estado" value={selected.estado} />
                <Detail label="Fecha acumulada" value={formatDateForDisplay(selected.fechaAcumulada)} />
                <Detail label="Fecha propuesta" value={formatDateForDisplay(selected.fechaRebajoPropuesta)} />
                <Detail label="Hora propuesta" value={selected.horaSalidaPropuesta} />
                <Detail label="Fila" value={`${selected.rowIndex}`} />
              </dl>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Motivo</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{selected.motivo}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Detalle</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{selected.detalle || "Sin detalle"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-300 bg-slate-100/70 p-5">
              <h3 className="text-lg font-semibold text-slate-950">Acciones</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">La decisión se guarda en Sheets y dispara el correo de respuesta al docente.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  disabled={isPending}
                  onClick={() => handleDecision("Aprobada")}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Aprobar
                </button>
                <button
                  disabled={isPending}
                  onClick={() => handleDecision("Rechazada")}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  Rechazar
                </button>
              </div>
              {isPending ? <p className="mt-3 text-sm text-slate-500">Registrando decisión...</p> : null}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
