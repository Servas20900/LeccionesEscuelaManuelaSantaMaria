"use client";

import { useState } from "react";
import { Loader2, Search, Sigma } from "lucide-react";
import { formatDateForDisplay, formatDateTimeForDisplay } from "@/lib/schemas";

type Summary = {
  sheetTitle: string;
  cedula: string;
  docente: string;
  totalLecciones: number;
  totalRegistros: number;
  ultimaFechaAcumulada: string;
  ultimoRegistro: string;
};

type SummaryResponse =
  | {
      success: true;
      summary: Summary;
    }
  | {
      success: false;
      error: string;
    };

export function AccumulationSummaryChecker() {
  const [cedula, setCedula] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSummary(null);
    setIsLoading(true);

    try {
      const normalized = cedula.replace(/\D/g, "");
      const response = await fetch(`/api/accumulate/summary?cedula=${encodeURIComponent(normalized)}`, {
        cache: "no-store",
      });

      const payload = (await response.json()) as SummaryResponse;
      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : "No fue posible consultar la sumatoria.");
      }

      setSummary(payload.summary);
    } catch (queryError) {
      setError(queryError instanceof Error ? queryError.message : "No fue posible consultar la sumatoria.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="glass-panel relative overflow-hidden rounded-[2rem] border border-white/60 px-4 py-4 shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:px-6 lg:px-8">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-900/60">Consulta pública</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Sumatoria de lecciones aprobadas</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Ingrese la cédula para ver el total de lecciones registradas automáticamente desde Google Sheets.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Cédula</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                inputMode="numeric"
                maxLength={9}
                placeholder="Ejemplo: 123456789"
                value={cedula}
                onChange={(event) => setCedula(event.target.value)}
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Consultar sumatoria
            </button>
          </form>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
          ) : null}
        </div>

        <aside className="rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-5 text-sm text-slate-700 shadow-inner">
          <div className="flex items-start gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-sky-950">
            <Sigma className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <p className="font-semibold">Cálculo automático</p>
              <p className="mt-1 leading-6">Cada acumulación aprobada actualiza el total sin sumas manuales.</p>
            </div>
          </div>

          {summary ? (
            <dl className="mt-4 space-y-3">
              <SummaryRow label="Docente" value={summary.docente || "Sin nombre"} />
              <SummaryRow label="Cédula" value={summary.cedula} />
              <SummaryRow label="Total lecciones" value={`${summary.totalLecciones}`} />
              <SummaryRow label="Total registros" value={`${summary.totalRegistros}`} />
              <SummaryRow
                label="Última fecha acumulada"
                value={summary.ultimaFechaAcumulada ? formatDateForDisplay(summary.ultimaFechaAcumulada) : "Sin fecha"}
              />
              <SummaryRow
                label="Último registro"
                value={summary.ultimoRegistro ? formatDateTimeForDisplay(summary.ultimoRegistro) : "Sin registro"}
              />
            </dl>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-500">El resultado aparecerá aquí al consultar una cédula válida.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}
