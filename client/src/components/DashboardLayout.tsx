import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard, LogOut, PanelLeft,
  BookOpen, Ruler, Layers, BookMarked, Library, HelpCircle, LayoutGrid, Search, FileText,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: LayoutGrid, label: "CDP Templates", path: "/cdp-templates" },
  { icon: LayoutGrid, label: "KP&A Templates", path: "/kpa-templates" },
  { icon: BookOpen, label: "Bible Studio", path: "/bible-studio" },
  { icon: Ruler, label: "Spine Calculator", path: "/spine-calculator" },
  { icon: Layers, label: "Cover Designer", path: "/cover-designer" },
  { icon: BookMarked, label: "ISBN & Metadata", path: "/isbn-manager" },
  { icon: Search, label: "ISBN Lookup", path: "/isbn-lookup" },
  { icon: FileText, label: "Print Specs", path: "/print-specs" },
  { icon: Library, label: "Resources", path: "/resources" },
  { icon: HelpCircle, label: "User Guide", path: "/guide" },
];

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-parchment">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-burgundy/10 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-burgundy" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-walnut text-center">
              Sign in to continue
            </h1>
            <p className="text-sm text-walnut/70 text-center max-w-sm leading-relaxed">
              Access to the Publisher Command Center requires authentication. Sign in to manage your book projects.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = "/api/login";
            }}
            size="lg"
            className="w-full bg-burgundy hover:bg-burgundy/90 text-parchment shadow-lg hover:shadow-xl transition-all font-semibold tracking-wide"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
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
  const { user, logout } = useAuth();
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
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold tracking-tight text-walnut truncate text-sm">
                    Create Design Publish
                  </span>
                </div>
              ) : null}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-gold/10 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/30">
                  <Avatar className="h-9 w-9 border border-gold/30 bg-burgundy/10 shrink-0">
                    <AvatarFallback className="text-xs font-semibold text-burgundy bg-burgundy/10">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-semibold text-walnut truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-walnut/60 truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-parchment border-gold/20">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
          </div>
        )}
        <main className="flex-1 p-4 bg-parchment/50">{children}</main>
      </SidebarInset>
    </>
  );
}
