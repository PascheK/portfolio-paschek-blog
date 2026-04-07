'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/components/ui/theme-provider';
import {
  LayoutDashboard, PenSquare, Image, Settings, ExternalLink,
  Sun, Moon, LogOut, Menu, X, ChevronLeft, ChevronRight,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/admin',          label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true },
  { href: '/admin/new',      label: 'New Post',  icon: <PenSquare size={18} /> },
  { href: '/admin/media',    label: 'Media',     icon: <Image size={18} /> },
  { href: '/admin/settings', label: 'Settings',  icon: <Settings size={18} /> },
];

interface Props {
  children: React.ReactNode;
  logoutAction: () => Promise<never> | Promise<void>;
}

export function AdminShell({ children, logoutAction }: Props) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [collapsed, setCollapsed] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
  }, []);

  function toggleCollapse() {
    setCollapsed((c) => {
      localStorage.setItem('admin-sidebar-collapsed', String(!c));
      return !c;
    });
  }

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 border-b border-white/[0.06] overflow-hidden ${collapsed ? 'justify-center px-0 py-5' : 'px-4 py-5'}`}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-white font-bold text-sm shrink-0">
          A
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="font-semibold text-sm text-foreground truncate">Admin</div>
            <div className="text-[10px] text-muted-foreground truncate">Portfolio CMS</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg transition-all group relative ${
                collapsed ? 'justify-center px-0 py-2.5 mx-1' : 'px-3 py-2'
              } ${
                active
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
              {/* Tooltip when collapsed */}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 text-xs bg-[#1e2433] text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10 transition-opacity">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-2 py-3 border-t border-white/[0.06] space-y-0.5">
        {/* View site */}
        <a
          href="/en"
          target="_blank"
          title={collapsed ? 'View site' : undefined}
          className={`flex items-center gap-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all group relative ${
            collapsed ? 'justify-center px-0 py-2.5 mx-1' : 'px-3 py-2'
          }`}
        >
          <ExternalLink size={18} className="shrink-0" />
          {!collapsed && <span className="text-sm font-medium">View site</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 text-xs bg-[#1e2433] text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10 transition-opacity">
              View site
            </span>
          )}
        </a>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={collapsed ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
          className={`w-full flex items-center gap-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all group relative ${
            collapsed ? 'justify-center px-0 py-2.5 mx-1' : 'px-3 py-2'
          }`}
        >
          {theme === 'dark' ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          {!collapsed && <span className="text-sm font-medium">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 text-xs bg-[#1e2433] text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10 transition-opacity">
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </span>
          )}
        </button>

        {/* Logout */}
        <form action={logoutAction}>
          <button
            type="submit"
            title={collapsed ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-all group relative ${
              collapsed ? 'justify-center px-0 py-2.5 mx-1' : 'px-3 py-2'
            }`}
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
            {collapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 text-xs bg-[#1e2433] text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-white/10 transition-opacity">
                Logout
              </span>
            )}
          </button>
        </form>

        {/* Collapse toggle - desktop only */}
        <button
          onClick={toggleCollapse}
          className={`hidden lg:flex w-full items-center gap-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all mt-1 ${
            collapsed ? 'justify-center px-0 py-2.5 mx-1' : 'px-3 py-2'
          }`}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span className="text-sm font-medium text-muted-foreground/60">Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="admin-area flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border bg-[#0d1117] fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-[56px]' : 'w-[240px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[240px] border-r border-border bg-[#0d1117] flex flex-col lg:hidden transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <X size={16} />
        </button>
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:ml-[56px]' : 'lg:ml-[240px]'
        }`}
      >
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-[#0d1117]">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={18} />
          </button>
          <span className="font-semibold text-sm">Admin</span>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
