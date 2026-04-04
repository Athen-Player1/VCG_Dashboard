import Link from "next/link";
import { ReactNode } from "react";

type Section = "dashboard" | "teams" | "analysis" | "meta" | "testing";

const navItems: Array<{
  href: string;
  label: string;
  icon: string;
  section: Section;
}> = [
  { href: "/", label: "Dashboard", icon: "dashboard", section: "dashboard" },
  { href: "/teams", label: "Teams", icon: "groups", section: "teams" },
  { href: "/analysis", label: "Analysis", icon: "analytics", section: "analysis" },
  { href: "/meta", label: "Meta Trends", icon: "radar", section: "meta" },
  { href: "/testing", label: "Testing", icon: "science", section: "testing" }
];

function NavLink({
  href,
  label,
  icon,
  active
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
}) {
  return (
    <Link
      className={`flex items-center gap-3 rounded-xl px-4 py-3 font-headline text-sm font-semibold transition-all ${
        active
          ? "translate-x-1 bg-white text-[var(--primary)] shadow-sm"
          : "text-slate-500 hover:bg-slate-200/60"
      }`}
      href={href}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {label}
    </Link>
  );
}

export function AppShell({
  activeSection,
  children
}: {
  activeSection: Section;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="glass-header fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/50 bg-slate-50/75 px-6 shadow-sm">
        <div className="flex items-center gap-8">
          <Link
            className="font-headline text-2xl font-extrabold italic tracking-tight text-[var(--primary)]"
            href="/"
          >
            VGC Pro Builder
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {navItems.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                className={`px-1 py-5 font-headline text-sm transition-colors ${
                  activeSection === item.section
                    ? "border-b-2 border-[var(--primary)] font-bold text-[var(--primary)]"
                    : "font-semibold text-slate-500 hover:text-[var(--primary)]"
                }`}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <form action="/teams" className="hidden items-center gap-2 rounded-full bg-slate-200/60 px-4 py-2 sm:flex">
            <span className="material-symbols-outlined text-sm text-slate-500">search</span>
            <input
              className="w-48 border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
              name="query"
              placeholder="Search teams, mons..."
              type="text"
            />
          </form>
          <button
            className="grid h-10 w-10 place-items-center rounded-full text-slate-400"
            disabled
            title="Notifications are not wired yet"
            type="button"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button
            className="grid h-10 w-10 place-items-center rounded-full text-slate-400"
            disabled
            title="Profile settings are not wired yet"
            type="button"
          >
            <span className="material-symbols-outlined">person</span>
          </button>
        </div>
      </header>

      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col bg-slate-100/85 px-4 pb-4 pt-20 lg:flex">
        <div className="mb-8 px-2">
          <h2 className="font-headline text-lg font-black text-slate-900">Laboratory</h2>
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-slate-500">
            VGC Analytics v1.0
          </p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              active={activeSection === item.section}
              href={item.href}
              icon={item.icon}
              label={item.label}
            />
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-[var(--surface-container-low)] p-4">
          <div className="font-label text-[10px] uppercase tracking-[0.28em] text-[var(--outline)]">
            Phase One
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-container-high)]">
            <div className="h-full w-3/5 rounded-full bg-[var(--primary)]" />
          </div>
          <p className="mt-2 text-xs text-[var(--on-surface-variant)]">
            Dashboard navigation, import workflow, and route wiring are active.
          </p>
        </div>
      </aside>

      <main className="px-6 pb-20 pt-24 lg:ml-64">{children}</main>
    </div>
  );
}
