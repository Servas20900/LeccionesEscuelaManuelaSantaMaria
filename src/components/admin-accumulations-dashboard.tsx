"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCcw, BookMarked } from "lucide-react";
import {
  formatDateForDisplay,
  formatDateTimeForDisplay,
  teacherFullName,
  type AccumulationRecord,
} from "@/lib/schemas";

type RecordsResponse =
  | {
      success: true;
      records: AccumulationRecord[];
    }
  | {
      success: false;
      error: string;
    };

export function AdminAccumulationsDashboard() {
  const [records, setRecords] = useState<AccumulationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadRecords() {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/accumulate/submissions", { cache: "no-store" });
      const payload = (await response.json()) as RecordsResponse;

      if (!response.ok || !payload.success) {
        throw new Error(!payload.success ? payload.error : "No fue posible cargar los registros.");
      }

      setRecords(payload.records);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar los registros.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadRecords();
  }, []);

  const totalLecciones = useMemo(
    () => records.reduce((total, record) => total + (Number.isFinite(record.cantidadLecciones) ? record.cantidadLecciones : 0), 0),
    [records],
  );

  return (
    <section className="space-y-5">
      <div className="glass-panel rounded-[2rem] border border-white/60 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 rounded-[1.5rem] bg-gradient-to-br from-slate-900 via-blue-900 to-slate-700 px-5 py-5 text-white lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-100/70">Panel privado</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Registros de acumulación</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Listado consolidado de lecciones acumuladas registradas por el personal docente.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Registros</p>
              <p className="mt-1 text-xl font-semibold">{records.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Lecciones acumuladas</p>
              <p className="mt-1 text-xl font-semibold">{totalLecciones}</p>
            </div>
            <button onClick={loadRecords} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 font-medium transition hover:bg-white/10">
              <RefreshCcw className="h-4 w-4" />
              Recargar
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
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Horario</th>
                  <th className="px-4 py-3 font-semibold">Lecciones</th>
                  <th className="px-4 py-3 font-semibold">Motivo</th>
                  <th className="px-4 py-3 font-semibold">Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-10 text-center text-slate-500" colSpan={7}>
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Cargando registros...
                      </span>
                    </td>
                  </tr>
                ) : null}

                {!isLoading && records.map((record) => (
                  <tr key={`${record.sheetTitle}-${record.rowIndex}`} className="align-top">
                    <td className="px-4 py-4 font-medium text-slate-900">{teacherFullName(record)}</td>
                    <td className="px-4 py-4 text-slate-600">{record.cedula}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDateForDisplay(record.fechaLeccionesAcumuladas)}</td>
                    <td className="px-4 py-4 text-slate-600">{record.horarioLeccionesAcumuladas}</td>
                    <td className="px-4 py-4 text-slate-600">{record.cantidadLecciones}</td>
                    <td className="px-4 py-4 text-slate-600">{record.motivo}</td>
                    <td className="px-4 py-4 text-slate-600">{formatDateTimeForDisplay(record.timestamp)}</td>
                  </tr>
                ))}

                {!isLoading && records.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={7}>
                      <span className="inline-flex items-center gap-2">
                        <BookMarked className="h-4 w-4" />
                        No hay acumulaciones registradas todavía.
                      </span>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
