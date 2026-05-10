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
    <header className="glass-panel sticky top-4 z-20 rounded-[1.6rem] border border-slate-200/80 px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="group inline-flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-slate-300/70 bg-slate-100/90">
            <Image src={logoUrl} alt="Logo institucional" fill sizes="44px" className="object-cover" priority />
          </div>
          <div className="leading-tight">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Escuela</p>
            <p className="text-sm font-semibold text-slate-900 sm:text-base">Manuela Santa Maria</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link href="/" className={itemClass(currentPath === "/")}>
            <Home className="h-4 w-4" />
            Inicio
          </Link>
          <Link href="/solicitud" className={itemClass(currentPath === "/solicitud")}>
            <FilePenLine className="h-4 w-4" />
            Uso Acumuladas
          </Link>
          <Link href="/acumuladas" className={itemClass(currentPath === "/acumuladas")}>
            <BookMarked className="h-4 w-4" />
            Registro Acumuladas
          </Link>
          <Link href="/consulta" className={itemClass(currentPath === "/consulta")}>
            <Search className="h-4 w-4" />
            Consulta Acumuladas
          </Link>
        </nav>
      </div>
    </header>
  );
}
