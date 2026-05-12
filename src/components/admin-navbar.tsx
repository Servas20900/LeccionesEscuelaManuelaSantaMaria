import Image from "next/image";
import Link from "next/link";
import { BookMarked, LayoutDashboard, ShieldCheck } from "lucide-react";

const logoUrl = "/school-brand.jpg";

type AdminNavbarProps = {
  currentPath?: "/admin" | "/admin/acumulaciones";
};

function itemClass(active: boolean) {
  const baseClass = "inline-flex items-center justify-center gap-2 rounded-xl border transition h-10 w-10 sm:h-9 sm:w-auto sm:px-3 sm:py-2 flex-shrink-0";
  if (active) {
    return `${baseClass} border-slate-800/70 bg-slate-900 text-slate-100`;
  }
  return `${baseClass} border-slate-300/70 bg-white/85 text-slate-700 hover:-translate-y-0.5 hover:bg-slate-100`;
}

export function AdminNavbar({ currentPath = "/admin" }: AdminNavbarProps) {
  return (
    <header className="glass-panel rounded-[1.6rem] border border-slate-200/80 px-3 py-3 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-3 flex-shrink-0">
          <div className="relative h-11 w-11 overflow-hidden rounded-xl border border-slate-300/70 bg-slate-100/90 flex-shrink-0">
            <Image src={logoUrl} alt="Logo institucional" fill sizes="44px" className="object-cover" priority />
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Zona protegida</p>
            <p className="text-sm font-semibold text-slate-900 sm:text-base">Direccion institucional</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 sm:gap-1 text-xs sm:text-sm font-medium flex-wrap">
          <Link href="/admin" className={itemClass(currentPath === "/admin")} title="Rebajos">
            <LayoutDashboard className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Rebajos</span>
          </Link>
          <Link href="/admin/acumulaciones" className={itemClass(currentPath === "/admin/acumulaciones")} title="Acumulaciones">
            <BookMarked className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Acumulaciones</span>
          </Link>
          <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800/70 bg-slate-900 text-slate-100 h-10 w-10 sm:h-9 sm:w-auto sm:px-3 sm:py-2 flex-shrink-0" title="Zona segura">
            <ShieldCheck className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Segura</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
