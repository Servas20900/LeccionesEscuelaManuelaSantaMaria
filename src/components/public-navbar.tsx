import Image from "next/image";
import Link from "next/link";
import { BookMarked, Home, Search, FilePenLine } from "lucide-react";

const logoUrl = "/school-brand.jpg";

type PublicNavbarProps = {
  currentPath?: "/" | "/solicitud" | "/acumuladas" | "/consulta";
};

function itemClass(active: boolean) {
  const baseClass = "inline-flex items-center justify-center gap-1 rounded-lg border transition h-9 w-9 sm:h-9 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2 flex-shrink-0";
  if (active) {
    return `${baseClass} border-slate-800/70 bg-slate-900 text-slate-100`;
  }
  return `${baseClass} border-slate-300/70 bg-white/85 text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100`;
}

export function PublicNavbar({ currentPath = "/" }: PublicNavbarProps) {
  return (
    <header className="glass-panel sticky top-2 z-20 rounded-2xl border border-slate-200/80 px-2 py-2 sm:px-6 sm:py-3 sm:rounded-[1.6rem]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="group inline-flex items-center gap-3 flex-shrink-0">
          <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-slate-300/70 bg-slate-100/90 flex-shrink-0">
            <Image src={logoUrl} alt="Logo institucional" fill sizes="44px" className="object-cover" priority />
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Escuela</p>
            <p className="text-sm font-semibold text-slate-900 sm:text-base">Manuela Santa Maria</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-1 text-xs sm:text-sm font-medium flex-wrap justify-start sm:justify-end">
          <Link href="/" className={itemClass(currentPath === "/")} title="Inicio">
            <Home className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <Link href="/solicitud" className={itemClass(currentPath === "/solicitud")} title="Uso Acumuladas">
            <FilePenLine className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Uso</span>
          </Link>
          <Link href="/acumuladas" className={itemClass(currentPath === "/acumuladas")} title="Registro">
            <BookMarked className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Registro</span>
          </Link>
          <Link href="/consulta" className={itemClass(currentPath === "/consulta")} title="Consulta">
            <Search className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Consulta</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
