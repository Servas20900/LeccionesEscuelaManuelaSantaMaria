import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookMarked, FilePenLine, Wrench } from "lucide-react";
import { PublicNavbar } from "@/components/public-navbar";

const logoUrl = "/school-brand.jpg";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <PublicNavbar currentPath="/" />

        <section className="glass-panel relative overflow-hidden rounded-[2rem] border border-white/70 px-6 py-7 sm:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-700" />
          <div className="absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute -right-14 top-0 h-44 w-44 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid gap-8 text-white lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-slate-100">
                Plataforma institucional
              </p>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Gestion de horas acumuladas con una experiencia clara y solida
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-100/85 sm:text-base">
                Inicio central para docentes y direccion, con flujo publico de solicitud,
                panel privado y trazabilidad de decisiones en un mismo sistema.
              </p>
            </div>

            <div className="justify-self-start lg:justify-self-end">
              <div className="w-full max-w-[320px] rounded-[1.4rem] border border-white/25 bg-gradient-to-b from-white/15 to-white/5 p-4 shadow-[0_26px_70px_rgba(2,6,23,0.25)] backdrop-blur-md">
                <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-100/85">
                  Identidad visual local
                </p>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem] border border-slate-300/40 bg-slate-100/90">
                  <Image src={logoUrl} alt="Escudo de la institucion" fill sizes="320px" className="object-contain p-3" priority />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Link
            href="/solicitud"
            className="glass-panel group rounded-[1.6rem] border border-white/70 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.1)] transition hover:-translate-y-1"
          >
            <div className="inline-flex rounded-xl border border-blue-200/80 bg-blue-50 p-2 text-blue-900">
              <FilePenLine className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Solicitud docente</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Vista funcional actual para registrar rebajo de horas acumuladas.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-900">
              Ir a la vista actual <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            href="/acumuladas"
            className="glass-panel group rounded-[1.6rem] border border-white/70 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.1)] transition hover:-translate-y-1"
          >
            <div className="inline-flex rounded-xl border border-slate-300/80 bg-slate-100 p-2 text-slate-900">
              <BookMarked className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Lecciones acumuladas</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Registre cantidad de lecciones, fecha, horario, motivo y detalle en su historial.
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
              Ir al registro <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>

          <div className="glass-panel rounded-[1.6rem] border border-white/70 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.1)]">
            <div className="inline-flex rounded-xl border border-amber-300/80 bg-amber-100 p-2 text-amber-900">
              <Wrench className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Modulo en expansion</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Espacio reservado para proximas funciones de consulta y reportes operativos.
            </p>
            <p className="mt-4 text-sm font-semibold text-amber-900">Proximamente</p>
          </div>
        </section>
      </div>
    </main>
  );
}
