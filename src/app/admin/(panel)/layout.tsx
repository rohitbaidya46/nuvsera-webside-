import { Sidebar, type NavItem } from "@/components/admin/Sidebar";
import { requireAdmin } from "@/lib/auth";
import { can, ROLE_LABELS, type Permission } from "@/lib/permissions";

const MENU: (NavItem & { perm?: Permission })[] = [
  { href: "/admin", label: "Dashboard", icon: "gauge", section: "main", perm: "dashboard.view" },
  { href: "/admin/leads", label: "Leads", icon: "inbox", section: "main", perm: "leads.view" },
  { href: "/admin/subscribers", label: "Newsletter", icon: "mail", section: "main", perm: "subscribers.view" },
  { href: "/admin/content/pages", label: "Pages & SEO", icon: "file", section: "Content", perm: "content.manage" },
  { href: "/admin/content/services", label: "Services", icon: "wrench", section: "Content", perm: "content.manage" },
  { href: "/admin/content/portfolio", label: "Portfolio", icon: "folder", section: "Content", perm: "content.manage" },
  { href: "/admin/content/blog", label: "Blog posts", icon: "book", section: "Content", perm: "content.manage" },
  { href: "/admin/content/categories", label: "Blog categories", icon: "tags", section: "Content", perm: "content.manage" },
  { href: "/admin/content/team", label: "Team", icon: "users", section: "Content", perm: "content.manage" },
  { href: "/admin/content/testimonials", label: "Testimonials", icon: "quote", section: "Content", perm: "content.manage" },
  { href: "/admin/content/faqs", label: "FAQs", icon: "help", section: "Content", perm: "content.manage" },
  { href: "/admin/media", label: "Media library", icon: "image", section: "Content", perm: "media.manage" },
  { href: "/admin/content/jobs", label: "Jobs", icon: "briefcase", section: "Careers", perm: "careers.manage" },
  { href: "/admin/applications", label: "Applications", icon: "cv", section: "Careers", perm: "applications.view" },
  { href: "/admin/settings", label: "Site settings", icon: "settings", section: "System", perm: "settings.manage" },
  { href: "/admin/users", label: "Users & roles", icon: "team", section: "System", perm: "users.manage" },
  { href: "/admin/audit", label: "Audit log", icon: "scroll", section: "System", perm: "audit.view" },
  { href: "/admin/backups", label: "Backups", icon: "archive", section: "System", perm: "backups.manage" },
  { href: "/admin/account", label: "My account", icon: "account", section: "System" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  const items = MENU.filter((m) => !m.perm || can(user.role, m.perm)).map(({ perm: _p, ...m }) => m);
  return (
    <div className="min-h-screen bg-surface">
      <Sidebar items={items} user={{ name: user.name, email: user.email, role: ROLE_LABELS[user.role] }} />
      <div className="lg:pl-64">
        <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
