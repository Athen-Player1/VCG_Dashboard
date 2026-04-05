"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";

type Section = "dashboard" | "teams" | "analysis" | "meta" | "testing";

type NavItem = {
  href: string;
  label: string;
  icon?: string;
};

type NavGroup = {
  href: string;
  label: string;
  icon: string;
  section: Section;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: "dashboard",
    section: "dashboard",
    items: [
      { href: "/", label: "Overview", icon: "home" },
      { href: "/#threat-radar", label: "Threat Radar", icon: "warning" },
      { href: "/#weakness-matrix", label: "Weakness Matrix", icon: "grid_view" },
      { href: "/#meta-team-plans", label: "Meta Team Plans", icon: "strategy" }
    ]
  },
  {
    href: "/teams",
    label: "Teams",
    icon: "groups",
    section: "teams",
    items: [
      { href: "/teams", label: "All Teams", icon: "view_list" },
      { href: "/teams?compose=1", label: "Create Team", icon: "add_circle" },
      { href: "/teams#import-lab", label: "Import Team", icon: "upload" }
    ]
  },
  {
    href: "/analysis",
    label: "Analysis",
    icon: "analytics",
    section: "analysis",
    items: [
      { href: "/analysis", label: "Analysis Desk", icon: "space_dashboard" },
      { href: "/analysis#team-picker", label: "Select Team", icon: "checklist" },
      { href: "/analysis#structural-readout", label: "Structural Readout", icon: "monitoring" },
      { href: "/analysis#format-radar", label: "Format Radar", icon: "radar" },
      { href: "/analysis#threat-radar", label: "Threat Radar", icon: "warning" }
    ]
  },
  {
    href: "/meta",
    label: "Meta",
    icon: "radar",
    section: "meta",
    items: [
      { href: "/meta", label: "Snapshot Overview", icon: "timeline" },
      { href: "/meta#snapshot-guidance", label: "Guidance", icon: "tips_and_updates" },
      { href: "/meta#team-matchups", label: "Team Matchups", icon: "strategy" },
      { href: "/meta#archetype-plans", label: "Archetype Plans", icon: "group_work" },
      { href: "/meta/top-teams", label: "Top 5 Teams", icon: "military_tech" },
      { href: "/meta#snapshot-library", label: "Snapshot Library", icon: "inventory_2" },
      { href: "/meta#import-snapshot", label: "Import Snapshot", icon: "data_object" },
      { href: "/meta#victory-road-import", label: "Victory Road Import", icon: "public" }
    ]
  },
  {
    href: "/testing",
    label: "Simulation",
    icon: "science",
    section: "testing",
    items: [
      { href: "/testing", label: "Simulation Desk", icon: "biotech" },
      { href: "/testing#launch-sims", label: "Launch Sims", icon: "play_circle" },
      { href: "/testing#simulation-queue", label: "Queue", icon: "schedule" }
    ]
  }
];

function getBasePath(href: string) {
  return href.split("#")[0]?.split("?")[0] ?? href;
}

function isHrefActive(pathname: string, href: string) {
  const basePath = getBasePath(href);
  return pathname === basePath;
}

function NavItemLink({
  item,
  active,
  compact = false
}: {
  item: NavItem;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      className={`flex items-center gap-3 rounded-xl ${
        compact ? "px-3 py-2.5 text-xs" : "px-4 py-3 text-sm"
      } font-headline font-semibold transition-all ${
        active
          ? "bg-white text-[var(--primary)] shadow-sm"
          : "text-slate-500 hover:bg-slate-200/60"
      }`}
      href={item.href}
    >
      {item.icon ? <span className="material-symbols-outlined text-[1.15rem]">{item.icon}</span> : null}
      <span>{item.label}</span>
    </Link>
  );
}

export function AppShell({
  activeSection,
  pageNavigation = [],
  children
}: {
  activeSection: Section;
  pageNavigation?: NavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<Section>(activeSection);

  useEffect(() => {
    setOpenSection(activeSection);
    setMobileOpen(false);
  }, [activeSection, pathname]);

  const sidebarGroups = useMemo(
    () =>
      navGroups.map((group) =>
        group.section === activeSection && pageNavigation.length > 0
          ? { ...group, items: [...group.items, ...pageNavigation] }
          : group
      ),
    [activeSection, pageNavigation]
  );

  return (
    <div className="min-h-screen">
      <header className="glass-header fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/50 bg-slate-50/75 px-4 shadow-sm sm:px-6">
        <div className="flex items-center gap-8">
          <button
            aria-label="Toggle navigation"
            className="grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-white lg:hidden"
            onClick={() => setMobileOpen((current) => !current)}
            type="button"
          >
            <span className="material-symbols-outlined">{mobileOpen ? "close" : "menu"}</span>
          </button>
          <Link
            className="font-headline text-2xl font-extrabold italic tracking-tight text-[var(--primary)]"
            href="/"
          >
            VGC Pro Builder
          </Link>
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
        </div>
      </header>

      {mobileOpen ? (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-slate-950/25 lg:hidden"
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-72 flex-col bg-slate-100/92 px-4 pb-4 pt-20 transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 px-2">
          <h2 className="font-headline text-lg font-black text-slate-900">Laboratory</h2>
          <p className="font-label text-[10px] uppercase tracking-[0.3em] text-slate-500">
            Navigation Workspace
          </p>
        </div>
        <nav className="space-y-3">
          {sidebarGroups.map((group) => {
            const sectionOpen = openSection === group.section;
            const topLevelActive = activeSection === group.section;

            return (
              <div key={group.section} className="rounded-[1.25rem] bg-white/55 p-2">
                <div className="flex items-center gap-2">
                  <Link
                    className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-3 font-headline text-sm font-bold transition-all ${
                      topLevelActive
                        ? "bg-white text-[var(--primary)] shadow-sm"
                        : "text-slate-700 hover:bg-white/80"
                    }`}
                    href={group.href}
                  >
                    <span className="material-symbols-outlined">{group.icon}</span>
                    <span className="truncate">{group.label}</span>
                  </Link>
                  <button
                    aria-label={`Toggle ${group.label} menu`}
                    className="grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-white"
                    onClick={() =>
                      setOpenSection((current) =>
                        current === group.section ? activeSection : group.section
                      )
                    }
                    type="button"
                  >
                    <span className="material-symbols-outlined">
                      {sectionOpen ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                </div>
                {sectionOpen ? (
                  <div className="mt-2 space-y-1 border-t border-white/80 pt-2">
                    {group.items.map((item) => (
                      <NavItemLink
                        key={item.href}
                        active={isHrefActive(pathname, item.href)}
                        compact
                        item={item}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl bg-[var(--surface-container-low)] p-4">
          <div className="font-label text-[10px] uppercase tracking-[0.28em] text-[var(--outline)]">
            Navigation Notes
          </div>
          <p className="mt-2 text-xs text-[var(--on-surface-variant)]">
            Each workspace now keeps its related routes and in-page sections inside the sidebar, so
            fewer actions need to live in page headers.
          </p>
        </div>
      </aside>

      <main className="px-4 pb-20 pt-24 sm:px-6 lg:ml-72">{children}</main>
    </div>
  );
}
