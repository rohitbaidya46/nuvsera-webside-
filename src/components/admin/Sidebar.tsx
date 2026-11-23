"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Archive, BookOpen, Briefcase, ExternalLink, FileText, FolderKanban, Gauge, HelpCircle, Image as ImageIcon, Inbox, LayoutList,
  LogOut, Mail, Menu, MessageSquareQuote, ScrollText, Settings, Tags, UserCircle, Users, UsersRound, Wrench, X, FileUser,
} from "lucide-react";
import { LogoMark } from "@/components/site/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { api } from "./api";

export type NavItem = { href: string; label: string; icon: string; section: string };

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  gauge: Gauge, inbox: Inbox, mail: Mail, file: FileText, wrench: Wrench, folder: FolderKanban, book: BookOpen, tags: Tags,
  users: UsersRound, quote: MessageSquareQuote, help: HelpCircle, briefcase: Briefcase, cv: FileUser, image: ImageIcon,
  settings: Settings, team: Users, scroll: ScrollText, archive: Archive, account: UserCircle, list: LayoutList,
};

export function Sidebar({ items, user }: { items: NavItem[]; user: { name: string; email: string; role: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const sections = [...new Set(items.map((i) => i.section))];
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  async function logout() {
    await api("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
  }

  const nav = (
    <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {sections.map((sec) => (
        <div key={sec}>
          {sec !== "main" && <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{sec}</p>}
          <ul className="space-y-0.5">
            {items.filter((i) => i.section === sec).map((i) => {
              const Icon = ICONS[i.icon] ?? LayoutList;
              return (
                <li key={i.href}>
                  <Link href={i.href} aria-current={active(i.href) ? "page" : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${active(i.href) ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}>
                    <Icon className="h-4 w-4 shrink-0" /> {i.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-bg px-4 lg:hidden">
        <button onClick={() => setOpen(true)} className="inline-flex h-11 w-11 items-center justify-center" aria-label="Open menu"><Menu className="h-6 w-6" /></button>
        <span className="font-semibold text-fg">Nuvsera Admin</span>
        <ThemeToggle />
      </div>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-5">
          <Link href="/admin" className="flex items-center gap-2.5"><LogoMark className="h-8 w-8" /><span className="font-bold text-white">Nuvsera <span className="font-medium text-slate-400">Admin</span></span></Link>
          <button onClick={() => setOpen(false)} className="text-slate-300 lg:hidden" aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
        {nav}
        <div className="border-t border-white/10 p-4">
          <p className="truncate text-sm font-medium text-white">{user.name}</p>
          <p className="truncate text-xs text-slate-400">{user.role}</p>
          <div className="mt-3 flex items-center gap-2">
            <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white"><ExternalLink className="h-3.5 w-3.5" /> View site</Link>
            <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
          </div>
        </div>
      </aside>
    </>
  );
}
