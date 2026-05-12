import Image from "next/image";
import Link from "next/link";
import { BookMarked, Home, Search, FilePenLine } from "lucide-react";

const logoUrl = "/school-brand.jpg";

type PublicNavbarProps = {
  currentPath?: "/" | "/solicitud" | "/acumuladas" | "/consulta";
};

function itemClass(active: boolean) {
  if (active) {
    return "inline-flex items-center gap-2 rounded-xl border border-slate-800/70 bg-slate-900 px-3 py-2 text-slate-100";
  }

  return "inline-flex items-center gap-2 rounded-xl border border-slate-300/70 bg-white/85 px-3 py-2 text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-100";
}

export function PublicNavbar({ currentPath = "/" }: PublicNavbarProps) {
  return (
    <header className="glass-panel sticky top-4 z-20 rounded-[1.6rem] border border-slate-200/80 px-3 py-3 sm:px-6">
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

        <nav className="flex items-center gap-1 text-xs sm:text-sm font-medium flex-wrap justify-start sm:justify-end">
          <Link href="/" className={itemClass(currentPath === "/")}>
            <Home className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <Link href="/solicitud" className={itemClass(currentPath === "/solicitud")}>
            <FilePenLine className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Uso Acumuladas</span>
          </Link>
          <Link href="/acumuladas" className={itemClass(currentPath === "/acumuladas")}>
            <BookMarked className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Registro</span>
          </Link>
          <Link href="/consulta" className={itemClass(currentPath === "/consulta")}>
            <Search className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Consulta</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
