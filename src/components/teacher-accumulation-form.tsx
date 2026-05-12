"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardCheck, Loader2, Send } from "lucide-react";
import type { z } from "zod";
import {
  accumulationRecordSchema,
  horarioOptions,
  motivoOptions,
  type AccumulationRecordInput,
} from "@/lib/schemas";

type TeacherAccumulationFormValues = z.input<typeof accumulationRecordSchema>;
type TeacherAccumulationSubmission = z.output<typeof accumulationRecordSchema>;

  const defaultValues: AccumulationRecordInput = {
  nombre: "",
  primerApellido: "",
  segundoApellido: "",
  cedula: "",
  correoInstitucional: "",
  fechaLeccionesAcumuladas: "",
  cantidadLecciones: 1,
  horarioLeccionesAcumuladas: [],
  motivo: "",
  detalle: "",
};

export function TeacherAccumulationForm() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [horariosOpen, setHorariosOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TeacherAccumulationFormValues, unknown, TeacherAccumulationSubmission>({
    resolver: zodResolver(accumulationRecordSchema),
    defaultValues,
  });

  const horariosSeleccionados = watch("horarioLeccionesAcumuladas") as string[];
  const cantidadLecciones = watch("cantidadLecciones") as number;

  useEffect(() => {
    if (!Array.isArray(horariosSeleccionados)) return;
    if (typeof cantidadLecciones !== "number") return;

    if (horariosSeleccionados.length > cantidadLecciones) {
      const trimmed = horariosSeleccionados.slice(0, cantidadLecciones);
      setValue("horarioLeccionesAcumuladas", trimmed, { shouldValidate: true, shouldDirty: true });
    }
  }, [cantidadLecciones, horariosSeleccionados, setValue]);

  async function onSubmit(values: TeacherAccumulationSubmission) {
    setServerMessage(null);
    setServerError(null);

    const response = await fetch("/api/accumulate/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const payload = (await response.json()) as { success?: boolean; message?: string; error?: string };

    if (!response.ok) {
      setServerError(payload.error ?? "No fue posible registrar la acumulación.");
      return;
    }

    setServerMessage(payload.message ?? "Registro enviado correctamente.");
    reset(defaultValues);
  }

  return (
    <section className="glass-panel relative overflow-hidden rounded-[2rem] border border-white/60 px-4 py-4 shadow-[0_30px_90px_rgba(15,23,42,0.12)] sm:px-6 lg:px-8">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-900/60">Registro docente</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Registrar lecciones acumuladas</h2>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Complete la información de acumulación. El sistema guarda cada registro en la pestaña de Sheets correspondiente a su cédula.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre" error={errors.nombre?.message}>
              <input className={inputClass} {...register("nombre")} />
            </Field>
            <Field label="Primer apellido" error={errors.primerApellido?.message}>
              <input className={inputClass} {...register("primerApellido")} />
            </Field>
            <Field label="Segundo apellido" error={errors.segundoApellido?.message}>
              <input className={inputClass} {...register("segundoApellido")} />
            </Field>
            <Field label="Cédula" error={errors.cedula?.message}>
              <input className={inputClass} inputMode="numeric" maxLength={9} {...register("cedula")} />
            </Field>
            <Field label="Correo institucional" error={errors.correoInstitucional?.message}>
              <input className={inputClass} type="email" {...register("correoInstitucional")} />
            </Field>
            <Field label="Fecha de acumulación" error={errors.fechaLeccionesAcumuladas?.message}>
              <input className={inputClass} type="date" {...register("fechaLeccionesAcumuladas")} />
            </Field>
            <Field label="Cantidad de lecciones" error={errors.cantidadLecciones?.message}>
              <input className={inputClass} type="number" min={1} max={20} {...register("cantidadLecciones", { valueAsNumber: true })} />
            </Field>

            <Field label="Horario acumulado" error={errors.horarioLeccionesAcumuladas?.message} hint="Seleccione hasta la cantidad indicada">
              <div>
                <button
                  type="button"
                  onClick={() => setHorariosOpen((v) => !v)}
                  className={`${inputClass} flex items-center justify-between gap-3`}
                >
                  <span className="truncate">
                    {Array.isArray(horariosSeleccionados) && horariosSeleccionados.length > 0
                      ? horariosSeleccionados.join(", ")
                      : "Seleccione lecciones "}
                  </span>
                  <span className="text-xs text-slate-500">{horariosOpen ? "Cerrar" : "Abrir"}</span>
                </button>

                {horariosOpen ? (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="grid gap-2">
                      {horarioOptions.map((option) => {
                        const selected = Array.isArray(horariosSeleccionados) && horariosSeleccionados.includes(option);
                        const selectedCount = Array.isArray(horariosSeleccionados) ? horariosSeleccionados.length : 0;
                        const disableUnchecked = !selected && selectedCount >= (cantidadLecciones || 0);

                        return (
                          <label key={option} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              value={option}
                              disabled={disableUnchecked}
                              {...register("horarioLeccionesAcumuladas")}
                              className="h-4 w-4"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </Field>
          </div>

          <Field label="Motivo" error={errors.motivo?.message}>
            <select className={inputClass} {...register("motivo")}>
              <option value="">Seleccione una opción</option>
              {motivoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Detalle" error={errors.detalle?.message}>
            <textarea className={`${inputClass} min-h-28`} rows={5} {...register("detalle")} />
          </Field>

          {serverError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{serverError}</div>
          ) : null}
          {serverMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{serverMessage}</div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Registrar acumulación
          </button>
        </form>

        <aside className="space-y-4 rounded-[1.75rem] border border-slate-200/80 bg-white/80 p-5 text-sm text-slate-700 shadow-inner">
          <div className="flex items-start gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-sky-950">
            <ClipboardCheck className="mt-0.5 h-5 w-5 flex-none" />
            <div>
              <p className="font-semibold">Registro trazable</p>
              <p className="mt-1 leading-6">Cada envío se valida en servidor y se agrega en su pestaña personal por cédula.</p>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Qué guarda el sistema</p>
            <ul className="space-y-2 leading-6">
              <li>• Cantidad de lecciones acumuladas.</li>
              <li>• Fecha y horario del bloque acumulado.</li>
              <li>• Motivo y detalle del registro.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="space-y-2">
      <span className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
        <span>{label}</span>
        {hint ? <span className="text-xs font-normal uppercase tracking-[0.22em] text-slate-400">{hint}</span> : null}
      </span>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </label>
  );
}

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100";
