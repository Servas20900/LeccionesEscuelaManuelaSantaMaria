import type { Metadata } from "next";
import Image from "next/image";
import { TeacherRequestForm } from "@/components/teacher-request-form";
import { PublicNavbar } from "@/components/public-navbar";

const logoUrl = "/school-brand.jpg";

export const metadata: Metadata = {
  title: "Solicitud docente",
};

export default function SolicitudPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
        <PublicNavbar currentPath="/solicitud" />

        <header className="glass-panel relative overflow-hidden rounded-[2rem] border border-white/60 px-6 py-5 sm:px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-700" />
          <div className="absolute -right-20 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="relative grid gap-8 text-white lg:grid-cols-[minmax(0,1.2fr)_minmax(240px,340px)] lg:items-center">
            <div className="max-w-3xl space-y-4">
              <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-sky-50">
                Escuela Manuela Santa María
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Solicitud digital de horas acumuladas
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-sky-50/90 sm:text-base">
                Registro público para el personal docente y panel privado para la dirección.
                Todo en español, con validaciones en tiempo real y envío automático de correo.
              </p>
            </div>

            <div className="flex items-center justify-start lg:justify-end">
              <div className="w-full max-w-[300px] rounded-[1.75rem] border border-white/20 bg-gradient-to-b from-white/20 to-white/5 p-4 shadow-[0_24px_70px_rgba(2,6,23,0.28)] backdrop-blur-md">
                <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100/80">
                  Logo institucional
                </p>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.2rem] border border-slate-300/40 bg-slate-100/90">
                  <Image
                    src={logoUrl}
                    alt="Logo institucional"
                    fill
                    sizes="300px"
                    className="object-contain p-3"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        <TeacherRequestForm />
      </div>
    </main>
  );
}
