import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard, PanelLeft,
  BookOpen, Ruler, Layers, BookMarked, Library, HelpCircle, LayoutGrid, Search, FileText,
  Sun, Moon, Bell, CheckCircle, Upload, Zap, CreditCard,
} from "lucide-react";
import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "./ui/button";
import { trpc } from "@/lib/trpc";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: LayoutGrid, label: "Book Templates", path: "/cdp-templates" },
  { icon: LayoutGrid, label: "KP&A Templates", path: "/kpa-templates" },
  { icon: BookOpen, label: "Bible Studio", path: "/bible-studio" },
  { icon: Ruler, label: "Spine Calculator", path: "/spine-calculator" },
  { icon: Layers, label: "Cover Designer", path: "/cover-designer" },
  { icon: BookMarked, label: "ISBN & Metadata", path: "/isbn-manager" },
  { icon: Search, label: "ISBN Lookup", path: "/isbn-lookup" },
  { icon: FileText, label: "Print Specs", path: "/print-specs" },
  { icon: Library, label: "Resources", path: "/resources" },
  { icon: HelpCircle, label: "User Guide", path: "/guide" },
  { icon: CreditCard, label: "Billing & Plans", path: "/pricing" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;
const NOTIFICATIONS_LAST_READ_KEY = "notifications-last-read";

function getNotificationIcon(type: string) {
  switch (type) {
    case "step_completion":
      return <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />;
    case "file_upload":
      return <Upload className="h-4 w-4 text-blue-600 shrink-0" />;
    case "production_job":
      return <Zap className="h-4 w-4 text-amber-600 shrink-0" />;
    default:
      return <Bell className="h-4 w-4 text-walnut/60 shrink-0" />;
  }
}

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(date).toLocaleDateString();
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [lastRead, setLastRead] = useState<number>(() => {
    const saved = localStorage.getItem(NOTIFICATIONS_LAST_READ_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });

  const { data: notifications, isLoading } = trpc.activity.recent.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const unreadCount = notifications
    ? notifications.filter((n) => new Date(n.timestamp).getTime() > lastRead).length
    : 0;

  const markAsRead = useCallback(() => {
    const now = Date.now();
    setLastRead(now);
    localStorage.setItem(NOTIFICATIONS_LAST_READ_KEY, now.toString());
  }, []);

  useEffect(() => {
    if (open) {
      markAsRead();
    }
  }, [open, markAsRead]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative h-9 w-9 flex items-center justify-center rounded-lg hover:bg-gold/15 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-walnut/70" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-80 p-0 bg-parchment border-gold/20"
      >
        <div className="px-4 py-3 border-b border-gold/15">
          <h3 className="text-sm font-semibold text-walnut">Notifications</h3>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-6 text-center text-sm text-walnut/50">
              Loading...
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-walnut/50">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification, i) => {
              const isUnread = new Date(notification.timestamp).getTime() > lastRead;
              return (
                <div
                  key={`${notification.type}-${notification.projectId}-${i}`}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-gold/10 last:border-b-0 transition-colors ${
                    isUnread ? "bg-burgundy/5" : ""
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-walnut truncate">
                      {notification.projectTitle}
                    </p>
                    <p className="text-xs text-walnut/70 mt-0.5">
                      {notification.detail}
                    </p>
                    <p className="text-[10px] text-walnut/40 mt-1">
                      {formatTimeAgo(notification.timestamp)}
                    </p>
                  </div>
                  {isUnread && (
                    <span className="mt-1 h-2 w-2 rounded-full bg-burgundy shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }


  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-gold/20"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center bg-cream/50">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-gold/15 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30 shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-walnut/70" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-bold tracking-tight text-walnut truncate text-sm">
                    Easy Book Publishers
                  </span>
                </div>
              ) : null}
              <NotificationBell />
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 bg-cream/30">
            <SidebarMenu className="px-2 py-2">
              {menuItems.map((item, index) => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    {index === 1 && (
                      <div className="my-2 h-px bg-gold/15" />
                    )}
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal rounded-lg ${
                        isActive
                          ? "bg-burgundy/10 text-burgundy font-medium"
                          : "text-walnut/80 hover:bg-gold/10 hover:text-walnut"
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-burgundy" : "text-walnut/60"}`}
                      />
                      <span className="tracking-wide text-[13px]">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 bg-cream/50 border-t border-gold/15">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gold/10 transition-colors w-full text-left text-walnut/80 group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30 mb-1"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-gold shrink-0" />
              ) : (
                <Moon className="h-4 w-4 text-walnut/60 shrink-0" />
              )}
              {!isCollapsed && (
                <span className="tracking-wide text-[13px]">
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </span>
              )}
            </button>
            <div className="flex items-center gap-3 rounded-lg px-1 py-1.5 w-full text-left group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-9 w-9 border border-gold/30 bg-burgundy/10 shrink-0">
                <AvatarFallback className="text-xs font-semibold text-burgundy bg-burgundy/10">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="text-sm font-semibold text-walnut truncate leading-none">
                  {user?.name || "User"}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-gold/30 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="flex border-b border-gold/20 h-14 items-center justify-between bg-parchment/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur sticky top-0 z-40">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-cream hover:bg-gold/15" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="tracking-tight text-walnut font-semibold text-sm">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
            <NotificationBell />
          </div>
        )}
        <main className="flex-1 p-4 bg-parchment/50">{children}</main>
      </SidebarInset>
    </>
  );
}
