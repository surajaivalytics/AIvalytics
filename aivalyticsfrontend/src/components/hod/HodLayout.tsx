import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LucideProps } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Bell,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun,
  HelpCircle,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Cpu,
  ClipboardList,
  User,
  Settings,
  LogIn,
} from "lucide-react";

type NavIcon = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

interface NavLeaf {
  label: string;
  path: string;
  icon: NavIcon;
}

interface NavGroup {
  label: string;
  icon: NavIcon;
  children: NavLeaf[];
}

type NavItem = NavLeaf | NavGroup;

interface HodLayoutProps {
  children: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/hod/dashboard" },
  { label: "Faculty", icon: Users, path: "/hod/faculty" },
  { label: "Courses", icon: BookOpen, path: "/hod/courses" },
  { label: "Reports", icon: FileText, path: "/hod/reports" },
  { label: "Performance", icon: TrendingUp, path: "/hod/performance" },
  { label: "Alerts", icon: Bell, path: "/hod/alerts" },
  {
    label: "AI Tools",
    icon: Sparkles,
    children: [
      { label: "Generate MCQs", path: "/hod/ai/mcqs", icon: ClipboardList },
      { label: "Generate Reports", path: "/hod/ai/reports", icon: Cpu },
    ],
  },
];

const HodLayout: React.FC<HodLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // ── Dark Mode ──────────────────────────────────────────────
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      return localStorage.getItem("hod-theme") === "dark";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("hod-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("hod-theme", "light");
    }
  }, [isDark]);

  // ── Other state ────────────────────────────────────────────
  const [aiToolsOpen, setAiToolsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // ── Keep AI Tools open when on sub-pages ──────────────────
  useEffect(() => {
    if (location.pathname.startsWith("/hod/ai/")) setAiToolsOpen(true);
  }, [location.pathname]);

  // ── Collapse sidebar on screens < 1024px ─────────────────
  useEffect(() => {
    const check = () => setCollapsed(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Close profile dropdown on outside click ───────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (children: NavLeaf[]) =>
    children.some((c) => location.pathname === c.path);

  const currentPage =
    navItems
      .flatMap((item) =>
        "children" in item
          ? item.children
          : [{ label: item.label, path: item.path, icon: item.icon }]
      )
      .find((item) => location.pathname === item.path)?.label || "Dashboard";

  const sidebarW = collapsed ? "w-[68px]" : "w-64";

  /* ── SIDEBAR INNER ─────────────────────────────────────── */
  const SidebarInner = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full bg-[#1a1a2e] dark:bg-[#0f0f1a]">
      {/* Logo */}
      <div
        className={`flex items-center h-16 px-4 border-b border-white/10 flex-shrink-0 ${
          collapsed && !mobile ? "justify-center" : "gap-3"
        }`}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight tracking-wide truncate">
              AIValytics
            </p>
            <p className="text-purple-300 text-[11px] leading-tight truncate">
              Head of Department
            </p>
          </div>
        )}
        {mobile && (
          <button
            className="ml-auto text-white/50 hover:text-white transition-colors flex-shrink-0"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          if ("children" in item) {
            const groupActive = isGroupActive(item.children);
            const showLabel = !collapsed || mobile;
            return (
              <div key={item.label}>
                <button
                  onClick={() => setAiToolsOpen((v) => !v)}
                  title={collapsed && !mobile ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    groupActive
                      ? "bg-purple-700/50 text-white"
                      : "text-purple-200 hover:bg-white/10 hover:text-white"
                  } ${collapsed && !mobile ? "justify-center" : ""}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {showLabel && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {aiToolsOpen ? (
                        <ChevronDown className="w-4 h-4 opacity-60 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 opacity-60 flex-shrink-0" />
                      )}
                    </>
                  )}
                </button>
                {/* Expanded sub-items (only when NOT collapsed or in mobile) */}
                {(aiToolsOpen || groupActive) && (!collapsed || mobile) && (
                  <div className="ml-4 pl-3 border-l border-purple-700/40 mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        onClick={() => mobile && setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                          isActive(child.path)
                            ? "bg-[#7C3AED] text-white font-semibold"
                            : "text-purple-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <child.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {/* Collapsed desktop: show child icons in a column */}
                {collapsed && !mobile && (
                  <div className="space-y-0.5 mt-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        title={child.label}
                        className={`flex items-center justify-center p-2.5 rounded-xl transition-all duration-150 ${
                          isActive(child.path)
                            ? "bg-[#7C3AED] text-white"
                            : "text-purple-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <child.icon className="w-4 h-4" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={(item as NavLeaf).path}
              to={(item as NavLeaf).path}
              onClick={() => mobile && setMobileOpen(false)}
              title={collapsed && !mobile ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive((item as NavLeaf).path)
                  ? "bg-[#7C3AED] text-white shadow-md shadow-purple-900/50"
                  : "text-purple-200 hover:bg-white/10 hover:text-white"
              } ${collapsed && !mobile ? "justify-center" : ""}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {(!collapsed || mobile) && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User — bottom of sidebar */}
      <div className="border-t border-white/10 p-2 flex-shrink-0">
        <div
          className={`flex items-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer px-2 py-2 gap-3 ${
            collapsed && !mobile ? "justify-center" : ""
          }`}
          title={collapsed && !mobile ? "Prof. Williams" : undefined}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            PW
          </div>
          {(!collapsed || mobile) && (
            <>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-white text-sm font-medium truncate leading-tight">
                  Prof. Williams
                </p>
                <p className="text-purple-400 text-[11px] truncate leading-tight">
                  Head of Department
                </p>
              </div>
              <button
                onClick={() => navigate("/login")}
                className="text-purple-400 hover:text-red-400 transition-colors flex-shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#f8f9ff] dark:bg-[#111827] font-['Inter',sans-serif] transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 shadow-2xl ${sidebarW}`}
      >
        <SidebarInner />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 z-50 shadow-2xl">
            <SidebarInner mobile />
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? "lg:pl-[68px]" : "lg:pl-64"
        }`}
      >
        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 px-4 md:px-6 h-16 bg-white dark:bg-[#1f2937] border-b border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0 transition-colors duration-200">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden text-gray-500 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop collapse toggle */}
          <button
            className="hidden lg:flex text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-colors"
            onClick={() => setCollapsed((v) => !v)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
            <span className="text-[#7C3AED] font-semibold whitespace-nowrap">
              AIValytics
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            <span className="font-medium text-gray-700 dark:text-gray-200 truncate">
              {currentPage}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Dark mode toggle */}
            <button
              onClick={() => setIsDark((v) => !v)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Help */}
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Notifications bell */}
            <button className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                3
              </span>
            </button>

            {/* Profile dropdown */}
            <div className="relative pl-2 border-l border-gray-200 dark:border-gray-700 ml-1" ref={profileRef}>
              <button
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => setProfileOpen((v) => !v)}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-xs shadow flex-shrink-0">
                  PW
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                    Prof. Williams
                  </p>
                  <span className="text-[10px] font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full leading-tight">
                    Head of Department
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 dark:text-gray-400 transition-transform duration-200 hidden sm:block ${profileOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown card */}
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-[220px] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] overflow-hidden z-50 animate-[fadeIn_0.15s_ease]">
                  {/* Top section */}
                  <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      PW
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">
                        Prof. Williams
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight truncate">
                        Head of Department
                      </p>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight truncate mt-0.5">
                        p.williams@university.edu
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-gray-700" />

                  {/* Menu items */}
                  <div className="py-1">
                    {[
                      { icon: User, label: "My Profile" },
                      { icon: Settings, label: "Settings" },
                      { icon: Bell, label: "Notifications" },
                    ].map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Icon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="h-px bg-gray-200 dark:bg-gray-700" />

                  {/* Sign Out */}
                  <div className="py-1">
                    <button
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/login");
                      }}
                    >
                      <LogIn className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto bg-[#f8f9ff] dark:bg-[#111827] transition-colors duration-200">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>

      {/* Floating Feedback */}
      <div className="fixed bottom-6 right-6 z-50">
        {showFeedback && (
          <div className="mb-3 w-72 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] p-4">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">
              Share Feedback
            </h4>
            <textarea
              className="w-full text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="What's on your mind?"
              rows={3}
            />
            <button className="mt-2 w-full py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200">
              Submit Feedback
            </button>
          </div>
        )}
        <button
          onClick={() => setShowFeedback(!showFeedback)}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-semibold text-sm shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-105 transition-all duration-200"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Give Feedback</span>
        </button>
      </div>
    </div>
  );
};

export default HodLayout;
